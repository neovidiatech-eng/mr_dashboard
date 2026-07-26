import { getMystudents } from "../services/MystudentsServices";
import { useQuery } from "@tanstack/react-query";

export const useMystudents = () => {
    return useQuery({
        queryKey: ["mystudents"],
        queryFn: getMystudents,
    });
}