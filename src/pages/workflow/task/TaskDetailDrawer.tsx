import { Alert, Button, Card, Descriptions, Drawer, Form, Space, Steps, Tag } from "antd";
import { useEffect, useState } from "react";
import { cancelTask, submitTaskStep } from "@/api/workflow";
import Authorized from "@/components/Authorized";
import { taskStatusMeta } from "@/constants/meta";
import type { TaskInstance } from "@/types";
import { notify } from "@/utils/notify";
import {
  buildStepInitialValues,
  formatFieldValue,
  normalizeFieldValue,
  renderFieldItems,
} from "../components/fields";

interface TaskDetailDrawerProps {
  task: TaskInstance | null;
  onClose: () => void;
  onSuccess: () => void;
}

/** 任务详情抽屉：Steps 进度 + 历史步骤只读数据 + 当前步骤动态表单 */
export default function TaskDetailDrawer({ task, onClose, onSuccess }: TaskDetailDrawerProps) {
  const [current, setCurrent] = useState<TaskInstance | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [form] = Form.useForm<Record<string, unknown>>();

  useEffect(() => {
    if (!task) return;
    setCurrent({
      ...task,
      steps: task.steps.map((step) => ({
        ...step,
        fields: step.fields.map((field) => ({ ...field })),
      })),
      formData: { ...task.formData },
    });
  }, [task]);

  const currentStep =
    current && current.status === "processing" ? current.steps[current.currentStep] : undefined;

  const handleSubmit = async () => {
    if (!current || !currentStep) return;
    const values = await form.validateFields();
    const data: Record<string, unknown> = {};
    for (const field of currentStep.fields) {
      data[field.name] = normalizeFieldValue(field, values[field.name]);
    }
    setSubmitting(true);
    try {
      const updated = await submitTaskStep(current.id, data);
      setCurrent(updated);
      form.resetFields();
      onSuccess();
      notify.success(updated.status === "completed" ? "任务已完成" : "已流转到下一步");
    } catch {
      // 错误提示已由请求层处理
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!current) return;
    setCancelling(true);
    try {
      const updated = await cancelTask(current.id);
      setCurrent(updated);
      onSuccess();
    } catch {
      // 错误提示已由请求层处理
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Drawer
      title={`任务详情 - ${current?.title ?? ""}`}
      width={720}
      open={Boolean(task)}
      onClose={onClose}
      destroyOnHidden
      footer={
        <Space style={{ float: "right" }}>
          {current?.status === "processing" ? (
            <Authorized perm="workflow:task:cancel">
              <Button danger loading={cancelling} onClick={handleCancel}>
                取消任务
              </Button>
            </Authorized>
          ) : null}
          <Button onClick={onClose}>关闭</Button>
        </Space>
      }
    >
      {current ? (
        <div>
          <Space style={{ marginBottom: 8 }}>
            <Tag color="blue">{current.workflowName}</Tag>
            <Tag color={taskStatusMeta[current.status].color}>
              {taskStatusMeta[current.status].label}
            </Tag>
            <span className="stat-desc" style={{ fontSize: 12 }}>
              发起人 {current.creator}
              {current.assignee ? ` · 负责人 ${current.assignee}` : ""}
            </span>
          </Space>

          <Steps
            size="small"
            current={current.status === "completed" ? current.steps.length : current.currentStep}
            status={current.status === "cancelled" ? "error" : "process"}
            items={current.steps.map((step) => ({ title: step.name }))}
            style={{ marginBottom: 24 }}
          />

          {current.steps.map((step, index) => {
            const show = current.status === "completed" ? true : index < current.currentStep;
            if (!show) return null;
            const data = current.formData[step.id];
            return (
              <div key={step.id} className="workflow-history">
                <div className="workflow-history-title">
                  步骤 {index + 1}：{step.name}
                </div>
                {data ? (
                  <Descriptions
                    column={1}
                    size="small"
                    bordered
                    items={step.fields.map((field) => ({
                      key: field.id,
                      label: field.label,
                      children: formatFieldValue(field, data[field.name]),
                    }))}
                  />
                ) : (
                  <div className="stat-desc">未填写</div>
                )}
              </div>
            );
          })}

          {current.status === "processing" && currentStep ? (
            <Card
              size="small"
              title={`步骤 ${current.currentStep + 1}：${currentStep.name}`}
              style={{ marginTop: 16 }}
            >
              {currentStep.description ? (
                <div className="stat-desc" style={{ marginBottom: 12 }}>
                  {currentStep.description}
                </div>
              ) : null}
              <Form
                form={form}
                layout="vertical"
                key={`${current.id}-${current.currentStep}`}
                initialValues={buildStepInitialValues(currentStep)}
              >
                {renderFieldItems(currentStep.fields)}
                <Authorized perm="workflow:task:submit">
                  <Button type="primary" loading={submitting} onClick={handleSubmit}>
                    提交并进入下一步
                  </Button>
                </Authorized>
              </Form>
            </Card>
          ) : null}

          {current.status === "completed" ? (
            <Alert
              type="success"
              showIcon
              message="任务已完成"
              description="所有步骤的表单均已提交。"
            />
          ) : null}
          {current.status === "cancelled" ? (
            <Alert type="warning" showIcon message="任务已取消，无法继续处理。" />
          ) : null}
        </div>
      ) : null}
    </Drawer>
  );
}
