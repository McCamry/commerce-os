import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import { UserPayload } from '../decorators/current-user.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Access token is missing');
    }

    try {
      const decoded = (await this.jwtService.verifyAsync(token)) as unknown;
      const payload = decoded as {
        sub: string;
        orgId: string;
        username: string;
        roles?: string[];
      };
      const reqWithUser = request as unknown as { user: UserPayload };
      reqWithUser.user = {
        userId: payload.sub,
        organizationId: payload.orgId,
        username: payload.username,
        roles: payload.roles || [],
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
