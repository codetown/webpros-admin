import type {
  PageParams,
  PageResult,
  TaskInstance,
  TaskStatus,
  Workflow,
  WorkflowStep,
} from "@/types";
import { request } from "./request";

export type WorkflowFormValues = Pick<Workflow, "name" | "code" | "description" | "status"> & {
  steps: WorkflowStep[];
};

export interface TaskQuery {
  title?: string;
  status?: TaskStatus;
}

export interface TaskCreateValues {
  workflowId: number;
  title: string;
  assignee?: string;
  creator: string;
}

export const getWorkflowList = () => request<Workflow[]>({ url: "/workflow/list" });

export const createWorkflow = (data: WorkflowFormValues) =>
  request<Workflow>({ url: "/workflow", method: "POST", data });

export const updateWorkflow = (id: number, data: WorkflowFormValues) =>
  request<Workflow>({ url: `/workflow/${id}`, method: "PUT", data });

export const deleteWorkflow = (id: number) =>
  request<null>({ url: `/workflow/${id}`, method: "DELETE" });

export const duplicateWorkflow = (id: number) =>
  request<Workflow>({ url: `/workflow/${id}/duplicate`, method: "POST" });

export const getTaskPage = (params: TaskQuery & PageParams) =>
  request<PageResult<TaskInstance>>({ url: "/task/page", params });

export const createTask = (data: TaskCreateValues) =>
  request<TaskInstance>({ url: "/task", method: "POST", data });

export const submitTaskStep = (id: number, data: Record<string, unknown>) =>
  request<TaskInstance>({ url: `/task/${id}/submit`, method: "POST", data: { data } });

export const cancelTask = (id: number) =>
  request<TaskInstance>({ url: `/task/${id}/cancel`, method: "POST" });
