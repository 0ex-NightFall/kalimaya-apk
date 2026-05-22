import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { Division } from '../divisions/division.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(Division) private divisions: Repository<Division>,
  ) {}

  listDivisions() {
    return this.divisions.find({ order: { name: 'ASC' } });
  }

  findAll() {
    return this.users.find({ relations: { division: true } });
  }

  findOne(id: string) {
    return this.users.findOne({ where: { id }, relations: { division: true } });
  }

  async create(dto: {
    fullName: string;
    username: string;
    email: string;
    password: string;
    divisionId?: string;
    roleCodes?: string[];
    jobTitle?: string;
  }) {
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.users.create({
      fullName: dto.fullName,
      username: dto.username,
      email: dto.email,
      divisionId: dto.divisionId,
      jobTitle: dto.jobTitle,
      passwordHash,
      roleCodes: dto.roleCodes || ['EMPLOYEE'],
      isActive: true,
    });
    return this.users.save(user);
  }

  async update(id: string, dto: Partial<User>) {
    await this.users.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) return { ok: true };

    const directors = await this.users.count({ where: { roleCodes: Not('') } });
    if (user.username === 'admin' && directors <= 1) {
      throw new BadRequestException('Admin utama tidak boleh dihapus');
    }

    await this.users.delete(id);
    return { ok: true };
  }
}
