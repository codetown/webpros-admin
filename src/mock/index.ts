import type { ApiResult, RequestOptions } from "@/types";
import { handlers, type MockContext } from "./handlers";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** 模拟网络延迟的 Mock 请求分发器 */
export async function mockRequest<T>(options: RequestOptions): Promise<ApiResult<T>> {
  await sleep(180 + Math.random() * 320);

  const method = options.method ?? "GET";
  for (const route of handlers) {
    if (route.method !== method) continue;
    const match = route.pattern.exec(options.url);
    if (!match) continue;

    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(options.params ?? {})) {
      if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
    }
    const ctx: MockContext = {
      query,
      body: (options.data ?? {}) as Record<string, unknown>,
      params: { ...(match.groups ?? {}) },
    };
    return route.handler(ctx) as ApiResult<T>;
  }

  return { code: 404, message: `未找到模拟接口：${method} ${options.url}`, data: null as T };
}
