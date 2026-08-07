import { FloatButton, Layout, Watermark } from "antd";
import { Suspense } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Loading from "@/components/Loading";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import HeaderBar from "./components/HeaderBar";
import SiderMenu from "./components/SiderMenu";
import TabsNav from "./components/TabsNav";

export default function BasicLayout() {
  const collapsed = useAppStore((state) => state.collapsed);
  const setCollapsed = useAppStore((state) => state.setCollapsed);
  const watermark = useAppStore((state) => state.watermark);
  const themeMode = useAppStore((state) => state.themeMode);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

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
          {!collapsed && <span>WebPros Admin</span>}
        </button>
        <SiderMenu />
      </Layout.Sider>
      <Layout>
        <HeaderBar />
        <TabsNav />
        <Layout.Content className="app-content">
          {watermark ? (
            <Watermark content={user?.nickname ?? "WebPros Admin"}>{content}</Watermark>
          ) : (
            content
          )}
        </Layout.Content>
        <Layout.Footer style={{ textAlign: "center", padding: "12px 50px" }}>
          WebPros Admin ©2026 · Powered by React + Ant Design
        </Layout.Footer>
      </Layout>
      <FloatButton.BackTop />
    </Layout>
  );
}
