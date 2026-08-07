import type { PageParams, PageResult, Status, SystemUser } from "@/types";
import { request } from "./request";

export interface UserQuery {
  username?: string;
  phone?: string;
  status?: Status;
}

export type UserFormValues = Omit<SystemUser, "id" | "createdAt" | "avatar">;

export const getUserPage = (params: UserQuery & PageParams) =>
  request<PageResult<SystemUser>>({ url: "/user/page", params });

export const createUser = (data: UserFormValues) =>
  request<SystemUser>({ url: "/user", method: "POST", data });

export const updateUser = (id: number, data: UserFormValues) =>
  request<SystemUser>({ url: `/user/${id}`, method: "PUT", data });

export const updateUserStatus = (id: number, status: Status) =>
  request<null>({ url: `/user/${id}/status`, method: "PATCH", data: { status } });

export const resetUserPassword = (id: number) =>
  request<null>({ url: `/user/${id}/password`, method: "PATCH" });

export const deleteUsers = (ids: number[]) =>
  request<null>({ url: "/user", method: "DELETE", data: { ids } });
