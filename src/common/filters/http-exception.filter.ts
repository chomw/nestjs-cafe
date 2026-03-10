import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { BusinessException } from '../exceptions/business.exception';
import { ErrorCode } from '../constants/error-code.constant';
import { ErrorMessageMap } from '../constants/error-message.constant';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {

    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = ErrorMessageMap[ErrorCode.INTERNAL_SERVER_ERROR];
        let errorCode = ErrorCode.INTERNAL_SERVER_ERROR;

        if (exception instanceof BusinessException) {
            statusCode = exception.getStatus();
            message = exception.message;
            errorCode = exception.errorCode;
        } else if (exception instanceof HttpException) {
            statusCode = exception.getStatus();            
            const resMsg = (exception.getResponse() as any)?.message;
            message = Array.isArray(resMsg) ? resMsg[0] : (resMsg || exception.message);
            errorCode = ErrorCode.INVALID_INPUT;
        }
        else {
            this.logger.error('Unhandled Exception:', exception);
        }

        const msg = {
            success: false,
            statusCode,
            errorCode,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
        };
        this.logger.debug('msg: ' + JSON.stringify(msg));
        response.status(statusCode).json(msg);
    }
}