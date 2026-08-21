import {
  DeleteOutlined,
  EditOutlined,
  KeyOutlined,
  PlusOutlined,
  ReloadOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import { App, Button, Card, Form, Input, Modal, Radio, Space, Table, Tag } from "antd";
import { useState } from "react";
import { createRole, deleteRole, getRoleList, type RoleFormValues, updateRole } from "@/api/role";
import Authorized from "@/components/Authorized";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { statusOptions } from "@/constants/meta";
import { useList } from "@/hooks/useList";
import type { RoleItem, Status } from "@/types";
import { formatDateTime } from "@/utils/format";
import PermDrawer from "./PermDrawer";

export default function RoleManagePage() {
  const { loading, dataSource: roles, refresh: fetchRoles } = useList<RoleItem>(getRoleList);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RoleItem | null>(null);
  const [permRole, setPermRole] = useState<RoleItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<RoleFormValues>();
  const { modal } = App.useApp();

  const openModal = (record: RoleItem | null) => {
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
        await updateRole(editing.id, values);
      } else {
        await createRole(values);
      }
      setModalOpen(false);
      fetchRoles();
    } catch {
      // 校验或请求错误，提示已处理
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (record: RoleItem) => {
    modal.confirm({
      title: "删除确认",
      content: `确定要删除角色「${record.name}」吗？`,
      okText: "删除",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: async () => {
        await deleteRole(record.id);
        fetchRoles();
      },
    });
  };

  const columns: TableColumnsType<RoleItem> = [
    { title: "角色名称", dataIndex: "name", width: 150 },
    {
      title: "角色编码",
      dataIndex: "code",
      width: 130,
      render: (code: string) => <Tag>{code}</Tag>,
    },
    { title: "描述", dataIndex: "description", ellipsis: true },
    {
      title: "权限数",
      dataIndex: "permissions",
      width: 100,
      render: (permissions: string[]) =>
        permissions.includes("*") ? <Tag color="gold">全部</Tag> : permissions.length,
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 90,
      render: (status: Status) => <StatusBadge status={status} />,
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      width: 170,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: "操作",
      key: "action",
      width: 240,
      render: (_: unknown, record) => (
        <Space size={0}>
          <Authorized perm="system:role:update">
            <Button
              type="link"
              size="small"
              icon={<KeyOutlined />}
              onClick={() => setPermRole(record)}
            >
              权限
            </Button>
          </Authorized>
          <Authorized perm="system:role:update">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openModal(record)}
            >
              编辑
            </Button>
          </Authorized>
          <Authorized perm="system:role:delete">
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              disabled={record.code === "admin"}
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
        icon={<TeamOutlined />}
        title="角色管理"
        description="维护角色与权限分配，支撑系统 RBAC 权限模型"
      />
      <Card>
        <div className="table-toolbar">
          <Authorized perm="system:role:add">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>
              新增角色
            </Button>
          </Authorized>
          <Button icon={<ReloadOutlined />} onClick={fetchRoles}>
            刷新
          </Button>
        </div>
        <Table<RoleItem>
          rowKey="id"
          loading={loading}
          dataSource={roles}
          columns={columns}
          pagination={false}
          scroll={{ x: 1000 }}
        />

        <Modal
          title={editing ? "编辑角色" : "新增角色"}
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          onOk={onSubmit}
          confirmLoading={saving}
          destroyOnHidden
        >
          <Form form={form} layout="vertical" autoComplete="off" style={{ marginTop: 16 }}>
            <Form.Item
              name="name"
              label="角色名称"
              rules={[{ required: true, message: "请输入角色名称" }]}
            >
              <Input placeholder="如：运营人员" />
            </Form.Item>
            <Form.Item
              name="code"
              label="角色编码"
              rules={[
                { required: true, message: "请输入角色编码" },
                { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: "以字母开头，仅含字母/数字/下划线" },
              ]}
            >
              <Input placeholder="如：operator" />
            </Form.Item>
            <Form.Item name="description" label="描述">
              <Input.TextArea rows={3} placeholder="角色职责描述" maxLength={100} showCount />
            </Form.Item>
            <Form.Item name="status" label="状态" rules={[{ required: true }]}>
              <Radio.Group options={statusOptions} />
            </Form.Item>
          </Form>
        </Modal>

        <PermDrawer
          open={Boolean(permRole)}
          role={permRole}
          onClose={() => setPermRole(null)}
          onSuccess={fetchRoles}
        />
      </Card>
    </div>
  );
}
