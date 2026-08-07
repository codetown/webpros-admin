import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  KeyOutlined,
  PlusOutlined,
  ReloadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import {
  App,
  Avatar,
  Badge,
  Button,
  Card,
  Form,
  Input,
  Select,
  Space,
  Switch,
  Table,
  Tag,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import {
  deleteUsers,
  getUserPage,
  resetUserPassword,
  type UserQuery,
  updateUserStatus,
} from "@/api/user";
import Authorized from "@/components/Authorized";
import PageHeader from "@/components/PageHeader";
import { usePermission } from "@/hooks/usePermission";
import { useTable } from "@/hooks/useTable";
import type { Status, SystemUser } from "@/types";
import { formatDateTime, genderLabels } from "@/utils/format";
import { notify } from "@/utils/notify";
import UserFormDrawer from "./UserFormDrawer";

export default function UserManagePage() {
  const { tableProps, onSearch, onReset, refresh, getParams } = useTable<SystemUser, UserQuery>(
    getUserPage,
  );
  const [searchForm] = Form.useForm<UserQuery>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<SystemUser | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const { modal } = App.useApp();
  const hasPerm = usePermission();

  const openDrawer = (record: SystemUser | null) => {
    setEditing(record);
    setDrawerOpen(true);
  };

  const confirmDelete = (ids: number[]) => {
    modal.confirm({
      title: "删除确认",
      content: `确定要删除选中的 ${ids.length} 个用户吗？该操作不可恢复。`,
      okText: "删除",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: async () => {
        await deleteUsers(ids);
        setSelectedRowKeys([]);
        refresh();
      },
    });
  };

  const handleStatusChange = async (record: SystemUser, checked: boolean) => {
    await updateUserStatus(record.id, (checked ? 1 : 0) as Status);
    refresh();
  };

  const handleExport = async () => {
    try {
      const data = await getUserPage({ ...getParams(), page: 1, pageSize: 10000 });
      if (data.list.length === 0) {
        notify.warning("当前条件下没有可导出的数据");
        return;
      }
      const { exportExcel } = await import("@/utils/excel");
      exportExcel(`用户列表_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`, [
        {
          name: "用户",
          headers: ["用户名", "昵称", "部门", "角色", "邮箱", "手机号", "性别", "状态", "创建时间"],
          rows: data.list.map((item) => [
            item.username,
            item.nickname,
            item.dept,
            item.roles.join("/"),
            item.email,
            item.phone,
            genderLabels[item.gender],
            item.status === 1 ? "启用" : "停用",
            formatDateTime(item.createdAt),
          ]),
        },
      ]);
      notify.success(`共导出 ${data.list.length} 个用户`);
    } catch {
      // 错误提示已由请求层处理
    }
  };

  const handleResetPassword = (record: SystemUser) => {
    modal.confirm({
      title: "重置密码",
      content: `确定要将用户「${record.nickname}」的密码重置为 123456 吗？`,
      okText: "重置",
      cancelText: "取消",
      onOk: async () => {
        await resetUserPassword(record.id);
      },
    });
  };

  const columns: TableColumnsType<SystemUser> = [
    { title: "用户名", dataIndex: "username", width: 120 },
    {
      title: "昵称",
      dataIndex: "nickname",
      width: 140,
      render: (nickname: string, record) => (
        <Space>
          <Avatar size="small" src={record.avatar}>
            {nickname.slice(0, 1)}
          </Avatar>
          {nickname}
        </Space>
      ),
    },
    { title: "部门", dataIndex: "dept", width: 100 },
    {
      title: "角色",
      dataIndex: "roles",
      width: 150,
      render: (roles: string[]) => (
        <Space size={4} wrap>
          {roles.map((role) => (
            <Tag key={role} color="processing">
              {role}
            </Tag>
          ))}
        </Space>
      ),
    },
    { title: "手机号", dataIndex: "phone", width: 130 },
    {
      title: "性别",
      dataIndex: "gender",
      width: 70,
      render: (gender: SystemUser["gender"]) => genderLabels[gender],
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (status: Status, record) => (
        <Space>
          <Badge status={status === 1 ? "success" : "error"} />
          <Switch
            size="small"
            checked={status === 1}
            disabled={!hasPerm("system:user:update")}
            onChange={(checked) => handleStatusChange(record, checked)}
          />
        </Space>
      ),
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
      fixed: "right",
      width: 180,
      render: (_: unknown, record) => (
        <Space size={0}>
          <Authorized perm="system:user:update">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openDrawer(record)}
            >
              编辑
            </Button>
          </Authorized>
          <Authorized perm="system:user:reset">
            <Button
              type="link"
              size="small"
              icon={<KeyOutlined />}
              onClick={() => handleResetPassword(record)}
            >
              重置
            </Button>
          </Authorized>
          <Authorized perm="system:user:delete">
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => confirmDelete([record.id])}
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
        icon={<UserOutlined />}
        title="用户管理"
        description="管理系统成员的账号信息、角色分配与启停状态"
      />
      <Card className="search-card">
        <Form
          form={searchForm}
          layout="inline"
          onFinish={(values) => onSearch(values)}
          style={{ rowGap: 12 }}
        >
          <Form.Item name="username" label="用户名">
            <Input placeholder="用户名 / 昵称" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input placeholder="手机号" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select
              placeholder="全部"
              allowClear
              style={{ width: 120 }}
              options={[
                { label: "启用", value: 1 },
                { label: "停用", value: 0 },
              ]}
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
          <Space>
            <Authorized perm="system:user:add">
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openDrawer(null)}>
                新增用户
              </Button>
            </Authorized>
            <Authorized perm="system:user:delete">
              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={selectedRowKeys.length === 0}
                onClick={() => confirmDelete(selectedRowKeys)}
              >
                批量删除{selectedRowKeys.length > 0 ? `（${selectedRowKeys.length}）` : ""}
              </Button>
            </Authorized>
          </Space>
          <Space>
            <Authorized perm="system:user:export">
              <Button icon={<DownloadOutlined />} onClick={handleExport}>
                导出 Excel
              </Button>
            </Authorized>
            <Button icon={<ReloadOutlined />} onClick={refresh}>
              刷新
            </Button>
          </Space>
        </div>
        <Table<SystemUser>
          {...tableProps}
          columns={columns}
          scroll={{ x: 1200 }}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys as number[]),
            getCheckboxProps: (record) => ({ disabled: record.username === "admin" }),
          }}
        />
      </Card>

      <UserFormDrawer
        open={drawerOpen}
        value={editing}
        onClose={() => setDrawerOpen(false)}
        onSuccess={refresh}
      />
    </div>
  );
}
