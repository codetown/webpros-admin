import {
  DeleteOutlined,
  EditOutlined,
  NotificationOutlined,
  PlusOutlined,
  PushpinFilled,
  ReloadOutlined,
} from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import {
  App,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Radio,
  Select,
  Space,
  Switch,
  Table,
  Tag,
} from "antd";
import { useState } from "react";
import {
  createNotice,
  deleteNotice,
  getNoticePage,
  type NoticeFormValues,
  type NoticeQuery,
  updateNotice,
} from "@/api/notice";
import Authorized from "@/components/Authorized";
import PageHeader from "@/components/PageHeader";
import { noticeTypeMeta } from "@/constants/meta";
import { useTable } from "@/hooks/useTable";
import { useAuthStore } from "@/store/useAuthStore";
import type { NoticeItem, NoticeType, Status } from "@/types";
import { formatDateTime } from "@/utils/format";

export default function NoticeManagePage() {
  const { tableProps, onSearch, onReset, refresh } = useTable<NoticeItem, NoticeQuery>(
    getNoticePage,
  );
  const [searchForm] = Form.useForm<NoticeQuery>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NoticeItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<NoticeFormValues>();
  const { modal } = App.useApp();
  const user = useAuthStore((state) => state.user);

  const openModal = (record: NoticeItem | null) => {
    setEditing(record);
    form.resetFields();
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.setFieldsValue({ type: "notice", pinned: false, status: 1 });
    }
    setModalOpen(true);
  };

  const onSubmit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editing) {
        await updateNotice(editing.id, values);
      } else {
        await createNotice({ ...values, publisher: user?.nickname ?? "-" } as NoticeFormValues);
      }
      setModalOpen(false);
      refresh();
    } catch {
      // 校验或请求错误，提示已处理
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (record: NoticeItem) => {
    modal.confirm({
      title: "删除确认",
      content: `确定要删除公告「${record.title}」吗？`,
      okText: "删除",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: async () => {
        await deleteNotice(record.id);
        refresh();
      },
    });
  };

  const columns: TableColumnsType<NoticeItem> = [
    {
      title: "标题",
      dataIndex: "title",
      width: 300,
      render: (title: string, record) => (
        <Space>
          {record.pinned ? <PushpinFilled style={{ color: "#f59e0b" }} /> : null}
          <span style={{ fontWeight: 500 }}>{title}</span>
        </Space>
      ),
    },
    {
      title: "类型",
      dataIndex: "type",
      width: 90,
      render: (type: NoticeType) => (
        <Tag color={noticeTypeMeta[type].color}>{noticeTypeMeta[type].label}</Tag>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 90,
      render: (status: Status) =>
        status === 1 ? <Tag color="success">已发布</Tag> : <Tag color="default">草稿</Tag>,
    },
    { title: "发布人", dataIndex: "publisher", width: 120 },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      width: 170,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: "操作",
      key: "actionCol",
      fixed: "right",
      width: 150,
      render: (_: unknown, record) => (
        <Space size={0}>
          <Authorized perm="notice:update">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openModal(record)}
            >
              编辑
            </Button>
          </Authorized>
          <Authorized perm="notice:delete">
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
        icon={<NotificationOutlined />}
        title="公告管理"
        description="发布与管理站内公告、通知与更新说明"
      />
      <Card className="search-card">
        <Form
          form={searchForm}
          layout="inline"
          onFinish={(values) => onSearch(values)}
          style={{ rowGap: 12 }}
        >
          <Form.Item name="title" label="标题">
            <Input placeholder="标题关键字" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select
              placeholder="全部"
              allowClear
              style={{ width: 120 }}
              options={[
                { label: "已发布", value: 1 },
                { label: "草稿", value: 0 },
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
          <Authorized perm="notice:add">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>
              新增公告
            </Button>
          </Authorized>
          <Button icon={<ReloadOutlined />} onClick={refresh}>
            刷新
          </Button>
        </div>
        <Table<NoticeItem> {...tableProps} columns={columns} scroll={{ x: 900 }} />
      </Card>

      <Modal
        title={editing ? "编辑公告" : "新增公告"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={onSubmit}
        confirmLoading={saving}
        destroyOnHidden
        width={600}
      >
        <Form form={form} layout="vertical" autoComplete="off" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: "请输入标题" }]}>
            <Input placeholder="请输入公告标题" maxLength={60} />
          </Form.Item>
          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: "请输入内容" }]}
          >
            <Input.TextArea rows={4} placeholder="请输入公告内容" maxLength={500} showCount />
          </Form.Item>
          <Space size={24}>
            <Form.Item name="type" label="类型" rules={[{ required: true }]}>
              <Select
                style={{ width: 120 }}
                options={Object.entries(noticeTypeMeta).map(([value, meta]) => ({
                  value,
                  label: meta.label,
                }))}
              />
            </Form.Item>
            <Form.Item name="pinned" label="置顶" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="status" label="状态" rules={[{ required: true }]}>
              <Radio.Group
                options={[
                  { label: "发布", value: 1 as Status },
                  { label: "草稿", value: 0 as Status },
                ]}
              />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
