import { useCallback, useEffect, useRef, useState } from "react";

/** 非分页列表 Hook：加载态 + 数据源 + 刷新（用于角色/菜单/工作流定义等） */
export function useList<T>(fetcher: () => Promise<T[]>) {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<T[]>([]);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setDataSource(await fetcherRef.current());
    } catch {
      // 错误提示已由请求层处理
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { loading, dataSource, refresh };
}
