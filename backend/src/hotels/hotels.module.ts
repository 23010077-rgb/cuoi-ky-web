import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from '../bookings/booking.entity';
import { Hotel } from './hotel.entity';
import { Room } from './room.entity';
import { HotelsController } from './hotels.controller';
import { HotelsService } from './hotels.service';

@Module({
  imports: [TypeOrmModule.forFeature([Hotel, Room, Booking])],
  controllers: [HotelsController],
  providers: [HotelsService],
})
export class HotelsModule {}
