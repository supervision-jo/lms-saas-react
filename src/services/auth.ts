/* eslint-disable @typescript-eslint/no-explicit-any */
import { NavigateFunction } from "react-router";
import { ACCESS_TOKEN, USER_KEY } from "../utils/constants";

export function getStoredTokens(): string | null {
  try {
    const tokens = localStorage.getItem(ACCESS_TOKEN);
    return tokens ? JSON.parse(tokens) : null;
  } catch {
    return null;
  }
}

export async function storeTokens(
  tokens: string,
  navigate?: NavigateFunction,
  setIsAuthenticated?: () => void
): Promise<void> {
  await localStorage.setItem(ACCESS_TOKEN, JSON.stringify(tokens));

  if (setIsAuthenticated) setIsAuthenticated();

  if (navigate) navigate("/");
}

export async function removeTokens(
  navigate?: NavigateFunction,
  setIsAuthenticated?: () => void
): Promise<void> {
  await localStorage.removeItem(ACCESS_TOKEN);

  if (setIsAuthenticated) setIsAuthenticated();

  if (navigate) navigate("/", { replace: true });
}

export function isAuthenticated(): boolean {
  // return !!getStoredTokens();
  return !!readUserFromStorage();
}

export function readUserFromStorage(): any | null {
  const raw = localStorage.getItem(USER_KEY);
  try {
    const u = JSON.parse(raw as string);
    if (u && typeof u === "object") return u as any;
  } catch {
    console.log("no user logged in");
  }
  return null;
}

export const roleOf = (u: any | null): string | null =>
  u?.type?.name?.toLowerCase?.() ?? null;
