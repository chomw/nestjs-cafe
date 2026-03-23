import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CafePost } from "./entities/cafe-post.entity";
import { Repository, DataSource, EntityManager } from "typeorm";
import { CafeService } from "./cafe.service";
import { CreateCafePostDto } from "./dto/create-cafe-post.dto";
import { BusinessException } from "src/common/exceptions/business.exception";
import { ErrorCode } from "src/common/constants/error-code.constant";
import { CafeMember } from "./entities/cafe-member.entity";
import { PaginationDefault } from "./constants/cafe.constant";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { CommentResponseDto } from "./dto/comment-response.dto";
import { CafeComment } from "./entities/cafe-comment.entity";


@Injectable()
export class CafePostService {
    constructor(
        @InjectRepository(CafePost)
        private readonly cafePostRepository: Repository<CafePost>,
        private readonly cafeService: CafeService,
        @InjectRepository(CafeComment)
        private readonly cafeCommentRepository: Repository<CafeComment>,
        private dataSource: DataSource,
    ) { }

    /**
   * 카페 게시글 생성
   */
    async createPost(userId: string, dto: CreateCafePostDto): Promise<CafePost> {

        const member = await this.cafeService.validateActiveMember(dto.cafeId, userId);

        // viewCount, likeCount 등은 default: 0 이므로 생략 가능
        // thumbnailUrl은 폼에 없으므로 일단 null로 둔다
        const newPost = this.cafePostRepository.create({
            cafeId: dto.cafeId,
            userId: userId, // 현재 로그인한 유저의 ID
            title: dto.title,
            content: dto.content,
        });

        return await this.cafePostRepository.save(newPost);
    }

    /**
     * 게시글 단건 조회
     * 
     * @param postId 게시글 ID
     * @returns 게시글 객체(CafePost)
     */
    async getPost(postId: string): Promise<CafePost> {
        const post = await this.cafePostRepository.findOneBy({
            id: postId
        });

        if (!post) {
            throw new BusinessException(ErrorCode.POST_NOT_FOUND, HttpStatus.NOT_FOUND);
        }

        return post;
    }

    /**
     * 게시글 목록 조회
     * 
     * (1) findAndCount
     * findAndCount를 쓰면 내부적으로 SELECT * ... LIMIT 쿼리와 SELECT COUNT(*) ... 쿼리를 TypeORM이 알아서 병렬로 날려 준다.
     * 
     * (2) 자동 Soft Delete 필터링
     * 엔티티에 @DeleteDateColumn을 설정했기 때문에, 위 쿼리에는 명시하지 않았지만 TypeORM이 몰래 WHERE deleted_at IS NULL 조건을 자동으로 붙여서 쿼리를 날려 준다.
     * 따라서 삭제된 컬럼은 표시되지 않는다.
     * 
     * 
     * @param cafeId 
     * @param page 
     * @param limit 
     */
    async getPostList(cafeId: number, page: number = PaginationDefault.PAGE, limit: number = PaginationDefault.LIMIT) {
        const take = limit;
        const skip = (page - 1) * limit;

        const [posts, total] = await this.cafePostRepository.findAndCount({
            where: { cafeId },
            order: { createdAt: 'DESC' },
            skip,
            take
        });

        if (posts.length === 0) {
            return { posts: [], totalElements: 0, currentPage: page, totalPages: 0 };
        }

        const userIds = [...new Set(posts.map(post => post.userId))];

        const members = await this.cafeService.getMemberList(cafeId, userIds);

        const memberMap = new Map(members.map(member => [member.userId, member]));

        const mappedPosts = posts.map(post => {
            const author = memberMap.get(post.userId);
            return {
                ...post,
                nickname: author ? author.nickname : null,
                profile_img: author ? author.profile_img : null
            };
        });

        return {
            posts: mappedPosts,
            totalPosts: total,
            currentPage: page,
            totalPages: Math.ceil(total / take),
        };
    }

    /**
     * 여러 카페의 최신 게시글을 각각 3개씩 병렬로 조회
     * 
     * 다음과 같은 쿼리를 TypeORM의 createQueryBuilder(), leftJoin()을 이용해서 구현.
     * 쿼리:
     * SELECT 
     *      post.*, `member`.nickname, `member`.profile_img 
     * FROM cafe_post AS post 
     *      LEFT JOIN cafe_member AS `member` 
     *      ON post.user_id = `member`.user_id AND post.cafe_id = `member`.cafe_id 
     * WHERE post.cafe_id = 7 ORDER BY post.created_at DESC LIMIT 3;
     * 
     * 
     * @param cafeIds   조회할 카페 ID 배열
     * @returns         cafeId를 키로 하고, 최신 게시글 배열을 값으로 가지는 Map 객체
     */
    async getLatestPostsByCafeIds(cafeIds: number[]) {
        // 가입한 카페가 없으면 빈 Map 반환
        if (!cafeIds || cafeIds.length === 0) {
            return new Map();
        }

        // 1. 각 카페별로 최신글 3개씩 가져오는 쿼리(Promise)들을 생성
        const fetchPromises = cafeIds.map(cafeId => {
            return this.cafePostRepository.createQueryBuilder('post')
                // 조건 1: 작성자 ID가 같아야 함 / 조건 2: 같은 카페의 멤버 정보여야 함
                .leftJoin(
                    'cafe_member',
                    'member',
                    'post.user_id = member.user_id AND post.cafe_id = member.cafe_id'
                )
                .select([
                    'post.id AS id',
                    'post.title AS title',
                    'post.created_at AS createdAt',
                    'member.nickname AS author',
                ])
                .where('post.cafe_id = :cafeId', { cafeId })
                .orderBy('post.created_at', 'DESC')
                .limit(3) 
                .getRawMany(); // 엔티티가 아닌 순수 데이터(Raw) 객체 배열로 반환
        });

        // 2. Promise.all로 여러 쿼리를 동시에(병렬) 데이터베이스에 요청!
        const results = await Promise.all(fetchPromises);

        // 3. 컨트롤러나 서비스에서 매핑하기 편하도록 Map 구조로 변환
        const postMap = new Map();
        cafeIds.forEach((cafeId, index) => {
            postMap.set(cafeId, results[index]);
        });

        return postMap;
    }
    
    /**
     * 댓글 추가 
     * 
     * (1) CafePost.commentCount에 1을 증가시킨다
     * (2) CafeComment 테이블에 INSERT
     * 
     * @param user 
     * @param postId 
     * @param dto 
     * @returns 
     */
    async createComment(user: any, postId: string, dto: CreateCommentDto): Promise<CommentResponseDto> {
        
        const post = await this.cafePostRepository.findOneBy({
            id: postId
        });

        if (!post) {
            throw new BusinessException(ErrorCode.POST_NOT_FOUND, HttpStatus.NOT_FOUND);
        }

        await this.cafeService.validateActiveMember(post.cafeId, user.id);

        return await this.dataSource.transaction(async (manager: EntityManager) => {
            
            await manager.increment(CafePost, { id: postId }, 'commentCount', 1);

            const newComment = manager.create(CafeComment, {
                postId: postId,
                userId: user.id,
                content: dto.content
            });

            const savedComment = await manager.save(newComment);

            return CommentResponseDto.from(savedComment, user.nickname, user.profile_img);
        });
    }

    /**
     * 게시글 ID로 댓글 목록을 얻는다
     * 
     * @param postId 게시글 ID
     * @returns Promise<CommentResponseDto[]>
     */
    async getCommentList(postId: string): Promise<CommentResponseDto[]> {
        
        const post = await this.cafePostRepository.findOneBy({
            id: postId
        });

        if (!post) {
            throw new BusinessException(ErrorCode.POST_NOT_FOUND, HttpStatus.NOT_FOUND);
        }

        const comments = await this.cafeCommentRepository.find({
            where: { postId: postId },
            order: {
                createdAt: 'ASC'
            },
            take: 100,
        });

        
        if (comments.length === 0) {
            return [];
        }

        const userIds = [...new Set(comments.map(comment => comment.userId))];

        const members = await this.cafeService.getMemberList(post.cafeId, userIds);

        const memberMap = new Map(members.map(member => [member.userId, member]));

        const mappedComments = comments.map(comment => {
            const author = memberMap.get(comment.userId);            
            const nickname = author?.nickname || '';
            const profile_img = author?.profile_img || '';

            return CommentResponseDto.from(comment, nickname, profile_img);            
        });

        return mappedComments;
    }
}