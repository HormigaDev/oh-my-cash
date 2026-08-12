<template>
  <q-btn flat round :aria-label="t('user.account')" class="user-menu__trigger">
    <q-avatar size="2.25rem" class="user-menu__avatar">
      <q-icon name="person" size="1.25rem" />
    </q-avatar>
    <q-menu anchor="bottom right" self="top right">
      <div class="user-menu__panel">
        <p class="user-menu__label">{{ t("user.signedInAs") }}</p>
        <p class="user-menu__identity">{{ identity }}</p>
      </div>
      <q-separator />
      <q-list class="user-menu__actions">
        <q-item
          v-close-popup
          clickable
          :disable="loggingOut"
          @click="handleLogout"
        >
          <q-item-section avatar>
            <q-spinner v-if="loggingOut" size="1.25rem" />
            <q-icon v-else name="logout" />
          </q-item-section>
          <q-item-section>{{ t("common.logout") }}</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";

import { useAuthStore } from "@/features/auth/authStore";

const auth = useAuthStore();
const loggingOut = ref(false);
const router = useRouter();
const $q = useQuasar();
const { t } = useI18n();

const identity = computed(
  () => auth.user?.displayName?.trim() || auth.user?.email || ""
);

async function handleLogout() {
  if (loggingOut.value) {
    return;
  }

  loggingOut.value = true;

  try {
    await auth.logout();
    await router.replace({ name: "login" });
  } catch {
    $q.notify({ type: "negative", message: t("user.logoutFailed") });
  } finally {
    loggingOut.value = false;
  }
}
</script>

<style scoped lang="scss">
.user-menu__trigger {
  color: var(--omc-color-text-secondary);
}

.user-menu__avatar {
  background: var(--omc-color-primary-soft);
  color: var(--omc-color-primary);
}

.user-menu__panel {
  width: min(18rem, 80vw);
  padding: 1rem;
}

.user-menu__label,
.user-menu__identity {
  margin: 0;
}

.user-menu__label {
  color: var(--omc-color-text-muted);
  font-size: 0.75rem;
}

.user-menu__identity {
  margin-top: 0.25rem;
  overflow: hidden;
  color: var(--omc-color-text);
  font-size: 0.9rem;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-menu__actions {
  padding: 0.5rem;
}

.user-menu__actions .q-item {
  min-height: 2.75rem;
  border-radius: var(--omc-radius-sm);
  color: var(--omc-color-text-secondary);
}
</style>
