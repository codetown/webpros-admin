import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { usePermission } from "@/hooks/usePermission";
import Forbidden from "@/pages/exception/403";
import { useAuthStore } from "@/store/useAuthStore";

/** 登录守卫：未登录时跳转登录页，并携带来源路径用于登录后回跳 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const token = useAuthStore((state) => state.token);
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ redirect: location.pathname }} replace />;
  }
  return <>{children}</>;
}

/** 权限守卫：无权限时展示 403 页面 */
export function PermissionGuard({ perm, children }: { perm: string; children: ReactNode }) {
  const hasPerm = usePermission();
  if (!hasPerm(perm)) return <Forbidden />;
  return <>{children}</>;
}
