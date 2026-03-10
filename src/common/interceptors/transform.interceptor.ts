import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// 아래와 같은 일관된 구조로 클라이언트에게 리턴
export interface Response<T> {
    success: boolean;
    statusCode: number;
    data: T;
    timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
        
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();

        return next.handle().pipe(
            map(data => ({
                success: true,
                statusCode: response.statusCode,
                data: data || null,
                timestamp: new Date().toISOString()
            })),
        );
    }
}