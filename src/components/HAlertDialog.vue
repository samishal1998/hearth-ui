<script setup lang="ts">
import HDialog from "./HDialog.vue";
import HButton from "./HButton.vue";
withDefaults(
  defineProps<{
    open?: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
    busy?: boolean;
    mobileBreakpoint?: number;
  }>(),
  { confirmLabel: "Confirm", cancelLabel: "Cancel" },
);
const emit = defineEmits<{
  "update:open": [open: boolean];
  confirm: [];
  cancel: [];
}>();
function cancel() {
  emit("update:open", false);
  emit("cancel");
}
</script>
<template>
  <HDialog
    :open="open"
    :title="title"
    :description="description"
    :mobile-breakpoint="mobileBreakpoint"
    role="alertdialog"
    @close="cancel"
    ><slot /><template #footer
      ><div class="h-confirm-actions">
        <HButton :disabled="busy" autofocus @click="cancel">{{
          cancelLabel
        }}</HButton
        ><HButton
          :variant="danger ? 'danger' : 'primary'"
          :loading="busy"
          @click="emit('confirm')"
          >{{ confirmLabel }}</HButton
        >
      </div></template
    ></HDialog
  >
</template>
<style scoped>
.h-confirm-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 12px;
}
</style>
