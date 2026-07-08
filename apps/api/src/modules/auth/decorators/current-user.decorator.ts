import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface UserPayload {
  userId: string;
  organizationId: string;
  username: string;
  roles: string[];
}

export const CurrentUser = createParamDecorator(
  (data: keyof UserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user?: UserPayload }>();
    const user = request.user;
    return data && user ? user[data] : user;
  },
);
