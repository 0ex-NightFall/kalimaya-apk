import { Body, Controller, Get, Post, Query, Request, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../../shared/jwt-auth.guard';
import { AttendanceService } from './attendance.service';
import { AuditService } from '../audit/audit.service';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(
    private svc: AttendanceService,
    private audit: AuditService,
  ) {}

  @Get('today') today(@Request() req: any) { return this.svc.today(req.user.id); }

  @Post('checkin')
  async checkIn(@Request() req: any, @Body() body: any) {
    const r = await this.svc.checkIn(req.user.id, body.lat, body.lng);
    await this.audit.log(req.user.id, req.user.username, 'CHECKIN', undefined, { status: r?.status });
    return r;
  }

  @Post('checkout')
  async checkOut(@Request() req: any, @Body() body: any) {
    const r = await this.svc.checkOut(req.user.id, body.lat, body.lng);
    await this.audit.log(req.user.id, req.user.username, 'CHECKOUT');
    return r;
  }

  @Get('me') myHistory(@Request() req: any) { return this.svc.myHistory(req.user.id); }

  @Get('export')
  async exportCsv(@Request() req: any, @Query('month') month: string, @Res() res: Response) {
    const m = month || new Date().toISOString().slice(0, 7);
    const csv = await this.svc.exportCsv(req.user.id, m);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="absensi-${m}.csv"`);
    res.send(csv);
  }
}
