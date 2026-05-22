import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ProjectStatus } from '../../shared/enums';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column({ unique: true }) code: string;
  @Column({ nullable: true }) divisionId: string;
  @Column({ type: 'varchar', default: ProjectStatus.PLANNING }) status: ProjectStatus;
  @Column({ default: 0 }) progressPercent: number;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ nullable: true }) picUserId: string;
  @Column({ type: 'date', nullable: true }) startDate: string;
  @Column({ type: 'date', nullable: true }) endDate: string;
  @CreateDateColumn() createdAt: Date;
}
