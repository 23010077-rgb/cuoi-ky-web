import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Booking } from '../src/bookings/booking.entity';
import { Hotel } from '../src/hotels/hotel.entity';
import { HotelsService } from '../src/hotels/hotels.service';
import { Room } from '../src/hotels/room.entity';

describe('HotelsService', () => {
  let service: HotelsService;
  const qb: any = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };
  const hotels = { createQueryBuilder: jest.fn(() => qb), findOne: jest.fn(), delete: jest.fn(), save: jest.fn(), create: jest.fn((x) => x) };
  const rooms = { save: jest.fn(), create: jest.fn((x) => x), delete: jest.fn() };
  const bookings = { count: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const mod = await Test.createTestingModule({
      providers: [
        HotelsService,
        { provide: getRepositoryToken(Hotel), useValue: hotels },
        { provide: getRepositoryToken(Room), useValue: rooms },
        { provide: getRepositoryToken(Booking), useValue: bookings },
      ],
    }).compile();
    service = mod.get(HotelsService);
  });

  it('search: dùng tham số hoá và tính minPrice', async () => {
    qb.getMany.mockResolvedValue([
      { id: 1, rooms: [{ pricePerNight: 900000 }, { pricePerNight: 500000 }] },
      { id: 2, rooms: [] },
    ]);
    const res = await service.search({ destination: "Hà Nội'; DROP TABLE users;--", guests: 2 });
    expect(res[0].minPrice).toBe(500000);
    expect(res[1].minPrice).toBeNull();
    // giá trị người dùng chỉ đi vào tham số, không nối chuỗi vào câu SQL
    const dCall = qb.andWhere.mock.calls.find((c) => c[0].includes(':d'));
    expect(dCall[0]).not.toContain('DROP');
    expect(dCall[1].d).toContain('drop table');
  });

  it('findOne: tính số phòng còn trống theo ngày', async () => {
    hotels.findOne.mockResolvedValue({ id: 1, rooms: [{ id: 5, quantity: 3 }] });
    bookings.count.mockResolvedValue(2);
    const res = await service.findOne(1, '2026-12-01', '2026-12-03');
    expect(res.rooms[0].available).toBe(1);
  });

  it('findOne: không có ngày thì available = quantity', async () => {
    hotels.findOne.mockResolvedValue({ id: 1, rooms: [{ id: 5, quantity: 3 }] });
    const res = await service.findOne(1);
    expect(res.rooms[0].available).toBe(3);
    expect(bookings.count).not.toHaveBeenCalled();
  });

  it('findOne: lỗi 404 khi không có khách sạn', async () => {
    hotels.findOne.mockResolvedValue(null);
    await expect(service.findOne(404)).rejects.toThrow(NotFoundException);
  });

  it('remove: lỗi 404 khi không xoá được', async () => {
    hotels.delete.mockResolvedValue({ affected: 0 });
    await expect(service.remove(1)).rejects.toThrow(NotFoundException);
  });

  it('addRoom: lỗi 404 khi khách sạn không tồn tại', async () => {
    hotels.findOne.mockResolvedValue(null);
    await expect(service.addRoom(1, { name: 'A', pricePerNight: 1, capacity: 2, quantity: 1 })).rejects.toThrow(NotFoundException);
  });
});
