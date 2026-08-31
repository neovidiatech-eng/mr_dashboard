import api from "../lib/axios";
import { LecturesData, Lecture } from "../types/lectures";

export const getAllLectures = async ( ): Promise<LecturesData> => {
  const response = await api.get<LecturesData>(`/materials/lectures`);
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
  try {
    await api.delete(`/materials/lectures/${id}`);
  } catch (err: any) {
    if (err?.response?.status === 404) {
      return;
    }
    throw err;
  }
};

export const completeLecture = async (id: string): Promise<void> => {
  await api.post(`/materials/lectures/${id}/complete`);
};

export const updateLectureProgress = async (
  id: string,
  position: number,
  duration?: number,
): Promise<void> => {
  await api.patch(`/materials/lectures/${id}/progress`, { position, duration });
};
