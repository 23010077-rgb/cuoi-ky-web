import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { Booking, BookingStatus } from '../src/bookings/booking.entity';
import { BookingsService } from '../src/bookings/bookings.service';

const future = (days: number) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

describe('BookingsService', () => {
  let service: BookingsService;
  const manager = { findOne: jest.fn(), count: jest.fn(), create: jest.fn(), save: jest.fn() };
  const dataSource = { transaction: jest.fn((cb) => cb(manager)) };
  const repo = { find: jest.fn(), findOne: jest.fn(), save: jest.fn() };

  const room = { id: 1, capacity: 2, quantity: 2, pricePerNight: 1000000 };

  beforeEach(async () => {
    jest.clearAllMocks();
    manager.create.mockImplementation((_e, data) => ({ ...data }));
    manager.save.mockImplementation(async (b) => ({ id: 10, ...b }));
    const mod = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: getDataSourceToken(), useValue: dataSource },
        { provide: getRepositoryToken(Booking), useValue: repo },
      ],
    }).compile();
    service = mod.get(BookingsService);
  });

  describe('create', () => {
    const dto = (over = {}) => ({ roomId: 1, checkIn: future(5), checkOut: future(8), guests: 2, ...over });

    it('thành công: tổng tiền = số đêm × giá (tính ở server)', async () => {
      manager.findOne.mockResolvedValue(room);
      manager.count.mockResolvedValue(0);
      const res = await service.create('u1', dto());
      expect(res.totalPrice).toBe(3_000_000);
      expect(res.status).toBe(BookingStatus.CONFIRMED);
      expect(manager.save).toHaveBeenCalledTimes(1);
    });

    it('lỗi: phòng không tồn tại -> 404', async () => {
      manager.findOne.mockResolvedValue(null);
      await expect(service.create('u1', dto())).rejects.toThrow(NotFoundException);
    });

    it('lỗi: vượt sức chứa', async () => {
      manager.findOne.mockResolvedValue(room);
      await expect(service.create('u1', dto({ guests: 5 }))).rejects.toThrow('tối đa 2 khách');
    });

    it('lỗi: hết phòng trong khoảng ngày (không double-booking)', async () => {
      manager.findOne.mockResolvedValue(room);
      manager.count.mockResolvedValue(2); // đã dùng hết quantity = 2
      await expect(service.create('u1', dto())).rejects.toThrow('đã hết');
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('lỗi: ngày không hợp lệ, không mở transaction', async () => {
      await expect(service.create('u1', dto({ checkOut: future(5) }))).rejects.toThrow(BadRequestException);
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('thành công: huỷ đơn của chính mình', async () => {
      repo.findOne.mockResolvedValue({ id: 1, status: BookingStatus.CONFIRMED, checkIn: future(10) });
      repo.save.mockImplementation(async (b) => b);
      const res = await service.cancel('u1', 1);
      expect(res.status).toBe(BookingStatus.CANCELLED);
    });

    it('lỗi: đơn của người khác -> 404 (chống IDOR)', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.cancel('u2', 1)).rejects.toThrow(NotFoundException);
    });

    it('lỗi: đã huỷ', async () => {
      repo.findOne.mockResolvedValue({ id: 1, status: BookingStatus.CANCELLED, checkIn: future(10) });
      await expect(service.cancel('u1', 1)).rejects.toThrow('huỷ trước đó');
    });

    it('lỗi: đơn đã/đang diễn ra', async () => {
      repo.findOne.mockResolvedValue({ id: 1, status: BookingStatus.CONFIRMED, checkIn: future(-1) });
      await expect(service.cancel('u1', 1)).rejects.toThrow('đã/đang diễn ra');
    });
  });

  describe('updateStatus (admin)', () => {
    it('lỗi: đơn không tồn tại', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.updateStatus(99, BookingStatus.COMPLETED)).rejects.toThrow(NotFoundException);
    });
  });
});
