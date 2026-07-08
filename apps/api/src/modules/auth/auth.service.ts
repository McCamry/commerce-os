import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(
    dto: LoginDto,
    ip?: string,
    userAgent?: string,
  ): Promise<Record<string, unknown>> {
    const org = await this.prisma.organization.findFirst({
      where: { code: dto.organizationCode, deletedAt: null },
    });

    if (!org) {
      throw new UnauthorizedException(
        'Invalid organization, username, or password',
      );
    }

    const user = await this.prisma.user.findFirst({
      where: {
        organizationId: org.id,
        username: dto.username,
        deletedAt: null,
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    const isPasswordValid = user
      ? bcrypt.compareSync(dto.password, user.passwordHash)
      : false;

    if (!user || !isPasswordValid) {
      if (user) {
        await this.prisma.loginHistory.create({
          data: {
            userId: user.id,
            ip,
            browser: this.parseBrowser(userAgent),
            device: this.parseDevice(userAgent),
            success: false,
          },
        });
      }
      throw new UnauthorizedException(
        'Invalid organization, username, or password',
      );
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is inactive');
    }

    // Success login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await this.prisma.loginHistory.create({
      data: {
        userId: user.id,
        ip,
        browser: this.parseBrowser(userAgent),
        device: this.parseDevice(userAgent),
        success: true,
      },
    });

    const sessionToken = uuidv4();
    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        token: sessionToken,
        ip,
        userAgent,
        browser: this.parseBrowser(userAgent),
        device: this.parseDevice(userAgent),
      },
    });

    const refreshTokenString = uuidv4();
    const refreshExpiredAt = new Date();
    refreshExpiredAt.setDate(refreshExpiredAt.getDate() + 30); // 30 days

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshTokenString,
        expiredAt: refreshExpiredAt,
        ip,
        userAgent,
      },
    });

    const roles = user.userRoles.map((ur) => ur.role.code);
    const jwtPayload = {
      sub: user.id,
      orgId: user.organizationId,
      username: user.username,
      roles,
    };

    const accessToken = this.jwtService.sign(jwtPayload);

    return {
      accessToken,
      refreshToken: refreshTokenString,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
      },
    };
  }

  async refresh(
    refreshTokenString: string,
    ip?: string,
    userAgent?: string,
  ): Promise<Record<string, unknown>> {
    const tokenRecord = await this.prisma.refreshToken.findFirst({
      where: {
        token: refreshTokenString,
        revokedAt: null,
        expiredAt: { gt: new Date() },
      },
      include: {
        user: {
          include: {
            userRoles: {
              include: {
                role: true,
              },
            },
          },
        },
      },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Revoke old refresh token
    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date() },
    });

    // Generate new refresh token
    const newRefreshTokenString = uuidv4();
    const refreshExpiredAt = new Date();
    refreshExpiredAt.setDate(refreshExpiredAt.getDate() + 30);

    await this.prisma.refreshToken.create({
      data: {
        userId: tokenRecord.user.id,
        token: newRefreshTokenString,
        expiredAt: refreshExpiredAt,
        ip,
        userAgent,
      },
    });

    const roles = tokenRecord.user.userRoles.map((ur) => ur.role.code);
    const jwtPayload = {
      sub: tokenRecord.user.id,
      orgId: tokenRecord.user.organizationId,
      username: tokenRecord.user.username,
      roles,
    };

    const accessToken = this.jwtService.sign(jwtPayload);

    return {
      accessToken,
      refreshToken: newRefreshTokenString,
    };
  }

  async logout(refreshTokenString: string): Promise<Record<string, unknown>> {
    const tokenRecord = await this.prisma.refreshToken.findFirst({
      where: { token: refreshTokenString },
    });

    if (tokenRecord) {
      await this.prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revokedAt: new Date() },
      });

      // Delete active user session related to the user and token IP/UA
      await this.prisma.userSession.deleteMany({
        where: {
          userId: tokenRecord.userId,
          ip: tokenRecord.ip,
          userAgent: tokenRecord.userAgent,
        },
      });
    }

    return { success: true };
  }

  async getProfile(userId: string): Promise<Record<string, unknown>> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: {
        defaultStore: true,
        userRoles: {
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
        },
        userStores: {
          include: {
            store: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Extract all unique permission codes
    const permissions = new Set<string>();
    for (const ur of user.userRoles) {
      for (const rp of ur.role.rolePermissions) {
        permissions.add(rp.permission.code);
      }
    }

    return {
      id: user.id,
      organizationId: user.organizationId,
      defaultStoreId: user.defaultStoreId,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      roles: user.userRoles.map((ur) => ur.role.code),
      permissions: Array.from(permissions),
      accessibleStores: user.userStores.map((us) => ({
        storeId: us.storeId,
        name: us.store.name,
        isDefault: us.isDefault,
      })),
    };
  }

  private parseBrowser(ua?: string): string {
    if (!ua) return 'Unknown';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Chrome') && !ua.includes('Chromium')) return 'Chrome';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Other';
  }

  private parseDevice(ua?: string): string {
    if (!ua) return 'Unknown';
    if (
      ua.includes('Mobile') ||
      ua.includes('Android') ||
      ua.includes('iPhone')
    )
      return 'Mobile';
    if (ua.includes('iPad') || ua.includes('Tablet')) return 'Tablet';
    return 'Desktop';
  }
}
