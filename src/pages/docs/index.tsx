import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  FolderOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import { App, Button, Card, Form, Input, Modal, Select, Space, Table, Tag } from "antd";
import { useState } from "react";
import { type DocQuery, deleteDoc, getDocContent, getDocPage, renameDoc } from "@/api/doc";
import Authorized from "@/components/Authorized";
import { getFileIcon } from "@/components/FileIcon";
import PageHeader from "@/components/PageHeader";
import { useTable } from "@/hooks/useTable";
import type { DocItem } from "@/types";
import { downloadDataUrl } from "@/utils/file";
import { formatDateTime, formatSize } from "@/utils/format";
import DocUploadModal, { docCategories } from "./DocUploadModal";

export default function DocManagePage() {
  const { tableProps, onSearch, onReset, refresh } = useTable<DocItem, DocQuery>(getDocPage);
  const [searchForm] = Form.useForm<DocQuery>();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [renaming, setRenaming] = useState<DocItem | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameSaving, setRenameSaving] = useState(false);
  const { modal } = App.useApp();

  const handleDownload = async (record: DocItem) => {
    const content = await getDocContent(record.id);
    downloadDataUrl(content, `${record.name}.${record.ext}`);
    refresh();
  };

  const openRename = (record: DocItem) => {
    setRenaming(record);
    setRenameValue(record.name);
  };

  const handleRename = async () => {
    if (!renaming) return;
    setRenameSaving(true);
    try {
      await renameDoc(renaming.id, renameValue);
      setRenaming(null);
      refresh();
    } catch {
      // 错误提示已由请求层处理
    } finally {
      setRenameSaving(false);
    }
  };

  const handleDelete = (record: DocItem) => {
    modal.confirm({
      title: "删除确认",
      content: `确定要删除文档「${record.name}.${record.ext}」吗？`,
      okText: "删除",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: async () => {
        await deleteDoc(record.id);
        refresh();
      },
    });
  };

  const columns: TableColumnsType<DocItem> = [
    {
      title: "文件",
      dataIndex: "name",
      width: 300,
      render: (name: string, record) => (
        <Space>
          <span style={{ fontSize: 18 }}>{getFileIcon(record.ext)}</span>
          <div>
            <div style={{ fontWeight: 500 }}>
              {name}.{record.ext}
            </div>
            <div className="stat-desc" style={{ fontSize: 12 }}>
              {formatSize(record.size)}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "分类",
      dataIndex: "category",
      width: 120,
      render: (category: string) => <Tag>{category}</Tag>,
    },
    { title: "上传者", dataIndex: "uploader", width: 120 },
    { title: "下载次数", dataIndex: "downloads", width: 100 },
    {
      title: "上传时间",
      dataIndex: "createdAt",
      width: 170,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: "操作",
      key: "actionCol",
      fixed: "right",
      width: 210,
      render: (_: unknown, record) => (
        <Space size={0}>
          <Authorized perm="docs:download">
            <Button
              type="link"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record)}
            >
              下载
            </Button>
          </Authorized>
          <Authorized perm="docs:update">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openRename(record)}
            >
              重命名
            </Button>
          </Authorized>
          <Authorized perm="docs:delete">
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
        icon={<FolderOutlined />}
        title="文档管理"
        description="上传、检索与管理系统文档，支持按分类归档与下载统计"
      />
      <Card className="search-card">
        <Form
          form={searchForm}
          layout="inline"
          onFinish={(values) => onSearch(values)}
          style={{ rowGap: 12 }}
        >
          <Form.Item name="name" label="文件名">
            <Input placeholder="文件名关键字" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="category" label="分类">
            <Select
              placeholder="全部"
              allowClear
              style={{ width: 140 }}
              options={docCategories.map((item) => ({ label: item, value: item }))}
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
            <Authorized perm="docs:upload">
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setUploadOpen(true)}>
                上传文档
              </Button>
            </Authorized>
          </Space>
          <Button icon={<ReloadOutlined />} onClick={refresh}>
            刷新
          </Button>
        </div>
        <Table<DocItem> {...tableProps} columns={columns} scroll={{ x: 1020 }} />
      </Card>

      <DocUploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} onSuccess={refresh} />

      <Modal
        title="重命名文档"
        open={Boolean(renaming)}
        onCancel={() => setRenaming(null)}
        onOk={handleRename}
        confirmLoading={renameSaving}
        destroyOnHidden
      >
        <div style={{ marginTop: 16 }}>
          <Input
            value={renameValue}
            onChange={(event) => setRenameValue(event.target.value)}
            onPressEnter={handleRename}
            maxLength={60}
            suffix={renaming ? `.${renaming.ext}` : undefined}
          />
        </div>
      </Modal>
    </div>
  );
}
