<script setup lang="ts">
import HToolbar from "./HToolbar.vue";
import HButton from "./HButton.vue";
withDefaults(
  defineProps<{ label?: string; activeCount?: number; disabled?: boolean }>(),
  { label: "Filters", activeCount: 0 },
);
const emit = defineEmits<{ clear: [] }>();
</script>
<template>
  <HToolbar :label="label"
    ><slot /><HButton
      v-if="activeCount > 0"
      variant="ghost"
      :disabled="disabled"
      @click="emit('clear')"
      >Clear {{ activeCount }} filters</HButton
    ></HToolbar
  >
</template>
