import { 
  Injectable, 
  CanActivate, 
  ExecutionContext, 
  ForbiddenException,
  UnauthorizedException 
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../../entities/user.entity';
import { ACCESS_KEY, AccessDecoratorOptions } from '../decorators/access.decorator';
import { ERRORS } from '../../utils/enums/errors.enum';
import { UserRole } from '../../utils/enums/roles.enum';
import { RbacEntities, EntityPath } from '../../utils/enums/rbac.enum';
import { RBAC_ROLES } from '../rbac/rbac-roles.config';

interface RequestWithParams {
  params?: Record<string, string>;
  body?: Record<string, unknown>;
  user?: UserDocument;
  [key: string]: unknown;
}

@Injectable()
export class AccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const accessOptions = this.reflector.get<AccessDecoratorOptions>(
      ACCESS_KEY,
      context.getHandler()
    );

    if (!accessOptions) {
      return true; // No access control defined
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException(ERRORS.UNAUTHORIZED);
    }

    // Get user role permissions
    const userPermissions = await this.getUserPermissions(user.role);
    
    // Check if user has the required permission
    if (!userPermissions.includes(accessOptions.permission)) {
      throw new ForbiddenException(ERRORS.NOT_ALLOWED);
    }

    // Check ownership if required
    if (accessOptions.checkOwnership && accessOptions.path) {
      const hasOwnership = await this.checkOwnership(
        user,
        request,
        accessOptions.type,
        accessOptions.path
      );
      
      if (!hasOwnership) {
        throw new ForbiddenException(ERRORS.NOT_ALLOWED);
      }
    }

    return true;
  }

  private async getUserPermissions(userRole: UserRole): Promise<string[]> {
    // Find the role configuration
    const roleConfig = RBAC_ROLES.find(role => role.machineName === this.getRoleMachineName(userRole));
    
    if (!roleConfig) {
      return [];
    }

    return roleConfig.permissions;
  }

  private getRoleMachineName(userRole: UserRole): string {
    const roleMapping = {
      [UserRole.ADMIN]: 'SOX_BASE_ADMIN',
      [UserRole.USER]: 'SOX_BASE_USER',
      [UserRole.GUEST]: 'SOX_BASE_GUEST',
    };

    return roleMapping[userRole] || 'SOX_BASE_GUEST';
  }

  private async checkOwnership(
    user: UserDocument,
    request: RequestWithParams,
    entityType: RbacEntities,
    path: EntityPath
  ): Promise<boolean> {
    // Admin users bypass ownership checks
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    const entityId = this.getValueFromPath(request, path);
    
    if (!entityId) {
      return false;
    }

    switch (entityType) {
      case RbacEntities.USER:
        return await this.checkUserOwnership(user._id?.toString() || '', entityId);
      
      default:
        return false;
    }
  }

  private getValueFromPath(request: RequestWithParams, path: EntityPath): string | null {
    const pathParts = path.split('.');
    let value: unknown = request;
    
    for (const part of pathParts) {
      if (value && typeof value === 'object' && part in value) {
        value = (value as Record<string, unknown>)[part];
      } else {
        return null;
      }
    }
    
    return typeof value === 'string' ? value : String(value);
  }

  private async checkUserOwnership(userId: string, targetUserId: string): Promise<boolean> {
    return userId === targetUserId;
  }
}
