import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { Booking } from './bookings/booking.entity';
import { BookingsModule } from './bookings/bookings.module';
import { Hotel } from './hotels/hotel.entity';
import { Room } from './hotels/room.entity';
import { HotelsModule } from './hotels/hotels.module';
import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Giới hạn tốc độ toàn cục: 100 request / phút / IP (chống spam, DoS đơn giản)
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    // Kết nối CSDL + ORM
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql' as const,
        host: config.get('DB_HOST', 'localhost'),
        port: parseInt(config.get('DB_PORT', '3306'), 10),
        username: config.getOrThrow<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.getOrThrow<string>('DB_NAME'),
        entities: [User, Hotel, Room, Booking],
        // synchronize chỉ bật ở môi trường dev; production phải dùng migration
        synchronize: config.get('NODE_ENV') !== 'production',
        charset: 'utf8mb4',
      }),
    }),
    UsersModule,
    AuthModule,
    HotelsModule,
    BookingsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
