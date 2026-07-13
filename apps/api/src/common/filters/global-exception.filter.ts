import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message: string | string[] = 'Internal server error';
    let details: unknown = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resObj = exceptionResponse as Record<string, unknown>;
        message =
          typeof resObj.message === 'string' || Array.isArray(resObj.message)
            ? (resObj.message as string | string[])
            : exception.message;

        // Map common NestJS status codes to our standard string codes
        switch (status) {
          case HttpStatus.BAD_REQUEST:
            code = 'VALIDATION_ERROR';
            details = resObj.message; // Often an array in ValidationPipe
            break;
          case HttpStatus.UNAUTHORIZED:
            code = 'UNAUTHORIZED';
            break;
          case HttpStatus.FORBIDDEN:
            code = 'FORBIDDEN';
            break;
          case HttpStatus.NOT_FOUND:
            code = 'NOT_FOUND';
            break;
          case HttpStatus.CONFLICT:
            code = 'CONFLICT';
            break;
          default:
            code = typeof resObj.error === 'string' ? resObj.error : 'ERROR';
        }
      } else if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      }
    } else if (exception instanceof Error) {
      // Non-HTTP exceptions (e.g., Prisma errors) can be handled here
      message = exception.message;
    }

    response.status(status).json({
      success: false,
      error: {
        code,
        message: Array.isArray(message) ? message[0] : message,
        details: details !== message ? details : undefined,
      },
    });
  }
}
