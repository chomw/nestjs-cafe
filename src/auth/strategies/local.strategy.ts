import { HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";
import { BusinessException } from "src/common/exceptions/business.exception";
import { ErrorCode } from "src/common/constants/error-code.constant";


@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({
            usernameField: 'login_id',
            passwordField: 'password',
        });
    }

    // AuthGuard('local')이 작동할 때 자동으로 호출되는 메서드
    async validate(login_id: string, password: string): Promise<any> {
        const user = await this.authService.validateUser(login_id, password);

        if (!user) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
        }

        // 여기서 반환된 user 객체는 Request 객체에 자동으로 할당된다. (req.user)
        return user;
    }
}