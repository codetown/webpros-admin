import type { NoticeItem, PageParams, PageResult, Status } from "@/types";
import { request } from "./request";

export interface NoticeQuery {
  title?: string;
  status?: Status;
}

export type NoticeFormValues = Pick<NoticeItem, "title" | "content" | "type" | "pinned" | "status">;

export const getNoticePage = (params: NoticeQuery & PageParams) =>
  request<PageResult<NoticeItem>>({ url: "/notice/page", params });

export const getPublishedNotices = () => request<NoticeItem[]>({ url: "/notice/published" });

export const createNotice = (data: NoticeFormValues) =>
  request<NoticeItem>({ url: "/notice", method: "POST", data });

export const updateNotice = (id: number, data: NoticeFormValues) =>
  request<NoticeItem>({ url: `/notice/${id}`, method: "PUT", data });

export const deleteNotice = (id: number) =>
  request<null>({ url: `/notice/${id}`, method: "DELETE" });
