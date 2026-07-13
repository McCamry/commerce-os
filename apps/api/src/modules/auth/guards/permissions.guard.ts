import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../../database/prisma.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

import { Request } from 'express';
import { UserPayload } from '../decorators/current-user.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: UserPayload }>();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Resolve user's active permissions from database in real-time
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId: user.userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    const userPermissions = new Set<string>();
    for (const ur of userRoles) {
      if (ur.role.status === 'ACTIVE' && ur.role.deletedAt === null) {
        for (const rp of ur.role.rolePermissions) {
          userPermissions.add(rp.permission.code);
        }
      }
    }

    const hasPermission = requiredPermissions.every((perm) =>
      userPermissions.has(perm),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }

    return true;
  }
}
