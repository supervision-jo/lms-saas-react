import { get } from "@/api/platform/userIndex";
import { QueryKey, useQuery } from "@tanstack/react-query";
import { AxiosRequestConfig } from "axios";

export const useCustomQuery = (
  endpoint: string,
  queryKey: QueryKey,
  config?: AxiosRequestConfig,
  enabled?: boolean
) => {
  return useQuery({
    queryKey,
    queryFn: () => get(endpoint, config),
    enabled,
  });
};
