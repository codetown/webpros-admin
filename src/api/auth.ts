import type { LoginParams, LoginResult, UserInfo } from "@/types";
import { request } from "./request";

export const loginApi = (data: LoginParams) =>
  request<LoginResult>({ url: "/auth/login", method: "POST", data });

export const logoutApi = () => request<null>({ url: "/auth/logout", method: "POST" });

export const unlockApi = (data: { username: string; password: string }) =>
  request<null>({ url: "/auth/unlock", method: "POST", data });

export const updateProfileApi = (data: Partial<UserInfo> & { username: string }) =>
  request<UserInfo>({ url: "/account/profile", method: "PUT", data });

export const changePasswordApi = (data: {
  username: string;
  oldPassword: string;
  newPassword: string;
}) => request<null>({ url: "/account/password", method: "PUT", data });
