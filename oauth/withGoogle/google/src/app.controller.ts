import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('auth/google')
  @UseGuards(AuthGuard('google'))
  login() {

  }

  @Get('auth/google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() req) {
    return {
      message: 'Google auth succesfull',
      user: req.user,
    }
  }

  @Get()
  getHello(): string {
    console.log('Client ID ' + process.env.CLIENT_ID);
    return this.appService.getHello();
  }
}
