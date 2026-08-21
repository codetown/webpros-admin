import { Button, Drawer, Form, Input, Radio, Select, Space } from "antd";
import { useEffect, useState } from "react";
import { getRoleList } from "@/api/role";
import { createUser, type UserFormValues, updateUser } from "@/api/user";
import { deptOptions, statusOptions } from "@/constants/meta";
import type { RoleItem, SystemUser } from "@/types";

interface UserFormDrawerProps {
  open: boolean;
  value: SystemUser | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserFormDrawer({ open, value, onClose, onSuccess }: UserFormDrawerProps) {
  const [form] = Form.useForm<UserFormValues>();
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const isEdit = Boolean(value);

  useEffect(() => {
    if (!open) return;
    getRoleList()
      .then(setRoles)
      .catch(() => undefined);
    form.resetFields();
    if (value) {
      form.setFieldsValue(value);
    } else {
      form.setFieldsValue({ gender: 1, status: 1, roles: [] });
    }
  }, [open, value, form]);

  const onSubmit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (isEdit && value) {
        await updateUser(value.id, values);
      } else {
        await createUser(values);
      }
      onSuccess();
      onClose();
    } catch {
      // 校验或请求错误，提示已处理
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      title={isEdit ? "编辑用户" : "新增用户"}
      width={480}
      open={open}
      onClose={onClose}
      destroyOnHidden
      footer={
        <Space style={{ float: "right" }}>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" loading={saving} onClick={onSubmit}>
            保存
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" autoComplete="off">
        <Form.Item
          name="username"
          label="用户名"
          rules={[
            { required: true, message: "请输入用户名" },
            {
              pattern: /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/,
              message: "以字母开头，3-20 位字母/数字/下划线",
            },
          ]}
        >
          <Input placeholder="请输入用户名" disabled={isEdit} />
        </Form.Item>
        <Form.Item name="nickname" label="昵称" rules={[{ required: true, message: "请输入昵称" }]}>
          <Input placeholder="请输入昵称" />
        </Form.Item>
        <Form.Item
          name="email"
          label="邮箱"
          rules={[
            { required: true, message: "请输入邮箱" },
            { type: "email", message: "邮箱格式不正确" },
          ]}
        >
          <Input placeholder="请输入邮箱" />
        </Form.Item>
        <Form.Item
          name="phone"
          label="手机号"
          rules={[
            { required: true, message: "请输入手机号" },
            { pattern: /^1[3-9]\d{9}$/, message: "手机号格式不正确" },
          ]}
        >
          <Input placeholder="请输入手机号" maxLength={11} />
        </Form.Item>
        <Form.Item name="gender" label="性别" rules={[{ required: true }]}>
          <Radio.Group
            options={[
              { label: "男", value: 1 },
              { label: "女", value: 2 },
              { label: "未知", value: 0 },
            ]}
          />
        </Form.Item>
        <Form.Item name="dept" label="部门" rules={[{ required: true, message: "请选择部门" }]}>
          <Select
            placeholder="请选择部门"
            options={deptOptions.map((dept) => ({ label: dept, value: dept }))}
          />
        </Form.Item>
        <Form.Item name="roles" label="角色" rules={[{ required: true, message: "请选择角色" }]}>
          <Select
            mode="multiple"
            placeholder="请选择角色"
            options={roles.map((role) => ({ label: role.name, value: role.code }))}
          />
        </Form.Item>
        <Form.Item name="status" label="状态" rules={[{ required: true }]}>
          <Radio.Group options={statusOptions} />
        </Form.Item>
      </Form>
    </Drawer>
  );
}
