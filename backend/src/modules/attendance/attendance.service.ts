import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './attendance.entity';

// Work hours: 09:00 - 17:00 WIB (UTC+7)
const WORK_START_HOUR = 9;   // 09:00 WIB
const LATE_GRACE_MINUTES = 0; // no grace

function getWIBHour(date: Date): number {
  return (date.getUTCHours() + 7) % 24;
}
function getWIBMinute(date: Date): number {
  return date.getUTCMinutes();
}

function calcStatus(checkInAt: Date): string {
  const h = getWIBHour(checkInAt);
  const m = getWIBMinute(checkInAt);
  if (h < WORK_START_HOUR) return 'EARLY';
  if (h === WORK_START_HOUR && m === 0) return 'ON_TIME';
  if (h === WORK_START_HOUR && m <= LATE_GRACE_MINUTES) return 'ON_TIME';
  return 'LATE';
}

@Injectable()
export class AttendanceService {
  constructor(@InjectRepository(Attendance) private repo: Repository<Attendance>) {}

  today(userId: string) {
    const date = new Date().toISOString().split('T')[0];
    return this.repo.findOne({ where: { userId, date } });
  }

  async checkIn(userId: string, lat?: number, lng?: number) {
    const date = new Date().toISOString().split('T')[0];
    let rec = await this.repo.findOne({ where: { userId, date } });
    if (!rec) rec = this.repo.create({ userId, date });
    const now = new Date();
    rec.checkInAt = now;
    rec.status = calcStatus(now);
    if (lat) rec.checkInLat = lat;
    if (lng) rec.checkInLng = lng;
    return this.repo.save(rec);
  }

  async checkOut(userId: string, lat?: number, lng?: number) {
    const date = new Date().toISOString().split('T')[0];
    const rec = await this.repo.findOne({ where: { userId, date } });
    if (!rec) throw new Error('No check-in found for today');
    rec.checkOutAt = new Date();
    if (lat) rec.checkOutLat = lat;
    if (lng) rec.checkOutLng = lng;
    return this.repo.save(rec);
  }

  myHistory(userId: string) {
    return this.repo.find({ where: { userId }, order: { date: 'DESC' }, take: 30 });
  }

  async exportCsv(userId: string, month: string) {
    // month format: YYYY-MM
    const records = await this.repo
      .createQueryBuilder('a')
      .where('a.userId = :userId', { userId })
      .andWhere("to_char(a.date::date, 'YYYY-MM') = :month", { month })
      .orderBy('a.date', 'ASC')
      .getMany();
    const header = 'Tanggal,Masuk,Pulang,Status,Durasi (jam)';
    const rows = records.map(r => {
      const cin = r.checkInAt ? new Date(r.checkInAt).toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' }) : '-';
      const cout = r.checkOutAt ? new Date(r.checkOutAt).toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' }) : '-';
      const dur = r.checkInAt && r.checkOutAt ? ((new Date(r.checkOutAt).getTime() - new Date(r.checkInAt).getTime()) / 3600000).toFixed(1) : '-';
      return `${r.date},${cin},${cout},${r.status || '-'},${dur}`;
    });
    return [header, ...rows].join('\n');
  }

  teamHistory(divisionId: string) {
    return this.repo.createQueryBuilder('a')
      .innerJoin('users', 'u', 'u.id = a.userId AND u.divisionId = :divisionId', { divisionId })
      .orderBy('a.date', 'DESC')
      .take(100)
      .getMany();
  }
}
