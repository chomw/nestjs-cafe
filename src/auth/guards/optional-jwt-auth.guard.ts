import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";


@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {

    handleRequest(err, user, info) {

        if (info) {
            console.log('🚨 JWT 검증 실패 사유:', info.message || info.name);
        }

        if (err || !user) {
            return null;
        }

        return user;
    }

}