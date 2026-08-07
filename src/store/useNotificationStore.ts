import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { NotificationItem } from "@/types";

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();

/** 首次使用时的种子通知（之后以持久化数据为准） */
function seedNotifications(): NotificationItem[] {
  return [
    {
      id: 1,
      type: "warning",
      title: "安全警报",
      content: "检测到新 IP 203.0.113.7 连续 3 次登录失败，已自动拦截，请注意账号安全。",
      read: false,
      createdAt: hoursAgo(1),
    },
    {
      id: 2,
      type: "info",
      title: "版本更新",
      content: "系统已升级至 v1.2.0：新增消息中心、主题色定制与菜单搜索（Ctrl+K）。",
      read: false,
      createdAt: hoursAgo(4),
    },
    {
      id: 3,
      type: "success",
      title: "导出完成",
      content: "你申请的「7 月操作日志」已导出完成，可在下载中心获取文件。",
      read: false,
      createdAt: hoursAgo(9),
    },
    {
      id: 4,
      type: "info",
      title: "任务提醒",
      content: "月度运营报表已自动生成，请前往报表中心查阅并分发。",
      read: true,
      createdAt: hoursAgo(28),
    },
    {
      id: 5,
      type: "error",
      title: "异常通知",
      content: "定时任务「历史日志归档」执行失败（超时），请检查调度服务状态。",
      read: true,
      createdAt: hoursAgo(52),
    },
    {
      id: 6,
      type: "success",
      title: "审计通过",
      content: "第三季度权限审计已完成，未发现越权配置，感谢配合。",
      read: true,
      createdAt: hoursAgo(120),
    },
  ];
}

interface NotificationState {
  items: NotificationItem[];
  markRead: (id: number) => void;
  markAllRead: () => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      items: seedNotifications(),
      markRead: (id) =>
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, read: true } : item)),
        })),
      markAllRead: () =>
        set((state) => ({ items: state.items.map((item) => ({ ...item, read: true })) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "webpros-notifications",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
