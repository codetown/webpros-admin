import {
  FileExcelOutlined,
  FileImageOutlined,
  FileOutlined,
  FilePdfOutlined,
  FilePptOutlined,
  FileTextOutlined,
  FileWordOutlined,
  FileZipOutlined,
} from "@ant-design/icons";
import type { ReactNode } from "react";

const extGroups: Array<{ exts: string[]; icon: ReactNode }> = [
  { exts: ["pdf"], icon: <FilePdfOutlined style={{ color: "#ef4444" }} /> },
  { exts: ["doc", "docx"], icon: <FileWordOutlined style={{ color: "#3b82f6" }} /> },
  { exts: ["xls", "xlsx", "csv"], icon: <FileExcelOutlined style={{ color: "#10b981" }} /> },
  { exts: ["ppt", "pptx"], icon: <FilePptOutlined style={{ color: "#f59e0b" }} /> },
  {
    exts: ["jpg", "jpeg", "png", "gif", "svg", "webp", "bmp"],
    icon: <FileImageOutlined style={{ color: "#8b5cf6" }} />,
  },
  {
    exts: ["zip", "rar", "7z", "tar", "gz"],
    icon: <FileZipOutlined style={{ color: "#eab308" }} />,
  },
  { exts: ["txt", "md", "log"], icon: <FileTextOutlined style={{ color: "#64748b" }} /> },
];

/** 根据扩展名渲染彩色文件图标 */
export function getFileIcon(ext: string): ReactNode {
  const group = extGroups.find((item) => item.exts.includes(ext));
  return group ? group.icon : <FileOutlined style={{ color: "#94a3b8" }} />;
}
