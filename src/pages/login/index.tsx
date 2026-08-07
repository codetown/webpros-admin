import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Divider, Form, Input, Space } from "antd";
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import type { LoginParams } from "@/types";
import { notify } from "@/utils/notify";

const demoAccounts = [
  { label: "管理员", username: "admin", password: "123456" },
  { label: "运营", username: "editor", password: "123456" },
  { label: "访客", username: "guest", password: "123456" },
];

export default function LoginPage() {
  const [form] = Form.useForm<LoginParams>();
  const [loading, setLoading] = useState(false);
  const token = useAuthStore((state) => state.token);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = (location.state as { redirect?: string } | null)?.redirect;

  const onFinish = async (values: LoginParams) => {
    setLoading(true);
    try {
      const user = await login(values);
      notify.success(`欢迎回来，${user.nickname}`);
      navigate(redirect ?? "/dashboard", { replace: true });
    } catch {
      // 错误提示已由请求层统一处理
    } finally {
      setLoading(false);
    }
  };

  if (token) return <Navigate to="/dashboard" replace />;

  return (
    <div className="login-page">
      <div className="login-banner">
        <div className="login-banner-inner">
          <div className="login-banner-logo">
            <img src="/favicon.svg" alt="logo" />
            <span>WebPros Admin</span>
          </div>
          <h1>开箱即用的中后台前端解决方案</h1>
          <p>
            基于 React 18、Vite、Ant Design 5 与 Zustand
            构建，提供完整的权限模型、多标签页与暗黑主题，助力团队快速交付企业级后台产品。
          </p>
          <ul className="banner-features">
            <li>RBAC 权限控制</li>
            <li>路由懒加载</li>
            <li>多标签页导航</li>
            <li>暗黑主题</li>
            <li>Mock 数据层</li>
            <li>响应式布局</li>
          </ul>
        </div>
      </div>
      <div className="login-form-wrap">
        <div className="login-form-box">
          <h2>欢迎登录</h2>
          <p className="login-subtitle">请输入您的账号信息</p>
          <Form
            form={form}
            size="large"
            autoComplete="off"
            onFinish={onFinish}
            initialValues={{ username: "admin", password: "123456" }}
          >
            <Form.Item name="username" rules={[{ required: true, message: "请输入用户名" }]}>
              <Input prefix={<UserOutlined />} placeholder="用户名" allowClear />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: "请输入密码" }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="密码" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                登 录
              </Button>
            </Form.Item>
          </Form>
          <Divider plain>演示账号（点击填充）</Divider>
          <Space wrap>
            {demoAccounts.map((account) => (
              <Button
                key={account.username}
                size="small"
                onClick={() =>
                  form.setFieldsValue({ username: account.username, password: account.password })
                }
              >
                {account.label} {account.username}
              </Button>
            ))}
          </Space>
          <div className="login-footer">WebPros Admin ©2026 · React + Vite + Ant Design</div>
        </div>
      </div>
    </div>
  );
}
