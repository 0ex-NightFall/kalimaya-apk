import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

@Injectable()
export class AuditService {
  constructor(@InjectRepository(AuditLog) private repo: Repository<AuditLog>) {}

  log(userId: string, username: string, action: string, target?: string, meta?: any) {
    return this.repo.save(this.repo.create({ userId, username, action, target, meta }));
  }

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' }, take: 200 });
  }
}
