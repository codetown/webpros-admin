import { Menu, type MenuProps } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { usePermission } from "@/hooks/usePermission";
import { type AppRouteObject, layoutRoutes } from "@/router/routes";
import { useAppStore } from "@/store/useAppStore";

type MenuItem = Required<MenuProps>["items"][number];

function buildMenuItems(
  routes: AppRouteObject[],
  parentPath: string,
  hasPerm: (perm?: string) => boolean,
): MenuItem[] {
  const items: MenuItem[] = [];
  for (const route of routes) {
    if (route.meta?.hidden) continue;
    if (!hasPerm(route.meta?.perm)) continue;
    const fullPath = `${parentPath}/${route.path}`;
    if (route.children) {
      const children = buildMenuItems(route.children, fullPath, hasPerm);
      if (children.length === 0) continue;
      items.push({ key: fullPath, icon: route.meta?.icon, label: route.meta?.title, children });
    } else {
      items.push({ key: fullPath, icon: route.meta?.icon, label: route.meta?.title });
    }
  }
  return items;
}

/** 根据当前路径计算需要展开的菜单 keys */
function deriveOpenKeys(pathname: string): string[] {
  const segments = pathname.split("/").filter(Boolean);
  const keys: string[] = [];
  let acc = "";
  for (let i = 0; i < segments.length - 1; i += 1) {
    acc += `/${segments[i]}`;
    keys.push(acc);
  }
  return keys;
}

export default function SiderMenu() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const hasPerm = usePermission();
  const themeMode = useAppStore((state) => state.themeMode);
  const [openKeys, setOpenKeys] = useState<string[]>(() => deriveOpenKeys(pathname));

  const items = useMemo(() => buildMenuItems(layoutRoutes, "", hasPerm), [hasPerm]);

  useEffect(() => {
    setOpenKeys((prev) => [...new Set([...prev, ...deriveOpenKeys(pathname)])]);
  }, [pathname]);

  return (
    <Menu
      mode="inline"
      theme={themeMode === "dark" ? "dark" : "light"}
      selectedKeys={[pathname]}
      openKeys={openKeys}
      onOpenChange={(keys) => setOpenKeys(keys as string[])}
      onClick={({ key }) => navigate(key)}
      items={items}
      style={{ borderInlineEnd: "none" }}
    />
  );
}
