<template>
  <main class="login-page">
    <div class="login-page__theme">
      <ThemeSwitcher />
    </div>

    <section class="login-panel" :aria-labelledby="titleId">
      <OMCBrand class="login-panel__brand" />

      <q-card flat class="login-card">
        <div class="login-card__header">
          <p class="login-card__eyebrow">{{ t("auth.login.eyebrow") }}</p>
          <h1 :id="titleId">{{ t("auth.login.title") }}</h1>
          <p>{{ t("auth.login.subtitle") }}</p>
        </div>

        <q-banner
          v-if="auth.sessionUnavailable && errorMessage === null"
          dense
          rounded
          class="login-card__notice"
          role="status"
        >
          <template #avatar>
            <q-icon name="cloud_off" />
          </template>
          {{ t("auth.session.unavailable") }}
        </q-banner>

        <q-banner
          v-if="errorMessage"
          dense
          rounded
          class="login-card__error"
          role="alert"
        >
          <template #avatar>
            <q-icon name="error_outline" />
          </template>
          {{ errorMessage }}
        </q-banner>

        <q-form class="login-form" @submit="submit">
          <q-input
            v-model.trim="email"
            outlined
            type="email"
            autocomplete="username"
            :label="t('auth.login.email')"
            :rules="emailRules"
            lazy-rules
            :disable="submitting"
            @update:model-value="errorMessage = null"
          >
            <template #prepend>
              <q-icon name="mail_outline" />
            </template>
          </q-input>

          <q-input
            v-model="password"
            outlined
            :type="passwordVisible ? 'text' : 'password'"
            autocomplete="current-password"
            :label="t('auth.login.password')"
            :rules="passwordRules"
            lazy-rules
            :disable="submitting"
            @update:model-value="errorMessage = null"
          >
            <template #prepend>
              <q-icon name="lock_outline" />
            </template>
            <template #append>
              <q-btn
                flat
                round
                dense
                :icon="passwordVisible ? 'visibility_off' : 'visibility'"
                :aria-label="
                  passwordVisible
                    ? t('auth.login.hidePassword')
                    : t('auth.login.showPassword')
                "
                @click="passwordVisible = !passwordVisible"
              />
            </template>
          </q-input>

          <q-btn
            unelevated
            no-caps
            type="submit"
            class="login-form__submit full-width"
            :label="t('auth.login.submit')"
            :loading="submitting"
            :disable="submitting"
          />
        </q-form>
      </q-card>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter, type RouteLocationRaw } from "vue-router";

import OMCBrand from "@/components/OMCBrand.vue";
import ThemeSwitcher from "@/components/ThemeSwitcher.vue";
import { useAuthStore } from "@/features/auth/authStore";
import { isApiError } from "@/lib/api/errors";

const titleId = "login-title";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const email = ref("");
const password = ref("");
const passwordVisible = ref(false);
const submitting = ref(false);
const errorMessage = ref<string | null>(null);

const emailRules = [
  (value: string) => value.length > 0 || t("auth.login.emailRequired"),
  (value: string) => emailPattern.test(value) || t("auth.login.emailInvalid")
];
const passwordRules = [
  (value: string) => value.length > 0 || t("auth.login.passwordRequired")
];

function requestedDestination(): RouteLocationRaw {
  const redirect = route.query.redirect;

  if (
    typeof redirect !== "string" ||
    !redirect.startsWith("/") ||
    redirect.startsWith("//")
  ) {
    return { name: "dashboard" };
  }

  const resolved = router.resolve(redirect);
  return resolved.matched.some(record => record.meta.requiresAuth)
    ? redirect
    : { name: "dashboard" };
}

function localizedLoginError(error: unknown) {
  if (!isApiError(error)) {
    return t("auth.login.unexpectedError");
  }

  if (error.code === "INVALID_CREDENTIALS") {
    return t("auth.login.invalidCredentials");
  }

  if (error.code === "NETWORK_ERROR") {
    return t("auth.login.unavailable");
  }

  return t("auth.login.unexpectedError");
}

async function submit() {
  if (submitting.value) {
    return;
  }

  submitting.value = true;
  errorMessage.value = null;

  try {
    await auth.login({ email: email.value, password: password.value });
    password.value = "";
    await router.replace(requestedDestination());
  } catch (error) {
    errorMessage.value = localizedLoginError(error);
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped lang="scss">
.login-page {
  position: relative;
  display: grid;
  min-height: 100dvh;
  overflow: hidden;
  place-items: center;
  padding: 5.5rem 1rem 2rem;
  background: var(--omc-color-background);
}

.login-page::before,
.login-page::after {
  position: absolute;
  border-radius: 50%;
  background: var(--omc-color-decoration);
  content: "";
  filter: blur(0.125rem);
  pointer-events: none;
}

.login-page::before {
  top: -8rem;
  right: -8rem;
  width: 20rem;
  height: 20rem;
}

.login-page::after {
  bottom: -11rem;
  left: -9rem;
  width: 24rem;
  height: 24rem;
}

.login-page__theme {
  position: absolute;
  z-index: 2;
  top: 1rem;
  right: 1rem;
}

.login-panel {
  position: relative;
  z-index: 1;
  width: min(100%, 29rem);
}

.login-panel__brand {
  margin: 0 0 1.5rem 0.25rem;
}

.login-card {
  padding: clamp(1.5rem, 6vw, 2.5rem);
  border: 0.0625rem solid var(--omc-color-border);
  border-radius: var(--omc-radius-xl);
  background: var(--omc-color-surface-elevated);
  box-shadow: var(--omc-shadow-md);
}

.login-card__header {
  margin-bottom: 1.75rem;
}

.login-card__eyebrow,
.login-card h1,
.login-card__header > p:last-child {
  margin: 0;
}

.login-card__eyebrow {
  color: var(--omc-color-primary);
  font-size: 0.75rem;
  font-weight: 750;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.login-card h1 {
  margin-top: 0.55rem;
  color: var(--omc-color-text);
  font-size: clamp(1.7rem, 7vw, 2.1rem);
  font-weight: 760;
  letter-spacing: -0.035em;
  line-height: 1.17;
}

.login-card__header > p:last-child {
  margin-top: 0.75rem;
  color: var(--omc-color-text-secondary);
  line-height: 1.6;
}

.login-card__notice,
.login-card__error {
  margin-bottom: 1.25rem;
  font-size: 0.86rem;
  line-height: 1.45;
}

.login-card__notice {
  background: var(--omc-color-info-soft);
  color: var(--omc-color-info);
}

.login-card__error {
  background: var(--omc-color-negative-soft);
  color: var(--omc-color-negative);
}

.login-form {
  display: grid;
  gap: 0.25rem;
}

.login-form__submit {
  min-height: 3rem;
  margin-top: 0.5rem;
  border-radius: var(--omc-radius-md);
  background: var(--omc-color-primary) !important;
  color: var(--omc-color-text-on-primary) !important;
  font-weight: 700;
}

.login-form__submit:hover {
  background: var(--omc-color-primary-hover) !important;
}

@media (min-width: 40rem) {
  .login-page {
    padding: 3rem 1.5rem;
  }

  .login-page__theme {
    top: 1.5rem;
    right: 1.5rem;
  }
}
</style>
