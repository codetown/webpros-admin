import type { PropsWithChildren, ReactNode } from "react";
import { usePermission } from "@/hooks/usePermission";

interface AuthorizedProps {
  /** 所需权限标识 */
  perm: string;
  /** 无权限时的降级渲染 */
  fallback?: ReactNode;
}

/** 按钮级权限控制：无权限时默认不渲染子节点 */
export default function Authorized({
  perm,
  fallback = null,
  children,
}: PropsWithChildren<AuthorizedProps>) {
  const hasPerm = usePermission();
  if (!hasPerm(perm)) return <>{fallback}</>;
  return <>{children}</>;
}
