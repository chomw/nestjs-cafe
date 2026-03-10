import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CafeService } from './cafe.service';
import { CafeController } from './cafe.controller';
import { Cafe } from './entities/cafe.entity';
import { CafeMember } from './entities/cafe-member.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Cafe, CafeMember])], 
  controllers: [CafeController],
  providers: [CafeService],
})
export class CafeModule {}
