import { Module } from '@nestjs/common';
import { PrismaModule } from './database/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StoresModule } from './modules/stores/stores.module';

@Module({
  imports: [PrismaModule, StoresModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
