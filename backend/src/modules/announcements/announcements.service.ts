import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from './announcement.entity';

const ALLOWED_ROLES = ['DIRECTOR', 'HR', 'ADMIN_IT'];

@Injectable()
export class AnnouncementsService {
  constructor(@InjectRepository(Announcement) private repo: Repository<Announcement>) {}

  list(user: any) {
    return this.repo.find({
      where: [
        { isActive: true, targetDivisionId: undefined as any },
        ...(user.divisionId ? [{ isActive: true, targetDivisionId: user.divisionId }] : []),
      ],
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async create(user: any, dto: { title: string; body: string; priority?: string; targetDivisionId?: string }) {
    if (!user.roles?.some((r: string) => ALLOWED_ROLES.includes(r))) {
      throw new ForbiddenException('Hanya HR / Direktur / Admin IT yang bisa broadcast');
    }
    const rec = this.repo.create({
      title: dto.title,
      body: dto.body,
      authorId: user.id,
      priority: dto.priority || 'NORMAL',
      targetDivisionId: dto.targetDivisionId,
    });
    return this.repo.save(rec);
  }

  async remove(user: any, id: string) {
    const rec = await this.repo.findOne({ where: { id } });
    if (!rec) throw new NotFoundException();
    const canManage = user.roles?.includes('DIRECTOR') || user.roles?.includes('ADMIN_IT') || rec.authorId === user.id;
    if (!canManage) throw new ForbiddenException();
    await this.repo.delete(id);
    return { ok: true };
  }
}
