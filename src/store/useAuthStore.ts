import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loginApi, logoutApi } from "@/api/auth";
import type { LoginParams, UserInfo } from "@/types";
import { useTabsStore } from "./useTabsStore";

interface AuthState {
  token: string;
  user: UserInfo | null;
  login: (params: LoginParams) => Promise<UserInfo>;
  logout: () => void;
  setUser: (user: UserInfo) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: "",
      user: null,
      login: async (params) => {
        const { token, user } = await loginApi(params);
        set({ token, user });
        return user;
      },
      logout: () => {
        logoutApi().catch(() => undefined);
        useTabsStore.getState().reset();
        set({ token: "", user: null });
      },
      setUser: (user) => set({ user }),
    }),
    {
      name: "webpros-auth",
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
);

/** 供非组件代码使用的权限判断 */
export function hasPermission(perm?: string): boolean {
  if (!perm) return true;
  const { user } = useAuthStore.getState();
  const permissions = user?.permissions ?? [];
  return permissions.includes("*") || permissions.includes(perm);
}
