import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter: {
    organizationId: string;
    search?: string;
  }): Promise<Record<string, unknown>[]> {
    const whereClause: Prisma.UserWhereInput = {
      organizationId: filter.organizationId,
      deletedAt: null,
    };

    if (filter.search) {
      whereClause.OR = [
        { username: { contains: filter.search, mode: 'insensitive' } },
        { email: { contains: filter.search, mode: 'insensitive' } },
        { displayName: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const users = await this.prisma.user.findMany({
      where: whereClause,
      orderBy: [{ username: 'asc' }],
      include: {
        defaultStore: true,
        userRoles: {
          include: {
            role: true,
          },
        },
        userStores: {
          include: {
            store: true,
          },
        },
      },
    });

    return users.map((u) =>
      this.sanitizeUser(u as unknown as Record<string, unknown>),
    );
  }

  async findOne(
    id: string,
    organizationId: string,
  ): Promise<Record<string, unknown>> {
    const user = await this.prisma.user.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: {
        defaultStore: true,
        userRoles: {
          include: {
            role: true,
          },
        },
        userStores: {
          include: {
            store: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user as unknown as Record<string, unknown>);
  }

  async create(
    dto: CreateUserDto,
    organizationId: string,
  ): Promise<Record<string, unknown>> {
    const passwordHash = bcrypt.hashSync(dto.password, 10);

    try {
      const user = await this.prisma.$transaction(async (tx) => {
        const u = await tx.user.create({
          data: {
            organizationId,
            username: dto.username,
            email: dto.email,
            phone: dto.phone || null,
            passwordHash,
            firstName: dto.firstName || null,
            lastName: dto.lastName || null,
            displayName: dto.displayName || null,
            avatar: dto.avatar || null,
            defaultStoreId: dto.defaultStoreId || null,
            status: 'ACTIVE',
          },
        });

        if (dto.roleIds && dto.roleIds.length > 0) {
          await tx.userRole.createMany({
            data: dto.roleIds.map((roleId) => ({
              userId: u.id,
              roleId,
            })),
          });
        }

        if (dto.storeIds && dto.storeIds.length > 0) {
          await tx.userStore.createMany({
            data: dto.storeIds.map((storeId) => ({
              userId: u.id,
              storeId,
              isDefault: storeId === dto.defaultStoreId,
            })),
          });
        }

        return u;
      });

      return this.findOne(user.id, organizationId);
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    organizationId: string,
  ): Promise<Record<string, unknown>> {
    await this.findOne(id, organizationId);

    const updateData: Prisma.UserUpdateInput = {
      email: dto.email,
      phone: dto.phone,
      firstName: dto.firstName,
      lastName: dto.lastName,
      displayName: dto.displayName,
      avatar: dto.avatar,
      status: dto.status,
    };

    if (dto.password) {
      updateData.passwordHash = bcrypt.hashSync(dto.password, 10);
    }

    if (dto.defaultStoreId !== undefined) {
      updateData.defaultStore = dto.defaultStoreId
        ? { connect: { id: dto.defaultStoreId } }
        : { disconnect: true };
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        const u = await tx.user.update({
          where: { id },
          data: updateData,
        });

        if (dto.roleIds !== undefined) {
          await tx.userRole.deleteMany({ where: { userId: id } });
          if (dto.roleIds.length > 0) {
            await tx.userRole.createMany({
              data: dto.roleIds.map((roleId) => ({
                userId: id,
                roleId,
              })),
            });
          }
        }

        if (dto.storeIds !== undefined) {
          await tx.userStore.deleteMany({ where: { userId: id } });
          if (dto.storeIds.length > 0) {
            await tx.userStore.createMany({
              data: dto.storeIds.map((storeId) => ({
                userId: id,
                storeId,
                isDefault: storeId === (dto.defaultStoreId || u.defaultStoreId),
              })),
            });
          }
        }
      });

      return this.findOne(id, organizationId);
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async remove(
    id: string,
    organizationId: string,
  ): Promise<Record<string, unknown>> {
    await this.findOne(id, organizationId);

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        status: 'INACTIVE',
        deletedAt: new Date(),
      },
    });

    return this.sanitizeUser(user as unknown as Record<string, unknown>);
  }

  private sanitizeUser(user: Record<string, unknown>): Record<string, unknown> {
    const sanitized = { ...user };
    delete sanitized.passwordHash;
    return sanitized;
  }

  private handleWriteError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Username or email already exists under this organization',
        );
      }
      if (error.code === 'P2003') {
        throw new NotFoundException(
          'Related organization, store, or role not found',
        );
      }
    }
    throw error;
  }
}
