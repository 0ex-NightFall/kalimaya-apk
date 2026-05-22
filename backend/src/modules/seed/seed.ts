import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Division } from '../divisions/division.entity';
import { User } from '../users/user.entity';

export async function seed(ds: DataSource) {
  const divRepo = ds.getRepository(Division);
  const userRepo = ds.getRepository(User);

  const divisions = [
    { code: 'MANAGEMENT', name: 'Manajemen / Management' },
    { code: 'ARSITEKTUR', name: 'Arsitektur' },
    { code: 'SIPIL', name: 'Sipil / Struktur' },
    { code: 'ADMIN', name: 'Administrasi' },
    { code: 'HR', name: 'HR & Umum' },
    { code: 'RAB', name: 'RAB & Estimasi' },
  ];

  for (const d of divisions) {
    const exists = await divRepo.findOne({ where: { code: d.code } });
    if (!exists) await divRepo.save(divRepo.create(d));
  }

  const mgmt = await divRepo.findOne({ where: { code: 'MANAGEMENT' } });

  // Only seed admin — all other users added manually via UI
  const adminExists = await userRepo.findOne({ where: { username: 'admin' } });
  if (!adminExists) {
    const passwordHash = await bcrypt.hash('kalimaya2024', 12);
    await userRepo.save(userRepo.create({
      fullName: 'Administrator',
      username: 'admin',
      email: 'admin@kalimaya.local',
      passwordHash,
      roleCodes: ['DIRECTOR', 'ADMIN_IT'],
      divisionId: mgmt?.id,
      jobTitle: 'Direktur',
      seniorityLevel: 'TIER1',
      isActive: true,
    }));
  }
}
