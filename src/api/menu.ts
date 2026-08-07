import type { MenuItem } from "@/types";
import { request } from "./request";

export type MenuFormValues = Omit<MenuItem, "id">;

export const getMenuList = () => request<MenuItem[]>({ url: "/menu/list" });

export const createMenu = (data: MenuFormValues) =>
  request<MenuItem>({ url: "/menu", method: "POST", data });

export const updateMenu = (id: number, data: MenuFormValues) =>
  request<MenuItem>({ url: `/menu/${id}`, method: "PUT", data });

export const deleteMenu = (id: number) => request<null>({ url: `/menu/${id}`, method: "DELETE" });
