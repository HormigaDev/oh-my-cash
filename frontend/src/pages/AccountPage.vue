<template>
  <q-page class="account-page">
    <div class="account-page__content">
      <AppPageHeader :title="t('account.title')" :subtitle="t('account.subtitle')" />

      <div class="account-grid">
        <q-card flat class="account-card">
          <q-card-section>
            <div class="account-card__heading">
              <q-icon name="person_outline" />
              <div><h2>{{ t("account.profile.title") }}</h2><p>{{ t("account.profile.description") }}</p></div>
            </div>
            <q-form class="account-form" @submit="saveProfile">
              <q-input v-model="profile.displayName" outlined maxlength="120" :label="t('account.profile.name')" :disable="savingProfile" />
              <q-input v-model="profile.email" outlined type="email" :label="t('account.profile.email')" :rules="emailRules" :disable="savingProfile">
                <template #prepend><q-icon name="mail_outline" /></template>
              </q-input>
              <div class="account-form__row">
                <q-select v-model="profile.currency" outlined emit-value map-options :options="currencyOptions" :label="t('account.preferences.currency')" :disable="savingProfile" />
                <q-select v-model="profile.locale" outlined emit-value map-options :options="localeOptions" :label="t('account.preferences.language')" :disable="savingProfile" />
              </div>
              <q-select v-model="profile.timezone" outlined use-input fill-input hide-selected input-debounce="0" emit-value map-options :options="filteredTimezones" :label="t('account.preferences.timezone')" :disable="savingProfile" @filter="filterTimezones" />
              <q-banner v-if="profileError" dense rounded class="account-error">{{ profileError }}</q-banner>
              <div class="account-form__actions"><q-btn type="submit" unelevated no-caps color="primary" :label="t('account.profile.save')" :loading="savingProfile" /></div>
            </q-form>
          </q-card-section>
        </q-card>

        <div class="account-side">
          <q-card flat class="account-card">
            <q-card-section>
              <div class="account-card__heading">
                <q-icon name="palette" />
                <div><h2>{{ t("account.appearance.title") }}</h2><p>{{ t("account.appearance.description") }}</p></div>
              </div>
              <ThemePalettePicker />
              <p class="account-appearance__mode-label">{{ t("theme.mode") }}</p>
              <ThemeSwitcher expanded />
              <p v-if="theme.isHighContrast" class="account-appearance__hint">
                {{ t("theme.contrastModeHint") }}
              </p>
              <q-banner
                v-if="theme.persistenceStatus === 'error'"
                dense
                rounded
                class="account-error account-appearance__error"
              >
                {{ t("theme.saveError") }}
              </q-banner>
            </q-card-section>
          </q-card>

          <q-card flat class="account-card">
            <q-card-section>
              <div class="account-card__heading">
                <q-icon name="lock_outline" />
                <div><h2>{{ t("account.security.title") }}</h2><p>{{ t("account.security.description") }}</p></div>
              </div>
              <q-form class="account-form" @submit="savePassword">
                <q-input v-model="password.current" outlined :type="showCurrent ? 'text' : 'password'" :label="t('account.security.currentPassword')" :rules="requiredRules" :disable="savingPassword"><template #append><q-icon :name="showCurrent ? 'visibility_off' : 'visibility'" class="account-password-toggle" @click="showCurrent = !showCurrent" /></template></q-input>
                <q-input v-model="password.next" outlined :type="showNext ? 'text' : 'password'" :label="t('account.security.newPassword')" :rules="passwordRules" :disable="savingPassword"><template #append><q-icon :name="showNext ? 'visibility_off' : 'visibility'" class="account-password-toggle" @click="showNext = !showNext" /></template></q-input>
                <q-input v-model="password.confirm" outlined type="password" :label="t('account.security.confirmPassword')" :rules="confirmRules" :disable="savingPassword" />
                <q-banner v-if="passwordError" dense rounded class="account-error">{{ passwordError }}</q-banner>
                <div class="account-form__actions"><q-btn type="submit" outline no-caps color="primary" :label="t('account.security.change')" :loading="savingPassword" /></div>
              </q-form>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";

import AppPageHeader from "@/components/AppPageHeader.vue";
import ThemeSwitcher from "@/components/ThemeSwitcher.vue";
import ThemePalettePicker from "@/components/ThemePalettePicker.vue";
import { changePassword, updateProfile } from "@/features/account/api";
import { useAuthStore } from "@/features/auth/authStore";
import { useThemeStore } from "@/features/preferences/themeStore";
import { isApiError } from "@/lib/api/errors";

const auth = useAuthStore();
const theme = useThemeStore();
const router = useRouter();
const $q = useQuasar();
const { t } = useI18n();
const profile = reactive({
  displayName: auth.user?.displayName ?? "",
  email: auth.user?.email ?? "",
  currency: auth.user?.currency ?? "BRL",
  timezone: auth.user?.timezone ?? "America/Sao_Paulo",
  locale: auth.user?.locale ?? "es-ES"
});
const password = reactive({ current: "", next: "", confirm: "" });
const savingProfile = ref(false);
const savingPassword = ref(false);
const profileError = ref<string | null>(null);
const passwordError = ref<string | null>(null);
const showCurrent = ref(false);
const showNext = ref(false);
const timezoneQuery = ref("");
const currencyOptions = ["BRL", "EUR", "USD"].map(value => ({ label: value, value }));
const localeOptions = [
  { label: "Español", value: "es-ES" },
  { label: "Português (fallback español)", value: "pt-BR" }
];
const timezoneValues = ["America/Sao_Paulo", "America/Argentina/Buenos_Aires", "America/Bogota", "America/Lima", "America/Mexico_City", "America/New_York", "Europe/Madrid", "Europe/Lisbon", "UTC"];
const filteredTimezones = computed(() => timezoneValues.filter(value => value.toLowerCase().includes(timezoneQuery.value.toLowerCase())).map(value => ({ label: value.replaceAll("_", " "), value })));
const emailRules = [(value: string) => /^\S+@\S+\.\S+$/u.test(value.trim()) || t("account.validation.email")];
const requiredRules = [(value: string) => value.length > 0 || t("account.validation.required")];
const passwordRules = [(value: string) => value.length >= 12 || t("account.validation.passwordLength")];
const confirmRules = [(value: string) => value === password.next || t("account.validation.passwordMatch")];

function filterTimezones(value: string, update: (callback: () => void) => void) {
  update(() => { timezoneQuery.value = value; });
}

function message(error: unknown) {
  if (isApiError(error) && error.code === "CONFLICT") return t("account.errors.emailTaken");
  if (isApiError(error) && error.code === "INVALID_CREDENTIALS") return t("account.errors.currentPassword");
  return t("account.errors.unexpected");
}

async function saveProfile() {
  savingProfile.value = true;
  profileError.value = null;
  try {
    const user = await updateProfile({ ...profile, displayName: profile.displayName.trim() || null });
    auth.setUser(user);
    $q.notify({ type: "positive", message: t("account.feedback.profile") });
  } catch (error) {
    profileError.value = message(error);
  } finally {
    savingProfile.value = false;
  }
}

async function savePassword() {
  savingPassword.value = true;
  passwordError.value = null;
  try {
    await changePassword({ currentPassword: password.current, newPassword: password.next });
    auth.expireSession();
    $q.notify({ type: "positive", message: t("account.feedback.password") });
    await router.replace({ name: "login" });
  } catch (error) {
    passwordError.value = message(error);
  } finally {
    savingPassword.value = false;
  }
}
</script>

<style scoped lang="scss">
.account-page { padding: clamp(1.25rem, 4vw, 2.5rem); }
.account-page__content { width: 100%; max-width: var(--omc-content-max-width); margin: 0 auto; }
.account-grid, .account-side { display: grid; gap: 1rem; }
.account-grid { margin-top: 2rem; }
.account-card { border: 0.0625rem solid var(--omc-color-border); border-radius: var(--omc-radius-lg); background: var(--omc-color-surface); }
.account-card :deep(.q-card__section) { padding: 1.4rem; }
.account-card__heading { display: flex; gap: 0.8rem; align-items: flex-start; margin-bottom: 1.25rem; }
.account-card__heading > .q-icon { padding: 0.65rem; border-radius: var(--omc-radius-sm); background: var(--omc-color-primary-soft); color: var(--omc-color-primary); font-size: 1.35rem; }
.account-card h2, .account-card p { margin: 0; }
.account-card h2 { font-size: 1.05rem; }
.account-card p { margin-top: 0.2rem; color: var(--omc-color-text-muted); font-size: 0.76rem; }
.account-form { display: grid; gap: 1rem; }
.account-form__row { display: grid; gap: 1rem; }
.account-form__actions { display: flex; justify-content: flex-end; }
.account-error { background: var(--omc-color-negative-soft); color: var(--omc-color-negative); }
.account-password-toggle { cursor: pointer; }
.account-appearance__mode-label { margin: 1rem 0 0.45rem !important; color: var(--omc-color-text-secondary) !important; font-weight: 650; }
.account-appearance__hint { margin: 0.55rem 0 0 !important; color: var(--omc-color-text-muted) !important; font-size: 0.75rem; line-height: 1.45; }
.account-appearance__error { margin-top: 0.75rem; }
@media (min-width: 44rem) { .account-form__row { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 62rem) { .account-grid { grid-template-columns: minmax(0, 1.25fr) minmax(20rem, 0.75fr); align-items: start; } }
</style>
