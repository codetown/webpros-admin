import type { RoleItem } from "@/types";
import { request } from "./request";

export type RoleFormValues = Pick<RoleItem, "name" | "code" | "description" | "status">;

export const getRoleList = () => request<RoleItem[]>({ url: "/role/list" });

export const createRole = (data: RoleFormValues) =>
  request<RoleItem>({ url: "/role", method: "POST", data });

export const updateRole = (id: number, data: RoleFormValues) =>
  request<RoleItem>({ url: `/role/${id}`, method: "PUT", data });

export const updateRolePermissions = (id: number, permissions: string[]) =>
  request<null>({ url: `/role/${id}/permissions`, method: "PUT", data: { permissions } });

export const deleteRole = (id: number) => request<null>({ url: `/role/${id}`, method: "DELETE" });
