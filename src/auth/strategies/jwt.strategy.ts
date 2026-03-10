import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from 'express';

const cookieExtractor = (req: Request): string | null => {
    if (req && req.cookies) {
        return req.cookies['access_token'];
    }
    return null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly configService: ConfigService) {
        super({
            // 요청 헤더의 'Authorization: Bearer <토큰>'에서 토큰을 추출
            // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            // 헤더에서 Bearer 토큰을 찾는 기본 설정 대신, cookie에서 토큰을 찾는 커스텀 추출기를 설정
            jwtFromRequest: cookieExtractor,
            // 토큰 만료 여부를 프레임워크가 자동으로 확인하게 한다. (만료시 401 에러)
            ignoreExpiration: false,
            // 서명 검증을 위해 .env에서 시크릿 키를 가져온다.
            secretOrKey: configService.get<string>('JWT_ACCESS_SECRET')!,
        });
    }

    async validate(payload: any) {        
        // stateless JWT의 장점을 살리기 위해 매번 DB를 조회하지 않는다.
        // 토큰에 들어있던 정보만으로 req.user 객체를 구성하여 반환
        return payload;
    }
}
