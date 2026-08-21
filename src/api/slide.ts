import type { SlideItem, Status } from "@/types";
import { request } from "./request";

export type SlideFormValues = Pick<
  SlideItem,
  "title" | "image" | "link" | "description" | "sort" | "status"
>;

export const getSlideList = () => request<SlideItem[]>({ url: "/slide/list" });

export const createSlide = (data: SlideFormValues) =>
  request<SlideItem>({ url: "/slide", method: "POST", data });

export const updateSlide = (id: number, data: SlideFormValues) =>
  request<SlideItem>({ url: `/slide/${id}`, method: "PUT", data });

export const updateSlideStatus = (id: number, status: Status) =>
  request<null>({ url: `/slide/${id}/status`, method: "PATCH", data: { status } });

export const deleteSlide = (id: number) => request<null>({ url: `/slide/${id}`, method: "DELETE" });
