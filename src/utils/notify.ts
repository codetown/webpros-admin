import type { App } from "antd";

type MessageApi = ReturnType<typeof App.useApp>["message"];

let messageApi: MessageApi | null = null;

/** 在应用根部绑定 antd message 实例，使请求层等非组件代码也能弹出提示 */
export function bindMessage(api: MessageApi) {
  messageApi = api;
}

export const notify = {
  success: (content: string) => messageApi?.success(content),
  error: (content: string) => messageApi?.error(content),
  warning: (content: string) => messageApi?.warning(content),
  info: (content: string) => messageApi?.info(content),
};
