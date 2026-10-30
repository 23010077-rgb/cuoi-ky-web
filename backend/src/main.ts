import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // Các header bảo mật (CSP, X-Frame-Options, HSTS, nosniff, ẩn X-Powered-By ...)
  app.use(helmet());
  app.use(cookieParser());

  // CORS: chỉ cho đúng origin của frontend + cho phép gửi cookie
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  });

  // Validate toàn bộ đầu vào: bỏ trường lạ, từ chối trường không khai báo, ép kiểu
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  // Tôn trọng @Exclude() (ẩn passwordHash) khi trả JSON
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new AllExceptionsFilter());

  // Tài liệu API (Swagger) tại /api/docs — tắt ở production
  if (process.env.NODE_ENV !== 'production') {
    const doc = new DocumentBuilder()
      .setTitle('Booking API')
      .setDescription('API đặt phòng khách sạn')
      .setVersion('1.0')
      .addCookieAuth('access_token')
      .build();
    SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, doc));
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
