// src/lib/security/rbac.ts
/**
 * Role-Based Access Control (RBAC) システム
 * ユーザーの権限管理を行う
 */

export enum Permission {
  CREATE_CHARACTER = 'create_character',
  CREATE_CONTENT = 'create_content',
  DELETE_CHARACTER = 'delete_character',
  EDIT_CHARACTER = 'edit_character',
  VIEW_PREMIUM_CONTENT = 'view_premium_content',
  MODERATE_CONTENT = 'moderate_content',
  ADMIN_ACCESS = 'admin_access',
  MANAGE_USERS = 'manage_users',
  VIEW_ANALYTICS = 'view_analytics',
  BULK_OPERATIONS = 'bulk_operations',
  SYSTEM_CONFIG = 'system_config'
}

export enum Role {
  USER = 'user',
  PREMIUM = 'premium',
  MODERATOR = 'moderator',
  ADMIN = 'admin'
}

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.USER]: [
    Permission.CREATE_CONTENT, // ユーザーはコンテンツを作成できる
    Permission.VIEW_PREMIUM_CONTENT // 基本的な閲覧権限のみ
  ],
  [Role.PREMIUM]: [
    Permission.CREATE_CHARACTER,
    Permission.CREATE_CONTENT,
    Permission.EDIT_CHARACTER,
    Permission.VIEW_PREMIUM_CONTENT
  ],
  [Role.MODERATOR]: [
    Permission.CREATE_CHARACTER,
    Permission.CREATE_CONTENT,
    Permission.EDIT_CHARACTER,
    Permission.VIEW_PREMIUM_CONTENT,
    Permission.MODERATE_CONTENT,
    Permission.VIEW_ANALYTICS
  ],
  [Role.ADMIN]: Object.values(Permission) // 全権限
};

/**
 * ユーザーが特定の権限を持っているかチェック
 * 
 * @param userRole ユーザーの役割
 * @param permission 必要な権限
 * @returns 権限を持っている場合はtrue
 */
export function hasPermission(userRole: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
}

/**
 * ユーザーが複数の権限を持っているかチェック
 * 
 * @param userRole ユーザーの役割
 * @param permissions 必要な権限の配列
 * @returns すべての権限を持っている場合はtrue
 */
export function hasAllPermissions(userRole: Role, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

/**
 * ユーザーがいずれかの権限を持っているかチェック
 * 
 * @param userRole ユーザーの役割
 * @param permissions 権限の配列
 * @returns いずれかの権限を持っている場合はtrue
 */
export function hasAnyPermission(userRole: Role, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

/**
 * 役割が有効かどうかを確認
 * 
 * @param role チェックする役割
 * @returns 有効な役割の場合はtrue
 */
export function isValidRole(role: string): role is Role {
  return Object.values(Role).includes(role as Role);
}

/**
 * ユーザーの役割を文字列から取得
 * 
 * @param roleString 役割の文字列
 * @returns 有効な役割またはデフォルトのUSER役割
 */
export function parseRole(roleString: string | undefined): Role {
  if (roleString && isValidRole(roleString)) {
    return roleString as Role;
  }
  return Role.USER;
}
