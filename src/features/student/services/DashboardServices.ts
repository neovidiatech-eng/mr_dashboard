import api from "../../../lib/axios";
import { StudentDashboardResponse } from "../../../types/studentDashboard";
export async function getStudentDashboard() : Promise<StudentDashboardResponse> {
    const response = await api.get("/student/dashboard");
    return response.data;
}