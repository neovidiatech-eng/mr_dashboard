import api from "../lib/axios";
import { LecturesData, Lecture } from "../types/lectures";

export const getAllLectures = async ( ): Promise<LecturesData> => {
  const response = await api.get<LecturesData>(`materials/lectures`);
  return response.data;
};

export const getLectureById = async (id: string): Promise<Lecture> => {
  const response = await api.get<Lecture>(`/materials/lectures/${id}`);
  return response.data;
};

export const createLecture = async (data: Partial<Lecture>): Promise<Lecture> => {
  const response = await api.post<Lecture>("/materials/lectures", data);
  return response.data;
};

export const updateLecture = async (id: string, data: Partial<Lecture>): Promise<Lecture> => {
  const response = await api.patch<Lecture>(`/materials/lectures/${id}`, data);
  return response.data;
};

export const deleteLecture = async (id: string): Promise<void> => {
  await api.delete(`/materials/lectures/${id}`);
};

export const completeLecture = async (id: string): Promise<void> => {
  await api.post(`/materials/lectures/${id}/complete`);
};
