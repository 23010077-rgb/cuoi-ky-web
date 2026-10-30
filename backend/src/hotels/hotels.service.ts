import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Not, Repository } from 'typeorm';
import { Booking, BookingStatus } from '../bookings/booking.entity';
import { Hotel } from './hotel.entity';
import { Room } from './room.entity';
import { CreateHotelDto, CreateRoomDto, UpdateHotelDto } from './dto/create-hotel.dto';
import { SearchHotelsDto } from './dto/search-hotels.dto';

@Injectable()
export class HotelsService {
  constructor(
    @InjectRepository(Hotel) private readonly hotels: Repository<Hotel>,
    @InjectRepository(Room) private readonly rooms: Repository<Room>,
    @InjectRepository(Booking) private readonly bookings: Repository<Booking>,
  ) {}

  /** Tìm khách sạn theo điểm đến, số khách, hạng sao, giá tối đa (truy vấn tham số hoá, chống SQL injection). */
  async search(q: SearchHotelsDto) {
    const qb = this.hotels.createQueryBuilder('h').leftJoinAndSelect('h.rooms', 'r');

    if (q.destination) {
      qb.andWhere('(LOWER(h.city) LIKE :d OR LOWER(h.name) LIKE :d)', {
        d: `%${q.destination.trim().toLowerCase()}%`,
      });
    }
    if (q.stars) qb.andWhere('h.stars >= :stars', { stars: q.stars });
    if (q.guests) qb.andWhere('r.capacity >= :guests', { guests: q.guests });
    if (q.maxPrice) qb.andWhere('r.pricePerNight <= :maxPrice', { maxPrice: q.maxPrice });

    qb.orderBy('h.stars', 'DESC').addOrderBy('r.pricePerNight', 'ASC');
    const list = await qb.getMany();

    return list.map((h) => ({
      ...h,
      minPrice: h.rooms.length ? Math.min(...h.rooms.map((r) => r.pricePerNight)) : null,
    }));
  }

  async findOne(id: number, checkIn?: string, checkOut?: string) {
    const hotel = await this.hotels.findOne({ where: { id }, relations: { rooms: true } });
    if (!hotel) throw new NotFoundException('Không tìm thấy khách sạn');

    const withDates = checkIn && checkOut;
    const rooms = await Promise.all(
      hotel.rooms.map(async (room) => {
        if (!withDates) return { ...room, available: room.quantity };
        const used = await this.bookings.count({
          where: {
            room: { id: room.id },
            status: Not(BookingStatus.CANCELLED),
            checkIn: LessThan(checkOut),
            checkOut: MoreThan(checkIn),
          },
        });
        return { ...room, available: Math.max(room.quantity - used, 0) };
      }),
    );
    return { ...hotel, rooms };
  }

  create(dto: CreateHotelDto) {
    return this.hotels.save(this.hotels.create(dto));
  }

  async update(id: number, dto: UpdateHotelDto) {
    const hotel = await this.hotels.findOne({ where: { id } });
    if (!hotel) throw new NotFoundException('Không tìm thấy khách sạn');
    return this.hotels.save(Object.assign(hotel, dto));
  }

  async remove(id: number) {
    const res = await this.hotels.delete(id);
    if (!res.affected) throw new NotFoundException('Không tìm thấy khách sạn');
    return { message: 'Đã xoá khách sạn' };
  }

  async addRoom(hotelId: number, dto: CreateRoomDto) {
    const hotel = await this.hotels.findOne({ where: { id: hotelId } });
    if (!hotel) throw new NotFoundException('Không tìm thấy khách sạn');
    if (dto.capacity < 1) throw new BadRequestException('Sức chứa không hợp lệ');
    return this.rooms.save(this.rooms.create({ ...dto, hotel }));
  }

  async removeRoom(roomId: number) {
    const res = await this.rooms.delete(roomId);
    if (!res.affected) throw new NotFoundException('Không tìm thấy phòng');
    return { message: 'Đã xoá phòng' };
  }
}
