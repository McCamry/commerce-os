import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret-key-12345',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [AuthService, JwtAuthGuard, PermissionsGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard, PermissionsGuard, JwtModule],
})
export class AuthModule {}
