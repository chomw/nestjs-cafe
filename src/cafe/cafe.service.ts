import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { CreateCafeDto } from './dto/create-cafe.dto';
import { Cafe } from './entities/cafe.entity';
import { ErrorCode } from '../common/constants/error-code.constant';
import { ErrorMessageMap } from '../common/constants/error-message.constant';
import { BusinessException } from 'src/common/exceptions/business.exception';
import { CafeMember } from './entities/cafe-member.entity';
import { CafeMemberLevel, CafeMemberStatus, CafePublicType } from './constants/cafe.constant';
import { CafePost } from './entities/cafe-post.entity';
import { CreateCafeMemberDto } from './dto/create-cafe-member.dto';

@Injectable()
export class CafeService {

  // 캐싱을 위한 멤버 변수들
  private cachedRecommendCafes: any[] | null = null; // 캐싱된 데이터를 담을 곳
  private lastCacheTime: number = 0;                 // 마지막으로 DB에서 가져온 시간 (Timestamp)
  private readonly CACHE_TTL = 10 * 60 * 1000;       // 10분 (10분 * 60초 * 1000밀리초)

  constructor(
    @InjectRepository(Cafe)
    private cafeRepository: Repository<Cafe>,
    @InjectRepository(CafeMember)
    private readonly cafeMemberRepository: Repository<CafeMember>,
    private dataSource: DataSource,
  ) { }

  async create(createCafeDto: CreateCafeDto, user: any): Promise<Cafe> {

    return await this.dataSource.transaction(async (manager: EntityManager) => {

      const existingCafe = await manager.findOne(Cafe, {
        where: { address: createCafeDto.address },
      });

      if (existingCafe) {
        throw new BusinessException(ErrorCode.CAFE_ALREADY_EXISTS);
      }

      const newCafe = manager.create(Cafe, createCafeDto);    // 순수한 JSON 데이터(createCafeDto)를 바탕으로, TypeORM의 Cafe 클래스 객체(인스턴스)를 메모리 상에 만들어주는 역할
      const savedCafe = await manager.save(newCafe);

      const newMember = manager.create(CafeMember, {
        cafeId: savedCafe.id,
        userId: user.id,
        nickname: user.nickname,
        level: CafeMemberLevel.MANAGER,
        status: CafeMemberStatus.ACTIVE,
        visitCount: 1,
      });

      await manager.save(newMember);

      const welcomeContent = [
        `${savedCafe.name} 카페를 시작합니다.`,
        '',
        '나의 친구들, 같은 관심사를 공유하는 멤버들!',
        `지금 바로 ${savedCafe.name} 카페에 멤버로 초대하세요.`,
        '',
        '아래 주소를 복사하여 친구들에게 알려주세요.',
        '',
        `${savedCafe.name} 카페초대주소`,
        `http://localhost:3000/cafe/${savedCafe.address}`
      ].join('\n');

      const defaultPost = manager.create(CafePost, {
        cafeId: savedCafe.id,
        userId: user.id,
        title: `${savedCafe.name} 카페를 시작합니다.`,
        content: welcomeContent,
        // viewCount, likeCount, commentCount 등은 엔티티의 default: 0 설정으로 자동 처리
      });
      await manager.save(defaultPost);

      return savedCafe;
    });

  }

  /**
   * 주소(address)로 카페 단건 조회
   */
  async getCafeByAddress(address: string): Promise<Cafe | null> {
    return await this.cafeRepository.findOne({
      where: { address },
    });
  }

  async validateActiveMember(cafeId: number, userId: string): Promise<CafeMember> {

    const cafe = await this.cafeRepository.findOne({
      where: { id: cafeId }
    });

    if (!cafe) {
      throw new BusinessException(ErrorCode.CAFE_NOT_FOUND);
    }

    const member = await this.cafeMemberRepository.findOne({
      where: { cafeId, userId },
    });

    if (!member) {
      throw new BusinessException(ErrorCode.NOT_CAFE_MEMBER, HttpStatus.FORBIDDEN);
    }

    if (member.status !== CafeMemberStatus.ACTIVE) {
      throw new BusinessException(ErrorCode.INVALID_MEMBER_STATUS, HttpStatus.FORBIDDEN);
    }

    return member;
  }

  /**
   * 유저 아이디로 특정 카페 회원 단건 조회
   * 
   * @param cafeId 
   * @param userId 
   * @returns 
   */
  async getMember(cafeId: number, userId: string): Promise<CafeMember | null> {
    const member = await this.cafeMemberRepository.findOne({
      where: { cafeId, userId },
    });

    return member;
  }

  /**
   * 유저 아이디 배열로 카페 회원 목록 조회
   * 
   * @param cafeId 
   * @param userIds 
   */
  async getMemberList(cafeId: number, userIds: Array<string>) {
    const uniqueIds = [...new Set(userIds)];

    const members = await this.cafeMemberRepository.find({
      where: {
        cafeId: cafeId,
        userId: In(uniqueIds),
      }
    });

    return members;
  }

  /**
   * 카페 가입 처리
   * 
   * @param userId 
   * @param dto 
   */
  async joinCafe(userId: string, dto: CreateCafeMemberDto): Promise<CafeMember> {
    const cafe = await this.cafeRepository.findOneBy({ id: dto.cafeId });
    if (!cafe) {
      throw new BusinessException(ErrorCode.CAFE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    // 이미 가입된 멤버인지 중복 체크
    const existingMember = await this.cafeMemberRepository.findOneBy({
      cafeId: cafe.id,
      userId
    });

    if (existingMember) {
      throw new BusinessException(ErrorCode.ALREADY_JOINED_MEMBER, HttpStatus.CONFLICT);
    }

    const existingNickname = await this.cafeMemberRepository.findOneBy({
      cafeId: cafe.id,
      nickname: dto.nickname
    });

    if (existingNickname) {
      throw new BusinessException(ErrorCode.NICKNAME_ALREADY_EXISTS, HttpStatus.CONFLICT);
    }

    const newMember = this.cafeMemberRepository.create({
      cafeId: cafe.id,
      userId,
      nickname: dto.nickname,
      profile_img: dto.profile_img,
      level: CafeMemberLevel.REGULAR,
      status: CafeMemberStatus.ACTIVE,
      visitCount: 1,
    });

    await this.cafeMemberRepository.save(newMember);
    return newMember;
  }

  /**
   * 유저가 가입한(활동 중인) 카페 목록 조회 (최근 방문일 순)
   * 
   * @param userId 
   */
  async getMyCafeList(userId: string) {
    const members = await this.cafeMemberRepository.find({
      where: {
        userId: userId,
        status: CafeMemberStatus.ACTIVE,
      },
      order: {
        lastVisitDate: 'DESC',
      }
    });

    if (members.length === 0) {
      return [];
    }

    const cafeIds = members.map(member => member.cafeId);
    const cafes = await this.cafeRepository.find({
      where: {
        id: In(cafeIds),
      },
    });

    const cafeMap = new Map(cafes.map(cafe => [cafe.id, cafe]));

    const result = members.map(member => {
      const cafeInfo = cafeMap.get(member.cafeId);

      return {
        cafeId: member.cafeId,
        cafeName: cafeInfo?.name || '알 수 없는 카페', 
        cafeAddress: cafeInfo?.address,
        cafeIconImg: cafeInfo?.icon_img,
        myNickname: member.nickname,
        myLevel: member.level,
        lastVisitDate: member.lastVisitDate,
        posts: []
      };
    });

    return result;
  }

  /**
   * 인기 카페(추천 카페) 목록 조회
   * 
   * @returns 
   */
  async getRecommendCafeList() {
    
    const currentTime = Date.now();

    // 캐시 히트(Cache Hit) - 데이터가 있고 10분이 안 지났으면 캐시 반환!
    if (this.cachedRecommendCafes && (currentTime - this.lastCacheTime < this.CACHE_TTL)) {
      return this.cachedRecommendCafes;
    }

    const cafes = await this.cafeRepository.find({
      where: {
        public_type: CafePublicType.PUBLIC, 
      },
      order: {
        member_count: 'DESC',    // 1순위: 멤버 수가 많은 순서 (내림차순)
        last_login_date: 'DESC', // 2순위: 멤버 수가 같다면 최근 로그인(활동)한 순서 (내림차순)
      },
      take: 10, 
    });

    const mappedCafes = cafes.map(cafe => ({
      cafeId: cafe.id,
      cafeName: cafe.name,           // 엔티티의 카페 이름 컬럼
      cafeAddress: cafe.address,     // 엔티티의 카페 주소 컬럼 (URL용)
      cafeIconImg: cafe.icon_img,    // 엔티티의 썸네일/아이콘 컬럼
      memberCount: cafe.member_count // 참고용 멤버 수 표기
    }));

    // 새로 가져온 데이터를 메모리에 덮어씌우고, 갱신 시간 기록
    this.cachedRecommendCafes = mappedCafes;
    this.lastCacheTime = currentTime;

    return this.cachedRecommendCafes;
  }
}