import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('announcements')
export class Announcement {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() title: string;
  @Column({ type: 'text' }) body: string;
  @Column() authorId: string;
  @Column({ type: 'varchar', default: 'NORMAL' }) priority: string;
  @Column({ type: 'varchar', nullable: true }) targetDivisionId?: string;
  @Column({ default: true }) isActive: boolean;
  @CreateDateColumn() createdAt: Date;
}
