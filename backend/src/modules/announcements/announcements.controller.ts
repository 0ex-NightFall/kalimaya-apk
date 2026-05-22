import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/jwt-auth.guard';
import { AnnouncementsService } from './announcements.service';
import { AuditService } from '../audit/audit.service';

@Controller('announcements')
@UseGuards(JwtAuthGuard)
export class AnnouncementsController {
  constructor(
    private svc: AnnouncementsService,
    private audit: AuditService,
  ) {}

  @Get() list(@Req() req: any) { return this.svc.list(req.user); }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    const r = await this.svc.create(req.user, body);
    await this.audit.log(req.user.id, req.user.username, 'CREATE_ANNOUNCEMENT', r?.title);
    return r;
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    const r = await this.svc.remove(req.user, id);
    await this.audit.log(req.user.id, req.user.username, 'DELETE_ANNOUNCEMENT', id);
    return r;
  }
}
