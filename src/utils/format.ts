import dayjs from "dayjs";
import type { Gender, Status } from "@/types";

export function formatDateTime(value?: string | number | Date, tpl = "YYYY-MM-DD HH:mm:ss") {
  return value ? dayjs(value).format(tpl) : "-";
}

/** 文件大小格式化 */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const genderLabels: Record<Gender, string> = {
  0: "未知",
  1: "男",
  2: "女",
};

export const statusLabels: Record<Status, string> = {
  1: "启用",
  0: "停用",
};

/** 问候语 */
export function getGreeting() {
  const hour = dayjs().hour();
  if (hour < 6) return "凌晨好";
  if (hour < 9) return "早上好";
  if (hour < 12) return "上午好";
  if (hour < 14) return "中午好";
  if (hour < 18) return "下午好";
  return "晚上好";
}
