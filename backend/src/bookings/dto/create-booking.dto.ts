import { Type } from 'class-transformer';
import { IsEnum, IsInt, Matches, Max, Min } from 'class-validator';
import { BookingStatus } from '../booking.entity';

export class CreateBookingDto {
  @Type(() => Number) @IsInt() @Min(1)
  roomId: number;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'checkIn phải có dạng YYYY-MM-DD' })
  checkIn: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'checkOut phải có dạng YYYY-MM-DD' })
  checkOut: string;

  @Type(() => Number) @IsInt() @Min(1) @Max(20)
  guests: number;
}

export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus, { message: 'Trạng thái không hợp lệ' })
  status: BookingStatus;
}
