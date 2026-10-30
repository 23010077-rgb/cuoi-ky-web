import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Bắt MỌI lỗi. Lỗi HttpException trả đúng mã + thông báo;
 * lỗi không lường trước chỉ ghi log phía server, client nhận thông báo chung
 * (không lộ stack trace, câu lệnh SQL hay đường dẫn nội bộ).
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const message =
        typeof body === 'string' ? body : ((body as any).message ?? exception.message);
      return res.status(status).json({
        statusCode: status,
        message,
        path: req.url,
        timestamp: new Date().toISOString(),
      });
    }

    this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    return res.status(500).json({
      statusCode: 500,
      message: 'Lỗi hệ thống, vui lòng thử lại sau',
      path: req.url,
      timestamp: new Date().toISOString(),
    });
  }
}
