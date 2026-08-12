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
    <template #prepend><q-icon name="schedule" /></template>
    <template #append><q-icon name="arrow_drop_down" /></template>

    <q-popup-proxy
      v-model="open"
      cover
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card class="app-date-time-field__popup">
        <div class="app-date-time-field__pickers">
          <q-date
            :model-value="dateValue"
            mask="YYYY-MM-DD"
            color="primary"
            today-btn
            @update:model-value="updateDate"
          />
          <q-time
            :model-value="timeValue"
            mask="HH:mm"
            color="primary"
            format24h
            now-btn
            @update:model-value="updateTime"
          />
        </div>
        <q-separator />
        <q-card-actions align="right">
          <q-btn
            v-close-popup
            flat
            no-caps
            color="primary"
            :label="t('common.done')"
          />
        </q-card-actions>
      </q-card>
    </q-popup-proxy>
  </q-input>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

import { useFinancialFormat } from "@/composables/useFinancialFormat";

type Rule = (value: string) => boolean | string;

const props = withDefaults(
  defineProps<{
    modelValue: string;
    label: string;
    rules?: Rule[];
    disable?: boolean;
  }>(),
  { rules: () => [], disable: false }
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const { t } = useI18n();
const { formatLocalDateTime } = useFinancialFormat();
const open = ref(false);
const dateValue = computed(() => props.modelValue.slice(0, 10));
const timeValue = computed(() => props.modelValue.slice(11, 16));
const displayValue = computed(() => formatLocalDateTime(props.modelValue));
const displayRules = computed(() =>
  props.rules.map(rule => () => rule(props.modelValue))
);

function updateDate(value: string | null) {
  if (value !== null) emit("update:modelValue", `${value}T${timeValue.value}`);
}

function updateTime(value: string | null) {
  if (value !== null) emit("update:modelValue", `${dateValue.value}T${value}`);
}
</script>

<style scoped lang="scss">
.app-date-time-field__pickers {
  display: flex;
  flex-wrap: wrap;
  background: var(--omc-color-surface-elevated);
}

.app-date-time-field__pickers :deep(.q-date),
.app-date-time-field__pickers :deep(.q-time) {
  flex: 1 1 18rem;
  box-shadow: none;
}
</style>
