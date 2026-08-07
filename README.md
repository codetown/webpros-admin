# WebPros Admin

开箱即用的通用中后台前端解决方案，以产品级标准打造：完整的 RBAC 权限模型、多标签页工作台、暗黑主题、消息中心与文档管理，帮助你快速交付企业级后台系统。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.2-61daff.svg)
![Ant Design](https://img.shields.io/badge/Ant%20Design-6.5-0170fe.svg)
![Vite](https://img.shields.io/badge/Vite-8.2-646cff.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178c6.svg)
![Biome](https://img.shields.io/badge/Biome-2.5-60a5fa.svg)

## 特性

### **架构与工程**

- 全量最新技术栈：React 19 / Ant Design 6 / React Router 7 / Vite 8（Rolldown 引擎）/ TypeScript 7 / Biome 2
- 路由级代码分割 + vendor 分包缓存策略，第三方库按需加载（antd ESM tree-shaking、Excel 导出动态导入）
- RBAC 权限模型：路由级鉴权 + 按钮级鉴权（`Authorized` 组件 / `hasPermission`），菜单按权限动态过滤
- Zustand 四大 Store（auth / app / tabs / notification）全部 persist 持久化
- 内置可持久化的 Mock 数据层（localStorage），一行环境变量切换真实后端

### **功能**

- 登录鉴权：token 持久化、登录回跳、演示账号一键填充
- 多标签页导航：固定标签、关闭当前 / 其他 / 全部，右键菜单，跨刷新保留
- 暗黑模式：跟随系统 / 手动切换，首屏无闪烁（FOUC 防护）
- 主题色定制：6 套预设品牌色，antd token 与 CSS 变量双通道实时生效
- 菜单快捷搜索：`Ctrl + K` 唤起，按权限过滤
- 消息中心：未读角标、单条 / 全部已读、清空
- 锁屏：实时时钟 + 密码解锁，状态跨刷新持久化
- 文档管理：拖拽多文件上传、分类归档、下载 / 重命名 / 删除、下载计数
- Excel 导出：SheetJS 生成真实 `.xlsx`（用户列表全量导出 / 操作日志导出），自动列宽
- 控制台：渐变欢迎横幅、统计卡（渐变图标 + SVG 迷你趋势图）、部门分布、系统信息
- 用户 / 角色 / 菜单 / 操作日志四大系统管理模块
- 个人设置：头像上传、资料维护、密码修改、偏好设置
- 响应式布局、面包屑、全屏、页面水印、返回顶部

## 技术栈

| 分类 | 选型 |
| --- | --- |
| 构建工具 | Vite 8（Rolldown）+ Bun |
| 代码规范 | Biome 2（Lint + Format + Import 排序，零 ESLint / Prettier 依赖） |
| 框架 | React 19 + TypeScript 7（strict 模式） |
| 路由 | React Router 7（懒加载 + 权限守卫） |
| 状态 | Zustand 5 |
| UI | Ant Design 6（CSS 变量主题 + 暗黑模式） |
| 数据处理 | dayjs + xlsx（SheetJS） |

## 快速开始

要求 [Bun](https://bun.sh) >= 1.1。

```bash
git clone https://github.com/<你的用户名>/webpros-admin.git
cd webpros-admin

bun install        # 安装依赖
bun run dev        # 启动开发服务器 http://localhost:5173
bun run build      # 类型检查 + 生产构建
bun run preview    # 本地预览生产构建
```

## 演示账号

| 账号 | 密码 | 角色 | 可体验 |
| --- | --- | --- | --- |
| admin | 123456 | 超级管理员 | 全部功能 |
| editor | 123456 | 运营人员 | 按钮级权限差异（无增删按钮）、用户导出、文档上传 |
| guest | 123456 | 访客 | 仅控制台，体验路由级 403 拦截 |

## 项目结构

```bash
src/
├── api/            # 接口层（与真实后端一一对应）
├── components/     # 通用组件（Authorized / PageHeader / FileIcon / LockScreen ...）
├── hooks/          # useTable / usePermission
├── layouts/        # 基础布局（侧边菜单 / 顶栏 / 多标签页 / 消息中心 / 菜单搜索）
├── mock/           # Mock 数据层（db 种子数据 + handlers 路由分发）
├── pages/          # 页面（login / dashboard / docs / system / account / exception）
├── router/         # 路由表（即菜单数据源）+ 守卫
├── store/          # Zustand stores（auth / app / tabs / notification）
├── styles/         # 全局样式（CSS 变量主题）
├── types/          # 类型定义
└── utils/          # 工具函数（notify / excel / file / format / tree）
```

## 脚本

| 命令 | 说明 |
| --- | --- |
| `bun run dev` | 启动开发服务器 |
| `bun run build` | TypeScript 类型检查 + 生产构建 |
| `bun run preview` | 预览生产构建 |
| `bun run typecheck` | 仅类型检查 |
| `bun run lint` | Biome 检查 |
| `bun run lint:fix` | Biome 检查并自动修复 |
| `bun run format` | Biome 格式化 |

## 对接真实后端

1. `.env` 中设置 `VITE_USE_MOCK = false`
2. 开发环境在 `.env.development` 配置 `VITE_PROXY_TARGET`（dev server 自动代理 `/api`）
3. 后端按 `src/types/index.ts` 中 `ApiResult<T>` 约定返回：`{ code: 0, message, data }`
4. 接口地址统一在 `src/api/*.ts` 维护，页面无需任何改动

## 按需加载与构建优化

- Ant Design 6 基于 ESM + CSS-in-JS（`@layer` 注入），组件与样式天然按需引入
- 图标自 `@ant-design/icons` 具名导入，tree-shaking 自动裁剪
- 页面组件全部 `React.lazy` 路由级懒加载，独立 chunk
- `manualChunks` 按包名精确分包：`react-vendor` / `antd-vendor` / `utils-vendor`，利用浏览器长期缓存
- xlsx 等大型库通过动态 `import()` 拆分，仅在触发导出时加载
- dayjs 按需引入 `zh-cn` locale 与 `relativeTime` 插件

## 浏览器支持

支持所有现代浏览器（Chrome / Edge / Firefox / Safari 最近两个大版本），不支持 IE。

## 参与贡献

欢迎提交 Issue 与 Pull Request：

1. Fork 本仓库并创建特性分支：`git checkout -b feat/your-feature`
2. 提交前运行 `bun run lint:fix && bun run typecheck` 确保代码规范
3. 提交信息遵循 Conventional Commits 规范（`feat:` / `fix:` / `docs:` ...）

## 许可证

[MIT](./LICENSE) © aigenpros
