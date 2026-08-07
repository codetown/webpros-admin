import type { DocItem, PageParams, PageResult } from "@/types";
import { request } from "./request";

export interface DocQuery {
  name?: string;
  category?: string;
}

export interface DocUploadValues {
  name: string;
  ext: string;
  size: number;
  category: string;
  uploader: string;
  content?: string;
}

export const getDocPage = (params: DocQuery & PageParams) =>
  request<PageResult<DocItem>>({ url: "/doc/page", params });

export const createDoc = (data: DocUploadValues) =>
  request<null>({ url: "/doc", method: "POST", data });

export const getDocContent = (id: number) => request<string>({ url: `/doc/${id}` });

export const renameDoc = (id: number, name: string) =>
  request<null>({ url: `/doc/${id}`, method: "PUT", data: { name } });

export const deleteDoc = (id: number) => request<null>({ url: `/doc/${id}`, method: "DELETE" });
