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
      },
      {
        path: "categories",
        name: "categories",
        component: () => import("@/pages/CategoriesPage.vue"),
        meta: {
          requiresAuth: true,
          titleKey: "categories.title"
        }
      },
      {
        path: "recurring",
        name: "recurring",
        component: () => import("@/pages/RecurringRulesPage.vue"),
        meta: {
          requiresAuth: true,
          titleKey: "recurring.title"
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
