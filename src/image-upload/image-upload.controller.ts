import { Controller, HttpStatus, Logger, Post, UploadedFile, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { ImageUploadService } from './image-upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { SsrOptionalAuthGuard } from 'src/auth/guards/ssr-optional-auth.guards';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { BusinessException } from 'src/common/exceptions/business.exception';
import { ErrorCode } from 'src/common/constants/error-code.constant';

@Controller('api/image-upload')
export class ImageUploadController {
    private readonly logger = new Logger(ImageUploadController.name);
    constructor(private readonly imageUploadService: ImageUploadService) { }

    @Post()
    @UseGuards(SsrOptionalAuthGuard)
    @UseInterceptors(TransformInterceptor)
    @UseInterceptors(FileInterceptor('image'))
    @UseFilters(HttpExceptionFilter)
    async uploadImage(@UploadedFile() image: Express.Multer.File) {
        if (!image) {
            throw new BusinessException(ErrorCode.FILE_NOT_PROVIDED, HttpStatus.BAD_REQUEST);
        }

        // 서비스 계층을 호출하여 S3에 업로드하고 CloudFront URL을 받아옴
        const imageUrl = await this.imageUploadService.uploadImage(image);

        this.logger.log('imageUrl: ' + imageUrl);

        return { imageUrl: imageUrl, };
    }

}
