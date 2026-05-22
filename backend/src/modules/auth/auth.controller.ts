import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuditService } from '../audit/audit.service';

@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    private audit: AuditService,
  ) {}

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const result = await this.auth.login(body.username, body.password);
    await this.audit.log(result.user.id, result.user.username, 'LOGIN');
    return result;
  }
}
