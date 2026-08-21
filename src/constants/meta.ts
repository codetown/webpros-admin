import type { MenuType, NoticeType, Status, TaskStatus } from "@/types";

/** 公告类型元信息 */
export const noticeTypeMeta: Record<NoticeType, { label: string; color: string }> = {
  notice: { label: "通知", color: "blue" },
  announcement: { label: "公告", color: "purple" },
  update: { label: "更新", color: "green" },
};

/** 任务状态元信息（列表/详情共用） */
export const taskStatusMeta: Record<TaskStatus, { label: string; color: string }> = {
  pending: { label: "待开始", color: "default" },
  processing: { label: "进行中", color: "processing" },
  completed: { label: "已完成", color: "success" },
  cancelled: { label: "已取消", color: "error" },
};

/** 菜单类型元信息 */
export const menuTypeMeta: Record<MenuType, { label: string; color: string }> = {
  catalog: { label: "目录", color: "blue" },
  menu: { label: "菜单", color: "green" },
  button: { label: "按钮", color: "orange" },
};

/** 启用/停用选项（Radio.Group / Select 通用） */
export const statusOptions: { label: string; value: Status }[] = [
  { label: "启用", value: 1 },
  { label: "停用", value: 0 },
];

/** 部门选项 */
export const deptOptions = ["研发部", "市场部", "财务部", "人事部", "运营部"];

/** 文档分类 */
export const docCategories = ["产品文档", "技术文档", "设计资源", "财务报表", "其他"];

/** 主题色预设 */
export const presetColors = ["#165dff", "#7c3aed", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"];
