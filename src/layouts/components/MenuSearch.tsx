import { SearchOutlined } from "@ant-design/icons";
import { Button, Empty, Input, Modal, Tooltip } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePermission } from "@/hooks/usePermission";
import { routeMetaMap } from "@/router/routes";

/** 菜单快捷搜索：Ctrl+K 唤起，按标题/路径过滤有权限的菜单 */
export default function MenuSearch() {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();
  const hasPerm = usePermission();

  const menus = useMemo(
    () =>
      [...routeMetaMap.entries()]
        .filter(([, meta]) => !meta.hidden)
        .map(([path, meta]) => ({ path, ...meta })),
    [],
  );

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return menus.filter(
      (menu) =>
        hasPerm(menu.perm) &&
        (kw === "" ||
          menu.title.toLowerCase().includes(kw) ||
          menu.path.toLowerCase().includes(kw)),
    );
  }, [menus, keyword, hasPerm]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const go = (path: string) => {
    setOpen(false);
    setKeyword("");
    navigate(path);
  };

  return (
    <>
      <Tooltip title="搜索菜单（Ctrl+K）">
        <Button
          type="text"
          aria-label="搜索菜单"
          icon={<SearchOutlined />}
          onClick={() => setOpen(true)}
        />
      </Tooltip>
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        closable={false}
        width={520}
        destroyOnHidden
        styles={{ body: { padding: 0 } }}
        afterOpenChange={(visible) => {
          if (!visible) setKeyword("");
        }}
      >
        <div style={{ padding: "12px 16px 0" }}>
          <Input
            size="large"
            autoFocus
            variant="borderless"
            prefix={<SearchOutlined />}
            placeholder="搜索菜单…"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
        </div>
        <div className="menu-search-list">
          {filtered.map((menu) => (
            <button
              key={menu.path}
              type="button"
              className="menu-search-item"
              onClick={() => go(menu.path)}
            >
              <span className="menu-search-icon">{menu.icon}</span>
              <span>{menu.title}</span>
              <span className="menu-search-path">{menu.path}</span>
            </button>
          ))}
          {filtered.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="没有匹配的菜单" />
          ) : null}
        </div>
      </Modal>
    </>
  );
}
