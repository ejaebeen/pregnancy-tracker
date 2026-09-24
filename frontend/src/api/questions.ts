import { del, get, patch, post } from "./client";
import type { DoctorQuestion } from "../types";

export const getQuestions = () => get<DoctorQuestion[]>("/questions");
export const createQuestion = (text: string) =>
  post<DoctorQuestion>("/questions", { text });
export const toggleQuestion = (id: string, isAnswered: boolean) =>
  patch<DoctorQuestion>(`/questions/${id}`, { is_answered: isAnswered });
export const deleteQuestion = (id: string) => del(`/questions/${id}`);
