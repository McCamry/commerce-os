import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { RolesPermissionsService } from './roles-permissions.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller()
export class RolesPermissionsController {
  constructor(private readonly service: RolesPermissionsService) {}

  @Get('permissions')
  findAllPermissions() {
    return this.service.findAllPermissions();
  }

  @Get('roles')
  findAllRoles(
    @Query('organizationId') organizationId: string,
    @Query('status') status?: 'ACTIVE' | 'INACTIVE',
  ) {
    if (!organizationId) {
      throw new BadRequestException(
        'organizationId query parameter is required',
      );
    }
    return this.service.findAllRoles({ organizationId, status });
  }

  @Get('roles/:id')
  findOneRole(@Param('id') id: string) {
    return this.service.findOneRole(id);
  }

  @Post('roles')
  createRole(
    @Body() dto: CreateRoleDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.service.createRole(dto, organizationId);
  }

  @Patch('roles/:id')
  updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.service.updateRole(id, dto);
  }

  @Delete('roles/:id')
  removeRole(@Param('id') id: string) {
    return this.service.removeRole(id);
  }

  @Patch('roles/:id/permissions')
  updateRolePermissions(
    @Param('id') id: string,
    @Body('permissionIds') permissionIds: string[],
  ) {
    if (!Array.isArray(permissionIds)) {
      throw new BadRequestException(
        'permissionIds must be an array of strings',
      );
    }
    return this.service.updateRolePermissions(id, permissionIds);
  }
}
