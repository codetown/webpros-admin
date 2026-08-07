import dayjs from "dayjs";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "dayjs/locale/zh-cn";
import relativeTime from "dayjs/plugin/relativeTime";
import RootApp from "./App";
import "./styles/index.css";

// dayjs 全局中文与相对时间（按需引入）
dayjs.locale("zh-cn");
dayjs.extend(relativeTime);

document.title = import.meta.env.VITE_APP_TITLE || "WebPros Admin";

const container = document.getElementById("root");
if (!container) throw new Error("找不到根节点 #root");

createRoot(container).render(
  <StrictMode>
    <RootApp />
  </StrictMode>,
);
