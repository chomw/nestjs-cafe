import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CreateCafeDto } from './dto/create-cafe.dto';
import { Cafe } from './entities/cafe.entity';
import { ErrorCode } from '../common/constants/error-code.constant';
import { ErrorMessageMap } from '../common/constants/error-message.constant';
import { BusinessException } from 'src/common/exceptions/business.exception';
import { CafeMember } from './entities/cafe-member.entity';
import { CafeMemberLevel, CafeMemberStatus } from './constants/cafe-member.constant';
import { CafePost } from './entities/cafe-post.entity';

@Injectable()
export class CafeService {
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
}