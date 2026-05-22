import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Division } from '../divisions/division.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() fullName: string;
  @Column({ unique: true }) username: string;
  @Column({ unique: true }) email: string;
  @Column() passwordHash: string;
  @Column({ default: true }) isActive: boolean;
  @Column('simple-array', { default: '' }) roleCodes: string[];
  @Column({ nullable: true }) divisionId: string;
  @Column({ nullable: true }) jobTitle: string;
  @Column({ nullable: true }) seniorityLevel: string;
  @ManyToOne(() => Division, division => division.users, { nullable: true })
  @JoinColumn({ name: 'divisionId' }) division?: Division;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
