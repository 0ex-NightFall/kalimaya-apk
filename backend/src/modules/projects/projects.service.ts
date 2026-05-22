import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';

@Injectable()
export class ProjectsService {
  constructor(@InjectRepository(Project) private repo: Repository<Project>) {}

  findAll(user: any) {
    if (user.roles.includes('DIRECTOR')) return this.repo.find();
    return this.repo.find({ where: { divisionId: user.divisionId } });
  }

  findOne(id: string) { return this.repo.findOne({ where: { id } }); }

  create(dto: Partial<Project>) { return this.repo.save(this.repo.create(dto)); }

  async update(id: string, dto: Partial<Project>) {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }
}
