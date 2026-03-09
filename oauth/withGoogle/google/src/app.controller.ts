import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('auth/google')
  @UseGuards(AuthGuard('google'))
  login() {

  }

  @Get('auth/google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() req, @Res() res) {
    const jwt = this.jwtService.sign({
      id: req.user.googleId,
      user: req.user.email,
      name: req.user.name,
    });

    res.cookie('accesToken', jwt, {
      httpOnly: true,
      secure: false, // In production, set this to true to ensure cookies are only sent over HTTPS
      sameSite: 'lax',
      maxAge: 3600000, // 1 hour
    });
    res.redirect('/hello');
  }

  @Get()
  getHello(): string {
    console.log('Client ID ' + process.env.CLIENT_ID);
    return this.appService.getHello();
  }
}
