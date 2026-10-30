import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { numericTransformer } from '../common/numeric.transformer';
import { Hotel } from './hotel.entity';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'decimal', precision: 12, scale: 0, transformer: numericTransformer })
  pricePerNight: number;

  @Column({ type: 'int' })
  capacity: number;

  /** Số phòng cùng loại hiện có */
  @Column({ type: 'int', default: 1 })
  quantity: number;

  @ManyToOne(() => Hotel, (hotel) => hotel.rooms, { onDelete: 'CASCADE' })
  hotel: Hotel;
}
