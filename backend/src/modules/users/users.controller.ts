import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/jwt-auth.guard';
import { Roles } from '../../shared/roles.decorator';
import { RolesGuard } from '../../shared/roles.guard';
import { UsersService } from './users.service';
import { AuditService } from '../audit/audit.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private svc: UsersService,
    private audit: AuditService,
  ) {}

  @Get()
  @Roles('DIRECTOR', 'HR', 'ADMIN_IT')
  findAll() { return this.svc.findAll(); }

  @Get('divisions')
  @Roles('DIRECTOR', 'HR', 'ADMIN_IT')
  divisions() { return this.svc.listDivisions(); }

  @Get('me')
  me(@Request() req: any) { return this.svc.findOne(req.user.id); }

  @Get(':id')
  @Roles('DIRECTOR', 'HR', 'ADMIN_IT')
  findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Post()
  @Roles('DIRECTOR', 'ADMIN_IT', 'HR')
  async create(@Request() req: any, @Body() body: any) {
    const u = await this.svc.create(body);
    await this.audit.log(req.user.id, req.user.username, 'CREATE_USER', u.username, { divisionId: u.divisionId });
    return u;
  }

  @Patch(':id')
  @Roles('DIRECTOR', 'ADMIN_IT')
  async update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    const u = await this.svc.update(id, body);
    await this.audit.log(req.user.id, req.user.username, 'UPDATE_USER', u?.username || id);
    return u;
  }

  @Delete(':id')
  @Roles('DIRECTOR', 'ADMIN_IT', 'HR')
  async remove(@Request() req: any, @Param('id') id: string) {
    const u = await this.svc.findOne(id);
    const r = await this.svc.remove(id);
    await this.audit.log(req.user.id, req.user.username, 'DELETE_USER', u?.username || id);
    return r;
  }
}
