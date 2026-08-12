<template>
  <q-layout view="hHh LpR fFf" class="app-shell">
    <q-header class="app-header">
      <q-toolbar class="app-header__toolbar">
        <q-btn
          flat
          round
          dense
          icon="menu"
          class="app-header__menu-toggle"
          :aria-label="t('common.menu')"
          @click="drawerOpen = !drawerOpen"
        />
        <div class="app-header__mobile-brand">
          <OMCBrand compact />
        </div>
        <q-toolbar-title class="app-header__title">
          {{ pageTitle }}
        </q-toolbar-title>
        <div class="app-header__actions">
          <ThemeSwitcher />
          <UserMenu />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawerOpen"
      show-if-above
      bordered
      :width="264"
      :breakpoint="1024"
      class="app-drawer"
    >
      <div class="app-drawer__content">
        <div class="app-drawer__brand">
          <OMCBrand />
        </div>
        <nav :aria-label="t('navigation.label')">
          <q-list class="app-navigation">
            <q-item
              clickable
              exact
              :to="{ name: 'dashboard' }"
              active-class="app-navigation__item--active"
              @click="closeDrawerOnMobile"
            >
              <q-item-section avatar>
                <q-icon name="space_dashboard" />
              </q-item-section>
              <q-item-section>{{ t("navigation.dashboard") }}</q-item-section>
            </q-item>
            <q-item
              clickable
              exact
              :to="{ name: 'transactions' }"
              active-class="app-navigation__item--active"
              @click="closeDrawerOnMobile"
            >
              <q-item-section avatar>
                <q-icon name="receipt_long" />
              </q-item-section>
              <q-item-section>{{
                t("navigation.transactions")
              }}</q-item-section>
            </q-item>
            <q-item
              clickable
              exact
              :to="{ name: 'recurring' }"
              active-class="app-navigation__item--active"
              @click="closeDrawerOnMobile"
            >
              <q-item-section avatar>
                <q-icon name="event_repeat" />
              </q-item-section>
              <q-item-section>{{ t("navigation.recurring") }}</q-item-section>
            </q-item>
            <q-item
              clickable
              exact
              :to="{ name: 'categories' }"
              active-class="app-navigation__item--active"
              @click="closeDrawerOnMobile"
            >
              <q-item-section avatar>
                <q-icon name="category" />
              </q-item-section>
              <q-item-section>{{ t("navigation.categories") }}</q-item-section>
            </q-item>
            <q-item
              clickable
              exact
              :to="{ name: 'account' }"
              active-class="app-navigation__item--active"
              @click="closeDrawerOnMobile"
            >
              <q-item-section avatar><q-icon name="manage_accounts" /></q-item-section>
              <q-item-section>{{ t("navigation.account") }}</q-item-section>
            </q-item>
          </q-list>
        </nav>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { useQuasar } from "quasar";

import OMCBrand from "@/components/OMCBrand.vue";
import ThemeSwitcher from "@/components/ThemeSwitcher.vue";
import UserMenu from "@/components/UserMenu.vue";
import { useAuthStore } from "@/features/auth/authStore";
import { useThemeStore } from "@/features/preferences/themeStore";

const drawerOpen = ref(false);
const route = useRoute();
const $q = useQuasar();
const { t } = useI18n();
const auth = useAuthStore();
const theme = useThemeStore();

watch(
  () => auth.user,
  user => {
    if (user) theme.hydrate(user.theme, user.themeMode);
  },
  { immediate: true }
);

const pageTitle = computed(() =>
  route.meta.titleKey ? t(route.meta.titleKey) : t("app.name")
);

function closeDrawerOnMobile() {
  if ($q.screen.lt.md) {
    drawerOpen.value = false;
  }
}
</script>

<style scoped lang="scss">
.app-header {
  border-bottom: 0.0625rem solid var(--omc-color-divider);
  background: var(--omc-color-surface);
  color: var(--omc-color-text);
  box-shadow: none;
}

.app-header__toolbar {
  min-height: var(--omc-header-height);
  padding: 0 1rem;
}

.app-header__menu-toggle {
  margin-right: 0.5rem;
  color: var(--omc-color-text-secondary);
}

.app-header__mobile-brand {
  display: flex;
}

.app-header__title {
  display: none;
  color: var(--omc-color-text);
  font-size: 1rem;
  font-weight: 680;
}

.app-header__actions {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  margin-left: auto;
}

.app-drawer {
  background: var(--omc-color-surface);
  color: var(--omc-color-text);
}

.app-drawer__content {
  display: flex;
  height: 100%;
  flex-direction: column;
  padding: 1.25rem 1rem;
}

.app-drawer__brand {
  min-height: 4rem;
  padding: 0 0.5rem 1.25rem;
  border-bottom: 0.0625rem solid var(--omc-color-divider);
}

.app-navigation {
  padding-top: 1.25rem;
}

.app-navigation .q-item {
  min-height: 3rem;
  margin-bottom: 0.35rem;
  border-radius: var(--omc-radius-md);
  color: var(--omc-color-text-secondary);
  font-weight: 620;
}

.app-navigation__item--active {
  background: var(--omc-color-primary-soft);
  color: var(--omc-color-primary) !important;
}

@media (min-width: 64rem) {
  .app-header__toolbar {
    padding: 0 2rem;
  }

  .app-header__menu-toggle,
  .app-header__mobile-brand {
    display: none;
  }

  .app-header__title {
    display: block;
  }
}
</style>
