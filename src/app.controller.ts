import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiTags('App Health Check')
  @ApiOperation({ summary: 'Server is responding or not' })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @ApiTags('Health Check')
  @ApiOperation({ summary: 'Health check endpoint for Docker' })
  @Get('health')
  getHealth(): object {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'the-project-name-backend'
    };
  }
}
