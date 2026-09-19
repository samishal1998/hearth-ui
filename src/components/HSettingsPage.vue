<script setup lang="ts">
import HPageHeader from "./HPageHeader.vue";
import HButton from "./HButton.vue";
import HButtonBar from "./HButtonBar.vue";
import HAlert from "./HAlert.vue";
withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    dirty?: boolean;
    saving?: boolean;
    error?: string;
    saveLabel?: string;
  }>(),
  {
    title: "Make yourself at home.",
    description: "A few thoughtful defaults. The rest is up to you.",
    saveLabel: "Save changes",
  },
);
const emit = defineEmits<{ save: []; reset: [] }>();
</script>
<template>
  <section class="h-settings-page" part="base">
    <HPageHeader
      :title="title"
      :description="description"
      eyebrow="Settings"
    /><HAlert v-if="error" tone="danger" :description="error" />
    <div class="h-settings-content" part="content"><slot /></div>
    <footer part="actions">
      <span role="status">{{
        saving
          ? "Saving your preferences…"
          : dirty
            ? "You have unsaved changes."
            : "All changes saved."
      }}</span
      ><HButtonBar align="end" label="Settings actions"
        ><HButton :disabled="!dirty || saving" @click="emit('reset')"
          >Reset changes</HButton
        ><HButton
          variant="primary"
          :disabled="!dirty"
          :loading="saving"
          @click="emit('save')"
          >{{ saveLabel }}</HButton
        ><slot name="actions"
      /></HButtonBar>
    </footer>
  </section>
</template>
<style scoped>
@import "../styles/base.css";
.h-settings-page {
  display: grid;
  gap: 24px;
  min-width: 0;
  color: var(--h-text);
  font-family: var(--h-font);
}
.h-settings-content {
  display: grid;
  gap: 22px;
}
footer {
  position: sticky;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  flex-wrap: wrap;
  padding: 18px;
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-card);
  background: var(--h-raised);
  box-shadow: var(--h-shadow-soft);
}
footer > span {
  font-size: 12px;
  color: var(--h-muted);
}
</style>
