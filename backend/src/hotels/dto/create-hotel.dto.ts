import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUrl, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateHotelDto {
  @IsString() @MinLength(2) @MaxLength(150)
  name: string;

  @IsString() @MinLength(2) @MaxLength(100)
  city: string;

  @IsString() @MinLength(2) @MaxLength(255)
  address: string;

  @IsOptional() @IsString() @MaxLength(5000)
  description?: string;

  @Type(() => Number) @IsInt() @Min(1) @Max(5)
  stars: number;

  // Chỉ chấp nhận http/https -> chặn javascript:, data: ...
  @IsOptional() @IsUrl({ protocols: ['http', 'https'], require_protocol: true }) @MaxLength(500)
  imageUrl?: string;
}

export class UpdateHotelDto extends PartialType(CreateHotelDto) {}

export class CreateRoomDto {
  @IsString() @MinLength(2) @MaxLength(100)
  name: string;

  @Type(() => Number) @IsInt() @Min(1)
  pricePerNight: number;

  @Type(() => Number) @IsInt() @Min(1) @Max(20)
  capacity: number;

  @Type(() => Number) @IsInt() @Min(1) @Max(500)
  quantity: number;
}
