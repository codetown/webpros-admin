import type { MenuFormValues } from "@/api/menu";
import type { RoleFormValues } from "@/api/role";
import type { UserFormValues } from "@/api/user";
import type { WorkflowFormValues } from "@/api/workflow";
import type {
  ApiResult,
  DashboardSummary,
  DocItem,
  Gender,
  LoginResult,
  MenuItem,
  RoleItem,
  Status,
  TaskInstance,
  UserInfo,
  Workflow,
} from "@/types";
import { collectPermissions, type DbUser, loadDB, saveDB, toPublicUser } from "./db";

export interface MockContext {
  query: URLSearchParams;
  body: Record<string, unknown>;
  params: Record<string, string>;
}

type MockHandler = (ctx: MockContext) => ApiResult<unknown>;

export interface MockRoute {
  method: string;
  pattern: RegExp;
  handler: MockHandler;
}

const ok = <T>(data: T, message = "操作成功"): ApiResult<T> => ({ code: 0, message, data });
const fail = (message: string): ApiResult<null> => ({ code: 1, message, data: null });

function numberQuery(query: URLSearchParams, key: string, fallback: number): number {
  const value = Number(query.get(key));
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function toUserInfo(user: DbUser, permissions: string[]): UserInfo {
  const publicUser = toPublicUser(user);
  return {
    id: publicUser.id,
    username: publicUser.username,
    nickname: publicUser.nickname,
    avatar: publicUser.avatar,
    email: publicUser.email,
    phone: publicUser.phone,
    gender: publicUser.gender,
    dept: publicUser.dept,
    roles: publicUser.roles,
    permissions,
  };
}

function paginate<T>(list: T[], page: number, pageSize: number) {
  return list.slice((page - 1) * pageSize, page * pageSize);
}

export const handlers: MockRoute[] = [
  // ---------------- 认证 ----------------
  {
    method: "POST",
    pattern: /^\/auth\/login$/,
    handler: ({ body }) => {
      const db = loadDB();
      const username = String(body.username ?? "");
      const password = String(body.password ?? "");
      const account = db.users.find(
        (user) => user.username === username && user.password === password,
      );
      if (!account) return fail("用户名或密码错误");
      if (account.status !== 1) return fail("该账号已被停用，请联系管理员");
      const result: LoginResult = {
        token: `mock.${account.id}.${Date.now().toString(36)}`,
        user: toUserInfo(account, collectPermissions(db, account.roles)),
      };
      return ok(result, "登录成功");
    },
  },
  {
    method: "POST",
    pattern: /^\/auth\/logout$/,
    handler: () => ok(null, "退出成功"),
  },
  {
    method: "POST",
    pattern: /^\/auth\/unlock$/,
    handler: ({ body }) => {
      const db = loadDB();
      const username = String(body.username ?? "");
      const password = String(body.password ?? "");
      const account = db.users.find(
        (user) => user.username === username && user.password === password,
      );
      if (!account) return fail("解锁密码错误");
      return ok(null, "解锁成功");
    },
  },
  {
    method: "PUT",
    pattern: /^\/account\/profile$/,
    handler: ({ body }) => {
      const db = loadDB();
      const username = String(body.username ?? "");
      const account = db.users.find((user) => user.username === username);
      if (!account) return fail("用户不存在");
      account.nickname = String(body.nickname ?? account.nickname);
      account.email = String(body.email ?? account.email);
      account.phone = String(body.phone ?? account.phone);
      account.gender = (body.gender as Gender) ?? account.gender;
      account.dept = String(body.dept ?? account.dept);
      if (typeof body.avatar === "string") account.avatar = body.avatar;
      saveDB(db);
      return ok(toUserInfo(account, collectPermissions(db, account.roles)), "保存成功");
    },
  },
  {
    method: "PUT",
    pattern: /^\/account\/password$/,
    handler: ({ body }) => {
      const db = loadDB();
      const account = db.users.find((user) => user.username === String(body.username ?? ""));
      if (!account) return fail("用户不存在");
      if (account.password !== String(body.oldPassword ?? "")) return fail("原密码不正确");
      account.password = String(body.newPassword ?? "");
      saveDB(db);
      return ok(null, "密码修改成功");
    },
  },

  // ---------------- 用户管理 ----------------
  {
    method: "GET",
    pattern: /^\/user\/page$/,
    handler: ({ query }) => {
      const db = loadDB();
      const page = numberQuery(query, "page", 1);
      const pageSize = numberQuery(query, "pageSize", 10);
      const username = query.get("username")?.trim();
      const phone = query.get("phone")?.trim();
      const status = query.get("status");
      let list = db.users.map(toPublicUser);
      if (username) {
        list = list.filter(
          (user) => user.username.includes(username) || user.nickname.includes(username),
        );
      }
      if (phone) list = list.filter((user) => user.phone.includes(phone));
      if (status !== null && status !== "") {
        list = list.filter((user) => user.status === Number(status));
      }
      list = [...list].sort((a, b) => b.id - a.id);
      return ok({ list: paginate(list, page, pageSize), total: list.length });
    },
  },
  {
    method: "POST",
    pattern: /^\/user$/,
    handler: ({ body }) => {
      const db = loadDB();
      const values = body as unknown as UserFormValues;
      if (db.users.some((user) => user.username === values.username)) {
        return fail("用户名已存在");
      }
      const user: DbUser = {
        ...values,
        id: Math.max(0, ...db.users.map((item) => item.id)) + 1,
        password: "123456",
        createdAt: new Date().toISOString(),
      };
      db.users.push(user);
      saveDB(db);
      return ok(toPublicUser(user), "创建成功");
    },
  },
  {
    method: "PUT",
    pattern: /^\/user\/(?<id>\d+)$/,
    handler: ({ params, body }) => {
      const db = loadDB();
      const user = db.users.find((item) => item.id === Number(params.id));
      if (!user) return fail("用户不存在");
      const values = body as unknown as UserFormValues;
      Object.assign(user, values);
      saveDB(db);
      return ok(toPublicUser(user), "更新成功");
    },
  },
  {
    method: "PATCH",
    pattern: /^\/user\/(?<id>\d+)\/status$/,
    handler: ({ params, body }) => {
      const db = loadDB();
      const user = db.users.find((item) => item.id === Number(params.id));
      if (!user) return fail("用户不存在");
      user.status = Number(body.status) as Status;
      saveDB(db);
      return ok(null, user.status === 1 ? "已启用" : "已停用");
    },
  },
  {
    method: "PATCH",
    pattern: /^\/user\/(?<id>\d+)\/password$/,
    handler: ({ params }) => {
      const db = loadDB();
      const user = db.users.find((item) => item.id === Number(params.id));
      if (!user) return fail("用户不存在");
      user.password = "123456";
      saveDB(db);
      return ok(null, "密码已重置为 123456");
    },
  },
  {
    method: "DELETE",
    pattern: /^\/user$/,
    handler: ({ body }) => {
      const db = loadDB();
      const ids = (body.ids ?? []) as number[];
      if (ids.some((id) => db.users.find((user) => user.id === id)?.username === "admin")) {
        return fail("内置管理员账号不可删除");
      }
      db.users = db.users.filter((user) => !ids.includes(user.id));
      saveDB(db);
      return ok(null, "删除成功");
    },
  },

  // ---------------- 角色管理 ----------------
  {
    method: "GET",
    pattern: /^\/role\/list$/,
    handler: () => {
      const db = loadDB();
      return ok(db.roles);
    },
  },
  {
    method: "POST",
    pattern: /^\/role$/,
    handler: ({ body }) => {
      const db = loadDB();
      const values = body as unknown as RoleFormValues;
      if (db.roles.some((role) => role.code === values.code)) return fail("角色编码已存在");
      const role: RoleItem = {
        ...values,
        id: Math.max(0, ...db.roles.map((item) => item.id)) + 1,
        permissions: [],
        createdAt: new Date().toISOString(),
      };
      db.roles.push(role);
      saveDB(db);
      return ok(role, "创建成功");
    },
  },
  {
    method: "PUT",
    pattern: /^\/role\/(?<id>\d+)$/,
    handler: ({ params, body }) => {
      const db = loadDB();
      const role = db.roles.find((item) => item.id === Number(params.id));
      if (!role) return fail("角色不存在");
      const values = body as unknown as RoleFormValues;
      if (values.code !== role.code && db.roles.some((item) => item.code === values.code)) {
        return fail("角色编码已存在");
      }
      Object.assign(role, values);
      saveDB(db);
      return ok(role, "更新成功");
    },
  },
  {
    method: "PUT",
    pattern: /^\/role\/(?<id>\d+)\/permissions$/,
    handler: ({ params, body }) => {
      const db = loadDB();
      const role = db.roles.find((item) => item.id === Number(params.id));
      if (!role) return fail("角色不存在");
      role.permissions = (body.permissions ?? []) as string[];
      saveDB(db);
      return ok(null, "权限分配成功");
    },
  },
  {
    method: "DELETE",
    pattern: /^\/role\/(?<id>\d+)$/,
    handler: ({ params }) => {
      const db = loadDB();
      const role = db.roles.find((item) => item.id === Number(params.id));
      if (!role) return fail("角色不存在");
      if (role.code === "admin") return fail("内置管理员角色不可删除");
      db.roles = db.roles.filter((item) => item.id !== role.id);
      saveDB(db);
      return ok(null, "删除成功");
    },
  },

  // ---------------- 菜单管理 ----------------
  {
    method: "GET",
    pattern: /^\/menu\/list$/,
    handler: () => {
      const db = loadDB();
      return ok(db.menus);
    },
  },
  {
    method: "POST",
    pattern: /^\/menu$/,
    handler: ({ body }) => {
      const db = loadDB();
      const values = body as unknown as MenuFormValues;
      const menu: MenuItem = {
        ...values,
        id: Math.max(0, ...db.menus.map((item) => item.id)) + 1,
      };
      db.menus.push(menu);
      saveDB(db);
      return ok(menu, "创建成功");
    },
  },
  {
    method: "PUT",
    pattern: /^\/menu\/(?<id>\d+)$/,
    handler: ({ params, body }) => {
      const db = loadDB();
      const menu = db.menus.find((item) => item.id === Number(params.id));
      if (!menu) return fail("菜单不存在");
      const values = body as unknown as MenuFormValues;
      if (values.parentId === menu.id) return fail("上级菜单不能是自身");
      Object.assign(menu, values);
      saveDB(db);
      return ok(menu, "更新成功");
    },
  },
  {
    method: "DELETE",
    pattern: /^\/menu\/(?<id>\d+)$/,
    handler: ({ params }) => {
      const db = loadDB();
      const id = Number(params.id);
      if (db.menus.some((item) => item.parentId === id)) return fail("存在子菜单，无法删除");
      db.menus = db.menus.filter((item) => item.id !== id);
      saveDB(db);
      return ok(null, "删除成功");
    },
  },

  // ---------------- 操作日志 ----------------
  {
    method: "GET",
    pattern: /^\/log\/page$/,
    handler: ({ query }) => {
      const db = loadDB();
      const page = numberQuery(query, "page", 1);
      const pageSize = numberQuery(query, "pageSize", 10);
      const username = query.get("username")?.trim();
      const status = query.get("status");
      const startTime = query.get("startTime");
      const endTime = query.get("endTime");
      let list = [...db.logs];
      if (username) list = list.filter((log) => log.username.includes(username));
      if (status !== null && status !== "") {
        list = list.filter((log) => log.status === Number(status));
      }
      if (startTime) list = list.filter((log) => new Date(log.createdAt) >= new Date(startTime));
      if (endTime) list = list.filter((log) => new Date(log.createdAt) <= new Date(endTime));
      return ok({ list: paginate(list, page, pageSize), total: list.length });
    },
  },

  // ---------------- 文档管理 ----------------
  {
    method: "GET",
    pattern: /^\/doc\/page$/,
    handler: ({ query }) => {
      const db = loadDB();
      const page = numberQuery(query, "page", 1);
      const pageSize = numberQuery(query, "pageSize", 10);
      const name = query.get("name")?.trim();
      const category = query.get("category");
      let list = db.docs.map((doc) => ({
        id: doc.id,
        name: doc.name,
        ext: doc.ext,
        size: doc.size,
        category: doc.category,
        uploader: doc.uploader,
        downloads: doc.downloads,
        createdAt: doc.createdAt,
      }));
      if (name) list = list.filter((doc) => doc.name.toLowerCase().includes(name.toLowerCase()));
      if (category) list = list.filter((doc) => doc.category === category);
      list = [...list].sort((a, b) => b.id - a.id);
      return ok({ list: paginate(list, page, pageSize), total: list.length });
    },
  },
  {
    method: "POST",
    pattern: /^\/doc$/,
    handler: ({ body }) => {
      const db = loadDB();
      const doc: DocItem = {
        id: Math.max(0, ...db.docs.map((item) => item.id)) + 1,
        name: String(body.name ?? "未命名"),
        ext: String(body.ext ?? "bin"),
        size: Number(body.size ?? 0),
        category: String(body.category ?? "其他"),
        uploader: String(body.uploader ?? "-"),
        downloads: 0,
        createdAt: new Date().toISOString(),
        content: typeof body.content === "string" ? body.content : undefined,
      };
      db.docs.push(doc);
      saveDB(db);
      return ok(null, "上传成功");
    },
  },
  {
    method: "GET",
    pattern: /^\/doc\/(?<id>\d+)$/,
    handler: ({ params }) => {
      const db = loadDB();
      const doc = db.docs.find((item) => item.id === Number(params.id));
      if (!doc) return fail("文档不存在");
      if (!doc.content) return fail("Mock 模式未保存该文件原内容（仅存储 1.5MB 以内的上传文件）");
      doc.downloads += 1;
      saveDB(db);
      return ok(doc.content, "开始下载");
    },
  },
  {
    method: "PUT",
    pattern: /^\/doc\/(?<id>\d+)$/,
    handler: ({ params, body }) => {
      const db = loadDB();
      const doc = db.docs.find((item) => item.id === Number(params.id));
      if (!doc) return fail("文档不存在");
      const name = String(body.name ?? "").trim();
      if (!name) return fail("文档名不能为空");
      doc.name = name;
      saveDB(db);
      return ok(null, "重命名成功");
    },
  },
  {
    method: "DELETE",
    pattern: /^\/doc\/(?<id>\d+)$/,
    handler: ({ params }) => {
      const db = loadDB();
      db.docs = db.docs.filter((item) => item.id !== Number(params.id));
      saveDB(db);
      return ok(null, "删除成功");
    },
  },

  // ---------------- 工作流定义 ----------------
  {
    method: "GET",
    pattern: /^\/workflow\/list$/,
    handler: () => {
      const db = loadDB();
      return ok(db.workflows);
    },
  },
  {
    method: "POST",
    pattern: /^\/workflow$/,
    handler: ({ body }) => {
      const db = loadDB();
      const values = body as unknown as WorkflowFormValues;
      if (db.workflows.some((workflow) => workflow.code === values.code)) {
        return fail("流程编码已存在");
      }
      const now = new Date().toISOString();
      const workflow: Workflow = {
        ...values,
        id: Math.max(0, ...db.workflows.map((item) => item.id)) + 1,
        createdAt: now,
        updatedAt: now,
      };
      db.workflows.push(workflow);
      saveDB(db);
      return ok(workflow, "创建成功");
    },
  },
  {
    method: "PUT",
    pattern: /^\/workflow\/(?<id>\d+)$/,
    handler: ({ params, body }) => {
      const db = loadDB();
      const workflow = db.workflows.find((item) => item.id === Number(params.id));
      if (!workflow) return fail("流程不存在");
      const values = body as unknown as WorkflowFormValues;
      if (values.code !== workflow.code && db.workflows.some((item) => item.code === values.code)) {
        return fail("流程编码已存在");
      }
      Object.assign(workflow, values);
      workflow.updatedAt = new Date().toISOString();
      saveDB(db);
      return ok(workflow, "更新成功");
    },
  },
  {
    method: "DELETE",
    pattern: /^\/workflow\/(?<id>\d+)$/,
    handler: ({ params }) => {
      const db = loadDB();
      const id = Number(params.id);
      if (db.tasks.some((task) => task.workflowId === id)) {
        return fail("已有任务引用该流程，无法删除");
      }
      db.workflows = db.workflows.filter((item) => item.id !== id);
      saveDB(db);
      return ok(null, "删除成功");
    },
  },

  // ---------------- 任务实例 ----------------
  {
    method: "GET",
    pattern: /^\/task\/page$/,
    handler: ({ query }) => {
      const db = loadDB();
      const page = numberQuery(query, "page", 1);
      const pageSize = numberQuery(query, "pageSize", 10);
      const title = query.get("title")?.trim();
      const status = query.get("status");
      let list = [...db.tasks];
      if (title) list = list.filter((task) => task.title.includes(title));
      if (status) list = list.filter((task) => task.status === status);
      list = list.sort((a, b) => b.id - a.id);
      return ok({ list: paginate(list, page, pageSize), total: list.length });
    },
  },
  {
    method: "POST",
    pattern: /^\/task$/,
    handler: ({ body }) => {
      const db = loadDB();
      const workflowId = Number(body.workflowId);
      const workflow = db.workflows.find((item) => item.id === workflowId);
      if (!workflow) return fail("流程不存在");
      const now = new Date().toISOString();
      const task: TaskInstance = {
        id: Math.max(0, ...db.tasks.map((item) => item.id)) + 1,
        workflowId,
        workflowName: workflow.name,
        title: String(body.title ?? "未命名任务"),
        creator: String(body.creator ?? "-"),
        assignee: typeof body.assignee === "string" && body.assignee ? body.assignee : undefined,
        steps: workflow.steps.map((step) => ({
          ...step,
          fields: step.fields.map((field) => ({ ...field })),
        })),
        currentStep: 0,
        status: "processing",
        formData: {},
        createdAt: now,
        updatedAt: now,
      };
      db.tasks.push(task);
      saveDB(db);
      return ok(task, "创建成功");
    },
  },
  {
    method: "POST",
    pattern: /^\/task\/(?<id>\d+)\/submit$/,
    handler: ({ params, body }) => {
      const db = loadDB();
      const task = db.tasks.find((item) => item.id === Number(params.id));
      if (!task) return fail("任务不存在");
      if (task.status !== "processing") return fail("当前任务状态不可提交");
      const step = task.steps[task.currentStep];
      if (!step) return fail("流程配置异常");
      task.formData = {
        ...task.formData,
        [step.id]: (body.data ?? {}) as Record<string, unknown>,
      };
      if (task.currentStep + 1 >= task.steps.length) {
        task.status = "completed";
      } else {
        task.currentStep += 1;
      }
      task.updatedAt = new Date().toISOString();
      saveDB(db);
      return ok(task, task.status === "completed" ? "任务已完成" : "已流转到下一步");
    },
  },
  {
    method: "POST",
    pattern: /^\/task\/(?<id>\d+)\/cancel$/,
    handler: ({ params }) => {
      const db = loadDB();
      const task = db.tasks.find((item) => item.id === Number(params.id));
      if (!task) return fail("任务不存在");
      if (task.status === "completed") return fail("已完成的任务不能取消");
      task.status = "cancelled";
      task.updatedAt = new Date().toISOString();
      saveDB(db);
      return ok(task, "任务已取消");
    },
  },

  // ---------------- 平台配置 ----------------
  {
    method: "GET",
    pattern: /^\/config$/,
    handler: () => {
      const db = loadDB();
      return ok(db.configs);
    },
  },
  {
    method: "PUT",
    pattern: /^\/config$/,
    handler: ({ body }) => {
      const db = loadDB();
      const values = body as Record<string, unknown>;
      for (const item of db.configs) {
        if (item.key in values) item.value = values[item.key] as string | number | boolean;
      }
      saveDB(db);
      return ok(db.configs, "保存成功");
    },
  },

  // ---------------- 控制台 ----------------
  {
    method: "GET",
    pattern: /^\/dashboard\/summary$/,
    handler: () => {
      const db = loadDB();
      const deptCounts = new Map<string, number>();
      for (const user of db.users) {
        if (user.status !== 1) continue;
        deptCounts.set(user.dept, (deptCounts.get(user.dept) ?? 0) + 1);
      }
      const deptStats = [...deptCounts.entries()]
        .map(([dept, count]) => ({ dept, count }))
        .sort((a, b) => b.count - a.count);
      const summary: DashboardSummary = {
        stats: [
          {
            key: "visits",
            label: "访问量",
            value: 88421,
            trend: 12.5,
            percent: 78,
            points: [28, 35, 30, 42, 38, 52, 48],
          },
          {
            key: "sales",
            label: "销售额",
            value: 126560,
            prefix: "¥",
            trend: 8.2,
            percent: 64,
            points: [18, 22, 26, 24, 30, 28, 36],
          },
          {
            key: "orders",
            label: "订单量",
            value: 6560,
            trend: -3.1,
            percent: 46,
            points: [12, 14, 11, 15, 13, 10, 12],
          },
          {
            key: "users",
            label: "用户总数",
            value: db.users.length,
            trend: 15.9,
            percent: 82,
            points: [6, 8, 9, 12, 15, 18, 24],
          },
        ],
        orders: [
          {
            id: 1,
            orderNo: "NO20260801001",
            product: "企业版年度授权",
            customer: "杭州云启科技",
            amount: 12800,
            status: "completed",
            createdAt: "2026-08-01 09:12:30",
          },
          {
            id: 2,
            orderNo: "NO20260801002",
            product: "数据大屏定制",
            customer: "上海星澜网络",
            amount: 36800,
            status: "processing",
            createdAt: "2026-08-01 10:05:11",
          },
          {
            id: 3,
            orderNo: "NO20260731003",
            product: "标准版续费",
            customer: "深圳未名信息",
            amount: 4800,
            status: "completed",
            createdAt: "2026-07-31 16:42:09",
          },
          {
            id: 4,
            orderNo: "NO20260731004",
            product: "私有化部署",
            customer: "北京国信数科",
            amount: 98000,
            status: "pending",
            createdAt: "2026-07-31 14:23:47",
          },
          {
            id: 5,
            orderNo: "NO20260730005",
            product: "企业版季度授权",
            customer: "广州木棉智能",
            amount: 3800,
            status: "completed",
            createdAt: "2026-07-30 11:18:22",
          },
          {
            id: 6,
            orderNo: "NO20260730006",
            product: "接口调用加油包",
            customer: "成都天府软件",
            amount: 1200,
            status: "processing",
            createdAt: "2026-07-30 09:47:03",
          },
        ],
        activities: [
          { id: 1, text: "超级管理员 创建了用户「user029」", time: "10 分钟前", color: "blue" },
          { id: 2, text: "运营小王 更新了「运营人员」角色权限", time: "1 小时前", color: "green" },
          { id: 3, text: "系统完成每日数据备份", time: "今天 03:00", color: "gray" },
          {
            id: 4,
            text: "超级管理员 删除了过期菜单「活动配置」",
            time: "昨天 18:26",
            color: "red",
          },
          { id: 5, text: "运营小王 导出了本月操作日志", time: "昨天 15:02", color: "orange" },
          { id: 6, text: "系统检测到 3 次异常登录尝试并已拦截", time: "昨天 02:41", color: "red" },
        ],
        deptStats,
      };
      return ok(summary);
    },
  },
];
