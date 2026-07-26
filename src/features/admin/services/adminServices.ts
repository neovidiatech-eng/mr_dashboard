import axiosInstance from '../../../lib/axios';
import { AdminDashboardResponse } from '../../../types/adminDashboard';

export const getAdminDashboardData = async (): Promise<AdminDashboardResponse> => {
  const response = await axiosInstance.get('/system/dashboard');
  return response.data;
};
