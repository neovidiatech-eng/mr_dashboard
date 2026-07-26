import api from "../../../lib/axios";
import { CreateTeacherReport, Insights, TeacherReportResponse, TeacherReportsResponse } from "../../../types/reports";

export const getTeacherReports = async (): Promise<TeacherReportsResponse> => {
  const response = await api.get("/teacher/weekly-reports/my-reports");
  return response.data;
};

export const getTeacherReportById = async (id: string): Promise<TeacherReportResponse> => {
  const response = await api.get(`/teacher/weekly-reports/${id}`);
  return response.data;
};

export const getTeacherInsights = async (params?: { weekStarting: string; weekEnding: string }): Promise<Insights> => {
  const response = await api.get("/teacher/weekly-reports/metrics", { params });
  return response.data;
};

export const addTeacherReport = async (data: CreateTeacherReport): Promise<TeacherReportResponse> => {
  const response = await api.post("/teacher/weekly-reports", data);
  return response.data;
};

export const updateTeacherReport = async (id: string, data: Partial<CreateTeacherReport>): Promise<TeacherReportResponse> => {
  const response = await api.patch(`/teacher/weekly-reports/${id}`, data);
  return response.data;
};

