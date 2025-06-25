import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    // Determine the HTTP status code
    const errorStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Determine the error message
    const message = this.getErrorMessage(exception);

    // Send the error response
    response.status(errorStatus).json({
      statusCode: errorStatus,
      message: message,
    });
  }

  private getErrorMessage(exception: unknown): string {
    if (typeof exception === 'object' && exception !== null) {
      const responseMessage = (
        exception as { response?: { message?: string | string[] } }
      )?.response?.message;
      const exceptionMessage = (exception as { message?: string }).message;

      if (Array.isArray(responseMessage)) {
        return responseMessage.join(', ');
      } else if (typeof responseMessage === 'string') {
        return responseMessage;
      } else if (typeof exceptionMessage === 'string') {
        return exceptionMessage;
      }
    }
    return 'Internal Server Error';
  }
}
