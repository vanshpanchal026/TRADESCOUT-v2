"use client";

export interface UserProfile {
  id: string;
  name: string;
  role: "guest" | "pro" | "institutional";
  plan: "Free" | "Pro" | "Enterprise";
  avatarText: string;
}

export const PRESET_USERS: UserProfile[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Alpha Trader",
    role: "pro",
    plan: "Pro",
    avatarText: "AT",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Beta Hedge Fund",
    role: "institutional",
    plan: "Enterprise",
    avatarText: "BH",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "Quant Desk",
    role: "pro",
    plan: "Pro",
    avatarText: "QD",
  },
];

/**
 * Returns whether a valid user login session exists in client storage.
 * Persists reliably across browser reloads.
 */
export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const loggedInFlag = localStorage.getItem("stc-logged-in");
    const persistentFlag = localStorage.getItem("stc-persistent-session");
    const activeUserId = localStorage.getItem("ts-active-user-id");
    return loggedInFlag === "true" || persistentFlag === "true" || Boolean(activeUserId);
  } catch {
    return false;
  }
}

/**
 * Retrieves the currently active user ID from client storage.
 * Returns null if not authenticated or in guest mode.
 */
export function getActiveUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("ts-active-user-id");
  } catch {
    return null;
  }
}

/**
 * Retrieves the UserProfile corresponding to the active user.
 */
export function getActiveUserProfile(): UserProfile {
  const currentId = getActiveUserId();
  if (!currentId) {
    return {
      id: "guest",
      name: "Guest Trader",
      role: "guest",
      plan: "Free",
      avatarText: "GT",
    };
  }
  const match = PRESET_USERS.find((u) => u.id === currentId);
  if (match) return match;
  return {
    id: currentId,
    name: `User ${currentId.slice(0, 6)}...`,
    role: "pro",
    plan: "Pro",
    avatarText: "CU",
  };
}

/**
 * Sets the active user ID and keeps stc-logged-in unified.
 * Dispatches a 'ts-user-changed' event across the window.
 */
export function setActiveUserId(userId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("ts-active-user-id", userId);
    localStorage.setItem("stc-logged-in", "true");
  } catch {}
  window.dispatchEvent(new CustomEvent("ts-user-changed", { detail: { userId } }));
}

/**
 * Unifies login state: sets stc-logged-in, stc-persistent-session, and ts-active-user-id,
 * and notifies all listeners via 'ts-user-changed'.
 */
export function setUserLoginSession(
  userId: string = PRESET_USERS[0].id,
  persistent: boolean = true
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("stc-logged-in", "true");
    if (persistent) {
      localStorage.setItem("stc-persistent-session", "true");
    }
    localStorage.setItem("ts-active-user-id", userId);
  } catch {}
  window.dispatchEvent(new CustomEvent("ts-user-changed", { detail: { userId } }));
}

/**
 * Clears the user login session across all auth keys.
 */
export function clearUserLoginSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("stc-logged-in");
    localStorage.removeItem("stc-persistent-session");
    localStorage.removeItem("ts-active-user-id");
  } catch {}
  window.dispatchEvent(new CustomEvent("ts-user-changed", { detail: { userId: null } }));
}

/**
 * Returns authentication headers containing the active user ID.
 * If user is unauthenticated or in guest mode, omits the x-user-id header.
 */
export function getAuthHeaders(): Record<string, string> {
  const userId = getActiveUserId();
  if (!userId) {
    return { "x-user-id": "guest" };
  }
  return {
    "x-user-id": userId,
  };
}
