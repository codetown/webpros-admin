import type { DocItem, Gender, LogItem, MenuItem, RoleItem, Status, SystemUser } from "@/types";

/** Mock 数据库用户（含密码字段，仅 Mock 内部使用） */
export type DbUser = SystemUser & { password: string };

export interface MockDB {
  users: DbUser[];
  roles: RoleItem[];
  menus: MenuItem[];
  logs: LogItem[];
  docs: DocItem[];
}

const DB_KEY = "webpros-admin-mock-db-v2";

const depts = ["研发部", "市场部", "财务部", "人事部", "运营部"];
const surnames = "赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张".split("");
const givens = [
  "伟",
  "芳",
  "娜",
  "敏",
  "静",
  "磊",
  "军",
  "洋",
  "勇",
  "艳",
  "杰",
  "涛",
  "明",
  "强",
  "霞",
  "平",
  "刚",
  "辉",
  "鹏",
  "华",
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPhone(): string {
  const prefixes = ["138", "139", "150", "151", "186", "188", "199", "137"];
  let rest = "";
  for (let i = 0; i < 8; i += 1) rest += Math.floor(Math.random() * 10);
  return randomItem(prefixes) + rest;
}

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(9 + Math.floor(Math.random() * 9), Math.floor(Math.random() * 60), 0, 0);
  return date.toISOString();
}

function seedUsers(): DbUser[] {
  const users: DbUser[] = [
    {
      id: 1,
      username: "admin",
      password: "123456",
      nickname: "超级管理员",
      email: "admin@webpros.dev",
      phone: "13800000001",
      gender: 1,
      dept: "研发部",
      roles: ["admin"],
      status: 1,
      createdAt: daysAgo(365),
    },
    {
      id: 2,
      username: "editor",
      password: "123456",
      nickname: "运营小王",
      email: "editor@webpros.dev",
      phone: "13800000002",
      gender: 2,
      dept: "运营部",
      roles: ["operator"],
      status: 1,
      createdAt: daysAgo(200),
    },
    {
      id: 3,
      username: "guest",
      password: "123456",
      nickname: "访客小李",
      email: "guest@webpros.dev",
      phone: "13800000003",
      gender: 1,
      dept: "市场部",
      roles: ["guest"],
      status: 1,
      createdAt: daysAgo(100),
    },
  ];

  for (let i = 4; i <= 28; i += 1) {
    const gender = (i % 3) as Gender;
    users.push({
      id: i,
      username: `user${String(i).padStart(3, "0")}`,
      password: "123456",
      nickname: randomItem(surnames) + randomItem(givens),
      email: `user${i}@webpros.dev`,
      phone: randomPhone(),
      gender,
      dept: randomItem(depts),
      roles: i % 4 === 0 ? ["operator"] : ["staff"],
      status: (i % 7 === 0 ? 0 : 1) as Status,
      createdAt: daysAgo(Math.floor(Math.random() * 180)),
    });
  }
  return users;
}

function seedRoles(): RoleItem[] {
  return [
    {
      id: 1,
      name: "超级管理员",
      code: "admin",
      description: "拥有系统全部权限",
      permissions: ["*"],
      status: 1,
      createdAt: daysAgo(365),
    },
    {
      id: 2,
      name: "运营人员",
      code: "operator",
      description: "负责日常运营，可管理用户与查看日志",
      permissions: [
        "dashboard",
        "system",
        "system:user:list",
        "system:user:update",
        "system:user:export",
        "system:log:list",
        "docs:list",
        "docs:upload",
        "docs:download",
      ],
      status: 1,
      createdAt: daysAgo(300),
    },
    {
      id: 3,
      name: "普通员工",
      code: "staff",
      description: "普通员工，仅可访问控制台",
      permissions: ["dashboard"],
      status: 1,
      createdAt: daysAgo(300),
    },
    {
      id: 4,
      name: "访客",
      code: "guest",
      description: "只读访客账号",
      permissions: ["dashboard"],
      status: 0,
      createdAt: daysAgo(90),
    },
  ];
}

function seedMenus(): MenuItem[] {
  return [
    {
      id: 1,
      parentId: 0,
      name: "控制台",
      type: "menu",
      icon: "DashboardOutlined",
      path: "/dashboard",
      permission: "dashboard",
      sort: 1,
      status: 1,
    },
    {
      id: 2,
      parentId: 0,
      name: "系统管理",
      type: "catalog",
      icon: "SettingOutlined",
      path: "/system",
      sort: 3,
      status: 1,
    },
    {
      id: 3,
      parentId: 2,
      name: "用户管理",
      type: "menu",
      icon: "UserOutlined",
      path: "/system/user",
      permission: "system:user:list",
      sort: 1,
      status: 1,
    },
    {
      id: 4,
      parentId: 2,
      name: "角色管理",
      type: "menu",
      icon: "TeamOutlined",
      path: "/system/role",
      permission: "system:role:list",
      sort: 2,
      status: 1,
    },
    {
      id: 5,
      parentId: 2,
      name: "菜单管理",
      type: "menu",
      icon: "PartitionOutlined",
      path: "/system/menu",
      permission: "system:menu:list",
      sort: 3,
      status: 1,
    },
    {
      id: 6,
      parentId: 2,
      name: "操作日志",
      type: "menu",
      icon: "FileTextOutlined",
      path: "/system/log",
      permission: "system:log:list",
      sort: 4,
      status: 1,
    },
    {
      id: 10,
      parentId: 3,
      name: "用户新增",
      type: "button",
      permission: "system:user:add",
      sort: 1,
      status: 1,
    },
    {
      id: 11,
      parentId: 3,
      name: "用户编辑",
      type: "button",
      permission: "system:user:update",
      sort: 2,
      status: 1,
    },
    {
      id: 12,
      parentId: 3,
      name: "用户删除",
      type: "button",
      permission: "system:user:delete",
      sort: 3,
      status: 1,
    },
    {
      id: 13,
      parentId: 3,
      name: "重置密码",
      type: "button",
      permission: "system:user:reset",
      sort: 4,
      status: 1,
    },
    {
      id: 20,
      parentId: 4,
      name: "角色新增",
      type: "button",
      permission: "system:role:add",
      sort: 1,
      status: 1,
    },
    {
      id: 21,
      parentId: 4,
      name: "角色编辑",
      type: "button",
      permission: "system:role:update",
      sort: 2,
      status: 1,
    },
    {
      id: 22,
      parentId: 4,
      name: "角色删除",
      type: "button",
      permission: "system:role:delete",
      sort: 3,
      status: 1,
    },
    {
      id: 30,
      parentId: 5,
      name: "菜单新增",
      type: "button",
      permission: "system:menu:add",
      sort: 1,
      status: 1,
    },
    {
      id: 31,
      parentId: 5,
      name: "菜单编辑",
      type: "button",
      permission: "system:menu:update",
      sort: 2,
      status: 1,
    },
    {
      id: 32,
      parentId: 5,
      name: "菜单删除",
      type: "button",
      permission: "system:menu:delete",
      sort: 3,
      status: 1,
    },
    {
      id: 14,
      parentId: 3,
      name: "用户导出",
      type: "button",
      permission: "system:user:export",
      sort: 5,
      status: 1,
    },
    {
      id: 7,
      parentId: 0,
      name: "文档管理",
      type: "menu",
      icon: "FolderOutlined",
      path: "/docs",
      permission: "docs:list",
      sort: 2,
      status: 1,
    },
    {
      id: 70,
      parentId: 7,
      name: "文档上传",
      type: "button",
      permission: "docs:upload",
      sort: 1,
      status: 1,
    },
    {
      id: 71,
      parentId: 7,
      name: "文档下载",
      type: "button",
      permission: "docs:download",
      sort: 2,
      status: 1,
    },
    {
      id: 72,
      parentId: 7,
      name: "文档重命名",
      type: "button",
      permission: "docs:update",
      sort: 3,
      status: 1,
    },
    {
      id: 73,
      parentId: 7,
      name: "文档删除",
      type: "button",
      permission: "docs:delete",
      sort: 4,
      status: 1,
    },
  ];
}

function seedLogs(): LogItem[] {
  const actions = [
    "登录系统",
    "退出登录",
    "创建用户",
    "更新用户",
    "删除用户",
    "更新角色权限",
    "创建角色",
    "删除菜单",
    "修改个人资料",
    "重置用户密码",
  ];
  const userAgents = [
    "Chrome 128 / Windows",
    "Edge 127 / Windows",
    "Firefox 129 / macOS",
    "Chrome 126 / macOS",
  ];
  const locations = ["浙江杭州", "上海市", "北京市", "广东深圳", "四川成都", "湖北武汉"];
  const paths = [
    "/api/auth/login",
    "/api/user/page",
    "/api/role/list",
    "/api/menu/list",
    "/api/log/page",
  ];
  const methods = ["GET", "POST", "PUT", "DELETE"];
  const logs: LogItem[] = [];
  for (let i = 1; i <= 48; i += 1) {
    const isFail = i % 9 === 0;
    logs.push({
      id: i,
      username: i % 3 === 0 ? "editor" : "admin",
      nickname: i % 3 === 0 ? "运营小王" : "超级管理员",
      action: randomItem(actions),
      ip: `192.168.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 254) + 1}`,
      status: (isFail ? 0 : 1) as Status,
      duration: 30 + Math.floor(Math.random() * 500),
      createdAt: daysAgo(Math.floor(Math.random() * 20)),
      method: randomItem(methods),
      path: randomItem(paths),
      userAgent: randomItem(userAgents),
      location: randomItem(locations),
    });
  }
  return logs.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

function seedDocs(): DocItem[] {
  const docs: Array<[string, string, number, string, string, number]> = [
    ["产品需求规格说明书 v2.3", "docx", 2_457_600, "产品文档", "超级管理员", 128],
    ["Q3 财务结算报表", "xlsx", 892_416, "财务报表", "运营小王", 56],
    ["品牌视觉规范手册", "pdf", 15_728_640, "设计资源", "超级管理员", 342],
    ["开放平台 API 接入指南", "pdf", 3_145_728, "技术文档", "超级管理员", 486],
    ["系统架构设计图", "png", 1_048_576, "技术文档", "超级管理员", 97],
    ["年度团队建设活动方案", "docx", 512_000, "其他", "运营小王", 23],
    ["竞品分析数据汇总", "xlsx", 1_572_864, "产品文档", "运营小王", 64],
    ["发布会主视觉素材包", "zip", 104_857_600, "设计资源", "超级管理员", 18],
  ];
  return docs.map(([name, ext, size, category, uploader, downloads], index) => ({
    id: index + 1,
    name,
    ext,
    size,
    category,
    uploader,
    downloads,
    createdAt: daysAgo(index * 6 + 2),
  }));
}

function seed(): MockDB {
  return {
    users: seedUsers(),
    roles: seedRoles(),
    menus: seedMenus(),
    logs: seedLogs(),
    docs: seedDocs(),
  };
}

export function loadDB(): MockDB {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw) as MockDB;
  } catch {
    // 数据损坏时回退到种子数据
  }
  const db = seed();
  saveDB(db);
  return db;
}

export function saveDB(db: MockDB) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

/** 剔除密码字段，返回对外的用户对象 */
export function toPublicUser(user: DbUser): SystemUser {
  return {
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    avatar: user.avatar,
    email: user.email,
    phone: user.phone,
    gender: user.gender,
    dept: user.dept,
    roles: user.roles,
    status: user.status,
    createdAt: user.createdAt,
  };
}

/** 根据角色编码汇总权限 */
export function collectPermissions(db: MockDB, roleCodes: string[]): string[] {
  const set = new Set<string>();
  for (const role of db.roles) {
    if (roleCodes.includes(role.code) && role.status === 1) {
      for (const permission of role.permissions) set.add(permission);
    }
  }
  return [...set];
}
