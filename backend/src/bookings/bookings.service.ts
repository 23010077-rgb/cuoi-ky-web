import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, LessThan, MoreThan, Not, Repository } from 'typeorm';
import { Room } from '../hotels/room.entity';
import { User } from '../users/user.entity';
import { Booking, BookingStatus } from './booking.entity';
import { assertValidStay } from './booking.utils';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Booking) private readonly repo: Repository<Booking>,
  ) {}

  /**
   * Đặt phòng trong MỘT transaction + khoá hàng phòng (pessimistic write)
   * để hai người đặt cùng lúc không thể vượt quá số phòng còn trống.
   */
  async create(userId: string, dto: CreateBookingDto) {
    const nights = assertValidStay(dto.checkIn, dto.checkOut);

    return this.dataSource.transaction(async (manager) => {
      const room = await manager.findOne(Room, {
        where: { id: dto.roomId },
        relations: { hotel: true },
        lock: { mode: 'pessimistic_write' },
      });
      if (!room) throw new NotFoundException('Không tìm thấy phòng');
      if (dto.guests > room.capacity) {
        throw new BadRequestException(`Phòng này chứa tối đa ${room.capacity} khách`);
      }

      const used = await manager.count(Booking, {
        where: {
          room: { id: room.id },
          status: Not(BookingStatus.CANCELLED),
          checkIn: LessThan(dto.checkOut),
          checkOut: MoreThan(dto.checkIn),
        },
      });
      if (used >= room.quantity) {
        throw new BadRequestException('Loại phòng này đã hết trong khoảng ngày bạn chọn');
      }

      const booking = manager.create(Booking, {
        user: { id: userId } as User,
        room,
        checkIn: dto.checkIn,
        checkOut: dto.checkOut,
        guests: dto.guests,
        totalPrice: nights * room.pricePerNight, // giá luôn tính ở server, không tin client
        status: BookingStatus.CONFIRMED,
      });
      return manager.save(booking);
    });
  }

  findMine(userId: string) {
    return this.repo.find({
      where: { user: { id: userId } },
      relations: { room: { hotel: true } },
      order: { createdAt: 'DESC' },
    });
  }

  /** Người dùng chỉ huỷ được đơn CỦA MÌNH (kiểm tra sở hữu -> chống IDOR). */
  async cancel(userId: string, id: number) {
    const booking = await this.repo.findOne({ where: { id, user: { id: userId } } });
    if (!booking) throw new NotFoundException('Không tìm thấy đơn đặt phòng');
    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Đơn đã được huỷ trước đó');
    }
    if (booking.checkIn <= new Date().toISOString().slice(0, 10)) {
      throw new BadRequestException('Không thể huỷ đơn đã/đang diễn ra');
    }
    booking.status = BookingStatus.CANCELLED;
    return this.repo.save(booking);
  }

  findAll() {
    return this.repo.find({
      relations: { user: true, room: { hotel: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: number, status: BookingStatus) {
    const booking = await this.repo.findOne({ where: { id } });
    if (!booking) throw new NotFoundException('Không tìm thấy đơn đặt phòng');
    booking.status = status;
    return this.repo.save(booking);
  }
}
