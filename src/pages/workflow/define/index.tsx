import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PartitionOutlined,
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import { App, Button, Card, Form, Input, Modal, Radio, Space, Table, Tag } from "antd";
import { useState } from "react";
import {
  createWorkflow,
  deleteWorkflow,
  duplicateWorkflow,
  getWorkflowList,
  updateWorkflow,
} from "@/api/workflow";
import Authorized from "@/components/Authorized";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { statusOptions } from "@/constants/meta";
import { useList } from "@/hooks/useList";
import type { Status, Workflow } from "@/types";
import { formatDateTime } from "@/utils/format";
import { notify } from "@/utils/notify";
import PreviewDrawer from "./PreviewDrawer";
import StepConfigDrawer from "./StepConfigDrawer";

interface WorkflowFormValues {
  name: string;
  code: string;
  description?: string;
  status: Status;
}

export default function WorkflowDefinePage() {
  const {
    loading,
    dataSource: workflows,
    refresh: fetchWorkflows,
  } = useList<Workflow>(getWorkflowList);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Workflow | null>(null);
  const [saving, setSaving] = useState(false);
  const [configTarget, setConfigTarget] = useState<Workflow | null>(null);
  const [previewTarget, setPreviewTarget] = useState<Workflow | null>(null);
  const [form] = Form.useForm<WorkflowFormValues>();
  const { modal } = App.useApp();

  const handleDuplicate = async (record: Workflow) => {
    try {
      await duplicateWorkflow(record.id);
      fetchWorkflows();
      notify.success("复制成功，副本默认为停用状态");
    } catch {
      // 错误提示已由请求层处理
    }
  };

  const openModal = (record: Workflow | null) => {
    setEditing(record);
    form.resetFields();
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.setFieldsValue({ status: 1 });
    }
    setModalOpen(true);
  };

  const onSubmit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editing) {
        await updateWorkflow(editing.id, { ...values, steps: editing.steps });
      } else {
        await createWorkflow({ ...values, steps: [] });
      }
      setModalOpen(false);
      fetchWorkflows();
    } catch {
      // 错误提示已由请求层处理
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (record: Workflow) => {
    modal.confirm({
      title: "删除确认",
      content: `确定要删除流程「${record.name}」吗？已有任务引用的流程无法删除。`,
      okText: "删除",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: async () => {
        await deleteWorkflow(record.id);
        fetchWorkflows();
      },
    });
  };

  const columns: TableColumnsType<Workflow> = [
    { title: "流程名称", dataIndex: "name", width: 180 },
    {
      title: "流程编码",
      dataIndex: "code",
      width: 150,
      render: (code: string) => <Tag>{code}</Tag>,
    },
    { title: "描述", dataIndex: "description", ellipsis: true },
    {
      title: "步骤数",
      dataIndex: "steps",
      width: 90,
      render: (steps: Workflow["steps"]) => steps.length,
    },
    {
      title: "表单项数",
      dataIndex: "steps",
      width: 100,
      render: (steps: Workflow["steps"]) =>
        steps.reduce((sum, step) => sum + step.fields.length, 0),
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 90,
      render: (status: Status) => <StatusBadge status={status} />,
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
      width: 310,
      render: (_: unknown, record) => (
        <Space size={0}>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setPreviewTarget(record)}
          >
            预览
          </Button>
          <Authorized perm="workflow:update">
            <Button
              type="link"
              size="small"
              icon={<SettingOutlined />}
              onClick={() => setConfigTarget(record)}
            >
              配置步骤
            </Button>
          </Authorized>
          <Authorized perm="workflow:update">
            <Button
              type="link"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleDuplicate(record)}
            >
              复制
            </Button>
          </Authorized>
          <Authorized perm="workflow:update">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openModal(record)}
            >
              编辑
            </Button>
          </Authorized>
          <Authorized perm="workflow:delete">
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            >
              删除
            </Button>
          </Authorized>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        icon={<PartitionOutlined />}
        title="工作流定义"
        description="定义流程步骤与每个步骤需要填写的表单字段，供任务实例复用"
      />
      <Card>
        <div className="table-toolbar">
          <Authorized perm="workflow:update">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>
              新建流程
            </Button>
          </Authorized>
          <Button icon={<ReloadOutlined />} onClick={fetchWorkflows}>
            刷新
          </Button>
        </div>
        <Table<Workflow>
          rowKey="id"
          loading={loading}
          dataSource={workflows}
          columns={columns}
          pagination={false}
          scroll={{ x: 1100 }}
        />
      </Card>

      <Modal
        title={editing ? "编辑流程" : "新建流程"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={onSubmit}
        confirmLoading={saving}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" autoComplete="off" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="流程名称"
            rules={[{ required: true, message: "请输入流程名称" }]}
          >
            <Input placeholder="如：员工入职流程" />
          </Form.Item>
          <Form.Item
            name="code"
            label="流程编码"
            rules={[
              { required: true, message: "请输入流程编码" },
              {
                pattern: /^[a-zA-Z][a-zA-Z0-9-_]*$/,
                message: "以字母开头，仅含字母/数字/下划线/中划线",
              },
            ]}
          >
            <Input placeholder="如：onboarding" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="流程用途描述" maxLength={100} showCount />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Radio.Group options={statusOptions} />
          </Form.Item>
        </Form>
      </Modal>

      <StepConfigDrawer
        open={Boolean(configTarget)}
        workflow={configTarget}
        onClose={() => setConfigTarget(null)}
        onSuccess={fetchWorkflows}
      />

      <PreviewDrawer workflow={previewTarget} onClose={() => setPreviewTarget(null)} />
    </div>
  );
}
