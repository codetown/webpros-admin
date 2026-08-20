/** 主题模式 */
export type ThemeMode = "light" | "dark";

/** 性别：0 未知 / 1 男 / 2 女 */
export type Gender = 0 | 1 | 2;

/** 状态：1 启用 / 0 停用 */
export type Status = 1 | 0;

/** 统一响应结构（与后端约定） */
export interface ApiResult<T = unknown> {
  code: number;
  message: string;
  data: T;
}

/** 分页请求参数 */
export interface PageParams {
  page: number;
  pageSize: number;
}

/** 分页响应结构 */
export interface PageResult<T> {
  list: T[];
  total: number;
}

/** 请求配置 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions {
  url: string;
  method?: HttpMethod;
  params?: object;
  data?: unknown;
  headers?: Record<string, string>;
}

/** 登录用户信息 */
export interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  avatar?: string;
  email: string;
  phone: string;
  gender: Gender;
  dept: string;
  roles: string[];
  permissions: string[];
}

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: UserInfo;
}

/** 系统用户 */
export interface SystemUser {
  id: number;
  username: string;
  nickname: string;
  avatar?: string;
  email: string;
  phone: string;
  gender: Gender;
  dept: string;
  roles: string[];
  status: Status;
  createdAt: string;
}

/** 角色 */
export interface RoleItem {
  id: number;
  name: string;
  code: string;
  description: string;
  permissions: string[];
  status: Status;
  createdAt: string;
}

/** 菜单类型 */
export type MenuType = "catalog" | "menu" | "button";

/** 菜单 */
export interface MenuItem {
  id: number;
  parentId: number;
  name: string;
  type: MenuType;
  icon?: string;
  path?: string;
  permission?: string;
  sort: number;
  status: Status;
}

/** 操作日志 */
export interface LogItem {
  id: number;
  username: string;
  nickname: string;
  action: string;
  ip: string;
  status: Status;
  duration: number;
  createdAt: string;
  method: string;
  path: string;
  userAgent: string;
  location: string;
}

/** 文档 */
export interface DocItem {
  id: number;
  name: string;
  /** 扩展名（小写、不含点） */
  ext: string;
  /** 文件大小（字节） */
  size: number;
  category: string;
  uploader: string;
  downloads: number;
  createdAt: string;
  /** Mock 模式下小文件的 dataURL 内容（可选） */
  content?: string;
}

/** 消息通知 */
export type NotificationType = "info" | "success" | "warning" | "error";

export interface NotificationItem {
  id: number;
  type: NotificationType;
  title: string;
  content: string;
  read: boolean;
  createdAt: string;
}

/** 控制台统计项 */
export interface StatItem {
  key: string;
  label: string;
  value: number;
  prefix?: string;
  trend: number;
  percent: number;
  /** 近 7 期趋势数据（迷你图） */
  points: number[];
}

/** 控制台订单项 */
export interface OrderItem {
  id: number;
  orderNo: string;
  product: string;
  customer: string;
  amount: number;
  status: "pending" | "processing" | "completed";
  createdAt: string;
}

/** 控制台动态项 */
export interface ActivityItem {
  id: number;
  text: string;
  time: string;
  color: string;
}

/** 部门人数分布 */
export interface DeptStat {
  dept: string;
  count: number;
}

export interface DashboardSummary {
  stats: StatItem[];
  orders: OrderItem[];
  activities: ActivityItem[];
  deptStats: DeptStat[];
}

/** 表单字段类型 */
export type WorkflowFieldType =
  | "input"
  | "textarea"
  | "number"
  | "select"
  | "radio"
  | "date"
  | "switch";

/** 工作流表单项定义 */
export interface WorkflowField {
  id: string;
  /** 字段标识（英文，用于表单 name） */
  name: string;
  /** 字段名称（展示 label） */
  label: string;
  type: WorkflowFieldType;
  required: boolean;
  placeholder?: string;
  tips?: string;
  /** select / radio 的选项 */
  options?: string[];
}

/** 工作流步骤 */
export interface WorkflowStep {
  id: string;
  name: string;
  description?: string;
  fields: WorkflowField[];
}

/** 工作流定义 */
export interface Workflow {
  id: number;
  name: string;
  code: string;
  description?: string;
  steps: WorkflowStep[];
  status: Status;
  createdAt: string;
  updatedAt: string;
}

/** 平台配置项类型 */
export type ConfigValueType = "string" | "number" | "boolean" | "select";

/** 平台配置项 */
export interface PlatformConfig {
  key: string;
  group: string;
  label: string;
  type: ConfigValueType;
  value: string | number | boolean;
  options?: { label: string; value: string | number }[];
  description?: string;
}

/** 任务状态 */
export type TaskStatus = "pending" | "processing" | "completed" | "cancelled";

/** 任务实例（步骤为创建时的快照） */
export interface TaskInstance {
  id: number;
  workflowId: number;
  workflowName: string;
  title: string;
  creator: string;
  assignee?: string;
  steps: WorkflowStep[];
  /** 当前步骤索引 */
  currentStep: number;
  status: TaskStatus;
  /** 各步骤表单数据：stepId -> 字段值 */
  formData: Record<string, Record<string, unknown>>;
  createdAt: string;
  updatedAt: string;
}
