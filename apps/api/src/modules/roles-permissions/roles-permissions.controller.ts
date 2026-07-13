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
    @CurrentUser('organizationId') organizationId: string,
    @Query('status') status?: 'ACTIVE' | 'INACTIVE',
  ) {
    return this.service.findAllRoles({ organizationId, status });
  }

  @Get('roles/:id')
  findOneRole(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.service.findOneRole(id, organizationId);
  }

  @Post('roles')
  createRole(
    @Body() dto: CreateRoleDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.service.createRole(dto, organizationId);
  }

  @Patch('roles/:id')
  updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.service.updateRole(id, dto, organizationId);
  }

  @Delete('roles/:id')
  removeRole(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.service.removeRole(id, organizationId);
  }

  @Patch('roles/:id/permissions')
  updateRolePermissions(
    @Param('id') id: string,
    @Body('permissionIds') permissionIds: string[],
    @CurrentUser('organizationId') organizationId: string,
  ) {
    if (!Array.isArray(permissionIds)) {
      throw new BadRequestException(
        'permissionIds must be an array of strings',
      );
    }
    return this.service.updateRolePermissions(
      id,
      permissionIds,
      organizationId,
    );
  }
}
