import { get } from "../api";
import { API_ENDPOINTS } from "../utils/constants";

export async function fetchSettings(): Promise<AppSettings> {
  const res = await get(API_ENDPOINTS.settings);
  const data = res?.data?.data ?? res?.data ?? res;
  return data as AppSettings;
}
