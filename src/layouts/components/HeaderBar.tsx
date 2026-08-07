import {
  FullscreenExitOutlined,
  FullscreenOutlined,
  HighlightOutlined,
  LockOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MoonOutlined,
  SunOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { App, Avatar, Breadcrumb, Button, Dropdown, Grid, Space, Tooltip } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { routeMetaMap } from "@/router/routes";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import MenuSearch from "./MenuSearch";
import NotificationBell from "./NotificationBell";

export default function HeaderBar() {
  const collapsed = useAppStore((state) => state.collapsed);
  const toggleCollapsed = useAppStore((state) => state.toggleCollapsed);
  const themeMode = useAppStore((state) => state.themeMode);
  const setThemeMode = useAppStore((state) => state.setThemeMode);
  const watermark = useAppStore((state) => state.watermark);
  const setWatermark = useAppStore((state) => state.setWatermark);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { modal } = App.useApp();
  const screens = Grid.useBreakpoint();
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const handler = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const breadcrumbItems = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    let acc = "";
    return segments
      .map((segment) => {
        acc += `/${segment}`;
        return routeMetaMap.get(acc)?.title;
      })
      .filter((title): title is string => Boolean(title))
      .map((title) => ({ title }));
  }, [pathname]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
    } else {
      void document.documentElement.requestFullscreen().catch(() => undefined);
    }
  };

  const dropdownItems: MenuProps["items"] = [
    { key: "profile", icon: <UserOutlined />, label: "个人中心" },
    { key: "lock", icon: <LockOutlined />, label: "锁定屏幕" },
    { type: "divider" },
    { key: "logout", icon: <LogoutOutlined />, label: "退出登录", danger: true },
  ];

  const onDropdownClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "lock") {
      useAppStore.getState().lock();
      return;
    }
    if (key === "logout") {
      modal.confirm({
        title: "提示",
        content: "确定要退出登录吗？",
        okText: "退出",
        cancelText: "取消",
        okButtonProps: { danger: true },
        onOk: () => {
          logout();
          navigate("/login", { replace: true });
        },
      });
    } else {
      navigate("/account/settings");
    }
  };

  return (
    <header className="app-header">
      <Space size={12}>
        <Button
          type="text"
          aria-label="收起/展开菜单"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleCollapsed}
        />
        {screens.md && breadcrumbItems.length > 1 ? <Breadcrumb items={breadcrumbItems} /> : null}
      </Space>
      <Space size={4}>
        <MenuSearch />
        <NotificationBell />
        <Tooltip title="页面水印">
          <Button
            type={watermark ? "link" : "text"}
            aria-label="切换页面水印"
            icon={<HighlightOutlined />}
            onClick={() => setWatermark(!watermark)}
          />
        </Tooltip>
        <Tooltip title={themeMode === "dark" ? "切换亮色模式" : "切换暗黑模式"}>
          <Button
            type="text"
            aria-label="切换主题"
            icon={themeMode === "dark" ? <SunOutlined /> : <MoonOutlined />}
            onClick={() => setThemeMode(themeMode === "dark" ? "light" : "dark")}
          />
        </Tooltip>
        <Tooltip title={fullscreen ? "退出全屏" : "进入全屏"}>
          <Button
            type="text"
            aria-label="切换全屏"
            icon={fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
            onClick={toggleFullscreen}
          />
        </Tooltip>
        <Dropdown menu={{ items: dropdownItems, onClick: onDropdownClick }} placement="bottomRight">
          <Space style={{ cursor: "pointer", padding: "0 8px" }}>
            <Avatar size="small" src={user?.avatar} icon={<UserOutlined />} />
            {screens.sm ? <span>{user?.nickname ?? "-"}</span> : null}
          </Space>
        </Dropdown>
      </Space>
    </header>
  );
}
