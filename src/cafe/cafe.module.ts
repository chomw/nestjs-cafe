import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CafeService } from './cafe.service';
import { CafeController } from './cafe.controller';
import { Cafe } from './entities/cafe.entity';
import { CafeMember } from './entities/cafe-member.entity';
import { CafePost } from './entities/cafe-post.entity';
import { CafePostService } from './cafe-post.service';
import { AuthModule } from 'src/auth/auth.module';
import { CafeComment } from './entities/cafe-comment.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Cafe, CafeMember, CafePost, CafeComment]), AuthModule], 
  controllers: [CafeController],
  providers: [CafeService, CafePostService],
  exports: [CafeService, CafePostService]
})
export class CafeModule {}
