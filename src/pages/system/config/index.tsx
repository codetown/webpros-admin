import { ControlOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, InputNumber, Select, Spin, Switch, Tabs } from "antd";
import { useEffect, useMemo, useState } from "react";
import Authorized from "@/components/Authorized";
import PageHeader from "@/components/PageHeader";
import { usePlatformConfigStore } from "@/store/usePlatformConfigStore";
import type { PlatformConfig } from "@/types";
import { notify } from "@/utils/notify";

const groupMeta: Record<string, { label: string }> = {
  basic: { label: "基础配置" },
  security: { label: "安全配置" },
  feature: { label: "功能配置" },
};

function renderItem(item: PlatformConfig) {
  switch (item.type) {
    case "boolean":
      return (
        <Form.Item
          name={item.key}
          label={item.label}
          valuePropName="checked"
          tooltip={item.description}
        >
          <Switch />
        </Form.Item>
      );
    case "number":
      return (
        <Form.Item name={item.key} label={item.label} tooltip={item.description}>
          <InputNumber style={{ width: "100%" }} min={1} max={99} />
        </Form.Item>
      );
    case "select":
      return (
        <Form.Item name={item.key} label={item.label} tooltip={item.description}>
          <Select options={item.options} />
        </Form.Item>
      );
    default:
      return (
        <Form.Item name={item.key} label={item.label} tooltip={item.description}>
          <Input />
        </Form.Item>
      );
  }
}

function ConfigGroupForm({
  items,
  saving,
  onSave,
}: {
  items: PlatformConfig[];
  saving: boolean;
  onSave: (values: Record<string, unknown>) => void;
}) {
  const [form] = Form.useForm();
  const initialValues = useMemo(
    () => Object.fromEntries(items.map((item) => [item.key, item.value])),
    [items],
  );

  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [form, initialValues]);

  return (
    <Form form={form} layout="vertical" initialValues={initialValues} onFinish={onSave}>
      {items.map(renderItem)}
      <Form.Item>
        <Authorized perm="platform:config:update">
          <Button type="primary" htmlType="submit" loading={saving}>
            保存本组配置
          </Button>
        </Authorized>
      </Form.Item>
    </Form>
  );
}

export default function PlatformConfigPage() {
  const configs = usePlatformConfigStore((state) => state.configs);
  const load = usePlatformConfigStore((state) => state.load);
  const save = usePlatformConfigStore((state) => state.save);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (configs.length > 0) return;
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [configs.length, load]);

  const groups = useMemo(() => {
    const map = new Map<string, PlatformConfig[]>();
    for (const item of configs) {
      const list = map.get(item.group) ?? [];
      list.push(item);
      map.set(item.group, list);
    }
    return [...map.entries()];
  }, [configs]);

  const handleSave = async (values: Record<string, unknown>) => {
    setSaving(true);
    try {
      await save(values);
      notify.success("配置已保存");
    } catch {
      // 错误提示已由请求层处理
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        icon={<ControlOutlined />}
        title="平台配置"
        description="集中管理平台的全局参数，保存后立即对全站生效"
      />
      <Card>
        <Spin spinning={loading}>
          <Tabs
            items={groups.map(([group, items]) => ({
              key: group,
              label: groupMeta[group]?.label ?? group,
              children: <ConfigGroupForm items={items} saving={saving} onSave={handleSave} />,
            }))}
          />
        </Spin>
      </Card>
    </div>
  );
}
