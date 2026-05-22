import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileRecord } from './file-record.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FilesService {
  constructor(@InjectRepository(FileRecord) private repo: Repository<FileRecord>) {}

  async list(user: any) {
    if (user.roles?.includes('DIRECTOR') || user.roles?.includes('ADMIN_IT')) {
      return this.repo.find({ order: { createdAt: 'DESC' } });
    }
    return this.repo.find({ where: { divisionId: user.divisionId }, order: { createdAt: 'DESC' } });
  }

  async create(user: any, file: Express.Multer.File) {
    const rec = this.repo.create({
      name: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      storagePath: file.path,
      divisionId: user.divisionId,
      uploadedBy: user.id,
    });
    return this.repo.save(rec);
  }

  async getOne(id: string, user: any) {
    const rec = await this.repo.findOne({ where: { id } });
    if (!rec) throw new NotFoundException('File not found');
    const allowed = user.roles?.includes('DIRECTOR') || user.roles?.includes('ADMIN_IT') || rec.divisionId === user.divisionId;
    if (!allowed) throw new ForbiddenException('No access to this file');
    return rec;
  }

  async remove(id: string, user: any) {
    const rec = await this.getOne(id, user);
    const isOwner = rec.uploadedBy === user.id;
    const canManage = user.roles?.includes('DIRECTOR') || user.roles?.includes('ADMIN_IT');
    if (!isOwner && !canManage) throw new ForbiddenException('Cannot delete this file');
    try { fs.unlinkSync(rec.storagePath); } catch {}
    await this.repo.delete(id);
    return { ok: true };
  }
}
