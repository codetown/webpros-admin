import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface TabItem {
  key: string;
  label: string;
  closable: boolean;
}

const HOME_TAB: TabItem = { key: "/dashboard", label: "控制台", closable: false };

interface TabsState {
  tabs: TabItem[];
  activeKey: string;
  addTab: (tab: TabItem) => void;
  /** 关闭标签，返回应当激活的标签 key */
  removeTab: (key: string) => string;
  removeOtherTabs: (key: string) => void;
  removeAllTabs: () => string;
  reset: () => void;
}

export const useTabsStore = create<TabsState>()(
  persist(
    (set, get) => ({
      tabs: [HOME_TAB],
      activeKey: HOME_TAB.key,
      addTab: (tab) => {
        const { tabs } = get();
        const exists = tabs.some((item) => item.key === tab.key);
        set({
          tabs: exists ? tabs.map((item) => (item.key === tab.key ? tab : item)) : [...tabs, tab],
          activeKey: tab.key,
        });
      },
      removeTab: (key) => {
        const { tabs, activeKey } = get();
        const target = tabs.find((item) => item.key === key);
        if (target && !target.closable) return activeKey;
        const next = tabs.filter((item) => item.key !== key);
        let nextActive = activeKey;
        if (activeKey === key) {
          const index = tabs.findIndex((item) => item.key === key);
          nextActive = next[Math.min(index, next.length - 1)]?.key ?? HOME_TAB.key;
        }
        set({ tabs: next, activeKey: nextActive });
        return nextActive;
      },
      removeOtherTabs: (key) => {
        const { tabs } = get();
        set({
          tabs: tabs.filter((item) => item.closable === false || item.key === key),
          activeKey: key,
        });
      },
      removeAllTabs: () => {
        const kept = get().tabs.filter((item) => item.closable === false);
        const first = kept[0]?.key ?? HOME_TAB.key;
        set({ tabs: kept, activeKey: first });
        return first;
      },
      reset: () => set({ tabs: [HOME_TAB], activeKey: HOME_TAB.key }),
    }),
    {
      name: "webpros-tabs",
    },
  ),
);
