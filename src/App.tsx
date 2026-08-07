import type { ThemeConfig } from "antd";
import { App as AntApp, ConfigProvider, theme } from "antd";
import zhCN from "antd/locale/zh_CN";
import { useEffect, useMemo } from "react";
import LockScreen from "@/components/LockScreen";
import AppRouter from "@/router";
import { useAppStore } from "@/store/useAppStore";
import { bindMessage } from "@/utils/notify";

/** 将 antd message 实例注入请求层 */
function MessageBinder() {
  const { message } = AntApp.useApp();
  useEffect(() => {
    bindMessage(message);
  }, [message]);
  return null;
}

export default function RootApp() {
  const themeMode = useAppStore((state) => state.themeMode);
  const primaryColor = useAppStore((state) => state.primaryColor);
  const locked = useAppStore((state) => state.locked);

  // 同步品牌色到 CSS 变量，供全局样式（横幅、标签页等）使用
  useEffect(() => {
    document.documentElement.style.setProperty("--app-primary", primaryColor);
  }, [primaryColor]);

  const themeConfig = useMemo<ThemeConfig>(
    () => ({
      algorithm: themeMode === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: {
        colorPrimary: primaryColor,
        colorLink: primaryColor,
        borderRadius: 8,
      },
      components: {
        Card: { borderRadiusLG: 12 },
        ...(themeMode === "dark"
          ? { Layout: { headerBg: "#141414", siderBg: "#141414", bodyBg: "#000000" } }
          : { Layout: { headerBg: "#ffffff", siderBg: "#ffffff", bodyBg: "#f5f7fa" } }),
      },
    }),
    [themeMode, primaryColor],
  );

  return (
    <ConfigProvider locale={zhCN} theme={themeConfig}>
      <AntApp>
        <MessageBinder />
        <AppRouter />
        {locked ? <LockScreen /> : null}
      </AntApp>
    </ConfigProvider>
  );
}
