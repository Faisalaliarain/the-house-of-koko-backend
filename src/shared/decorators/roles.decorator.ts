import { SetMetadata } from '@nestjs/common'
import { UserRole } from '../../utils/enums/roles.enum';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles)
