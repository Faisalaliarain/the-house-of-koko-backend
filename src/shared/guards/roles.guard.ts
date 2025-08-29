import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ERRORS } from '../../utils/enums/errors.enum'
import { UserRole } from '../../utils/enums/roles.enum'; // Changed to use the same enum as service

@Injectable()
export class RoleGuard implements CanActivate {
	constructor(private reflector: Reflector) { }

	canActivate(context: ExecutionContext): boolean {
		const roles = this.reflector.get<UserRole[]>('roles', context.getHandler())
		if (!roles || roles.length === 0) {
			return true
		}
		const request = context.switchToHttp().getRequest()
		const user = request.user
		
		if (!user) {
			throw new ForbiddenException(ERRORS.NOT_ALLOWED);
		}

		const userRole = user.role;
		
		if (!userRole) {
			throw new ForbiddenException(ERRORS.NOT_ALLOWED);
		}

		// Convert to string and ensure consistent comparison
		const userRoleStr = String(userRole).trim();
		
		// Check if user is admin (case-insensitive)
		if (userRoleStr.toUpperCase() === UserRole.ADMIN.toUpperCase()) {
			return true;
		}

		// Check if user has any of the required roles
		const hasRole = roles.some(role => 
			String(role).trim().toUpperCase() === userRoleStr.toUpperCase()
		);
		
		if (hasRole) {
			return true;
		}
		
		throw new ForbiddenException(ERRORS.NOT_ALLOWED);
	}
}
