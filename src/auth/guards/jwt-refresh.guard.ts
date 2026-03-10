import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ErrorCode } from 'src/common/constants/error-code.constant';
import { BusinessException } from 'src/common/exceptions/business.exception';

// AuthGuard에 'jwt-refresh'를 지정하여, Passport가 수많은 전략 중 JwtRefreshStrategy를 찾아 실행하도록 설정
@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {

    handleRequest(err, user, info) {
        if(err || !user) {
            // 리프레시 토큰이 없거나 만료되었다면 401 에러 발생시킴
            throw err || new BusinessException(ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
        }
        return user;
    }
}