import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCafeDto } from './dto/create-cafe.dto';
import { Cafe } from './entities/cafe.entity';
import { ErrorCode } from '../common/constants/error-code.constant';
import { ErrorMessageMap } from '../common/constants/error-message.constant';
import { BusinessException } from 'src/common/exceptions/business.exception';

@Injectable()
export class CafeService {
  constructor(
    @InjectRepository(Cafe)
    private cafeRepository: Repository<Cafe>    
  ) {}

  async create(createCafeDto: CreateCafeDto): Promise<Cafe> {
    
    const existingCafe = await this.cafeRepository.findOne({
      where: { address: createCafeDto.address }
    });

    if (existingCafe) {
      throw new BusinessException(ErrorCode.CAFE_ALREADY_EXISTS);
    }

    // 1. Dto 객체를 사용해 Entity 객체 생성
    const newCafe = this.cafeRepository.create(createCafeDto);

    // 2. DB 저장 및 결과 반환
    return await this.cafeRepository.save(newCafe);
  }
}