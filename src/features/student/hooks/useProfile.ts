import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getStudentProfile, updateStudentProfile } from "../services/ProfileServices"
import { StudentProfileResponse, UpdateProfile } from "../../../types/profile"
import ErrorService from "../../../utils/ErrorService"

export const useProfile = (options?: any) => {
    return useQuery<StudentProfileResponse>({
        queryKey: ["profile"],
        queryFn: getStudentProfile,
        ...options
    })
}

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation<StudentProfileResponse, Error, UpdateProfile>({
        mutationFn: updateStudentProfile,
        mutationKey: ["update-profile"],
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["profile"],
            });
            ErrorService.success("Profile updated successfully");
        },
        onError: () => {
            ErrorService.error("Failed to update profile");
        },
    })
}