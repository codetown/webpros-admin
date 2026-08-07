import type { TreeProps } from "antd";
import { Button, Drawer, Space, Spin, Tree } from "antd";
import { useEffect, useState } from "react";
import { getMenuList } from "@/api/menu";
import { updateRolePermissions } from "@/api/role";
import type { MenuItem, RoleItem } from "@/types";
import { listToTree } from "@/utils/tree";

interface PermDrawerProps {
  open: boolean;
  role: RoleItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

type PermTreeNode = { title: string; key: string; children?: PermTreeNode[] };

function buildTreeData(menus: MenuItem[]): PermTreeNode[] {
  return listToTree(menus)
    .sort((a, b) => a.sort - b.sort)
    .map((node) => ({
      title: node.name,
      key: node.permission ?? `cat-${node.id}`,
      children: node.children.length > 0 ? buildTreeData(node.children) : undefined,
    }));
}

/** 权限分配抽屉：基于菜单树勾选权限标识 */
export default function PermDrawer({ open, role, onClose, onSuccess }: PermDrawerProps) {
  const [treeData, setTreeData] = useState<PermTreeNode[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !role) return;
    setLoading(true);
    getMenuList()
      .then((menus) => {
        setTreeData(buildTreeData(menus.filter((menu) => menu.status === 1)));
        setCheckedKeys(role.permissions.filter((perm) => perm !== "*"));
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [open, role]);

  const onCheck: TreeProps["onCheck"] = (keys) => {
    setCheckedKeys(Array.isArray(keys) ? (keys as string[]) : keys.checked.map(String));
  };

  const onSubmit = async () => {
    if (!role) return;
    setSaving(true);
    try {
      const permissions = checkedKeys.filter((key) => !key.startsWith("cat-"));
      await updateRolePermissions(role.id, permissions);
      onSuccess();
      onClose();
    } catch {
      // 错误提示已处理
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      title={`分配权限 - ${role?.name ?? ""}`}
      width={420}
      open={open}
      onClose={onClose}
      destroyOnHidden
      footer={
        <Space style={{ float: "right" }}>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" loading={saving} onClick={onSubmit}>
            保存
          </Button>
        </Space>
      }
    >
      <Spin spinning={loading}>
        <Tree
          checkable
          defaultExpandAll
          treeData={treeData}
          checkedKeys={checkedKeys}
          onCheck={onCheck}
        />
      </Spin>
    </Drawer>
  );
}
