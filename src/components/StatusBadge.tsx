import { Badge } from "antd";
import type { Status } from "@/types";

/** 启用/停用状态徽标（替代各页面重复的 Badge 写法） */
export default function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge status={status === 1 ? "success" : "error"} text={status === 1 ? "启用" : "停用"} />
  );
}
