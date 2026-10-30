import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Room } from './room.entity';

@Entity('hotels')
export class Hotel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  name: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 255 })
  address: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'tinyint', default: 3 })
  stars: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string;

  @OneToMany(() => Room, (room) => room.hotel, { cascade: true })
  rooms: Room[];

  @CreateDateColumn()
  createdAt: Date;
}
