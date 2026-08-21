import { InboxOutlined } from "@ant-design/icons";
import { Modal, Select, Upload, type UploadFile, type UploadProps } from "antd";
import { useState } from "react";
import { createDoc } from "@/api/doc";
import { docCategories } from "@/constants/meta";
import { useAuthStore } from "@/store/useAuthStore";
import { readAsDataUrl, splitFileName } from "@/utils/file";
import { notify } from "@/utils/notify";

/** Mock 模式下保存原内容的文件大小上限 */
const CONTENT_LIMIT = 1.5 * 1024 * 1024;
const SIZE_LIMIT = 8 * 1024 * 1024;

interface DocUploadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/** 文档上传弹窗：支持多文件，小文件保存原内容可供下载 */
export default function DocUploadModal({ open, onClose, onSuccess }: DocUploadModalProps) {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [category, setCategory] = useState(docCategories[0]);
  const user = useAuthStore((state) => state.user);

  const beforeUpload: UploadProps["beforeUpload"] = (file) => {
    if (file.size > SIZE_LIMIT) {
      notify.error(`文件「${file.name}」超过 8MB，已忽略`);
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const customRequest: UploadProps["customRequest"] = async (options) => {
    const file = options.file as File;
    try {
      const { name, ext } = splitFileName(file.name);
      const content = file.size <= CONTENT_LIMIT ? await readAsDataUrl(file) : undefined;
      await createDoc({
        name,
        ext,
        size: file.size,
        category,
        uploader: user?.nickname ?? "-",
        content,
      });
      options.onSuccess?.(null);
      onSuccess();
    } catch (error) {
      options.onError?.(error as Error);
    }
  };

  const handleClose = () => {
    setFileList([]);
    onClose();
  };

  return (
    <Modal
      title="上传文档"
      open={open}
      onCancel={handleClose}
      footer={null}
      width={560}
      destroyOnHidden
    >
      <div style={{ margin: "16px 0 12px", display: "flex", alignItems: "center", gap: 12 }}>
        <span>归入分类</span>
        <Select
          value={category}
          onChange={setCategory}
          options={docCategories.map((item) => ({ label: item, value: item }))}
          style={{ width: 160 }}
        />
      </div>
      <Upload.Dragger
        multiple
        fileList={fileList}
        beforeUpload={beforeUpload}
        customRequest={customRequest}
        onChange={({ fileList: next }) => setFileList(next)}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此处上传</p>
        <p className="ant-upload-hint">
          支持常见办公文档 / 图片 / 压缩包，单个不超过 8MB；1.5MB 以内的文件可在 Mock
          模式下下载原文件
        </p>
      </Upload.Dragger>
    </Modal>
  );
}
