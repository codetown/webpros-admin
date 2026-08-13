import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import {
  App,
  Button,
  Drawer,
  Empty,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tag,
} from "antd";
import { useEffect, useState } from "react";
import { updateWorkflow } from "@/api/workflow";
import type { Status, Workflow, WorkflowField, WorkflowFieldType, WorkflowStep } from "@/types";
import { fieldTypeLabels, genId } from "../components/fields";

interface StepConfigDrawerProps {
  open: boolean;
  workflow: Workflow | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface StepFormValues {
  name: string;
  description?: string;
}

interface FieldFormValues {
  name: string;
  label: string;
  type: WorkflowFieldType;
  required: boolean;
  placeholder?: string;
  tips?: string;
  options?: string[];
}

/** 步骤与表单项配置抽屉：这是工作流编排的核心 */
export default function StepConfigDrawer({
  open,
  workflow,
  onClose,
  onSuccess,
}: StepConfigDrawerProps) {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [saving, setSaving] = useState(false);
  const [stepModalOpen, setStepModalOpen] = useState(false);
  const [stepEditing, setStepEditing] = useState<WorkflowStep | null>(null);
  const [fieldModalOpen, setFieldModalOpen] = useState(false);
  const [fieldStepId, setFieldStepId] = useState("");
  const [fieldEditing, setFieldEditing] = useState<WorkflowField | null>(null);
  const [stepForm] = Form.useForm<StepFormValues>();
  const [fieldForm] = Form.useForm<FieldFormValues>();
  const { modal } = App.useApp();

  useEffect(() => {
    if (!open || !workflow) return;
    setSteps(
      workflow.steps.map((step) => ({
        ...step,
        fields: step.fields.map((field) => ({ ...field })),
      })),
    );
  }, [open, workflow]);

  // ---------------- 步骤操作 ----------------
  const openStepModal = (step: WorkflowStep | null) => {
    setStepEditing(step);
    stepForm.resetFields();
    if (step) stepForm.setFieldsValue(step);
    setStepModalOpen(true);
  };

  const submitStep = async () => {
    const values = await stepForm.validateFields();
    if (stepEditing) {
      setSteps((prev) =>
        prev.map((step) => (step.id === stepEditing.id ? { ...step, ...values } : step)),
      );
    } else {
      setSteps((prev) => [...prev, { id: genId(), fields: [], ...values }]);
    }
    setStepModalOpen(false);
  };

  const removeStep = (step: WorkflowStep) => {
    modal.confirm({
      title: "删除步骤",
      content: `确定要删除步骤「${step.name}」及其 ${step.fields.length} 个表单项吗？`,
      okText: "删除",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: () => setSteps((prev) => prev.filter((item) => item.id !== step.id)),
    });
  };

  const moveStep = (index: number, delta: number) => {
    setSteps((prev) => {
      const next = [...prev];
      const target = index + delta;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  // ---------------- 表单项操作 ----------------
  const openFieldModal = (stepId: string, field: WorkflowField | null) => {
    setFieldStepId(stepId);
    setFieldEditing(field);
    fieldForm.resetFields();
    if (field) {
      fieldForm.setFieldsValue(field);
    } else {
      fieldForm.setFieldsValue({ type: "input", required: false });
    }
    setFieldModalOpen(true);
  };

  const submitField = async () => {
    const values = await fieldForm.validateFields();
    const payload: WorkflowField = {
      id: fieldEditing?.id ?? genId(),
      name: values.name,
      label: values.label,
      type: values.type,
      required: values.required,
      placeholder: values.placeholder?.trim() || undefined,
      tips: values.tips?.trim() || undefined,
      options: values.type === "select" || values.type === "radio" ? values.options : undefined,
    };
    setSteps((prev) =>
      prev.map((step) => {
        if (step.id !== fieldStepId) return step;
        const exists = step.fields.some((field) => field.id === payload.id);
        return {
          ...step,
          fields: exists
            ? step.fields.map((field) => (field.id === payload.id ? payload : field))
            : [...step.fields, payload],
        };
      }),
    );
    setFieldModalOpen(false);
  };

  const removeField = (stepId: string, field: WorkflowField) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === stepId
          ? { ...step, fields: step.fields.filter((item) => item.id !== field.id) }
          : step,
      ),
    );
  };

  // ---------------- 保存 ----------------
  const handleSave = async () => {
    if (!workflow) return;
    if (steps.length === 0) {
      modal.warning({ title: "提示", content: "请至少添加一个步骤" });
      return;
    }
    const emptyStep = steps.find((step) => step.fields.length === 0);
    if (emptyStep) {
      modal.warning({
        title: "提示",
        content: `步骤「${emptyStep.name}」还没有表单项，请为其添加`,
      });
      return;
    }
    setSaving(true);
    try {
      await updateWorkflow(workflow.id, {
        name: workflow.name,
        code: workflow.code,
        description: workflow.description,
        status: workflow.status as Status,
        steps,
      });
      onSuccess();
      onClose();
    } catch {
      // 错误提示已由请求层处理
    } finally {
      setSaving(false);
    }
  };

  const renderFieldColumns = (stepId: string): TableColumnsType<WorkflowField> => [
    { title: "字段名称", dataIndex: "label", width: 120 },
    {
      title: "字段标识",
      dataIndex: "name",
      width: 130,
      render: (name: string) => <Tag>{name}</Tag>,
    },
    {
      title: "类型",
      dataIndex: "type",
      width: 90,
      render: (type: WorkflowFieldType) => <Tag color="processing">{fieldTypeLabels[type]}</Tag>,
    },
    {
      title: "必填",
      dataIndex: "required",
      width: 60,
      render: (required: boolean) => (required ? "是" : "否"),
    },
    {
      title: "操作",
      key: "action",
      width: 120,
      render: (_: unknown, record) => (
        <Space size={0}>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openFieldModal(stepId, record)}
          />
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => removeField(stepId, record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Drawer
      title={`配置步骤 - ${workflow?.name ?? ""}`}
      width={760}
      open={open}
      onClose={onClose}
      destroyOnHidden
      footer={
        <Space style={{ float: "right" }}>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" loading={saving} onClick={handleSave}>
            保存
          </Button>
        </Space>
      }
    >
      <div className="table-toolbar">
        <Button type="dashed" icon={<PlusOutlined />} onClick={() => openStepModal(null)}>
          添加步骤
        </Button>
      </div>

      {steps.length === 0 ? (
        <Empty description="暂无步骤，点击上方按钮添加第一个步骤" />
      ) : (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          {steps.map((step, index) => (
            <div key={step.id} className="workflow-step-card">
              <div className="workflow-step-head">
                <div>
                  <span className="workflow-step-index">{index + 1}</span>
                  <span className="workflow-step-name">{step.name}</span>
                  {step.description ? (
                    <span className="stat-desc" style={{ marginLeft: 8, fontSize: 12 }}>
                      {step.description}
                    </span>
                  ) : null}
                </div>
                <Space size={0}>
                  <Button
                    type="text"
                    size="small"
                    icon={<ArrowUpOutlined />}
                    disabled={index === 0}
                    onClick={() => moveStep(index, -1)}
                  />
                  <Button
                    type="text"
                    size="small"
                    icon={<ArrowDownOutlined />}
                    disabled={index === steps.length - 1}
                    onClick={() => moveStep(index, 1)}
                  />
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => openStepModal(step)}
                  />
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeStep(step)}
                  />
                </Space>
              </div>
              <Table<WorkflowField>
                rowKey="id"
                size="small"
                columns={renderFieldColumns(step.id)}
                dataSource={step.fields}
                pagination={false}
                locale={{ emptyText: "该步骤暂无表单项" }}
              />
              <Button
                type="dashed"
                size="small"
                block
                icon={<PlusOutlined />}
                style={{ marginTop: 12 }}
                onClick={() => openFieldModal(step.id, null)}
              >
                添加表单项
              </Button>
            </div>
          ))}
        </Space>
      )}

      {/* 步骤编辑弹窗 */}
      <Modal
        title={stepEditing ? "编辑步骤" : "添加步骤"}
        open={stepModalOpen}
        onCancel={() => setStepModalOpen(false)}
        onOk={submitStep}
        destroyOnHidden
      >
        <Form form={stepForm} layout="vertical" autoComplete="off" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="步骤名称"
            rules={[{ required: true, message: "请输入步骤名称" }]}
          >
            <Input placeholder="如：入职登记" />
          </Form.Item>
          <Form.Item name="description" label="步骤说明">
            <Input.TextArea rows={2} placeholder="该步骤要做什么" maxLength={60} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 表单项编辑弹窗 */}
      <Modal
        title={fieldEditing ? "编辑表单项" : "添加表单项"}
        open={fieldModalOpen}
        onCancel={() => setFieldModalOpen(false)}
        onOk={submitField}
        width={520}
        destroyOnHidden
      >
        <Form form={fieldForm} layout="vertical" autoComplete="off" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="字段标识"
            rules={[
              { required: true, message: "请输入字段标识" },
              { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: "以字母开头，仅含字母/数字/下划线" },
            ]}
          >
            <Input placeholder="如：realName" />
          </Form.Item>
          <Form.Item
            name="label"
            label="字段名称"
            rules={[{ required: true, message: "请输入字段名称" }]}
          >
            <Input placeholder="如：姓名" />
          </Form.Item>
          <Form.Item name="type" label="字段类型" rules={[{ required: true }]}>
            <Select
              options={Object.entries(fieldTypeLabels).map(([value, label]) => ({ value, label }))}
            />
          </Form.Item>
          <Form.Item name="required" label="是否必填" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="placeholder" label="占位提示">
            <Input placeholder="输入框占位文字" />
          </Form.Item>
          <Form.Item name="tips" label="帮助说明">
            <Input placeholder="字段下方的说明文字" />
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, next) => prev.type !== next.type}>
            {({ getFieldValue }) => {
              const type = getFieldValue("type") as WorkflowFieldType;
              if (type !== "select" && type !== "radio") return null;
              return (
                <Form.Item
                  name="options"
                  label="选项"
                  rules={[{ required: true, message: "请添加至少一个选项" }]}
                >
                  <Select mode="tags" open={false} placeholder="输入选项后回车" />
                </Form.Item>
              );
            }}
          </Form.Item>
        </Form>
      </Modal>
    </Drawer>
  );
}
