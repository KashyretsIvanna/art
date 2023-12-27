import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';
import { User } from '@prisma/client';

export const ReqUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const user = ctx.switchToHttp().getRequest().user as User;

    if (!user) {
      console.error('Unexpected user in @User() decorator!');
      throw new InternalServerErrorException();
    }

    return user;
  }
);
