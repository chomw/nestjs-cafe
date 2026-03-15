import { Controller, Post, Request, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { AuthTokenMaxAge } from './constants/auth.constants';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';

@Controller('api/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // @UseGuards(AuthGuard('local'))가 동작하는 순서:
    // 1. 클라이언트가 POST /auth/login으로 login_id과 password를 보낸다.
    // 2. AuthGuard가 요청을 가로채서 LocalStrategy의 validate()를 실행한다.
    // 3. 검증이 실패하면 자동으로 401 Unauthorized 에러를 응답.
    // 4. 검증이 성공하면 통과시키고, 반환된 유저 정보를 req.user에 담아 준다.
    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Request() req, @Res({ passthrough: true }) res: Response) {
        // req.user는 LocalStrategy의 validate 메서드가 반환한 객체.
        // 검증이 끝난 안전한 유저 정보를 넘겨 토큰을 발급

        const tokens = await this.authService.login(req.user);

        res.cookie('access_token', tokens.access_token, {
            httpOnly: true,
            maxAge: AuthTokenMaxAge.ACCESS,
        });
        res.cookie('refresh_token', tokens.refresh_token, {
            httpOnly: true,
            maxAge: AuthTokenMaxAge.REFRESH,
        });

        return this.authService.login(req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout(@GetUser() user:any, @Res({ passthrough: true }) res: Response) {
        this.authService.logout(user);
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
    }
}
