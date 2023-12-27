import { UserRole } from '@app/prisma';
import { SetMetadata, applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export const ROLES_KEY = 'roles';
export const Roles = (roles: UserRole[] | UserRole) => {
  const rolesArr = Array.isArray(roles) ? roles : [roles];

  return applyDecorators(
    ApiOperation({
      description: rolesArr.map((r) => `\`${r}\``).join(' '),
    }),
    SetMetadata(ROLES_KEY, rolesArr)
  );
};
