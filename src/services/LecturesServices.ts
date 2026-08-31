import api from "../lib/axios";
import { LecturesData, Lecture, CreateLecture } from "../types/lectures";

export const getAllLectures = async ( ): Promise<LecturesData> => {
  const response = await api.get<LecturesData>(`materials/lectures`);
  return response.data;
};

export const getLectureById = async (id: string): Promise<Lecture> => {
  const response = await api.get<Lecture>(`/materials/lectures/${id}`);
  return response.data;
};

export const createLecture = async (data: CreateLecture): Promise<Lecture> => {
  const formData = new FormData();
  
  Object.keys(data).forEach(key => {
    const value = data[key as keyof CreateLecture];
    if (value !== undefined) {
      formData.append(key, value as Blob | string);
    }
  });

  const response = await api.post<Lecture>("/materials/lectures", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const updateLecture = async (id: string, data: CreateLecture): Promise<Lecture> => {
  const formData = new FormData();
  
  Object.keys(data).forEach(key => {
    const value = data[key as keyof CreateLecture];
    if (value !== undefined) {
      formData.append(key, value as Blob | string);
    }
  });

  const response = await api.patch<Lecture>(`/materials/lectures/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deleteLecture = async (id: string): Promise<void> => {
  await api.delete(`/materials/lectures/${id}`);
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
