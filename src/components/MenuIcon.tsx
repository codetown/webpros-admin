import {
  DashboardOutlined,
  FileTextOutlined,
  FolderOutlined,
  PartitionOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { ReactNode } from "react";

const iconMap: Record<string, ReactNode> = {
  DashboardOutlined: <DashboardOutlined />,
  SettingOutlined: <SettingOutlined />,
  UserOutlined: <UserOutlined />,
  TeamOutlined: <TeamOutlined />,
  PartitionOutlined: <PartitionOutlined />,
  FileTextOutlined: <FileTextOutlined />,
  FolderOutlined: <FolderOutlined />,
};

/** 根据图标名称渲染图标（菜单管理中的图标字段） */
export default function MenuIcon({ name }: { name?: string }) {
  if (!name || !iconMap[name]) return null;
  return <>{iconMap[name]}</>;
}
