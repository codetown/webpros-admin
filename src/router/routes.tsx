import {
  ApartmentOutlined,
  AuditOutlined,
  ControlOutlined,
  DashboardOutlined,
  DeploymentUnitOutlined,
  FileTextOutlined,
  FolderOutlined,
  PartitionOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { lazy, type ReactNode } from "react";
import { PermissionGuard } from "./guards";

// 路由级懒加载：每个页面独立 chunk，按需加载
const Dashboard = lazy(() => import("@/pages/dashboard"));
const DocManage = lazy(() => import("@/pages/docs"));
const WorkflowDefine = lazy(() => import("@/pages/workflow/define"));
const WorkflowTask = lazy(() => import("@/pages/workflow/task"));
const PlatformConfig = lazy(() => import("@/pages/system/config"));
const UserManage = lazy(() => import("@/pages/system/user"));
const RoleManage = lazy(() => import("@/pages/system/role"));
const MenuManage = lazy(() => import("@/pages/system/menu"));
const LogManage = lazy(() => import("@/pages/system/log"));
const AccountSettings = lazy(() => import("@/pages/account/settings"));

export interface RouteMeta {
  /** 菜单/面包屑/标签页标题 */
  title: string;
  /** 菜单图标 */
  icon?: ReactNode;
  /** 是否在菜单中隐藏 */
  hidden?: boolean;
  /** 访问所需权限标识，缺省表示无需鉴权 */
  perm?: string;
  /** 是否为固定标签页 */
  affix?: boolean;
}

export interface AppRouteObject {
  path: string;
  element?: ReactNode;
  meta?: RouteMeta;
  children?: AppRouteObject[];
}

/** 布局内路由（同时作为菜单数据源） */
export const layoutRoutes: AppRouteObject[] = [
  {
    path: "dashboard",
    element: <Dashboard />,
    meta: { title: "控制台", icon: <DashboardOutlined />, perm: "dashboard", affix: true },
  },
  {
    path: "docs",
    element: (
      <PermissionGuard perm="docs:list">
        <DocManage />
      </PermissionGuard>
    ),
    meta: { title: "文档管理", icon: <FolderOutlined />, perm: "docs:list" },
  },
  {
    path: "workflow",
    meta: { title: "流程中心", icon: <ApartmentOutlined />, perm: "workflow:list" },
    children: [
      {
        path: "define",
        element: (
          <PermissionGuard perm="workflow:list">
            <WorkflowDefine />
          </PermissionGuard>
        ),
        meta: { title: "工作流定义", icon: <DeploymentUnitOutlined />, perm: "workflow:list" },
      },
      {
        path: "task",
        element: (
          <PermissionGuard perm="workflow:task:list">
            <WorkflowTask />
          </PermissionGuard>
        ),
        meta: { title: "任务实例", icon: <AuditOutlined />, perm: "workflow:task:list" },
      },
    ],
  },
  {
    path: "system",
    meta: { title: "系统管理", icon: <SettingOutlined />, perm: "system" },
    children: [
      {
        path: "user",
        element: (
          <PermissionGuard perm="system:user:list">
            <UserManage />
          </PermissionGuard>
        ),
        meta: { title: "用户管理", icon: <UserOutlined />, perm: "system:user:list" },
      },
      {
        path: "role",
        element: (
          <PermissionGuard perm="system:role:list">
            <RoleManage />
          </PermissionGuard>
        ),
        meta: { title: "角色管理", icon: <TeamOutlined />, perm: "system:role:list" },
      },
      {
        path: "menu",
        element: (
          <PermissionGuard perm="system:menu:list">
            <MenuManage />
          </PermissionGuard>
        ),
        meta: { title: "菜单管理", icon: <PartitionOutlined />, perm: "system:menu:list" },
      },
      {
        path: "log",
        element: (
          <PermissionGuard perm="system:log:list">
            <LogManage />
          </PermissionGuard>
        ),
        meta: { title: "操作日志", icon: <FileTextOutlined />, perm: "system:log:list" },
      },
      {
        path: "config",
        element: (
          <PermissionGuard perm="platform:config:list">
            <PlatformConfig />
          </PermissionGuard>
        ),
        meta: { title: "平台配置", icon: <ControlOutlined />, perm: "platform:config:list" },
      },
    ],
  },
  {
    path: "account",
    meta: { title: "个人中心", hidden: true },
    children: [
      {
        path: "settings",
        element: <AccountSettings />,
        meta: { title: "个人设置", hidden: true },
      },
    ],
  },
];

/** 扁平化路由表：完整路径 -> meta，用于面包屑与标签页标题 */
export const routeMetaMap = (() => {
  const map = new Map<string, RouteMeta>();
  const walk = (routes: AppRouteObject[], parentPath: string) => {
    for (const route of routes) {
      const fullPath = `${parentPath}/${route.path}`;
      if (route.meta) map.set(fullPath, route.meta);
      if (route.children) walk(route.children, fullPath);
    }
  };
  walk(layoutRoutes, "");
  return map;
})();
