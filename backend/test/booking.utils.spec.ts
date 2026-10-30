import { BadRequestException } from '@nestjs/common';
import { assertValidStay, calcNights } from '../src/bookings/booking.utils';

describe('booking.utils', () => {
  const today = new Date('2026-11-01T00:00:00Z');

  describe('calcNights', () => {
    it('tính đúng số đêm', () => {
      expect(calcNights('2026-11-10', '2026-11-13')).toBe(3);
    });
    it('trả NaN khi ngày không hợp lệ', () => {
      expect(Number.isNaN(calcNights('abc', '2026-11-13'))).toBe(true);
    });
  });

  describe('assertValidStay', () => {
    it('thành công: trả về số đêm', () => {
      expect(assertValidStay('2026-11-10', '2026-11-12', today)).toBe(2);
    });
    it('lỗi: trả phòng cùng ngày hoặc trước nhận phòng', () => {
      expect(() => assertValidStay('2026-11-10', '2026-11-10', today)).toThrow(BadRequestException);
      expect(() => assertValidStay('2026-11-10', '2026-11-09', today)).toThrow(BadRequestException);
    });
    it('lỗi: nhận phòng trong quá khứ', () => {
      expect(() => assertValidStay('2026-10-01', '2026-10-03', today)).toThrow('quá khứ');
    });
    it('lỗi: quá 30 đêm', () => {
      expect(() => assertValidStay('2026-11-02', '2026-12-20', today)).toThrow('tối đa');
    });
    it('cho phép nhận phòng ngay hôm nay', () => {
      expect(assertValidStay('2026-11-01', '2026-11-02', today)).toBe(1);
    });
  });
});
