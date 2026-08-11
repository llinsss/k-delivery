export const permissions = {
  CUSTOMER: ["delivery:create", "delivery:read-own", "delivery:cancel-own", "rating:create"],
  MERCHANT: ["delivery:create", "delivery:read-own", "delivery:cancel-own", "location:manage-own", "analytics:read-own"],
  RIDER: ["offer:respond-own", "delivery:update-assigned", "availability:update-own", "earnings:read-own"],
  PROVIDER_ADMIN: ["provider:manage-own", "provider-rider:manage-own", "delivery:read-provider", "api-key:manage-own", "webhook:manage-own"],
  OPERATIONS: ["delivery:read-all", "delivery:dispatch", "rider:manage", "provider:read", "operations:read"],
  SUPPORT: ["delivery:read-all", "user:read", "dispute:manage"],
  PLATFORM_ADMIN: ["*"],
} as const;

export type Role = keyof typeof permissions;
export type Permission = (typeof permissions)[Exclude<Role, "PLATFORM_ADMIN">][number] | "*";

export function hasPermission(role: Role, permission: Permission) {
  const assigned = permissions[role] as readonly string[];
  return assigned.includes("*") || assigned.includes(permission);
}

export function requirePermission(role: Role, permission: Permission) {
  if (!hasPermission(role, permission)) throw new Error("FORBIDDEN");
}

