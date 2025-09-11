// src/services/auth.ts
import { NavigateFunction } from "react-router";
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  ACCESS_TOKEN_EXPIRES_AT_KEY,
  USER_KEY,
  TOKEN_TTL_MS,
  API_ENDPOINTS,
  BASE_URL,
} from "../utils/constants";
import axios from "axios";

// ---- Utilities
function decodeJwtExp(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );
    // JWT exp is in seconds
    return typeof json?.exp === "number" ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}

// ---- Getters
export function getAccessToken(): string | null {
  try {
    const raw = localStorage.getItem(ACCESS_TOKEN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getRefreshToken(): string | null {
  try {
    const raw = localStorage.getItem(REFRESH_TOKEN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getAccessExp(): number | null {
  const raw = localStorage.getItem(ACCESS_TOKEN_EXPIRES_AT_KEY);
  return raw ? Number(raw) : null;
}

export function isAccessExpired(leewayMs = 30_000): boolean {
  // leeway: refresh slightly before actual expiry
  const exp = getAccessExp();
  if (!exp) return true;
  return Date.now() + leewayMs >= exp;
}

// ---- Setters
export async function storeTokens(params: {
  access: string;
  refresh: string;
  user?: any;
  navigate?: NavigateFunction;
  setIsAuthenticated?: (v: boolean) => void;
}): Promise<void> {
  const { access, refresh, user, navigate, setIsAuthenticated } = params;

  const exp =
    decodeJwtExp(access) ??
    Date.now() + (typeof TOKEN_TTL_MS === "number" ? TOKEN_TTL_MS : 0);

  localStorage.setItem(ACCESS_TOKEN_KEY, JSON.stringify(access));
  localStorage.setItem(REFRESH_TOKEN_KEY, JSON.stringify(refresh));
  localStorage.setItem(ACCESS_TOKEN_EXPIRES_AT_KEY, String(exp));

  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  if (setIsAuthenticated) setIsAuthenticated(true);
  if (navigate) navigate("/");
}

export async function removeTokens(
  navigate?: NavigateFunction,
  setIsAuthenticated?: (v: boolean) => void
): Promise<void> {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ACCESS_TOKEN_EXPIRES_AT_KEY);
  localStorage.removeItem(USER_KEY);

  if (setIsAuthenticated) setIsAuthenticated(false);
  if (navigate) navigate("/login", { replace: true });
}

// ---- Refresh (dedup concurrent calls)
let refreshingPromise: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  if (!refreshingPromise) {
    refreshingPromise = axios
      .post(BASE_URL + API_ENDPOINTS.refreshToken, { refresh })
      .then((res) => {
        // your API may return {tokens:{access,...}} or {access: "..."}
        const newAccess =
          res.data?.data?.tokens?.access ??
          res.data?.tokens?.access ??
          res.data?.access ??
          null;

        if (!newAccess) throw new Error("No access token in refresh response");

        const exp = decodeJwtExp(newAccess) ?? Date.now() + 5 * 60_000; // fallback 5min

        localStorage.setItem(ACCESS_TOKEN_KEY, JSON.stringify(newAccess));
        localStorage.setItem(ACCESS_TOKEN_EXPIRES_AT_KEY, String(exp));

        return newAccess as string;
      })
      .catch(() => {
        // refresh failed → force logout
        removeTokens();
        return null;
      })
      .finally(() => {
        refreshingPromise = null;
      });
  }
  return refreshingPromise;
}

export function isAuthenticated(): boolean {
  const access = getAccessToken();
  if (!access) return false;
  return !isAccessExpired(0);
}

export function readUserFromStorage(): any | null {
  const raw = localStorage.getItem(USER_KEY);
  try {
    const u = JSON.parse(raw as string);
    return u && typeof u === "object" ? (u as any) : null;
  } catch {
    return null;
  }
}

export const roleOf = (u: User | null): "student" | "instructor" =>
  u?.is_student ? "student" : "instructor";
