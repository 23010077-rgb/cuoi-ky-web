import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { numericTransformer } from '../common/numeric.transformer';
import { Room } from '../hotels/room.entity';
import { User } from '../users/user.entity';

export enum BookingStatus {
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  user: User;

  @ManyToOne(() => Room, { onDelete: 'CASCADE', nullable: false })
  room: Room;

  @Column({ type: 'date' })
  checkIn: string;

  @Column({ type: 'date' })
  checkOut: string;

  @Column({ type: 'int' })
  guests: number;

  @Column({ type: 'decimal', precision: 14, scale: 0, transformer: numericTransformer })
  totalPrice: number;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.CONFIRMED })
  status: BookingStatus;

  @CreateDateColumn()
  createdAt: Date;
}
