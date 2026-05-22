import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column({ type: 'date' }) date: string;
  @Column({ type: 'timestamp', nullable: true }) checkInAt?: Date;
  @Column({ type: 'timestamp', nullable: true }) checkOutAt?: Date;
  @Column({ type: 'numeric', nullable: true }) checkInLat?: number;
  @Column({ type: 'numeric', nullable: true }) checkInLng?: number;
  @Column({ type: 'numeric', nullable: true }) checkOutLat?: number;
  @Column({ type: 'numeric', nullable: true }) checkOutLng?: number;
  @Column({ type: 'varchar', nullable: true }) status?: string;
  @Column({ type: 'text', nullable: true }) note?: string;
}
