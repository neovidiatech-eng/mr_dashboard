import api from "../../../lib/axios"
import { StudentProfileResponse, UpdateProfile } from "../../../types/profile"

export const getStudentProfile = async (): Promise<StudentProfileResponse> => {
    const response = await api.get("/student/profile");
    return response.data;
}

export const updateStudentProfile = async (data: UpdateProfile): Promise<StudentProfileResponse> => {
    const response = await api.patch("/student/profile/update-profile", data);
    return response.data;
}
