import { applyDecorators, UseGuards, Type, CanActivate } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AccessGuard } from '../guards/access.guard';
import { Access, AccessDecoratorOptions } from './access.decorator';

export function Policy(options: AccessDecoratorOptions & { guards?: Type<CanActivate>[] }) {
  const { permission, type, path, checkOwnership = true, guards = [] } = options;

  const usableGuards: Type<CanActivate>[] = [...guards];
  if (guards.length === 0) {
    usableGuards.push(JwtAuthGuard);
  }

  const skipAccessGuard = guards.find((guard) => guard === AccessGuard);
  if (!skipAccessGuard) {
    usableGuards.push(AccessGuard);
  }

  const decorators = [
    Access({
      permission,
      type,
      checkOwnership,
      path
    }),
    UseGuards(...usableGuards)
  ];

  return applyDecorators(...decorators);
}
