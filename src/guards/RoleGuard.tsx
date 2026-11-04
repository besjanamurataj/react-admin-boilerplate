import React from "react";
import { useAuth } from "../hooks/useAuth";

interface PermissionGuardProps {
  children: React.ReactNode;
  fallback?: string[];
  permissions: string[];
}

export const PermissionGuard = ({
  children,
  fallback,
  permissions,
}: PermissionGuardProps) => {
  const { hasPermission } = useAuth();

  const hasRequiredPermission = permissions.some((permission) =>
    hasPermission(permission),
  );

  if (!hasRequiredPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
