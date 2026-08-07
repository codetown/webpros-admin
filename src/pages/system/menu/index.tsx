import {
  DeleteOutlined,
  EditOutlined,
  PartitionOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import {
  App,
  Badge,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Space,
  Table,
  Tag,
  TreeSelect,
} from "antd";
import { useEffect, useState } from "react";
import { createMenu, deleteMenu, getMenuList, type MenuFormValues, updateMenu } from "@/api/menu";
import Authorized from "@/components/Authorized";
import MenuIcon from "@/components/MenuIcon";
import PageHeader from "@/components/PageHeader";
import type { MenuItem, MenuType, Status } from "@/types";
import { listToTree, type TreeNode } from "@/utils/tree";

const typeMeta: Record<MenuType, { label: string; color: string }> = {
  catalog: { label: "目录", color: "blue" },
  menu: { label: "菜单", color: "green" },
  button: { label: "按钮", color: "orange" },
};

function sortBySort<T extends { sort: number; children: T[] }>(nodes: T[]): T[] {
  return [...nodes]
    .sort((a, b) => a.sort - b.sort)
    .map((node) => ({ ...node, children: sortBySort(node.children) }));
}

export default function MenuManagePage() {
  const [treeData, setTreeData] = useState<TreeNode<MenuItem>[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<MenuFormValues>();
  const { modal } = App.useApp();

  const fetchMenus = () => {
    setLoading(true);
    getMenuList()
      .then((menus) => setTreeData(sortBySort(listToTree(menus))))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  };

  useEffect(fetchMenus, []);

  const openModal = (record: MenuItem | null, parentId = 0) => {
    setEditing(record);
    form.resetFields();
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.setFieldsValue({
        parentId,
        type: parentId === 0 ? "catalog" : "menu",
        status: 1,
        sort: 1,
      });
    }
    setModalOpen(true);
  };

  const onSubmit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MenuFormValues = {
        ...values,
        icon: values.type === "button" ? undefined : values.icon,
        path: values.type === "button" ? undefined : values.path,
        permission: values.permission?.trim() || undefined,
      };
      if (editing) {
        await updateMenu(editing.id, payload);
      } else {
        await createMenu(payload);
      }
      setModalOpen(false);
      fetchMenus();
    } catch {
      // 校验或请求错误，提示已处理
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (record: MenuItem) => {
    modal.confirm({
      title: "删除确认",
      content: `确定要删除「${record.name}」吗？`,
      okText: "删除",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: async () => {
        await deleteMenu(record.id);
        fetchMenus();
      },
    });
  };

  const columns: TableColumnsType<TreeNode<MenuItem>> = [
    {
      title: "菜单名称",
      dataIndex: "name",
      width: 220,
      render: (name: string, record) => (
        <Space>
          <MenuIcon name={record.icon} />
          {name}
        </Space>
      ),
    },
    {
      title: "类型",
      dataIndex: "type",
      width: 90,
      render: (type: MenuType) => <Tag color={typeMeta[type].color}>{typeMeta[type].label}</Tag>,
    },
    {
      title: "权限标识",
      dataIndex: "permission",
      width: 180,
      render: (permission?: string) => (permission ? <Tag>{permission}</Tag> : "-"),
    },
    { title: "路由路径", dataIndex: "path", width: 160, render: (path?: string) => path ?? "-" },
    { title: "排序", dataIndex: "sort", width: 80 },
    {
      title: "状态",
      dataIndex: "status",
      width: 90,
      render: (status: Status) => (
        <Badge status={status === 1 ? "success" : "error"} text={status === 1 ? "启用" : "停用"} />
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 230,
      render: (_: unknown, record) => (
        <Space size={0}>
          {record.type !== "button" ? (
            <Authorized perm="system:menu:add">
              <Button
                type="link"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => openModal(null, record.id)}
              >
                子级
              </Button>
            </Authorized>
          ) : null}
          <Authorized perm="system:menu:update">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openModal(record)}
            >
              编辑
            </Button>
          </Authorized>
          <Authorized perm="system:menu:delete">
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

  type MenuOption = { title: string; value: number; children: MenuOption[] };
  const parentTreeData: MenuOption[] = treeData
    .filter((node) => node.type !== "button")
    .map(function toOption(node: TreeNode<MenuItem>): MenuOption {
      return {
        title: node.name,
        value: node.id,
        children: node.children.filter((child) => child.type !== "button").map(toOption),
      };
    });

  return (
    <div>
      <PageHeader
        icon={<PartitionOutlined />}
        title="菜单管理"
        description="维护系统菜单结构与按钮级权限标识"
      />
      <Card>
        <div className="table-toolbar">
          <Authorized perm="system:menu:add">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>
              新增菜单
            </Button>
          </Authorized>
          <Button icon={<ReloadOutlined />} onClick={fetchMenus}>
            刷新
          </Button>
        </div>
        <Table<TreeNode<MenuItem>>
          rowKey="id"
          loading={loading}
          dataSource={treeData}
          columns={columns}
          pagination={false}
          scroll={{ x: 1000 }}
          expandable={{ defaultExpandAllRows: true }}
        />

        <Modal
          title={editing ? "编辑菜单" : "新增菜单"}
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          onOk={onSubmit}
          confirmLoading={saving}
          destroyOnHidden
          width={560}
        >
          <Form form={form} layout="vertical" autoComplete="off" style={{ marginTop: 16 }}>
            <Form.Item name="parentId" label="上级菜单">
              <TreeSelect
                placeholder="根菜单"
                allowClear
                treeDefaultExpandAll
                treeData={parentTreeData}
              />
            </Form.Item>
            <Form.Item name="type" label="菜单类型" rules={[{ required: true }]}>
              <Radio.Group
                options={[
                  { label: "目录", value: "catalog" },
                  { label: "菜单", value: "menu" },
                  { label: "按钮", value: "button" },
                ]}
              />
            </Form.Item>
            <Form.Item
              name="name"
              label="菜单名称"
              rules={[{ required: true, message: "请输入菜单名称" }]}
            >
              <Input placeholder="如：用户管理" />
            </Form.Item>
            <Form.Item noStyle shouldUpdate={(prev, next) => prev.type !== next.type}>
              {({ getFieldValue }) =>
                getFieldValue("type") !== "button" ? (
                  <Space.Compact block>
                    <Form.Item name="icon" label="图标" style={{ width: "40%" }}>
                      <Input placeholder="如：UserOutlined" />
                    </Form.Item>
                    <Form.Item
                      name="path"
                      label="路由路径"
                      style={{ width: "60%", marginLeft: 12 }}
                      rules={[{ required: true, message: "请输入路由路径" }]}
                    >
                      <Input placeholder="如：/system/user" />
                    </Form.Item>
                  </Space.Compact>
                ) : null
              }
            </Form.Item>
            <Form.Item
              name="permission"
              label="权限标识"
              tooltip="按钮类型必填，如 system:user:add"
            >
              <Input placeholder="如：system:user:list" />
            </Form.Item>
            <Space size={16}>
              <Form.Item name="sort" label="排序" rules={[{ required: true }]}>
                <InputNumber min={1} max={999} />
              </Form.Item>
              <Form.Item name="status" label="状态" rules={[{ required: true }]}>
                <Radio.Group
                  options={[
                    { label: "启用", value: 1 as Status },
                    { label: "停用", value: 0 as Status },
                  ]}
                />
              </Form.Item>
            </Space>
          </Form>
        </Modal>
      </Card>
    </div>
  );
}
