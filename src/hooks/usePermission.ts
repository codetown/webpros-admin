import { useCallback } from "react";
import { useAuthStore } from "@/store/useAuthStore";

/** 返回权限判断函数：拥有 "*" 视为超级权限 */
export function usePermission() {
  const permissions = useAuthStore((state) => state.user?.permissions);
  return useCallback(
    (perm?: string) => {
      if (!perm) return true;
      const list = permissions ?? [];
      return list.includes("*") || list.includes(perm);
    },
    [permissions],
  );
}
