import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CafeModule } from './cafe/cafe.module';
import { UserModule } from './user/user.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './redis/redis.module';
import { ImageUploadModule } from './image-upload/image-upload.module';
import * as Joi from 'joi'; 

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 전역에서 사용
      envFilePath: `env/.env.${process.env.NODE_ENV || 'development'}`,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production').default('development'),
        
        // MySQL 설정
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().default(3306), 
        DATABASE_USER: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_DB_NAME: Joi.string().required(),
        
        // Redis 설정
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().default(6379),
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_DB_NAME'),
        autoLoadEntities: true,             // 엔터티 자동 로드: entities 배열에 일일이 넣지 않아도 됨. TypeOrmModule.forFeature()로 각 도메인 모듈에서 등록은 해야 함.
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        logging: true
      }),
    }),
    CacheModule.registerAsync({   // Redis 캐시 모듈을 전역(Global)으로 설정합니다.
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get<string>('REDIS_HOST'),
            port: configService.get<number>('REDIS_PORT')
          }
        })
      })
    }),
    CafeModule,
    UserModule,
    AuthModule,
    RedisModule,
    ImageUploadModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
