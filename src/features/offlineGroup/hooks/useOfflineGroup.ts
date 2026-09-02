import { useQuery } from "@tanstack/react-query";
import { scanOfflineGroup } from "../services/offlineGroupService";

export const useScanOfflineGroup = (token: string | null) => {
  return useQuery({
    queryKey: ["offlineGroupScan", token],
    queryFn: () => scanOfflineGroup(token!),
    enabled: !!token,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 mins
  });
};
