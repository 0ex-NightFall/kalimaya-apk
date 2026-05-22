import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column() username: string;
  @Column() action: string;
  @Column({ nullable: true }) target: string;
  @Column({ type: 'jsonb', nullable: true }) meta: any;
  @CreateDateColumn() createdAt: Date;
}
