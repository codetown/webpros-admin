import type { PlatformConfig } from "@/types";
import { request } from "./request";

export const getPlatformConfig = () => request<PlatformConfig[]>({ url: "/config" });

export const savePlatformConfig = (values: Record<string, unknown>) =>
  request<PlatformConfig[]>({ url: "/config", method: "PUT", data: values });
