import { Dropdown, type MenuProps, Tabs, type TabsProps } from "antd";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { routeMetaMap } from "@/router/routes";
import { useTabsStore } from "@/store/useTabsStore";

/** 多标签页导航：与路由双向同步，支持右键菜单批量关闭 */
export default function TabsNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const tabs = useTabsStore((state) => state.tabs);
  const activeKey = useTabsStore((state) => state.activeKey);
  const addTab = useTabsStore((state) => state.addTab);
  const removeTab = useTabsStore((state) => state.removeTab);
  const removeOtherTabs = useTabsStore((state) => state.removeOtherTabs);
  const removeAllTabs = useTabsStore((state) => state.removeAllTabs);

  useEffect(() => {
    const meta = routeMetaMap.get(pathname);
    addTab({
      key: pathname,
      label: meta?.title ?? "未命名页面",
      closable: meta?.affix !== true,
    });
  }, [pathname, addTab]);

  const closeTab = (key: string) => {
    const next = removeTab(key);
    if (next !== pathname) navigate(next);
  };

  const buildContextMenu = (key: string, closable: boolean): MenuProps => ({
    items: [
      { key: "close", label: "关闭当前", disabled: !closable },
      { key: "closeOthers", label: "关闭其他" },
      { key: "closeAll", label: "关闭全部" },
    ],
    onClick: ({ key: action }) => {
      if (action === "close") closeTab(key);
      else if (action === "closeOthers") removeOtherTabs(key);
      else navigate(removeAllTabs());
    },
  });

  const items: TabsProps["items"] = tabs.map((tab) => ({
    key: tab.key,
    closable: tab.closable,
    label: (
      <Dropdown menu={buildContextMenu(tab.key, tab.closable)} trigger={["contextMenu"]}>
        <span>{tab.label}</span>
      </Dropdown>
    ),
  }));

  const onEdit: TabsProps["onEdit"] = (key, action) => {
    if (action === "remove" && typeof key === "string") closeTab(key);
  };

  return (
    <div className="tabs-nav">
      <Tabs
        size="small"
        type="editable-card"
        hideAdd
        activeKey={activeKey}
        onChange={(key) => navigate(key)}
        onEdit={onEdit}
        items={items}
      />
    </div>
  );
}
