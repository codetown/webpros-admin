import type { LogItem, PageParams, PageResult, Status } from "@/types";
import { request } from "./request";

export interface LogQuery {
  username?: string;
  status?: Status;
  startTime?: string;
  endTime?: string;
}

export const getLogPage = (params: LogQuery & PageParams) =>
  request<PageResult<LogItem>>({ url: "/log/page", params });
