import { del, get, post } from "./client";
import type { DiaryEntry } from "../types";

export const getDiary = () => get<DiaryEntry[]>("/diary");
export const createDiary = (text: string) => post<DiaryEntry>("/diary", { text });
export const deleteDiary = (id: string) => del(`/diary/${id}`);
