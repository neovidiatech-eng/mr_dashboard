import { useQuery } from "@tanstack/react-query";
import { getTeacherProfile } from "../services/TeacherProfileServices";
import { TeacherProfileResponse } from "../../../types/profile";

export const useTeacherProfile = (options?: any) => {
  return useQuery<TeacherProfileResponse>({
    queryKey: ["teacher-profile"],
    queryFn: getTeacherProfile,
    ...options
  });
};
