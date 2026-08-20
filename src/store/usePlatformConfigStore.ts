import { create } from "zustand";
import { getPlatformConfig, savePlatformConfig } from "@/api/config";
import type { PlatformConfig } from "@/types";

interface PlatformConfigState {
  configs: PlatformConfig[];
  loaded: boolean;
  load: () => Promise<void>;
  save: (values: Record<string, unknown>) => Promise<void>;
}

export const usePlatformConfigStore = create<PlatformConfigState>()((set) => ({
  configs: [],
  loaded: false,
  load: async () => {
    try {
      const configs = await getPlatformConfig();
      set({ configs, loaded: true });
    } catch {
      set({ loaded: true });
    }
  },
  save: async (values) => {
    const configs = await savePlatformConfig(values);
    set({ configs });
  },
}));

/** 从配置列表中读取指定 key 的值（纯函数，便于组件配合订阅使用） */
export function getConfigValue(configs: PlatformConfig[], key: string): unknown {
  return configs.find((item) => item.key === key)?.value;
}
