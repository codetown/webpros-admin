import { AuditOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import { Button, Card, Form, Input, Modal, Progress, Select, Space, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import { createTask, getTaskPage, getWorkflowList, type TaskQuery } from "@/api/workflow";
import Authorized from "@/components/Authorized";
import PageHeader from "@/components/PageHeader";
import { useTable } from "@/hooks/useTable";
import { useAuthStore } from "@/store/useAuthStore";
import type { TaskInstance, TaskStatus, Workflow } from "@/types";
import { formatDateTime } from "@/utils/format";
import TaskDetailDrawer from "./TaskDetailDrawer";

const statusMeta: Record<TaskStatus, { label: string; color: string }> = {
  pending: { label: "待开始", color: "default" },
  processing: { label: "进行中", color: "processing" },
  completed: { label: "已完成", color: "success" },
  cancelled: { label: "已取消", color: "error" },
};

interface TaskCreateValues {
  workflowId: number;
  title: string;
  assignee?: string;
}

export default function WorkflowTaskPage() {
  const { tableProps, onSearch, onReset, refresh } = useTable<TaskInstance, TaskQuery>(getTaskPage);
  const [searchForm] = Form.useForm<TaskQuery>();
  const [createOpen, setCreateOpen] = useState(false);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [creating, setCreating] = useState(false);
  const [detail, setDetail] = useState<TaskInstance | null>(null);
  const [createForm] = Form.useForm<TaskCreateValues>();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    getWorkflowList()
      .then(setWorkflows)
      .catch(() => undefined);
  }, []);

  const openCreate = () => {
    createForm.resetFields();
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    const values = await createForm.validateFields();
    setCreating(true);
    try {
      const task = await createTask({ ...values, creator: user?.nickname ?? "-" });
      setCreateOpen(false);
      setDetail(task);
      refresh();
    } catch {
      // 错误提示已由请求层处理
    } finally {
      setCreating(false);
    }
  };

  const renderCurrentStep = (task: TaskInstance) => {
    if (task.status === "completed") return "已完成";
    if (task.status === "cancelled") return "已取消";
    return task.steps[task.currentStep]?.name ?? "-";
  };

  const renderProgress = (task: TaskInstance) => {
    const done = task.status === "completed" ? task.steps.length : task.currentStep;
    const percent = task.steps.length === 0 ? 0 : Math.round((done / task.steps.length) * 100);
    return <Progress percent={percent} size="small" style={{ width: 140 }} />;
  };

  const columns: TableColumnsType<TaskInstance> = [
    {
      title: "任务标题",
      dataIndex: "title",
      width: 200,
      render: (title: string) => <strong>{title}</strong>,
    },
    {
      title: "所属流程",
      dataIndex: "workflowName",
      width: 150,
      render: (name: string) => <Tag color="blue">{name}</Tag>,
    },
    {
      title: "当前步骤",
      key: "step",
      width: 120,
      render: (_: unknown, record) => renderCurrentStep(record),
    },
    {
      title: "进度",
      key: "progress",
      width: 160,
      render: (_: unknown, record) => renderProgress(record),
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 90,
      render: (status: TaskStatus) => (
        <Tag color={statusMeta[status].color}>{statusMeta[status].label}</Tag>
      ),
    },
    { title: "发起人", dataIndex: "creator", width: 110 },
    {
      title: "负责人",
      dataIndex: "assignee",
      width: 110,
      render: (assignee?: string) => assignee ?? "-",
    },
    {
      title: "更新时间",
      dataIndex: "updatedAt",
      width: 170,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: "操作",
      key: "actionCol",
      fixed: "right",
      width: 120,
      render: (_: unknown, record) => (
        <Button type="link" size="small" onClick={() => setDetail(record)}>
          {record.status === "processing" ? "处理" : "详情"}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        icon={<AuditOutlined />}
        title="任务实例"
        description="基于工作流创建任务，按步骤填写表单直至完成流转"
      />
      <Card className="search-card">
        <Form
          form={searchForm}
          layout="inline"
          onFinish={(values) => onSearch(values)}
          style={{ rowGap: 12 }}
        >
          <Form.Item name="title" label="任务标题">
            <Input placeholder="任务标题关键字" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select
              placeholder="全部"
              allowClear
              style={{ width: 130 }}
              options={Object.entries(statusMeta).map(([value, meta]) => ({
                label: meta.label,
                value,
              }))}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button
                onClick={() => {
                  searchForm.resetFields();
                  onReset();
                }}
              >
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card>
        <div className="table-toolbar">
          <Authorized perm="workflow:task:create">
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              创建任务
            </Button>
          </Authorized>
          <Button icon={<ReloadOutlined />} onClick={refresh}>
            刷新
          </Button>
        </div>
        <Table<TaskInstance> {...tableProps} columns={columns} scroll={{ x: 1250 }} />
      </Card>

      <Modal
        title="创建任务"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={handleCreate}
        confirmLoading={creating}
        destroyOnHidden
      >
        <Form form={createForm} layout="vertical" autoComplete="off" style={{ marginTop: 16 }}>
          <Form.Item
            name="workflowId"
            label="选择流程"
            rules={[{ required: true, message: "请选择流程" }]}
          >
            <Select
              placeholder="请选择流程"
              options={workflows.map((workflow) => ({
                label: `${workflow.name}（${workflow.steps.length} 个步骤）`,
                value: workflow.id,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="title"
            label="任务标题"
            rules={[{ required: true, message: "请输入任务标题" }]}
          >
            <Input placeholder="如：张三入职办理" />
          </Form.Item>
          <Form.Item name="assignee" label="负责人">
            <Input placeholder="任务负责人" />
          </Form.Item>
        </Form>
      </Modal>

      <TaskDetailDrawer task={detail} onClose={() => setDetail(null)} onSuccess={refresh} />
    </div>
  );
}
