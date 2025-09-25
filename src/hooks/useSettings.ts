import { useQuery } from "@tanstack/react-query";
import { fetchSettings } from "../services/settings";

export const SETTINGS_QUERY_KEY = ["settings"] as const;

export function useSettings() {
  return useQuery<AppSettings>({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: fetchSettings,
  });
}

export function useFeatureFlag(flag: BooleanFlagKey, defaultValue = false) {
  const { data, isLoading, isFetching, isError } = useSettings();

  if (!data) {
    return { enabled: defaultValue, isLoading, isFetching, isError };
  }

  const enabled = data[flag]; // boolean
  return { enabled, isLoading, isFetching, isError };
}
