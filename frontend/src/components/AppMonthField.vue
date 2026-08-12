<template>
  <q-input
    :model-value="displayValue"
    dense
    outlined
    readonly
    :label="label"
    :disable="disable"
    @click="open = true"
  >
    <template #append><q-icon name="calendar_month" /></template>
    <q-popup-proxy
      v-model="open"
      cover
      transition-show="scale"
      transition-hide="scale"
    >
      <q-date
        :model-value="dateValue"
        mask="YYYY-MM-DD"
        color="primary"
        minimal
        default-view="Years"
        @update:model-value="selectDate"
      />
    </q-popup-proxy>
  </q-input>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

import { useAppLocale } from "@/composables/useAppLocale";
import { formatMonth } from "@/features/transactions/month";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    label: string;
    disable?: boolean;
  }>(),
  { disable: false }
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const { locale } = useAppLocale();
const open = ref(false);
const dateValue = computed(() => `${props.modelValue}-01`);
const displayValue = computed(() =>
  formatMonth(props.modelValue, locale.value)
);

function selectDate(value: string | null) {
  if (value === null) return;

  emit("update:modelValue", value.slice(0, 7));
  open.value = false;
}
</script>
