import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Student {
  @PrimaryColumn({ length: 10 })
  SID: string;

  @Column({ length: 30 })
  SNAME: string;

  @Column({ length: 30 })
  EMAIL: string;

  @Column({ length: 10, nullable: true })
  Tutor_id: string;
}
