import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly _appService: AppService) {}

  @Get('health')
  public async healthCheck(): Promise<string> {
    return this._appService.healthCheck();
  }
}
