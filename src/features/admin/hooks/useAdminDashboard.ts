import { useQuery } from '@tanstack/react-query';
import { getAdminDashboardData } from '../services/adminServices';
import { AdminDashboardResponse } from '../../../types/adminDashboard';

export const useAdminDashboard = () => {
  return useQuery<AdminDashboardResponse, Error>({
    queryKey: ['adminDashboard'],
    queryFn: getAdminDashboardData,
  });
};
