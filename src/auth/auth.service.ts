import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { ErrorCode } from 'src/common/constants/error-code.constant';
import { BusinessException } from 'src/common/exceptions/business.exception';
import { RedisService } from 'src/redis/redis.service';
import { UserService } from 'src/user/user.service';
import { AuthTokenExpiresIn, AuthTokenTTL } from './constants/auth.constants';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        private readonly redisService: RedisService,
    ) { }

    // 사용자 검증 (LocalStrategy에서 호출)
    async validateUser(login_id: string, password: string): Promise<any> {

        const user = await this.userService.findByLoginId(login_id);

        // 데이터베이스에 유저가 있고, bcrypt로 해시된 비밀번호가 일치하는지 확인
        if (user && await bcrypt.compare(password, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    // 토큰 발급 및 Redis 저장 (Controller에서 호출)
    async login(user: any) {
        const payload = { login_id: user.login_id, sub: user.id, nickname: user.nickname, profile_img: user.profile_img };    // 토큰에 담을 정보 (최소화하는 것이 좋음)

        // Access Token 생성
        const accessToken = this.jwtService.sign(payload);

        // RefreshToken 생성
        const refreshToken = this.jwtService.sign(payload, { expiresIn: AuthTokenExpiresIn.REFRESH });

        // Redis에 Refresh Token 저장 
        await this.redisService.setRefreshToken(user.login_id, refreshToken, AuthTokenTTL.REFRESH);

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }

    async refreshTokens(user: any, oldRefreshToken: string) {

        // redis에서 유저의 진짜 리프레시 토큰을 가져옴
        const storedToken = await this.redisService.getRefreshToken(user.login_id);

        // 해킹 방어 (RTR) 핵심: Redis에 토큰이 없거나, 보낸 토큰과 다르면 탈취로 간주
        if (!storedToken || storedToken !== oldRefreshToken) {
            // 위험 감지 시 해당 유저의 토큰을 즉시 강제 폐기 (모든 기기 로그아웃 효과)
            await this.redisService.removeRefreshToken(user.login_id);
            throw new BusinessException(ErrorCode.INVALID_TOKEN, HttpStatus.UNAUTHORIZED);
        }

        const payload = { login_id: user.login_id, sub: user.id, nickname: user.nickname, profile_img: user.profile_img };
        const newAccessToken = this.jwtService.sign(payload);
        const newRefreshToken = this.jwtService.sign(payload, { expiresIn: AuthTokenExpiresIn.REFRESH });

        await this.redisService.setRefreshToken(user.login_id, newRefreshToken, AuthTokenTTL.REFRESH);

        return {
            access_token: newAccessToken,
            refresh_token: newRefreshToken,
        };
    }

    // 로그아웃 로직
  async logout(login_id: string) {
    // Redis에서 해당 유저의 리프레시 토큰을 완전히 삭제
    await this.redisService.removeRefreshToken(login_id);    
  }
}
