import api from "../../../lib/axios";
import { TeacherStudent, TeacherStudentsResponse } from "../../../types/teacherStudents";

export const getMystudents = async (): Promise<TeacherStudent[]> => {
    const res = await api.get<TeacherStudentsResponse>('/teacher/profile/my-students');
    return res.data.data;
}