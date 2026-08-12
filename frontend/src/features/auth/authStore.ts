import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { createSession, destroySession, fetchSession } from "./api";
import type { AuthStatus, AuthUser, LoginCredentials } from "./types";

let pendingBootstrap: Promise<void> | null = null;

export const useAuthStore = defineStore("auth", () => {
  const status = ref<AuthStatus>("unknown");
  const user = ref<AuthUser | null>(null);
  const sessionUnavailable = ref(false);

  const isAuthenticated = computed(
    () => status.value === "authenticated" && user.value !== null
  );

  async function bootstrapSession() {
    if (status.value !== "unknown") {
      return;
    }

    if (pendingBootstrap !== null) {
      await pendingBootstrap;
      return;
    }

    pendingBootstrap = (async () => {
      try {
        const session = await fetchSession();
        user.value = session.user;
        status.value = session.user === null ? "anonymous" : "authenticated";
        sessionUnavailable.value = false;
      } catch {
        user.value = null;
        status.value = "anonymous";
        sessionUnavailable.value = true;
      } finally {
        pendingBootstrap = null;
      }
    })();

    await pendingBootstrap;
  }

  async function login(credentials: LoginCredentials) {
    const session = await createSession(credentials);

    if (session.user === null) {
      throw new Error("A successful login did not return a user");
    }

    user.value = session.user;
    status.value = "authenticated";
    sessionUnavailable.value = false;
  }

  async function logout() {
    await destroySession();
    user.value = null;
    status.value = "anonymous";
    sessionUnavailable.value = false;
  }

  return {
    status,
    user,
    sessionUnavailable,
    isAuthenticated,
    bootstrapSession,
    login,
    logout
  };
});
