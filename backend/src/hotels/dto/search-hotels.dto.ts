import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export class SearchHotelsDto {
  /** Tên thành phố hoặc tên khách sạn */
  @IsOptional() @IsString() @MaxLength(100)
  destination?: string;

  @IsOptional() @Matches(DATE, { message: 'checkIn phải có dạng YYYY-MM-DD' })
  checkIn?: string;

  @IsOptional() @Matches(DATE, { message: 'checkOut phải có dạng YYYY-MM-DD' })
  checkOut?: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(20)
  guests?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(5)
  stars?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  maxPrice?: number;
}

export class AvailabilityQueryDto {
  @IsOptional() @Matches(DATE, { message: 'checkIn phải có dạng YYYY-MM-DD' })
  checkIn?: string;

  @IsOptional() @Matches(DATE, { message: 'checkOut phải có dạng YYYY-MM-DD' })
  checkOut?: string;
}
