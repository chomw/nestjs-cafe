import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CafeService } from './cafe.service';
import { CafeController } from './cafe.controller';
import { Cafe } from './entities/cafe.entity';
import { CafeMember } from './entities/cafe-member.entity';
import { CafePost } from './entities/cafe-post.entity';
import { CafePostService } from './cafe-post.service';


@Module({
  imports: [TypeOrmModule.forFeature([Cafe, CafeMember, CafePost])], 
  controllers: [CafeController],
  providers: [CafeService, CafePostService],
  exports: [CafeService]
})
export class CafeModule {}
