import { SetMetadata } from '@nestjs/common';
import { RbacEntities, EntityPath } from '../../utils/enums/rbac.enum';

export interface AccessDecoratorOptions {
  permission: string;
  type: RbacEntities;
  path?: EntityPath;
  checkOwnership?: boolean;
}

export const ACCESS_KEY = 'access';

export const Access = (options: AccessDecoratorOptions) => 
  SetMetadata(ACCESS_KEY, options);
