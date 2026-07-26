import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createConversation, getConversationMessages, getConversations } from "../services/chatServices";

export const useConversations = () => {
  return useQuery({
    queryKey: ["messages"],
    queryFn: () => getConversations(),
  });
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { teacherId: string, studentId: string }) => createConversation(data),
    onSuccess: () => {
      
      queryClient.invalidateQueries({
        queryKey: ["messages"],
      });

    },
    onError: (error) => {
      console.log(error);
    },
  });
};

export const useMessages = (conversationId?: string) => {
    return useQuery({
        queryKey: ["messages", conversationId],
        queryFn: () => getConversationMessages(conversationId!),
        enabled: !!conversationId,
    });
}
