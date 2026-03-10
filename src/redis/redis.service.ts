import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly redisClient: Redis;
    private readonly logger = new Logger(RedisService.name);

    constructor(private readonly configService: ConfigService) {
        this.redisClient = new Redis({
            host: this.configService.get<string>('REDIS_HOST') || 'localhost',
            port: this.configService.get<number>('REDIS_PORT') || 6379,
        })
    }

    onModuleInit() {
        this.logger.log('Redis Connection Created');
    }

    onModuleDestroy() {
        this.redisClient.quit();
    }

    // 리프레시 토큰 저장
    async setRefreshToken(login_id: string, token: string, ttlSeconds: number): Promise<void> {
        await this.redisClient.set(`user:${login_id}:refreshToken`, token, 'EX', ttlSeconds);
    }

    // 리프레시 토큰 조회
    async getRefreshToken(login_id: string): Promise<string | null> {
        return this.redisClient.get(`user:${login_id}:refreshToken`);
    }

    // 리프레시 토큰 삭제
    async removeRefreshToken(login_id: string): Promise<void> {
        await this.redisClient.del(`user:${login_id}:refreshToken`);
    }
}
