import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "login",
    component: () => import("@/pages/LoginPage.vue")
  },
  {
    path: "/",
    component: () => import("@/layouts/AppLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        redirect: { name: "dashboard" }
      },
      {
        path: "dashboard",
        name: "dashboard",
        component: () => import("@/pages/DashboardPage.vue"),
        meta: {
          requiresAuth: true,
          titleKey: "dashboard.title"
        }
      }
    ]
  },
  {
    path: "/:catchAll(.*)*",
    name: "not-found",
    component: () => import("@/pages/ErrorNotFound.vue")
  }
];

export default routes;
