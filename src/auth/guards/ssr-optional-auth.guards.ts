import { ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthService } from "../auth.service";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";
import { AuthTokenMaxAge } from "../constants/auth.constants";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class SsrOptionalAuthGuard extends AuthGuard('jwt') {
    private readonly logger = new Logger(SsrOptionalAuthGuard.name);
    constructor(
        private readonly authService: AuthService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {
        super();
    }

    // handleRequest가 아니라 canActivate를 오버라이딩해야 Request와 Response 객체에 접근가능
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();

        try {
            // 1. Passport의 기본 Access Token 검증 로직 실행
            // 유효한 토큰이면 여기서 통과하고 request.user가 자동으로 설정됨
            const isValid = await super.canActivate(context);
            if (isValid) {
                this.logger.log('VALID ACCESS TOKEN');
                return true;
            }
        } catch (err) {
            // Access Token이 없거나 만료되면 예외 발생
            // 아래 Refresh 로직 수행
        }

        // 쿠키에서 refresh token 가져옴
        const refreshToken = request.cookies['refresh_token'];

        // 없다면 비회원이므로 null 리턴
        if (!refreshToken) {
            this.logger.log('NO REFRESH TOKEN');
            request.user = null;
            return true;
        }

        // SSR 백그라운드 조용한 갱신(Silent Refresh) 시도
        try {
            const secret = this.configService.get<string>('JWT_ACCESS_SECRET');
            const decoded = await this.jwtService.verifyAsync(refreshToken, { secret });

            // 리프레시 토큰의 페이로드를 바탕으로 임시 유저 객체 생성
            const user = { id: decoded.id, login_id: decoded.login_id, nickname: decoded.nickname, profile_img: decoded.profile_img };

            const tokens = await this.authService.refreshTokens(user, refreshToken);

            response.cookie('access_token', tokens.access_token, {
                httpOnly: true,
                maxAge: AuthTokenMaxAge.ACCESS,
            });
            response.cookie('refresh_token', tokens.refresh_token, {
                httpOnly: true,
                maxAge: AuthTokenMaxAge.REFRESH,
            });

            request.user = user;

            this.logger.log('NEW REFRESH TOKEN');

            return true;
        } catch (refreshErr) {
            // Refresh Token도 만료되었거나, Redis 검증(RTR)에서 탈취로 판단되면 로그아웃 처리
            response.clearCookie('access_token');
            response.clearCookie('refresh_token');
            request.user = null;

            this.logger.error('INVALID REFRESH TOKEN :: ', refreshErr);

            return true;
        }
    }
}