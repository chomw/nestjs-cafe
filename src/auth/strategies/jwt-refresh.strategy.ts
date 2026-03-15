import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';

const cookieExtractor = (req: Request): string | null => {
    if (req && req.cookies) {
        return req.cookies['access_token'];
    }
    return null;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(private readonly configService: ConfigService) {
        super({
            jwtFromRequest: cookieExtractor,
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_ACCESS_SECRET')!,
        });
    }

    async validate(payload: any) {
        return {
            id: payload.id,
            login_id: payload.login_id,
            nickname: payload.nickname,
            profile_img: payload.profile_img,
        };
    }
}