import { DatePicker, Form, Input, InputNumber, Radio, Select, Switch } from "antd";
import type { ReactNode } from "react";
import type { WorkflowField } from "@/types";

/** 简单唯一 id（Mock 场景足够） */
export function genId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function toOptions(options?: string[]) {
  return (options ?? []).map((option) => ({ label: option, value: option }));
}

/** 根据字段类型渲染对应控件 */
function renderControl(field: WorkflowField): ReactNode {
  switch (field.type) {
    case "textarea":
      return <Input.TextArea rows={3} placeholder={field.placeholder} />;
    case "number":
      return <InputNumber style={{ width: "100%" }} placeholder={field.placeholder} />;
    case "select":
      return (
        <Select allowClear placeholder={field.placeholder} options={toOptions(field.options)} />
      );
    case "radio":
      return <Radio.Group options={toOptions(field.options)} />;
    case "date":
      return <DatePicker style={{ width: "100%" }} />;
    case "switch":
      return <Switch />;
    default:
      return <Input placeholder={field.placeholder} />;
  }
}

/** 根据字段定义动态渲染一组 Form.Item */
export function renderFieldItems(fields: WorkflowField[]): ReactNode[] {
  return fields.map((field) => (
    <Form.Item
      key={field.id}
      name={field.name}
      label={field.label}
      rules={field.required ? [{ required: true, message: `请填写${field.label}` }] : []}
      tooltip={field.tips}
      valuePropName={field.type === "switch" ? "checked" : "value"}
    >
      {renderControl(field)}
    </Form.Item>
  ));
}

/** 将表单值格式化为可读文本（用于只读展示） */
export function formatFieldValue(field: WorkflowField, value: unknown): string {
  if (value === undefined || value === null || value === "") return "-";
  if (field.type === "switch") return value ? "是" : "否";
  return String(value);
}

export const fieldTypeLabels: Record<WorkflowField["type"], string> = {
  input: "单行文本",
  textarea: "多行文本",
  number: "数字",
  select: "下拉选择",
  radio: "单选",
  date: "日期",
  switch: "开关",
};
