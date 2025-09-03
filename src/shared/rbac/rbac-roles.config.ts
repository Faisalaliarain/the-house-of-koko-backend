import {
  RbacRoleMachineName,
  RbacRoleCategory,
  RbacEntities,
  UserPermissions,
  NotificationPermissions,
  ProgressPermissions,
} from '../../utils/enums/rbac.enum';

export interface RbacRole {
  name: string;
  machineName: RbacRoleMachineName;
  category: RbacRoleCategory;
  entityType: RbacEntities;
  permissions: string[];
}
export const RoleMachineNameMap: Record<string, RbacRoleMachineName> = {
  admin: RbacRoleMachineName.SOX_BASE_ADMIN,
  user: RbacRoleMachineName.SOX_BASE_USER,
  guest: RbacRoleMachineName.SOX_BASE_GUEST,
};

export const BASE_ADMIN: RbacRole = {
  name: 'Admin',
  machineName: RbacRoleMachineName.SOX_BASE_ADMIN,
  category: RbacRoleCategory.BASE,
  entityType: RbacEntities.USER,
  permissions: [
    // User permissions
    UserPermissions.VIEW_ONE,
    UserPermissions.VIEW_ALL,
    UserPermissions.CREATE,
    UserPermissions.UPDATE,
    UserPermissions.DELETE, 
    UserPermissions.VIEW_PROFILE,
    UserPermissions.UPDATE_PROFILE,

    // Notification permissions
    NotificationPermissions.VIEW_ONE,
    NotificationPermissions.VIEW_ALL,
    NotificationPermissions.CREATE,
    NotificationPermissions.UPDATE,
    NotificationPermissions.DELETE,
    NotificationPermissions.MARK_READ,

    // Progress permissions
    ProgressPermissions.VIEW_ONE,
    ProgressPermissions.VIEW_ALL,
    ProgressPermissions.CREATE,
    ProgressPermissions.UPDATE,
    ProgressPermissions.DELETE,
    ProgressPermissions.VIEW_OWN,
    ProgressPermissions.UPDATE_OWN,

  ],
};

export const BASE_USER: RbacRole = {
  name: 'User',
  machineName: RbacRoleMachineName.SOX_BASE_USER,
  category: RbacRoleCategory.BASE,
  entityType: RbacEntities.USER,
  permissions: [
    // User permissions
    UserPermissions.VIEW_PROFILE,
    UserPermissions.UPDATE_PROFILE,
    
    // Progress permissions - Users can view and update their own progress
    ProgressPermissions.VIEW_OWN,
    ProgressPermissions.UPDATE_OWN,
  ],
};

export const BASE_GUEST: RbacRole = {
  name: 'Guest',
  machineName: RbacRoleMachineName.SOX_BASE_GUEST,
  category: RbacRoleCategory.BASE,
  entityType: RbacEntities.USER,
  permissions: [
    // User permissions
    UserPermissions.VIEW_PROFILE,
    UserPermissions.UPDATE_PROFILE,
    
    // Progress permissions - Guests can view and update their own progress
    ProgressPermissions.VIEW_OWN,
    ProgressPermissions.UPDATE_OWN,
  ],
};

export const RBAC_ROLES: RbacRole[] = [
  BASE_ADMIN,
  BASE_USER,
  BASE_GUEST,
];
