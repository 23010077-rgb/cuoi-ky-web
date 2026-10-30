import { BadRequestException } from '@nestjs/common';

const DAY_MS = 86_400_000;
export const MAX_NIGHTS = 30;

/** Số đêm giữa hai ngày dạng YYYY-MM-DD. */
export function calcNights(checkIn: string, checkOut: string): number {
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.round(ms / DAY_MS);
}

/** Kiểm tra khoảng lưu trú hợp lệ, trả về số đêm. */
export function assertValidStay(checkIn: string, checkOut: string, today: Date = new Date()): number {
  const nights = calcNights(checkIn, checkOut);
  if (Number.isNaN(nights) || nights < 1) {
    throw new BadRequestException('Ngày trả phòng phải sau ngày nhận phòng');
  }
  if (nights > MAX_NIGHTS) {
    throw new BadRequestException(`Chỉ được đặt tối đa ${MAX_NIGHTS} đêm mỗi lần`);
  }
  const todayStr = today.toISOString().slice(0, 10);
  if (checkIn < todayStr) {
    throw new BadRequestException('Ngày nhận phòng không được ở quá khứ');
  }
  return nights;
}
