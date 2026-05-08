import { Controller, Get, HttpCode } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @HttpCode(200)
  @Get()
  check() {
    return { status: 'ok', uptime: process.uptime() };
  }
}
