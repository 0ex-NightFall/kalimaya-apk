import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  health() {
    return {
      ok: true,
      app: 'kalimaya-backend',
      ts: new Date().toISOString(),
    };
  }
}
