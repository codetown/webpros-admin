import { mockRequest } from "@/mock";
import { useAuthStore } from "@/store/useAuthStore";
import type { ApiResult, RequestOptions } from "@/types";
import { notify } from "@/utils/notify";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function toQueryString(params?: object): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.append(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

/** 真实 HTTP 请求（Mock 关闭时使用） */
async function httpFetch<T>(options: RequestOptions): Promise<ApiResult<T>> {
  const { url, method = "GET", params, data, headers } = options;
  const token = useAuthStore.getState().token;

  const response = await fetch(`${BASE_URL}${url}${toQueryString(params)}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: data === undefined ? undefined : JSON.stringify(data),
  });

  if (response.status === 401) {
    useAuthStore.getState().logout();
    window.location.href = "/login";
    return { code: 401, message: "登录状态已过期，请重新登录", data: null as T };
  }
  if (!response.ok) {
    return {
      code: response.status,
      message: `服务异常（HTTP ${response.status}）`,
      data: null as T,
    };
  }
  return (await response.json()) as ApiResult<T>;
}

/** 统一请求入口：自动切换 Mock / 真实接口，统一处理业务错误码 */
export async function request<T>(options: RequestOptions): Promise<T> {
  const result = USE_MOCK ? await mockRequest<T>(options) : await httpFetch<T>(options);
  if (result.code !== 0) {
    notify.error(result.message || "请求失败");
    throw new Error(result.message);
  }
  return result.data;
}
