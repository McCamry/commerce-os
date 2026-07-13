import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  meta?: any;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data already contains a meta property, extract it and move it to the root level
        if (
          data &&
          typeof data === 'object' &&
          'meta' in data &&
          'data' in data
        ) {
          const resObj = data as Record<string, unknown>;
          return {
            success: true,
            data: resObj.data as T,
            meta: resObj.meta,
          };
        }
        return {
          success: true,
          data: data as T,
        };
      }),
    );
  }
}
