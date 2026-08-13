"use client";

import { login, getMe } from "./api";

const GUEST_EMAIL = "guest@example.com";
const USER_ID_KEY = "airbnb_user_id";

export async function getCurrentUserId(): Promise<number> {
  // First use the currently stored user.
  const existingId = localStorage.getItem(USER_ID_KEY);

  if (existingId) {
    const userId = Number(existingId);

    if (!Number.isNaN(userId) && userId > 0) {
      try {
        // Verify that the user still exists.
        await getMe(userId);
        return userId;
      } catch {
        // Stored user no longer exists.
        localStorage.removeItem(USER_ID_KEY);
      }
    } else {
      localStorage.removeItem(USER_ID_KEY);
    }
  }

  // No valid user found.
  // Login using the demo guest account.
  const user = await login(GUEST_EMAIL);

  localStorage.setItem(
    USER_ID_KEY,
    String(user.id)
  );

  return user.id;
}

export function setCurrentUserId(userId: number) {
  localStorage.setItem(
    USER_ID_KEY,
    String(userId)
  );
}

export function clearCurrentUser() {
  localStorage.removeItem(USER_ID_KEY);
}