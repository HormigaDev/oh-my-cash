import "vue-router";

export {};

declare module "vue-router" {
  interface RouteMeta {
    requiresAuth?: boolean;
    titleKey?: string;
  }
}
