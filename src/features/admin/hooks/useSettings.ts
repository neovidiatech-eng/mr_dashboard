import { UpdateSettingsRequest } from "../../../types/settings";
import { getSettings, updateSettings } from "../services/SettingsServices";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useSettings = () => {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['settings'],
        queryFn: getSettings,
    });

    const updateSettingsMutation = useMutation({
        mutationFn: (data: UpdateSettingsRequest) => updateSettings(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
        },
    });

    return {
        settings: data?.data,
        isLoading,
        updateSettings: updateSettingsMutation.mutateAsync,
    };
}