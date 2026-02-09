import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport'; // unterstützt die Verwendung von Passport-Strategi Guards

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(AuthGuard('basic')) // AuthGuard mit der 'basic' Strategie verwenden
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
