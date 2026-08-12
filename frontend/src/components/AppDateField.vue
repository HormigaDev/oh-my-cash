<template>
  <q-input
    :model-value="displayValue"
    outlined
    readonly
    :label="label"
    :rules="displayRules"
    :disable="disable"
    @click="open = true"
  >
    <template #prepend><q-icon name="calendar_month" /></template>
    <template #append>
      <q-icon
        v-if="clearable && modelValue"
        name="close"
        class="app-date-field__action"
        role="button"
        tabindex="0"
        :aria-label="t('common.clearDate')"
        @click.stop="emit('update:modelValue', null)"
        @keyup.enter.stop="emit('update:modelValue', null)"
      />
      <q-icon
        name="arrow_drop_down"
        class="app-date-field__action"
        aria-hidden="true"
      />
    </template>

    <q-popup-proxy
      v-model="open"
      cover
      transition-show="scale"
      transition-hide="scale"
    >
      <q-date
        :model-value="modelValue"
        mask="YYYY-MM-DD"
        color="primary"
        today-btn
        @update:model-value="selectDate"
      />
    </q-popup-proxy>
  </q-input>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

import { useFinancialFormat } from "@/composables/useFinancialFormat";

type Rule = (value: string | null) => boolean | string;

const props = withDefaults(
  defineProps<{
    modelValue: string | null;
    label: string;
    rules?: Rule[];
    disable?: boolean;
    clearable?: boolean;
  }>(),
  {
    rules: () => [],
    disable: false,
    clearable: false
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: string | null];
}>();

const { t } = useI18n();
const { formatDateOnly } = useFinancialFormat();
const open = ref(false);
const displayValue = computed(() =>
  props.modelValue ? formatDateOnly(props.modelValue) : ""
);
const displayRules = computed(() =>
  props.rules.map(rule => () => rule(props.modelValue))
);

function selectDate(value: string | null) {
  emit("update:modelValue", value);
  if (value !== null) open.value = false;
}
</script>

<style scoped lang="scss">
.app-date-field__action {
  cursor: pointer;
}
</style>
