import type { DashboardSummary } from "@/types";
import { request } from "./request";

export const getDashboardSummary = () => request<DashboardSummary>({ url: "/dashboard/summary" });
