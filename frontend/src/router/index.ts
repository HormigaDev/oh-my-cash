import { defineRouter } from "#q-app";
import {
  createMemoryHistory,
  createRouter,
  createWebHistory
} from "vue-router";

import { useAuthStore } from "@/features/auth/authStore";

import routes from "./routes";

export default defineRouter(({ store }) => {
  const createHistory = import.meta.env.QUASAR_SERVER
    ? createMemoryHistory
    : createWebHistory;

  const router = createRouter({
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE),
    routes,
    scrollBehavior: () => ({ left: 0, top: 0 })
  });

  router.beforeEach(async to => {
    const auth = useAuthStore(store);
    await auth.bootstrapSession();

    if (to.meta.requiresAuth && !auth.isAuthenticated) {
      return {
        name: "login",
        query: { redirect: to.fullPath }
      };
    }

    if (to.name === "login" && auth.isAuthenticated) {
      return { name: "dashboard" };
    }

    return true;
  });

  return router;
});
