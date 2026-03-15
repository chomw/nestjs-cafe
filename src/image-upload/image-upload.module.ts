import { Module } from '@nestjs/common';
import { ImageUploadController } from './image-upload.controller';
import { ImageUploadService } from './image-upload.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [ImageUploadController],
  providers: [ImageUploadService],
  exports: [ImageUploadService],
})
export class ImageUploadModule {}
