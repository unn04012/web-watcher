import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  public async healthCheck(): Promise<string> {
    return 'OK';
  }
}
