import { useMutation, useQueryClient } from "@tanstack/react-query";
import { JoinSession, EndSession } from "../../../services/SessionsServices";
import { message } from "antd";

export const useJoinSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => JoinSession(id),
    onSuccess: (data) => {
      message.success("Joined session successfully");
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      if (data?.join_url) {
        window.open(data.join_url, '_blank');
      }
    },
    onError: () => {
      message.error("Failed to join session");
    }
  });
};

export const useEndSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => EndSession(id),
    onSuccess: () => {
      message.success("Session ended successfully");
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: () => {
      message.error("Failed to end session");
    }
  });
};
