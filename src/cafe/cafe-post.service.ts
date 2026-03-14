import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CafePost } from "./entities/cafe-post.entity";
import { Repository } from "typeorm";
import { CafeService } from "./cafe.service";
import { CreateCafePostDto } from "./dto/create-cafe-post.dto";
import { BusinessException } from "src/common/exceptions/business.exception";
import { ErrorCode } from "src/common/constants/error-code.constant";
import { CafeMember } from "./entities/cafe-member.entity";


@Injectable()
export class CafePostService {
    constructor(
        @InjectRepository(CafePost)
        private readonly cafePostRepository: Repository<CafePost>,
        private readonly cafeService: CafeService,
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
}