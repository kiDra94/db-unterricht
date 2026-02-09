import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BasicStrategy } from './basic.strategy';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, BasicStrategy],
})
export class AppModule {}
