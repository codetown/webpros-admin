import {
  CaretDownOutlined,
  CaretUpOutlined,
  DollarOutlined,
  EyeOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import {
  version as antdVersion,
  Card,
  Col,
  Progress,
  Row,
  Statistic,
  Table,
  Tag,
  Timeline,
} from "antd";
import dayjs from "dayjs";
import { type ReactNode, version as reactVersion, useEffect, useState } from "react";
import { getDashboardSummary } from "@/api/dashboard";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import type { DashboardSummary, OrderItem, StatItem } from "@/types";
import { getGreeting } from "@/utils/format";
import Sparkline from "./Sparkline";

const statVisual: Record<string, { icon: ReactNode; from: string; to: string }> = {
  visits: { icon: <EyeOutlined />, from: "#3b82f6", to: "#60a5fa" },
  sales: { icon: <DollarOutlined />, from: "#8b5cf6", to: "#a78bfa" },
  orders: { icon: <ShoppingCartOutlined />, from: "#f59e0b", to: "#fbbf24" },
  users: { icon: <TeamOutlined />, from: "#10b981", to: "#34d399" },
};

const fallbackVisual = { icon: <EyeOutlined />, from: "#64748b", to: "#94a3b8" };

const orderStatusMap = {
  pending: { label: "待处理", color: "default" },
  processing: { label: "进行中", color: "processing" },
  completed: { label: "已完成", color: "success" },
} as const;

const orderColumns: TableColumnsType<OrderItem> = [
  { title: "订单号", dataIndex: "orderNo", width: 150 },
  { title: "产品", dataIndex: "product", ellipsis: true },
  { title: "客户", dataIndex: "customer", ellipsis: true },
  {
    title: "金额",
    dataIndex: "amount",
    width: 110,
    align: "right",
    render: (value: number) => `¥${value.toLocaleString()}`,
  },
  {
    title: "状态",
    dataIndex: "status",
    width: 90,
    render: (status: OrderItem["status"]) => (
      <Tag color={orderStatusMap[status].color}>{orderStatusMap[status].label}</Tag>
    ),
  },
  { title: "下单时间", dataIndex: "createdAt", width: 170 },
];

const placeholderStats: StatItem[] = [
  { key: "visits", label: "访问量", value: 0, trend: 0, percent: 0, points: [0, 0] },
  { key: "sales", label: "销售额", value: 0, trend: 0, percent: 0, points: [0, 0] },
  { key: "orders", label: "订单量", value: 0, trend: 0, percent: 0, points: [0, 0] },
  { key: "users", label: "用户总数", value: 0, trend: 0, percent: 0, points: [0, 0] },
];

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const unread = useNotificationStore((state) => state.items.filter((item) => !item.read).length);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    getDashboardSummary()
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = summary?.stats ?? placeholderStats;
  const maxDept = Math.max(1, ...(summary?.deptStats.map((item) => item.count) ?? [1]));

  return (
    <div>
      <div className="welcome-banner">
        <div>
          <h2>
            {getGreeting()}，{user?.nickname ?? "访客"}！
          </h2>
          <p>
            {dayjs().format("YYYY年M月D日 dddd")} · {user?.dept ?? "-"} · 新的一天，继续全力以赴吧。
          </p>
        </div>
        <div className="welcome-banner-stats">
          <div className="item">
            <span>今日订单</span>
            <strong>46</strong>
          </div>
          <div className="item">
            <span>待办任务</span>
            <strong>8</strong>
          </div>
          <div className="item">
            <span>未读消息</span>
            <strong>{unread}</strong>
          </div>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {stats.map((item) => {
          const visual = statVisual[item.key] ?? fallbackVisual;
          return (
            <Col key={item.key} xs={24} sm={12} xl={6}>
              <Card className="stat-card" loading={loading}>
                <div className="stat-card-head">
                  <div>
                    <div className="stat-label">{item.label}</div>
                    <Statistic
                      value={item.value}
                      prefix={item.prefix}
                      valueStyle={{ fontSize: 26, fontWeight: 600 }}
                    />
                  </div>
                  <div
                    className="stat-icon"
                    style={{
                      background: `linear-gradient(135deg, ${visual.from}, ${visual.to})`,
                    }}
                  >
                    {visual.icon}
                  </div>
                </div>
                <Sparkline points={item.points} color={visual.to} />
                <div className="stat-card-foot">
                  <span className={item.trend >= 0 ? "trend-up" : "trend-down"}>
                    {item.trend >= 0 ? <CaretUpOutlined /> : <CaretDownOutlined />}
                    {Math.abs(item.trend)}%
                    <span className="stat-desc" style={{ marginLeft: 6 }}>
                      较上周
                    </span>
                  </span>
                  <span className="stat-desc">目标 {item.percent}%</span>
                </div>
                <Progress
                  percent={item.percent}
                  showInfo={false}
                  size="small"
                  strokeColor={visual.to}
                />
              </Card>
            </Col>
          );
        })}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} xl={16}>
          <Card title="最近订单" loading={loading}>
            <Table
              size="small"
              rowKey="id"
              columns={orderColumns}
              dataSource={summary?.orders ?? []}
              pagination={false}
            />
          </Card>
        </Col>
        <Col xs={24} xl={8}>
          <Card title="最新动态" loading={loading}>
            <Timeline
              items={(summary?.activities ?? []).map((item) => ({
                color: item.color,
                children: (
                  <div>
                    <div>{item.text}</div>
                    <div className="stat-desc" style={{ fontSize: 12 }}>
                      {item.time}
                    </div>
                  </div>
                ),
              }))}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} xl={16}>
          <Card title="部门人数分布" loading={loading}>
            {(summary?.deptStats ?? []).map((dept) => (
              <div key={dept.dept} className="dept-row">
                <span className="dept-name">{dept.dept}</span>
                <Progress
                  percent={Math.round((dept.count / maxDept) * 100)}
                  showInfo={false}
                  size="small"
                  strokeColor="var(--app-primary)"
                />
                <span className="dept-count">{dept.count} 人</span>
              </div>
            ))}
          </Card>
        </Col>
        <Col xs={24} xl={8}>
          <Card title="系统信息">
            <div className="sysinfo-row">
              <span>系统版本</span>
              <strong className="sysinfo-value">v1.1.0</strong>
            </div>
            <div className="sysinfo-row">
              <span>React</span>
              <strong className="sysinfo-value">{reactVersion}</strong>
            </div>
            <div className="sysinfo-row">
              <span>Ant Design</span>
              <strong className="sysinfo-value">{antdVersion}</strong>
            </div>
            <div className="sysinfo-row">
              <span>构建模式</span>
              <strong className="sysinfo-value">
                {import.meta.env.MODE === "production" ? "生产" : "开发"}
              </strong>
            </div>
            <div className="sysinfo-row">
              <span>接口模式</span>
              <strong className="sysinfo-value">
                {import.meta.env.VITE_USE_MOCK === "true" ? "Mock 数据" : "真实接口"}
              </strong>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
