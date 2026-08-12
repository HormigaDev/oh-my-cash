<template>
  <q-page class="admin-users-page">
    <div class="admin-users-page__content">
      <AppPageHeader
        :title="t('adminUsers.title')"
        :subtitle="t('adminUsers.subtitle')"
      >
        <q-btn
          unelevated
          no-caps
          icon="person_add"
          color="negative"
          :label="t('adminUsers.actions.create')"
          @click="openCreate"
        />
      </AppPageHeader>

      <q-banner rounded class="admin-users-warning">
        <template #avatar><q-icon name="admin_panel_settings" /></template>
        {{ t("adminUsers.warning") }}
      </q-banner>

      <q-card flat class="admin-users-card">
        <q-inner-loading :showing="loading"
          ><q-spinner color="negative" size="2rem"
        /></q-inner-loading>
        <q-banner v-if="loadError" dense rounded class="admin-users-error">
          {{ loadError }}
          <template #action
            ><q-btn
              flat
              dense
              no-caps
              :label="t('common.retry')"
              @click="loadUsers"
          /></template>
        </q-banner>
        <q-list v-else separator>
          <q-item v-for="user in users" :key="user.id" class="admin-user-row">
            <q-item-section avatar><q-avatar icon="person" /></q-item-section>
            <q-item-section>
              <q-item-label>{{
                user.displayName || t("adminUsers.noName")
              }}</q-item-label>
              <q-item-label caption>{{ user.email }}</q-item-label>
            </q-item-section>
            <q-item-section side top>
              <q-badge
                :color="user.role === 'admin' ? 'negative' : 'primary'"
                :label="t(`adminUsers.roles.${user.role}`)"
              />
            </q-item-section>
            <q-item-section side
              ><q-btn
                flat
                round
                icon="edit"
                :aria-label="t('adminUsers.actions.edit')"
                @click="openEdit(user)"
            /></q-item-section>
            <q-item-section side
              ><q-btn
                flat
                round
                color="negative"
                icon="delete_outline"
                :disable="user.id === auth.user?.id"
                :aria-label="t('adminUsers.actions.delete')"
                @click="openDelete(user)"
            /></q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </div>

    <q-dialog
      v-model="formOpen"
      :persistent="saving"
      :maximized="$q.screen.lt.sm"
    >
      <q-card class="admin-users-dialog">
        <q-card-section class="admin-users-dialog__header"
          ><div
            ><p>{{
              t(editing ? "adminUsers.editEyebrow" : "adminUsers.createEyebrow")
            }}</p
            ><h2>{{
              t(editing ? "adminUsers.editTitle" : "adminUsers.createTitle")
            }}</h2></div
          ><q-btn
            v-close-popup
            flat
            round
            icon="close"
            :disable="saving"
            :aria-label="t('common.close')"
        /></q-card-section>
        <q-separator />
        <q-form @submit="submitForm"
          ><q-card-section class="admin-users-dialog__body">
            <q-banner
              v-if="formError"
              dense
              rounded
              class="admin-users-error"
              >{{ formError }}</q-banner
            >
            <q-input
              v-model="form.displayName"
              outlined
              maxlength="120"
              :label="t('adminUsers.fields.name')"
              :disable="saving"
            />
            <q-input
              v-model="form.email"
              outlined
              type="email"
              :label="t('adminUsers.fields.email')"
              :rules="emailRules"
              :disable="saving"
            />
            <q-input
              v-model="form.password"
              outlined
              :type="showPassword ? 'text' : 'password'"
              :label="
                t(
                  editing
                    ? 'adminUsers.fields.newPassword'
                    : 'adminUsers.fields.password'
                )
              "
              :rules="passwordRules"
              :disable="saving"
              ><template #append
                ><q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="admin-users-clickable"
                  @click="showPassword = !showPassword" /></template
            ></q-input>
            <q-input
              v-if="form.password"
              v-model="form.confirmPassword"
              outlined
              type="password"
              :label="t('adminUsers.fields.confirmPassword')"
              :rules="confirmPasswordRules"
              :disable="saving"
            />
            <q-separator />
            <q-input
              v-model="form.administratorPassword"
              outlined
              type="password"
              :label="t('adminUsers.fields.administratorPassword')"
              :rules="requiredRules"
              :disable="saving"
            /> </q-card-section
          ><q-card-actions align="right"
            ><q-btn
              v-close-popup
              flat
              no-caps
              :label="t('common.cancel')"
              :disable="saving" /><q-btn
              type="submit"
              unelevated
              no-caps
              color="negative"
              :label="
                t(
                  editing
                    ? 'adminUsers.actions.save'
                    : 'adminUsers.actions.create'
                )
              "
              :loading="saving" /></q-card-actions
        ></q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="deleteOpen" :persistent="deleting">
      <q-card class="admin-users-dialog"
        ><q-card-section class="admin-users-dialog__header"
          ><div
            ><p>{{ t("adminUsers.deleteEyebrow") }}</p
            ><h2>{{ t("adminUsers.deleteTitle") }}</h2></div
          ><q-btn
            v-close-popup
            flat
            round
            icon="close"
            :disable="deleting"
            :aria-label="t('common.close')" /></q-card-section
        ><q-card-section
          ><p>{{
            t("adminUsers.deleteDescription", {
              name: deletingUser?.displayName || deletingUser?.email
            })
          }}</p
          ><q-input
            v-model="deletePassword"
            outlined
            type="password"
            :label="t('adminUsers.fields.administratorPassword')"
            :disable="deleting" /></q-card-section
        ><q-card-actions align="right"
          ><q-btn
            v-close-popup
            flat
            no-caps
            :label="t('common.cancel')"
            :disable="deleting" /><q-btn
            unelevated
            no-caps
            color="negative"
            :label="t('adminUsers.actions.delete')"
            :loading="deleting"
            @click="confirmDelete" /></q-card-actions
      ></q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";

import AppPageHeader from "@/components/AppPageHeader.vue";
import {
  createManagedUser,
  deleteManagedUser,
  fetchManagedUsers,
  updateManagedUser
} from "@/features/admin/api";
import type { ManagedUser } from "@/features/admin/types";
import { useAuthStore } from "@/features/auth/authStore";
import { isApiError } from "@/lib/api/errors";

const auth = useAuthStore();
const $q = useQuasar();
const { t } = useI18n();
const users = ref<ManagedUser[]>([]);
const loading = ref(true);
const loadError = ref<string | null>(null);
const formOpen = ref(false);
const editing = ref<ManagedUser | null>(null);
const saving = ref(false);
const formError = ref<string | null>(null);
const showPassword = ref(false);
const deleteOpen = ref(false);
const deleting = ref(false);
const deletingUser = ref<ManagedUser | null>(null);
const deletePassword = ref("");
const form = reactive({
  displayName: "",
  email: "",
  password: "",
  confirmPassword: "",
  administratorPassword: ""
});
const requiredRules = [
  (value: string) => value.length > 0 || t("account.validation.required")
];
const emailRules = [
  (value: string) =>
    /^\S+@\S+\.\S+$/u.test(value.trim()) || t("account.validation.email")
];
const passwordRules = [
  (value: string) =>
    (editing.value !== null && value.length === 0) ||
    value.length >= 12 ||
    t("account.validation.passwordLength")
];
const confirmPasswordRules = [
  (value: string) =>
    value === form.password || t("account.validation.passwordMatch")
];

function resetForm() {
  Object.assign(form, {
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
    administratorPassword: ""
  });
  formError.value = null;
  showPassword.value = false;
}
function openCreate() {
  editing.value = null;
  resetForm();
  formOpen.value = true;
}
function openEdit(user: ManagedUser) {
  editing.value = user;
  resetForm();
  form.displayName = user.displayName ?? "";
  form.email = user.email;
  formOpen.value = true;
}
function openDelete(user: ManagedUser) {
  deletingUser.value = user;
  deletePassword.value = "";
  deleteOpen.value = true;
}
function errorMessage(error: unknown) {
  if (isApiError(error) && error.code === "INVALID_CREDENTIALS")
    return t("adminUsers.errors.administratorPassword");
  if (isApiError(error) && error.code === "CONFLICT")
    return t("account.errors.emailTaken");
  return t("adminUsers.errors.unexpected");
}
async function loadUsers() {
  loading.value = true;
  loadError.value = null;
  try {
    users.value = await fetchManagedUsers();
  } catch (error) {
    loadError.value = errorMessage(error);
  } finally {
    loading.value = false;
  }
}
async function submitForm() {
  saving.value = true;
  formError.value = null;
  try {
    if (editing.value) {
      const updated = await updateManagedUser(editing.value.id, {
        email: form.email,
        displayName: form.displayName.trim() || null,
        password: form.password || undefined,
        administratorPassword: form.administratorPassword
      });
      users.value = users.value.map(user =>
        user.id === updated.id ? updated : user
      );
    } else {
      const created = await createManagedUser({
        email: form.email,
        displayName: form.displayName.trim() || null,
        password: form.password,
        administratorPassword: form.administratorPassword
      });
      users.value = [...users.value, created].sort((left, right) =>
        left.email.localeCompare(right.email)
      );
    }
    formOpen.value = false;
    $q.notify({ type: "positive", message: t("adminUsers.feedback.saved") });
  } catch (error) {
    formError.value = errorMessage(error);
  } finally {
    saving.value = false;
  }
}
async function confirmDelete() {
  if (!deletingUser.value || !deletePassword.value) return;
  deleting.value = true;
  try {
    await deleteManagedUser(deletingUser.value.id, deletePassword.value);
    users.value = users.value.filter(
      user => user.id !== deletingUser.value?.id
    );
    deleteOpen.value = false;
    $q.notify({ type: "positive", message: t("adminUsers.feedback.deleted") });
  } catch (error) {
    $q.notify({ type: "negative", message: errorMessage(error) });
  } finally {
    deleting.value = false;
  }
}
void loadUsers();
</script>

<style scoped lang="scss">
.admin-users-page {
  padding: clamp(1.25rem, 4vw, 2.5rem);
}
.admin-users-page__content {
  width: 100%;
  max-width: var(--omc-content-max-width);
  margin: 0 auto;
}
.admin-users-warning {
  margin-top: 1.5rem;
  border: 0.0625rem solid var(--omc-color-negative);
  background: var(--omc-color-negative-soft);
  color: var(--omc-color-negative);
}
.admin-users-card {
  position: relative;
  margin-top: 1rem;
  border: 0.0625rem solid var(--omc-color-border);
  border-radius: var(--omc-radius-lg);
  background: var(--omc-color-surface);
  overflow: hidden;
}
.admin-user-row {
  min-height: 5rem;
}
.admin-user-row .q-avatar {
  background: var(--omc-color-negative-soft);
  color: var(--omc-color-negative);
}
.admin-users-error {
  margin: 1rem;
  background: var(--omc-color-negative-soft);
  color: var(--omc-color-negative);
}
.admin-users-dialog {
  width: min(34rem, 100vw);
  background: var(--omc-color-surface);
}
.admin-users-dialog__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}
.admin-users-dialog__header p,
.admin-users-dialog__header h2,
.admin-users-dialog__body p {
  margin: 0;
}
.admin-users-dialog__header p {
  color: var(--omc-color-negative);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}
.admin-users-dialog__header h2 {
  margin-top: 0.25rem;
  font-size: 1.15rem;
}
.admin-users-dialog__body {
  display: grid;
  gap: 1rem;
}
.admin-users-clickable {
  cursor: pointer;
}
</style>
