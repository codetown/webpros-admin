import { Checkbox, DatePicker, Form, Input, InputNumber, Radio, Select, Switch } from "antd";
import dayjs from "dayjs";
import type { ReactNode } from "react";
import type { WorkflowField, WorkflowStep } from "@/types";

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
    case "checkbox":
      return <Checkbox.Group options={toOptions(field.options)} />;
    case "date":
      return <DatePicker style={{ width: "100%" }} />;
    case "datetime":
      return <DatePicker showTime style={{ width: "100%" }} />;
    case "switch":
      return <Switch />;
    default:
      return <Input placeholder={field.placeholder} />;
  }
}

/** 根据字段定义生成表单校验规则 */
function buildRules(field: WorkflowField) {
  if (!field.required) return [];
  const message = `请填写${field.label}`;
  return field.type === "checkbox"
    ? [{ required: true, type: "array" as const, min: 1, message }]
    : [{ required: true, message }];
}

/** 根据字段定义动态渲染一组 Form.Item */
export function renderFieldItems(fields: WorkflowField[]): ReactNode[] {
  return fields.map((field) => (
    <Form.Item
      key={field.id}
      name={field.name}
      label={field.label}
      rules={buildRules(field)}
      tooltip={field.tips}
      valuePropName={field.type === "switch" ? "checked" : "value"}
    >
      {renderControl(field)}
    </Form.Item>
  ));
}

/** 根据步骤字段定义生成表单初始值（应用默认值） */
export function buildStepInitialValues(step: WorkflowStep): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const field of step.fields) {
    if (field.defaultValue === undefined) continue;
    // DatePicker 需要 Dayjs 值，字符串默认值需转换
    if (field.type === "date" || field.type === "datetime") {
      if (typeof field.defaultValue === "string" && field.defaultValue) {
        values[field.name] = dayjs(field.defaultValue);
      }
    } else {
      values[field.name] = field.defaultValue;
    }
  }
  return values;
}

/** 将表单值格式化为可读文本（用于只读展示） */
export function formatFieldValue(field: WorkflowField, value: unknown): string {
  if (value === undefined || value === null || value === "") return "-";
  if (field.type === "switch") return value ? "是" : "否";
  if (Array.isArray(value)) return value.join("、");
  return String(value);
}

export const fieldTypeLabels: Record<WorkflowField["type"], string> = {
  input: "单行文本",
  textarea: "多行文本",
  number: "数字",
  select: "下拉选择",
  radio: "单选",
  checkbox: "多选",
  date: "日期",
  datetime: "日期时间",
  switch: "开关",
};

/** 需要提供选项的字段类型 */
export const optionFieldTypes = ["select", "radio", "checkbox"];

/** 提交时按字段类型规范化值（日期/日期时间转字符串，checkbox 保持数组） */
export function normalizeFieldValue(field: WorkflowField, value: unknown): unknown {
  if (value === undefined || value === null || value === "") return value;
  if (field.type === "date" || field.type === "datetime") {
    const fmt = field.type === "date" ? "YYYY-MM-DD" : "YYYY-MM-DD HH:mm:ss";
    return dayjs(value as Date).format(fmt);
  }
  return value;
}
