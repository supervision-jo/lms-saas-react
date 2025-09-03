import { remove, edit, patch, post } from "@/api/platform/userIndex";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCustomPost = (endpoint: string, queryKey?: string[]) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: any) => post(endpoint, body),
    onSuccess: () => {
      queryKey?.forEach((key) => {
        queryClient.resetQueries({ queryKey: [key] });
      });
    },
  });
};

export const useCustomUpdate = (endpoint: string, queryKey?: string[]) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: any) => edit(endpoint, body),
    onSuccess: () => {
      queryKey?.forEach((key) => {
        queryClient.resetQueries({ queryKey: [key] });
      });
    },
  });
};

export const useCustomPatch = (endpoint: string, queryKey: string[]) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: any) => patch(endpoint, body),
    onSuccess: () => {
      queryKey?.forEach((key) => {
        queryClient.resetQueries({ queryKey: [key] });
      });
    },
  });
};

export const useCustomRemove = (endpoint: string, queryKey: string[]) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => remove(endpoint),
    onSuccess: () => {
      queryKey?.forEach((key) => {
        queryClient.resetQueries({ queryKey: [key] });
      });
    },
  });
};
