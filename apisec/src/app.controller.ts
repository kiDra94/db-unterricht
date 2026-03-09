/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport'; // unterstützt die Verwendung von Passport-Strategi Guards

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(AuthGuard('basic')) // AuthGuard mit der 'basic' Strategie verwenden
  @Get()
  getHello(@Req() req) {
    return {
      message: this.appService.getHello(),
      user: req.user, // Zugriff auf die Benutzerdaten, die von der Strategie zurückgegeben werden
    };
  }
}
