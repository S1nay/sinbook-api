import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface IErrorResponse {
  message: string;
  error: string;
  statusCode: (typeof HttpStatus)[keyof typeof HttpStatus];
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const exceptionResponse = exception.getResponse() as IErrorResponse;

    response.status(exceptionResponse.statusCode).json({
      statusCode: exceptionResponse.statusCode,
      message: exceptionResponse.message,
      error: exceptionResponse.error,
      path: request.url,
    });
  }
}
