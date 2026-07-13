import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesPermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllPermissions(): Promise<Record<string, unknown>[]> {
    const perms = await this.prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { code: 'asc' }],
    });
    return perms as unknown as Record<string, unknown>[];
  }

  async findAllRoles(filter: {
    organizationId: string;
    status?: 'ACTIVE' | 'INACTIVE';
  }): Promise<Record<string, unknown>[]> {
    const whereClause: Prisma.RoleWhereInput = {
      organizationId: filter.organizationId,
      deletedAt: null,
    };

    if (filter.status) {
      whereClause.status = filter.status;
    }

    const roles = await this.prisma.role.findMany({
      where: whereClause,
      orderBy: [{ name: 'asc' }],
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
    return roles as unknown as Record<string, unknown>[];
  }

  async findOneRole(
    id: string,
    organizationId: string,
  ): Promise<Record<string, unknown>> {
    const role = await this.prisma.role.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role as unknown as Record<string, unknown>;
  }

  async createRole(
    dto: CreateRoleDto,
    organizationId: string,
  ): Promise<Record<string, unknown>> {
    try {
      const created = await this.prisma.$transaction(async (tx) => {
        const role = await tx.role.create({
          data: {
            organizationId,
            code: dto.code.toUpperCase(),
            name: dto.name,
            description: dto.description || null,
            isSystem: false,
            status: 'ACTIVE',
          },
        });

        if (dto.permissionIds && dto.permissionIds.length > 0) {
          await tx.rolePermission.createMany({
            data: dto.permissionIds.map((permissionId) => ({
              roleId: role.id,
              permissionId,
            })),
          });
        }

        return tx.role.findUnique({
          where: { id: role.id },
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        });
      });

      if (!created) {
        throw new BadRequestException('Failed to create role');
      }
      return created as unknown as Record<string, unknown>;
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async updateRole(
    id: string,
    dto: UpdateRoleDto,
    organizationId: string,
  ): Promise<Record<string, unknown>> {
    const role = await this.findOneRole(id, organizationId);

    if (role.isSystem) {
      throw new BadRequestException('System roles cannot be modified');
    }

    try {
      const updated = await this.prisma.$transaction(async (tx) => {
        await tx.role.update({
          where: { id },
          data: {
            name: dto.name,
            description: dto.description,
            status: dto.status,
          },
        });

        if (dto.permissionIds !== undefined) {
          await tx.rolePermission.deleteMany({ where: { roleId: id } });
          if (dto.permissionIds.length > 0) {
            await tx.rolePermission.createMany({
              data: dto.permissionIds.map((permissionId) => ({
                roleId: id,
                permissionId,
              })),
            });
          }
        }

        return tx.role.findUnique({
          where: { id },
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        });
      });

      if (!updated) {
        throw new BadRequestException('Failed to update role');
      }
      return updated as unknown as Record<string, unknown>;
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async removeRole(
    id: string,
    organizationId: string,
  ): Promise<Record<string, unknown>> {
    const role = await this.findOneRole(id, organizationId);

    if (role.isSystem) {
      throw new BadRequestException('System roles cannot be deleted');
    }

    const removed = await this.prisma.role.update({
      where: { id },
      data: {
        status: 'INACTIVE',
        deletedAt: new Date(),
      },
    });

    return removed as unknown as Record<string, unknown>;
  }

  async updateRolePermissions(
    roleId: string,
    permissionIds: string[],
    organizationId: string,
  ): Promise<Record<string, unknown>> {
    const role = await this.findOneRole(roleId, organizationId);

    if (role.isSystem) {
      throw new BadRequestException(
        'Permissions of system roles cannot be modified',
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { roleId } });
      if (permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({
            roleId,
            permissionId,
          })),
        });
      }

      return tx.role.findUnique({
        where: { id: roleId },
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      });
    });

    if (!updated) {
      throw new BadRequestException('Failed to update role permissions');
    }
    return updated as unknown as Record<string, unknown>;
  }

  private handleWriteError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Role code already exists under this organization',
        );
      }
      if (error.code === 'P2003') {
        throw new NotFoundException(
          'Related organization or permission reference not found',
        );
      }
    }
    throw error;
  }
}
