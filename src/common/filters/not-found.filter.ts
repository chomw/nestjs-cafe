import { Catch, NotFoundException, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Response, Request } from 'express';

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 무조건 메인 홈으로 보내기 
    response.redirect('/');    
  }
}