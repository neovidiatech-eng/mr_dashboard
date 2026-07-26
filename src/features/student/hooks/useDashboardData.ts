import { useQuery } from "@tanstack/react-query"
import { getStudentDashboard } from "../services/DashboardServices"

export const useDashboardData = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getStudentDashboard(),
  })
}