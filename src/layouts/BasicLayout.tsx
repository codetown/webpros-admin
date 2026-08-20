import { FloatButton, Layout, Watermark } from "antd";
import { Suspense } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Loading from "@/components/Loading";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { getConfigValue, usePlatformConfigStore } from "@/store/usePlatformConfigStore";
import HeaderBar from "./components/HeaderBar";
import SiderMenu from "./components/SiderMenu";
import TabsNav from "./components/TabsNav";

export default function BasicLayout() {
  const collapsed = useAppStore((state) => state.collapsed);
  const setCollapsed = useAppStore((state) => state.setCollapsed);
  const themeMode = useAppStore((state) => state.themeMode);
  const user = useAuthStore((state) => state.user);
  const configs = usePlatformConfigStore((state) => state.configs);
  const navigate = useNavigate();

  const siteName = String(getConfigValue(configs, "site.name") || "WebPros Admin");
  const footerText = String(
    getConfigValue(configs, "site.footer") || "WebPros Admin ©2026 · Powered by React + Ant Design",
  );
  const watermarkEnabled = getConfigValue(configs, "security.watermark") === true;
  const watermarkText = String(
    getConfigValue(configs, "security.watermarkText") || user?.nickname || "WebPros Admin",
  );
  const multiTab = getConfigValue(configs, "feature.multiTab") !== false;

  const content = (
    <Suspense fallback={<Loading />}>
      <Outlet />
    </Suspense>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout.Sider
        className="app-sider"
        theme={themeMode === "dark" ? "dark" : "light"}
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={220}
        breakpoint="lg"
        onBreakpoint={(broken) => setCollapsed(broken)}
      >
        <button type="button" className="sider-logo" onClick={() => navigate("/dashboard")}>
          <img src="/favicon.svg" alt="logo" />
          {!collapsed && <span>{siteName}</span>}
        </button>
        <SiderMenu />
      </Layout.Sider>
      <Layout>
        <HeaderBar />
        {multiTab ? <TabsNav /> : null}
        <Layout.Content className="app-content">
          {watermarkEnabled ? <Watermark content={watermarkText}>{content}</Watermark> : content}
        </Layout.Content>
        <Layout.Footer style={{ textAlign: "center", padding: "12px 50px" }}>
          {footerText}
        </Layout.Footer>
      </Layout>
      <FloatButton.BackTop />
    </Layout>
  );
}
