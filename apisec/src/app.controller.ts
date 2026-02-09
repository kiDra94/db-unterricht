import { Controller, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Headers('authorization') auth?: string): string {
    //? heisst das es NULLable ist!, wenn nichts kommt steht NULL
    if (!auth || !auth.startsWith('Basic ')) {
      throw new UnauthorizedException('Missing Basic authorization header');
    }
    const base64Credentials = auth.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    console.log('Received Basic auth header:', base64Credentials);
    console.log('Decoded credentials:', credentials);
    const [username, password] = credentials.split(':');
    console.log('Username:', username);
    console.log('Password:', password);
    if (username !== 'user' || password !== 'secret') {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.appService.getHello();
  }
}
