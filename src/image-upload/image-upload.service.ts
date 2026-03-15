import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import sharp from 'sharp';

@Injectable()
export class ImageUploadService {
    private readonly logger = new Logger(ImageUploadService.name);
    private readonly s3Client: S3Client;

    constructor(private readonly configService: ConfigService) {
        // 생성자에서 S3 클라이언트 초기화
        this.s3Client = new S3Client({
            region: this.configService.get<string>('AWS_REGION')!,
            credentials: {
                accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID')!,
                secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY')!,
            },
        });
    }

    async uploadImage(file: Express.Multer.File): Promise<string> {
        try {

            // 이미지 리사이징 처리 (Sharp 사용)
            // 가로/세로 중 작은 쪽을 기준으로 200px로 맞추고 중앙을 자른다
            const resizedBuffer = await sharp(file.buffer)
            .resize(200, 200, {
                fit: 'cover',
                position: 'center'
            })
            .withMetadata() // EXIF 데이터(사진 회전 정보 등) 유지
            .toBuffer();

            // 1. 고유한 파일명 생성 (예: 123e4567-e89b-12d3-a456-426614174000.png)
            const ext = path.extname(file.originalname);
            const uuid = crypto.randomUUID();
            const fileName = `${uuid}${ext}`;

            const bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
            const cloudFrontUrl = this.configService.get<string>('AWS_CLOUDFRONT_URL');

            // 2. S3 업로드 커맨드 생성
            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: `images/${fileName}`, // S3 버킷 내부의 폴더 경로 설정 (선택 사항)
                Body: resizedBuffer,
                ContentType: file.mimetype,
            });

            // 3. S3로 전송
            await this.s3Client.send(command);

            // 4. CloudFront 주소와 결합하여 최종 이미지 URL 반환
            return `${cloudFrontUrl}/images/${fileName}`;
        } catch (error) {
            this.logger.error('S3 Image Upload Error:', error);
            throw new InternalServerErrorException('이미지 업로드 중 문제가 발생했습니다.');
        }
    }
}
