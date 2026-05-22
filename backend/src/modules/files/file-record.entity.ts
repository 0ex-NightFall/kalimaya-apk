import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('files')
export class FileRecord {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: true }) folderId: string;
  @Column() name: string;
  @Column() mimeType: string;
  @Column({ type: 'bigint', default: 0 }) sizeBytes: number;
  @Column() storagePath: string;
  @Column() divisionId: string;
  @Column() uploadedBy: string;
  @CreateDateColumn() createdAt: Date;
}
