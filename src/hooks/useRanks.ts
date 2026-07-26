import { useQuery } from "@tanstack/react-query";
import { getAllRanks } from "../services/RankServices";

export const useRanks = () => {
    return useQuery({
        queryKey: ["ranks"],
        queryFn: getAllRanks,
    });
}
