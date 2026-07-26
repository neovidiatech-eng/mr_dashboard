import api from "../../../lib/axios";
import { TeacherProfileResponse } from "../../../types/profile";

export const getTeacherProfile = async (): Promise<TeacherProfileResponse> => {
  const response = await api.get<TeacherProfileResponse>("/teacher/profile");
  return response.data;
};