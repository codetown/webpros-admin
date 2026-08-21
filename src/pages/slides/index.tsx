import {
  DeleteOutlined,
  EditOutlined,
  PictureOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import {
  App,
  Button,
  Card,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Radio,
  Space,
  Switch,
  Table,
  Upload,
  type UploadProps,
} from "antd";
import { useState } from "react";
import {
  createSlide,
  deleteSlide,
  getSlideList,
  type SlideFormValues,
  updateSlide,
  updateSlideStatus,
} from "@/api/slide";
import Authorized from "@/components/Authorized";
import PageHeader from "@/components/PageHeader";
import { statusOptions } from "@/constants/meta";
import { useList } from "@/hooks/useList";
import { usePermission } from "@/hooks/usePermission";
import type { SlideItem, Status } from "@/types";
import { readAsDataUrl } from "@/utils/file";
import { formatDateTime } from "@/utils/format";
import { notify } from "@/utils/notify";

export default function SlideManagePage() {
  const { loading, dataSource: slides, refresh } = useList<SlideItem>(getSlideList);
  const hasPerm = usePermission();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SlideItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<SlideFormValues>();
  const { modal } = App.useApp();

  const openModal = (record: SlideItem | null) => {
    setEditing(record);
    form.resetFields();
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.setFieldsValue({ sort: 1, status: 1 });
    }
    setModalOpen(true);
  };

  const onSubmit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editing) {
        await updateSlide(editing.id, values);
      } else {
        await createSlide(values);
      }
      setModalOpen(false);
      refresh();
    } catch {
      // 校验或请求错误，提示已处理
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (record: SlideItem, checked: boolean) => {
    try {
      await updateSlideStatus(record.id, (checked ? 1 : 0) as Status);
      refresh();
    } catch {
      // 错误提示已由请求层处理
    }
  };

  const handleDelete = (record: SlideItem) => {
    modal.confirm({
      title: "删除确认",
      content: `确定要删除幻灯片「${record.title}」吗？`,
      okText: "删除",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: async () => {
        await deleteSlide(record.id);
        refresh();
      },
    });
  };

  const beforeUpload: UploadProps["beforeUpload"] = async (file) => {
    if (!file.type.startsWith("image/")) {
      notify.error("仅支持上传图片文件");
      return Upload.LIST_IGNORE;
    }
    if (file.size > 2 * 1024 * 1024) {
      notify.error("图片大小不能超过 2MB");
      return Upload.LIST_IGNORE;
    }
    const dataUrl = await readAsDataUrl(file);
    form.setFieldsValue({ image: dataUrl });
    return false;
  };

  const imageValue = Form.useWatch("image", form);

  const columns: TableColumnsType<SlideItem> = [
    {
      title: "图片",
      dataIndex: "image",
      width: 180,
      render: (image: string, record) => (
        <Image
          src={image}
          alt={record.title}
          width={160}
          height={64}
          style={{ objectFit: "cover", borderRadius: 6 }}
        />
      ),
    },
    {
      title: "标题",
      dataIndex: "title",
      width: 200,
      render: (title: string) => <strong>{title}</strong>,
    },
    { title: "跳转链接", dataIndex: "link", width: 150, render: (link?: string) => link ?? "-" },
    { title: "排序", dataIndex: "sort", width: 70 },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (status: Status, record) => (
        <Space>
          <Switch
            size="small"
            checked={status === 1}
            disabled={!hasPerm("slide:update")}
            onChange={(checked) => handleStatusChange(record, checked)}
          />
          <span>{status === 1 ? "启用" : "停用"}</span>
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
      key: "actionCol",
      fixed: "right",
      width: 150,
      render: (_: unknown, record) => (
        <Space size={0}>
          <Authorized perm="slide:update">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openModal(record)}
            >
              编辑
            </Button>
          </Authorized>
          <Authorized perm="slide:delete">
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
        icon={<PictureOutlined />}
        title="首页幻灯片"
        description="管理网站首页轮播图，支持图片上传、排序与启停"
      />
      <Card>
        <div className="table-toolbar">
          <Authorized perm="slide:add">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>
              新增幻灯片
            </Button>
          </Authorized>
          <Button icon={<ReloadOutlined />} onClick={refresh}>
            刷新
          </Button>
        </div>
        <Table<SlideItem>
          rowKey="id"
          loading={loading}
          dataSource={slides}
          columns={columns}
          pagination={false}
          scroll={{ x: 1050 }}
        />
      </Card>

      <Modal
        title={editing ? "编辑幻灯片" : "新增幻灯片"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={onSubmit}
        confirmLoading={saving}
        destroyOnHidden
        width={560}
      >
        <Form form={form} layout="vertical" autoComplete="off" style={{ marginTop: 16 }}>
          <Form.Item
            name="image"
            label="图片"
            rules={[{ required: true, message: "请上传图片" }]}
            valuePropName="value"
          >
            <Upload
              accept="image/*"
              listType="picture-card"
              showUploadList={false}
              beforeUpload={beforeUpload}
            >
              {imageValue ? (
                <img
                  src={imageValue}
                  alt="预览"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: "请输入标题" }]}>
            <Input placeholder="幻灯片主标题" maxLength={40} />
          </Form.Item>
          <Form.Item name="description" label="副标题">
            <Input placeholder="幻灯片副标题（可选）" maxLength={60} />
          </Form.Item>
          <Form.Item name="link" label="跳转链接">
            <Input placeholder="如 /dashboard（可选）" />
          </Form.Item>
          <Space size={24}>
            <Form.Item name="sort" label="排序" rules={[{ required: true }]}>
              <InputNumber min={1} max={999} />
            </Form.Item>
            <Form.Item name="status" label="状态" rules={[{ required: true }]}>
              <Radio.Group options={statusOptions} />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
