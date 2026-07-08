import { Module } from '@nestjs/common';
import { RolesPermissionsService } from './roles-permissions.service';
import { RolesPermissionsController } from './roles-permissions.controller';

@Module({
  providers: [RolesPermissionsService],
  controllers: [RolesPermissionsController],
  exports: [RolesPermissionsService],
})
export class RolesPermissionsModule {}
