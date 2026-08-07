import type { TableProps } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PageParams, PageResult } from "@/types";

interface UseTableOptions<P> {
  defaultParams?: P;
  pageSize?: number;
}

/**
 * 通用表格 Hook：统一管理加载态、分页、搜索参数与刷新
 */
export function useTable<T extends object, P extends object = Record<string, unknown>>(
  fetcher: (params: P & PageParams) => Promise<PageResult<T>>,
  options: UseTableOptions<P> = {},
) {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(options.pageSize ?? 10);
  const paramsRef = useRef<P>((options.defaultParams ?? {}) as P);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const run = useCallback(async (nextPage: number, nextSize: number) => {
    setLoading(true);
    try {
      const result = await fetcherRef.current({
        ...paramsRef.current,
        page: nextPage,
        pageSize: nextSize,
      } as P & PageParams);
      setDataSource(result.list);
      setTotal(result.total);
    } catch {
      // 错误提示已由请求层统一处理
    } finally {
      setLoading(false);
    }
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: 仅需在挂载时执行一次初始加载
  useEffect(() => {
    run(1, options.pageSize ?? 10);
  }, []);

  /** 按条件搜索并回到第一页 */
  const onSearch = useCallback(
    (params: P) => {
      paramsRef.current = params;
      setPage(1);
      run(1, pageSize);
    },
    [pageSize, run],
  );

  /** 清空搜索条件 */
  const onReset = useCallback(() => {
    paramsRef.current = {} as P;
    setPage(1);
    run(1, pageSize);
  }, [pageSize, run]);

  /** 以当前分页与条件重新加载 */
  const refresh = useCallback(() => run(page, pageSize), [page, pageSize, run]);

  /** 获取当前搜索条件（用于导出等场景） */
  const getParams = useCallback(() => ({ ...paramsRef.current }), []);

  const onChange: TableProps<T>["onChange"] = (pagination) => {
    const next = pagination.current ?? 1;
    const size = pagination.pageSize ?? pageSize;
    setPage(next);
    setPageSize(size);
    run(next, size);
  };

  const tableProps: TableProps<T> = {
    rowKey: "id",
    loading,
    dataSource,
    pagination: {
      current: page,
      pageSize,
      total,
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: (value) => `共 ${value} 条`,
    },
    onChange,
  };

  return { tableProps, onSearch, onReset, refresh, getParams };
}
