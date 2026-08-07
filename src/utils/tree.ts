export interface TreeNodeLike {
  id: number;
  parentId: number;
}

export type TreeNode<T> = T & { children: TreeNode<T>[] };

/** 扁平列表转树（parentId === 0 视为根节点） */
export function listToTree<T extends TreeNodeLike>(list: T[]): TreeNode<T>[] {
  const map = new Map<number, TreeNode<T>>();
  for (const item of list) {
    map.set(item.id, { ...item, children: [] });
  }
  const roots: TreeNode<T>[] = [];
  for (const node of map.values()) {
    const parent = node.parentId === 0 ? undefined : map.get(node.parentId);
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}
