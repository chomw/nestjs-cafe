import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../constants/error-code.constant';
import { ErrorMessageMap } from '../constants/error-message.constant';


export class BusinessException extends HttpException {   
    constructor(
        public readonly errorCode: ErrorCode,
        statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    ) {
        const message = ErrorMessageMap[errorCode] || ErrorMessageMap[ErrorCode.INTERNAL_SERVER_ERROR];
        super(message, statusCode);
    }
}