<template>
  <q-dialog
    :model-value="modelValue"
    :persistent="saving"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <q-card class="category-form-dialog">
      <q-card-section class="category-form-dialog__header">
        <div>
          <p class="category-form-dialog__eyebrow">
            {{
              category
                ? t("categories.form.editEyebrow")
                : t("categories.form.createEyebrow")
            }}
          </p>
          <h2>
            {{
              category
                ? t("categories.form.editTitle")
                : t("categories.form.createTitle")
            }}
          </h2>
        </div>
        <q-btn
          v-close-popup
          flat
          round
          dense
          icon="close"
          :disable="saving"
          :aria-label="t('common.close')"
        />
      </q-card-section>

      <q-separator />

      <q-form ref="form" @submit="submit">
        <q-card-section class="category-form-dialog__body">
          <q-banner
            v-if="error"
            dense
            rounded
            class="category-form-dialog__error"
            role="alert"
          >
            <template #avatar>
              <q-icon name="error_outline" />
            </template>
            {{ error }}
          </q-banner>

          <q-input
            v-model="name"
            outlined
            autofocus
            maxlength="80"
            counter
            :label="t('categories.form.name')"
            :rules="nameRules"
            :disable="saving"
            @update:model-value="emit('clearError')"
          />

          <fieldset class="category-form-dialog__fieldset">
            <legend>{{ t("categories.form.kind") }}</legend>
            <q-btn-toggle
              v-model="kind"
              no-caps
              spread
              unelevated
              :options="kindOptions"
              class="category-form-dialog__kind-toggle"
              :disable="saving"
            />
          </fieldset>

          <fieldset class="category-form-dialog__fieldset">
            <legend>{{ t("categories.form.icon") }}</legend>
            <div class="category-form-dialog__icons">
              <q-btn
                flat
                round
                icon="block"
                :aria-label="t('categories.icons.none')"
                :class="{
                  'category-form-dialog__choice--active': icon === null
                }"
                :disable="saving"
                @click="icon = null"
              />
              <q-btn
                v-for="option in categoryIconOptions"
                :key="option"
                flat
                round
                :icon="option"
                :aria-label="t(`categories.icons.${option}`)"
                :class="{
                  'category-form-dialog__choice--active': icon === option
                }"
                :disable="saving"
                @click="icon = option"
              />
            </div>
          </fieldset>

          <fieldset class="category-form-dialog__fieldset">
            <legend>{{ t("categories.form.color") }}</legend>
            <div class="category-form-dialog__colors">
              <button
                type="button"
                class="category-color-choice category-color-choice--none category-color--neutral"
                :aria-label="t('categories.colors.none')"
                :aria-pressed="color === null"
                :disabled="saving"
                @click="color = null"
              >
                <q-icon v-if="color === null" name="block" />
              </button>
              <button
                v-for="option in categoryColorOptions"
                :key="option.value"
                type="button"
                class="category-color-choice"
                :class="`category-color--${option.value}`"
                :aria-label="t(option.labelKey)"
                :aria-pressed="color === option.value"
                :disabled="saving"
                @click="color = option.value"
              >
                <q-icon v-if="color === option.value" name="check" />
              </button>
            </div>
          </fieldset>
        </q-card-section>

        <q-separator />

        <q-card-actions class="category-form-dialog__actions">
          <q-btn
            v-close-popup
            flat
            no-caps
            :label="t('common.cancel')"
            :disable="saving"
          />
          <q-btn
            unelevated
            no-caps
            type="submit"
            color="primary"
            :label="
              category ? t('categories.form.save') : t('categories.form.create')
            "
            :loading="saving"
            :disable="saving"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { QForm } from "quasar";

import {
  categoryColorOptions,
  categoryIconOptions,
  categoryKindOptions,
  defaultCategoryColor,
  defaultCategoryIcon
} from "./options";
import type {
  Category,
  CategoryColor,
  CategoryInput,
  CategoryKind
} from "./types";

const props = defineProps<{
  modelValue: boolean;
  category: Category | null;
  saving: boolean;
  error: string | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  submit: [input: CategoryInput];
  clearError: [];
}>();

const form = ref<QForm | null>(null);
const name = ref("");
const kind = ref<CategoryKind>("expense");
const icon = ref<string | null>(defaultCategoryIcon);
const color = ref<CategoryColor | null>(defaultCategoryColor);
const { t } = useI18n();

const kindOptions = computed(() =>
  categoryKindOptions.map(option => ({
    label: t(option.labelKey),
    value: option.value
  }))
);

const nameRules = [
  (value: string) =>
    value.trim().length > 0 || t("categories.form.nameRequired"),
  (value: string) =>
    [...value.trim()].length <= 80 || t("categories.form.nameTooLong")
];

watch(
  () => props.modelValue,
  open => {
    if (!open) {
      return;
    }

    name.value = props.category?.name ?? "";
    kind.value = props.category?.kind ?? "expense";
    icon.value = props.category ? props.category.icon : defaultCategoryIcon;
    color.value = props.category ? props.category.color : defaultCategoryColor;
    form.value?.resetValidation();
    emit("clearError");
  }
);

function submit() {
  emit("submit", {
    name: name.value.trim(),
    kind: kind.value,
    icon: icon.value,
    color: color.value
  });
}
</script>

<style scoped lang="scss">
.category-form-dialog {
  width: min(38rem, calc(100vw - 2rem));
  max-width: 38rem;
  border: 0.0625rem solid var(--omc-color-border);
  border-radius: var(--omc-radius-xl);
  box-shadow: var(--omc-shadow-md);
}

.category-form-dialog__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem;
}

.category-form-dialog__eyebrow,
.category-form-dialog h2 {
  margin: 0;
}

.category-form-dialog__eyebrow {
  margin-bottom: 0.35rem;
  color: var(--omc-color-primary);
  font-size: 0.72rem;
  font-weight: 750;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.category-form-dialog h2 {
  font-size: 1.4rem;
  font-weight: 740;
  letter-spacing: -0.025em;
}

.category-form-dialog__body {
  display: grid;
  max-height: min(68dvh, 42rem);
  gap: 1.35rem;
  overflow-y: auto;
  padding: 1.5rem;
}

.category-form-dialog__error {
  background: var(--omc-color-negative-soft);
  color: var(--omc-color-negative);
  font-size: 0.86rem;
}

.category-form-dialog__fieldset {
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

.category-form-dialog__fieldset legend {
  margin-bottom: 0.7rem;
  color: var(--omc-color-text-secondary);
  font-size: 0.8rem;
  font-weight: 680;
}

.category-form-dialog__kind-toggle {
  overflow: hidden;
  border: 0.0625rem solid var(--omc-color-border);
  border-radius: var(--omc-radius-md);
  background: var(--omc-color-surface-subtle);
  color: var(--omc-color-text-secondary);
}

.category-form-dialog__kind-toggle :deep(.q-btn--active) {
  background: var(--omc-color-primary-soft) !important;
  color: var(--omc-color-primary) !important;
}

.category-form-dialog__icons,
.category-form-dialog__colors {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.category-form-dialog__icons .q-btn {
  width: 2.75rem;
  height: 2.75rem;
  color: var(--omc-color-text-secondary);
}

.category-form-dialog__choice--active {
  background: var(--omc-color-primary-soft) !important;
  color: var(--omc-color-primary) !important;
}

.category-color-choice {
  display: inline-grid;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  place-items: center;
  border: 0.1875rem solid transparent;
  border-radius: 50%;
  background: var(--omc-category-color);
  color: var(--omc-category-color-on);
  cursor: pointer;
}

.category-color-choice[aria-pressed="true"] {
  border-color: var(--omc-color-surface-elevated);
  box-shadow: 0 0 0 0.125rem var(--omc-category-color);
}

.category-color-choice--none {
  background: var(--omc-category-color-soft);
  color: var(--omc-category-color);
}

.category-color-choice:disabled {
  cursor: default;
  opacity: 0.6;
}

.category-form-dialog__actions {
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
}

.category-form-dialog__actions .q-btn {
  min-height: 2.75rem;
  padding-inline: 1.15rem;
  border-radius: var(--omc-radius-md);
  font-weight: 680;
}

@media (max-width: 30rem) {
  .category-form-dialog__header,
  .category-form-dialog__body {
    padding: 1.25rem;
  }

  .category-form-dialog__kind-toggle :deep(.q-btn) {
    padding-inline: 0.35rem;
    font-size: 0.76rem;
  }
}
</style>
