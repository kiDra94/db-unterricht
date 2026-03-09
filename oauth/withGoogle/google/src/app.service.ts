import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(req): string {
    return `Hello ${req.user.name}!`;
  }
}
