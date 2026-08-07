import { DownloadOutlined, EyeOutlined, FileTextOutlined } from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import {
  Badge,
  Button,
  Card,
  DatePicker,
  Descriptions,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useState } from "react";
import { getLogPage, type LogQuery } from "@/api/log";
import PageHeader from "@/components/PageHeader";
import { useTable } from "@/hooks/useTable";
import type { LogItem, Status } from "@/types";
import { formatDateTime } from "@/utils/format";
import { notify } from "@/utils/notify";

const { RangePicker } = DatePicker;

interface LogSearchValues {
  username?: string;
  status?: Status;
  range?: [Dayjs, Dayjs];
}

export default function LogManagePage() {
  const { tableProps, onSearch, onReset } = useTable<LogItem, LogQuery>(getLogPage);
  const [searchForm] = Form.useForm<LogSearchValues>();
  const [detail, setDetail] = useState<LogItem | null>(null);

  const handleFinish = (values: LogSearchValues) => {
    const { range, ...rest } = values;
    onSearch({
      ...rest,
      startTime: range?.[0]?.startOf("day").toISOString(),
      endTime: range?.[1]?.endOf("day").toISOString(),
    });
  };

  const handleReset = () => {
    searchForm.resetFields();
    onReset();
  };

  const handleExport = async () => {
    const dataSource = tableProps.dataSource ?? [];
    if (dataSource.length === 0) {
      notify.warning("当前没有可导出的数据");
      return;
    }
    const { exportExcel } = await import("@/utils/excel");
    exportExcel(`操作日志_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`, [
      {
        name: "操作日志",
        headers: [
          "ID",
          "用户名",
          "昵称",
          "操作",
          "IP 地址",
          "地区",
          "状态",
          "耗时(ms)",
          "操作时间",
        ],
        rows: dataSource.map((log) => [
          log.id,
          log.username,
          log.nickname,
          log.action,
          log.ip,
          log.location,
          log.status === 1 ? "成功" : "失败",
          log.duration,
          formatDateTime(log.createdAt),
        ]),
      },
    ]);
    notify.success("导出成功");
  };

  const columns: TableColumnsType<LogItem> = [
    {
      title: "操作人",
      dataIndex: "nickname",
      width: 140,
      render: (nickname: string, record) => `${nickname}（${record.username}）`,
    },
    { title: "操作内容", dataIndex: "action", width: 140 },
    { title: "IP 地址", dataIndex: "ip", width: 130 },
    { title: "地区", dataIndex: "location", width: 100 },
    {
      title: "状态",
      dataIndex: "status",
      width: 90,
      render: (status: Status) =>
        status === 1 ? <Tag color="success">成功</Tag> : <Tag color="error">失败</Tag>,
    },
    {
      title: "耗时",
      dataIndex: "duration",
      width: 90,
      render: (duration: number) => `${duration} ms`,
    },
    {
      title: "操作时间",
      dataIndex: "createdAt",
      width: 170,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: "操作",
      key: "actionCol",
      fixed: "right",
      width: 80,
      render: (_: unknown, record) => (
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => setDetail(record)}>
          详情
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        icon={<FileTextOutlined />}
        title="操作日志"
        description="审计用户操作行为，支持筛选、查看详情与导出 CSV"
      />
      <Card className="search-card">
        <Form form={searchForm} layout="inline" onFinish={handleFinish} style={{ rowGap: 12 }}>
          <Form.Item name="username" label="操作人">
            <Input placeholder="用户名" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select
              placeholder="全部"
              allowClear
              style={{ width: 120 }}
              options={[
                { label: "成功", value: 1 },
                { label: "失败", value: 0 },
              ]}
            />
          </Form.Item>
          <Form.Item name="range" label="时间范围">
            <RangePicker />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card>
        <div className="table-toolbar">
          <span className="stat-desc">
            共 {typeof tableProps.pagination === "object" ? (tableProps.pagination?.total ?? 0) : 0}{" "}
            条记录
          </span>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            导出本页 Excel
          </Button>
        </div>
        <Table<LogItem> {...tableProps} columns={columns} scroll={{ x: 1040 }} />
      </Card>

      <Drawer
        title="日志详情"
        width={520}
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        destroyOnHidden
      >
        {detail ? (
          <Descriptions
            column={1}
            bordered
            size="small"
            items={[
              {
                key: "user",
                label: "操作人",
                children: `${detail.nickname}（${detail.username}）`,
              },
              { key: "action", label: "操作内容", children: detail.action },
              {
                key: "status",
                label: "状态",
                children: (
                  <Badge
                    status={detail.status === 1 ? "success" : "error"}
                    text={detail.status === 1 ? "成功" : "失败"}
                  />
                ),
              },
              {
                key: "request",
                label: "请求",
                children: (
                  <Space>
                    <Tag color="processing">{detail.method}</Tag>
                    <span>{detail.path}</span>
                  </Space>
                ),
              },
              { key: "ip", label: "IP 地址", children: detail.ip },
              { key: "location", label: "登录地区", children: detail.location },
              { key: "agent", label: "客户端", children: detail.userAgent },
              { key: "duration", label: "耗时", children: `${detail.duration} ms` },
              { key: "time", label: "操作时间", children: formatDateTime(detail.createdAt) },
            ]}
          />
        ) : null}
      </Drawer>
    </div>
  );
}
