import { deptOptions } from "@/constants/meta";
import type {
  DocItem,
  Gender,
  LogItem,
  MenuItem,
  NoticeItem,
  PlatformConfig,
  RoleItem,
  SlideItem,
  Status,
  SystemUser,
  TaskInstance,
  Workflow,
} from "@/types";

/** Mock 数据库用户（含密码字段，仅 Mock 内部使用） */
export type DbUser = SystemUser & { password: string };

export interface MockDB {
  users: DbUser[];
  roles: RoleItem[];
  menus: MenuItem[];
  logs: LogItem[];
  docs: DocItem[];
  workflows: Workflow[];
  tasks: TaskInstance[];
  configs: PlatformConfig[];
  notices: NoticeItem[];
  slides: SlideItem[];
}

const DB_KEY = "webpros-admin-mock-db-v6";

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
      dept: randomItem(deptOptions),
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
        "workflow:list",
        "workflow:task:list",
        "workflow:task:create",
        "workflow:task:submit",
        "notice:list",
        "notice:update",
        "slide:list",
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
    {
      id: 8,
      parentId: 0,
      name: "流程中心",
      type: "catalog",
      icon: "ApartmentOutlined",
      path: "/workflow",
      sort: 4,
      status: 1,
    },
    {
      id: 80,
      parentId: 8,
      name: "工作流定义",
      type: "menu",
      icon: "DeploymentUnitOutlined",
      path: "/workflow/define",
      permission: "workflow:list",
      sort: 1,
      status: 1,
    },
    {
      id: 81,
      parentId: 8,
      name: "任务实例",
      type: "menu",
      icon: "AuditOutlined",
      path: "/workflow/task",
      permission: "workflow:task:list",
      sort: 2,
      status: 1,
    },
    {
      id: 82,
      parentId: 80,
      name: "工作流配置",
      type: "button",
      permission: "workflow:update",
      sort: 1,
      status: 1,
    },
    {
      id: 83,
      parentId: 80,
      name: "工作流删除",
      type: "button",
      permission: "workflow:delete",
      sort: 2,
      status: 1,
    },
    {
      id: 84,
      parentId: 81,
      name: "创建任务",
      type: "button",
      permission: "workflow:task:create",
      sort: 1,
      status: 1,
    },
    {
      id: 85,
      parentId: 81,
      name: "提交表单",
      type: "button",
      permission: "workflow:task:submit",
      sort: 2,
      status: 1,
    },
    {
      id: 86,
      parentId: 81,
      name: "取消任务",
      type: "button",
      permission: "workflow:task:cancel",
      sort: 3,
      status: 1,
    },
    {
      id: 9,
      parentId: 2,
      name: "平台配置",
      type: "menu",
      icon: "ControlOutlined",
      path: "/system/config",
      permission: "platform:config:list",
      sort: 5,
      status: 1,
    },
    {
      id: 90,
      parentId: 9,
      name: "配置修改",
      type: "button",
      permission: "platform:config:update",
      sort: 1,
      status: 1,
    },
    {
      id: 10,
      parentId: 0,
      name: "公告管理",
      type: "menu",
      icon: "NotificationOutlined",
      path: "/notices",
      permission: "notice:list",
      sort: 5,
      status: 1,
    },
    {
      id: 100,
      parentId: 10,
      name: "公告新增",
      type: "button",
      permission: "notice:add",
      sort: 1,
      status: 1,
    },
    {
      id: 101,
      parentId: 10,
      name: "公告编辑",
      type: "button",
      permission: "notice:update",
      sort: 2,
      status: 1,
    },
    {
      id: 102,
      parentId: 10,
      name: "公告删除",
      type: "button",
      permission: "notice:delete",
      sort: 3,
      status: 1,
    },
    {
      id: 11,
      parentId: 0,
      name: "首页幻灯片",
      type: "menu",
      icon: "PictureOutlined",
      path: "/slides",
      permission: "slide:list",
      sort: 6,
      status: 1,
    },
    {
      id: 110,
      parentId: 11,
      name: "幻灯片新增",
      type: "button",
      permission: "slide:add",
      sort: 1,
      status: 1,
    },
    {
      id: 111,
      parentId: 11,
      name: "幻灯片编辑",
      type: "button",
      permission: "slide:update",
      sort: 2,
      status: 1,
    },
    {
      id: 112,
      parentId: 11,
      name: "幻灯片删除",
      type: "button",
      permission: "slide:delete",
      sort: 3,
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

function seedWorkflows(): Workflow[] {
  return [
    {
      id: 1,
      name: "员工入职流程",
      code: "onboarding",
      description: "新员工入职登记、HR 审核与行政安排",
      status: 1,
      createdAt: daysAgo(90),
      updatedAt: daysAgo(5),
      steps: [
        {
          id: "onb-s1",
          name: "入职登记",
          description: "填写个人与岗位信息",
          fields: [
            {
              id: "onb-s1-f1",
              name: "realName",
              label: "姓名",
              type: "input",
              required: true,
              placeholder: "请输入真实姓名",
            },
            {
              id: "onb-s1-f2",
              name: "dept",
              label: "所属部门",
              type: "select",
              required: true,
              options: ["研发部", "市场部", "财务部", "人事部"],
            },
            {
              id: "onb-s1-f3",
              name: "position",
              label: "岗位",
              type: "input",
              required: true,
              placeholder: "如：前端工程师",
            },
            { id: "onb-s1-f4", name: "entryDate", label: "入职日期", type: "date", required: true },
            {
              id: "onb-s1-f5",
              name: "email",
              label: "企业邮箱",
              type: "input",
              required: true,
              placeholder: "name@company.com",
            },
          ],
        },
        {
          id: "onb-s2",
          name: "HR 审核",
          description: "人事专员审核入职材料",
          fields: [
            {
              id: "onb-s2-f1",
              name: "result",
              label: "审核结果",
              type: "radio",
              required: true,
              options: ["通过", "驳回"],
            },
            {
              id: "onb-s2-f2",
              name: "comment",
              label: "审批意见",
              type: "textarea",
              required: false,
              placeholder: "填写审核意见",
            },
          ],
        },
        {
          id: "onb-s3",
          name: "行政安排",
          description: "工位与办公设备分配",
          fields: [
            {
              id: "onb-s3-f1",
              name: "workstation",
              label: "工位",
              type: "select",
              required: true,
              options: ["A 区", "B 区", "C 区"],
            },
            {
              id: "onb-s3-f2",
              name: "device",
              label: "办公设备",
              type: "select",
              required: false,
              options: ["笔记本", "显示器", "键鼠套装"],
            },
            {
              id: "onb-s3-f3",
              name: "accessCard",
              label: "发放门禁卡",
              type: "switch",
              required: false,
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: "报销审批流程",
      code: "reimbursement",
      description: "费用报销申请与逐级审批",
      status: 1,
      createdAt: daysAgo(80),
      updatedAt: daysAgo(12),
      steps: [
        {
          id: "rmb-s1",
          name: "报销申请",
          description: "填写报销明细",
          fields: [
            { id: "rmb-s1-f1", name: "amount", label: "报销金额", type: "number", required: true },
            {
              id: "rmb-s1-f2",
              name: "type",
              label: "费用类型",
              type: "select",
              required: true,
              options: ["差旅费", "办公费", "招待费", "交通费"],
            },
            {
              id: "rmb-s1-f3",
              name: "reason",
              label: "报销事由",
              type: "textarea",
              required: true,
              placeholder: "说明费用产生的背景",
            },
            {
              id: "rmb-s1-f4",
              name: "invoiceNo",
              label: "发票编号",
              type: "input",
              required: false,
              placeholder: "如有请填写",
            },
          ],
        },
        {
          id: "rmb-s2",
          name: "主管审批",
          description: "直属主管审批",
          fields: [
            {
              id: "rmb-s2-f1",
              name: "agree",
              label: "是否同意",
              type: "radio",
              required: true,
              options: ["同意", "驳回"],
            },
            {
              id: "rmb-s2-f2",
              name: "comment",
              label: "审批意见",
              type: "textarea",
              required: false,
              placeholder: "填写审批意见",
            },
          ],
        },
        {
          id: "rmb-s3",
          name: "财务打款",
          description: "财务核对并打款",
          fields: [
            {
              id: "rmb-s3-f1",
              name: "account",
              label: "收款账号",
              type: "input",
              required: true,
              placeholder: "银行卡号",
            },
            {
              id: "rmb-s3-f2",
              name: "paidAmount",
              label: "实付金额",
              type: "number",
              required: true,
            },
            { id: "rmb-s3-f3", name: "remark", label: "备注", type: "textarea", required: false },
          ],
        },
      ],
    },
    {
      id: 3,
      name: "项目立项流程",
      code: "project-kickoff",
      description: "新项目立项申请与评审",
      status: 1,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(20),
      steps: [
        {
          id: "prj-s1",
          name: "立项申请",
          description: "填写项目基本信息",
          fields: [
            {
              id: "prj-s1-f1",
              name: "projectName",
              label: "项目名称",
              type: "input",
              required: true,
            },
            {
              id: "prj-s1-f2",
              name: "budget",
              label: "预算（万元）",
              type: "number",
              required: true,
            },
            {
              id: "prj-s1-f3",
              name: "startDate",
              label: "计划启动日期",
              type: "date",
              required: true,
            },
            {
              id: "prj-s1-f4",
              name: "priority",
              label: "优先级",
              type: "radio",
              required: true,
              options: ["高", "中", "低"],
            },
          ],
        },
        {
          id: "prj-s2",
          name: "立项评审",
          description: "评审委员会评审",
          fields: [
            {
              id: "prj-s2-f1",
              name: "passed",
              label: "是否通过",
              type: "radio",
              required: true,
              options: ["通过", "不通过"],
            },
            {
              id: "prj-s2-f2",
              name: "comment",
              label: "评审意见",
              type: "textarea",
              required: false,
            },
          ],
        },
      ],
    },
  ];
}

function seedTasks(workflows: Workflow[]): TaskInstance[] {
  const [onboarding, reimbursement, kickoff] = workflows;
  return [
    {
      id: 1,
      workflowId: 1,
      workflowName: "员工入职流程",
      title: "张三入职办理",
      creator: "运营小王",
      assignee: "超级管理员",
      steps: onboarding.steps,
      currentStep: 1,
      status: "processing",
      formData: {
        "onb-s1": {
          realName: "张三",
          dept: "研发部",
          position: "前端工程师",
          entryDate: "2026-08-18",
          email: "zhangsan@company.com",
        },
      },
      createdAt: daysAgo(1),
      updatedAt: daysAgo(0),
    },
    {
      id: 2,
      workflowId: 1,
      workflowName: "员工入职流程",
      title: "李四入职办理",
      creator: "运营小王",
      assignee: "超级管理员",
      steps: onboarding.steps,
      currentStep: 3,
      status: "completed",
      formData: {
        "onb-s1": {
          realName: "李四",
          dept: "市场部",
          position: "市场专员",
          entryDate: "2026-08-10",
          email: "lisi@company.com",
        },
        "onb-s2": { result: "通过", comment: "材料齐全，同意入职" },
        "onb-s3": { workstation: "B 区", device: "笔记本", accessCard: true },
      },
      createdAt: daysAgo(9),
      updatedAt: daysAgo(7),
    },
    {
      id: 3,
      workflowId: 2,
      workflowName: "报销审批流程",
      title: "王五 7 月差旅报销",
      creator: "运营小王",
      assignee: "超级管理员",
      steps: reimbursement.steps,
      currentStep: 2,
      status: "processing",
      formData: {
        "rmb-s1": {
          amount: 2680,
          type: "差旅费",
          reason: "赴上海客户现场出差",
          invoiceNo: "INV-20260728-001",
        },
        "rmb-s2": { agree: "同意", comment: "费用合理" },
      },
      createdAt: daysAgo(2),
      updatedAt: daysAgo(1),
    },
    {
      id: 4,
      workflowId: 3,
      workflowName: "项目立项流程",
      title: "智能客服系统立项",
      creator: "超级管理员",
      assignee: "运营小王",
      steps: kickoff.steps,
      currentStep: 0,
      status: "processing",
      formData: {},
      createdAt: daysAgo(0),
      updatedAt: daysAgo(0),
    },
    {
      id: 5,
      workflowId: 2,
      workflowName: "报销审批流程",
      title: "赵六办公用品报销",
      creator: "运营小王",
      assignee: "超级管理员",
      steps: reimbursement.steps,
      currentStep: 1,
      status: "cancelled",
      formData: {
        "rmb-s1": { amount: 360, type: "办公费", reason: "购买键盘鼠标", invoiceNo: "" },
      },
      createdAt: daysAgo(4),
      updatedAt: daysAgo(3),
    },
  ];
}

function seedConfigs(): PlatformConfig[] {
  return [
    {
      key: "site.name",
      group: "basic",
      label: "系统名称",
      type: "string",
      value: "WebPros Admin",
      description: "显示在登录页、侧边栏与浏览器标题",
    },
    {
      key: "site.footer",
      group: "basic",
      label: "页脚版权",
      type: "string",
      value: "WebPros Admin ©2026 · Powered by React + Ant Design",
      description: "显示在页面底部",
    },
    {
      key: "security.watermark",
      group: "security",
      label: "开启页面水印",
      type: "boolean",
      value: false,
      description: "在内容区域显示水印，用于安全审计",
    },
    {
      key: "security.watermarkText",
      group: "security",
      label: "水印文字",
      type: "string",
      value: "WebPros Admin",
      description: "留空时默认显示当前用户名",
    },
    {
      key: "security.loginLimit",
      group: "security",
      label: "登录失败次数限制",
      type: "number",
      value: 5,
      description: "连续失败达到次数后临时锁定账号",
    },
    {
      key: "feature.multiTab",
      group: "feature",
      label: "多标签页导航",
      type: "boolean",
      value: true,
      description: "关闭后不再显示标签页栏",
    },
    {
      key: "feature.menuSearch",
      group: "feature",
      label: "菜单快捷搜索",
      type: "boolean",
      value: true,
      description: "顶栏搜索按钮与 Ctrl+K 快捷方式",
    },
    {
      key: "feature.notification",
      group: "feature",
      label: "消息中心",
      type: "boolean",
      value: true,
      description: "顶栏铃铛与未读角标",
    },
  ];
}

function seedNotices(): NoticeItem[] {
  return [
    {
      id: 1,
      title: "系统升级维护通知",
      content: "本周六 02:00-04:00 进行系统升级维护，期间服务将短暂不可用，请提前保存工作。",
      type: "notice",
      pinned: true,
      status: 1,
      publisher: "超级管理员",
      createdAt: daysAgo(0),
    },
    {
      id: 2,
      title: "2026 年中秋节放假安排",
      content: "根据国务院办公厅通知，中秋节放假调休安排已发布，请各部门提前做好工作交接。",
      type: "announcement",
      pinned: true,
      status: 1,
      publisher: "超级管理员",
      createdAt: daysAgo(1),
    },
    {
      id: 3,
      title: "v1.2.0 版本更新说明",
      content: "新增消息中心、主题色定制与菜单搜索（Ctrl+K），优化多标签页交互体验。",
      type: "update",
      pinned: false,
      status: 1,
      publisher: "超级管理员",
      createdAt: daysAgo(3),
    },
    {
      id: 4,
      title: "办公区域消防演练通知",
      content: "定于下周三下午进行消防应急疏散演练，请全体员工配合参与。",
      type: "notice",
      pinned: false,
      status: 1,
      publisher: "运营小王",
      createdAt: daysAgo(5),
    },
    {
      id: 5,
      title: "新员工入职培训安排（草稿）",
      content: "入职培训将于每周五上午举行，内容涵盖公司制度与常用工具使用。",
      type: "announcement",
      pinned: false,
      status: 0,
      publisher: "运营小王",
      createdAt: daysAgo(6),
    },
  ];
}

/** 生成渐变占位图（SVG dataURL，无需真实图片文件） */
function svgSlide(from: string, to: string, text: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="480"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="1200" height="480" fill="url(#g)"/><text x="600" y="260" font-size="64" fill="#ffffff" font-family="sans-serif" text-anchor="middle" font-weight="bold">${text}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function seedSlides(): SlideItem[] {
  return [
    {
      id: 1,
      title: "全新 WebPros Admin 上线",
      description: "开箱即用的中后台前端解决方案",
      image: svgSlide("#165dff", "#0ea5e9", "WebPros Admin"),
      link: "/dashboard",
      sort: 1,
      status: 1,
      createdAt: daysAgo(10),
    },
    {
      id: 2,
      title: "任务工作流全新升级",
      description: "可视化编排流程步骤与动态表单",
      image: svgSlide("#7c3aed", "#a855f7", "Workflow"),
      link: "/workflow/define",
      sort: 2,
      status: 1,
      createdAt: daysAgo(8),
    },
    {
      id: 3,
      title: "文档中心开放",
      description: "团队文档统一归档、分享与下载",
      image: svgSlide("#0ea5e9", "#10b981", "Docs"),
      link: "/docs",
      sort: 3,
      status: 1,
      createdAt: daysAgo(6),
    },
    {
      id: 4,
      title: "中秋活动预告（草稿）",
      description: "敬请期待",
      image: svgSlide("#f59e0b", "#ef4444", "Coming Soon"),
      link: "/notices",
      sort: 4,
      status: 0,
      createdAt: daysAgo(2),
    },
  ];
}

function seed(): MockDB {
  const workflows = seedWorkflows();
  return {
    users: seedUsers(),
    roles: seedRoles(),
    menus: seedMenus(),
    logs: seedLogs(),
    docs: seedDocs(),
    workflows,
    tasks: seedTasks(workflows),
    configs: seedConfigs(),
    notices: seedNotices(),
    slides: seedSlides(),
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
