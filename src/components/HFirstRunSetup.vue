<script setup lang="ts">
import { ref } from "vue";
import HPageHeader from "./HPageHeader.vue";
import HCard from "./HCard.vue";
import HInput from "./HInput.vue";
import HButton from "./HButton.vue";
import HButtonBar from "./HButtonBar.vue";
import HAlert from "./HAlert.vue";
import HProviderSetup from "./HProviderSetup.vue";
import HEmptyState from "./HEmptyState.vue";
import type { AuthCredentials, ConnectionDraft } from "../themes";
const props = withDefaults(
  defineProps<{
    step?: number;
    title?: string;
    busy?: boolean;
    error?: string;
    passwordMinLength?: number;
    connectionState?:
      "connecting" | "connected" | "reconnecting" | "failed" | "offline";
    connectionMessage?: string;
    allowBack?: boolean;
  }>(),
  {
    step: 0,
    title: "Make this space yours.",
    allowBack: true,
    connectionState: "offline",
  },
);
const emit = defineEmits<{
  "update:step": [step: number];
  account: [credentials: AuthCredentials];
  "test-provider": [draft: ConnectionDraft];
  provider: [draft: ConnectionDraft];
  complete: [];
}>();
const form = ref<HTMLFormElement>();
const steps = ["Owner account", "Connect infrastructure", "Ready to go"];
function account(e: SubmitEvent) {
  e.preventDefault();
  if (props.busy) return;
  const data = new FormData(e.currentTarget as HTMLFormElement);
  emit("account", {
    username: String(data.get("username") || ""),
    password: String(data.get("password") || ""),
  });
}
</script>
<template>
  <section class="h-first-run" part="base">
    <HPageHeader
      :title="title"
      description="A few simple steps to your own starting point."
      eyebrow="Welcome home"
    />
    <ol class="h-setup-steps" aria-label="Setup progress" part="steps">
      <li
        v-for="(label, i) in steps"
        :key="label"
        :aria-current="
          Math.max(0, Math.min(2, step)) === i ? 'step' : undefined
        "
        :class="{ current: step === i, done: step > i }"
      >
        <span>{{ i + 1 }}</span
        >{{ label }}
      </li>
    </ol>
    <HAlert v-if="error" tone="danger" :description="error" /><HCard
      v-if="step <= 0"
      title="Create your owner account"
      description="Your application securely creates and stores this account."
      ><slot name="account"
        ><form ref="form" @submit="account">
          <HInput
            name="username"
            label="Owner username"
            autocomplete="username"
            required
            :disabled="busy"
          /><HInput
            name="password"
            label="Owner password"
            type="password"
            autocomplete="new-password"
            required
            :minlength="passwordMinLength"
            :disabled="busy"
          /><HButtonBar align="end"
            ><HButton type="submit" variant="primary" :loading="busy"
              >Create owner account</HButton
            ></HButtonBar
          >
        </form></slot
      ></HCard
    ><HProviderSetup
      v-else-if="step === 1"
      :saving="busy"
      :testing="connectionState === 'connecting'"
      :state="connectionState"
      :message="connectionMessage"
      @test="emit('test-provider', $event)"
      @save="emit('provider', $event)"
    /><HEmptyState
      v-else
      title="A new place to call home."
      description="Your application has completed setup. Your workspace is ready."
      icon="check"
      ><HButton variant="primary" @click="emit('complete')"
        >Open your workspace</HButton
      ></HEmptyState
    ><HButton
      v-if="allowBack && step > 0 && step < 2"
      :disabled="busy"
      variant="ghost"
      @click="emit('update:step', step - 1)"
      >Back</HButton
    ><slot name="footer" />
  </section>
</template>
<style scoped>
@import "../styles/base.css";
.h-first-run {
  display: grid;
  gap: 25px;
  max-width: 820px;
  margin: 40px auto;
  color: var(--h-text);
  font-family: var(--h-font);
  min-width: 0;
}
.h-setup-steps {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  padding: 0;
  margin: 0;
  list-style: none;
}
.h-setup-steps li {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 11px;
  color: var(--h-muted);
}
.h-setup-steps span {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--h-border);
  border-radius: 50%;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}
.h-setup-steps .current {
  color: var(--h-accent-text);
}
.current span {
  background: var(--h-accent-subtle);
  border-color: var(--h-accent);
}
.done span {
  color: var(--h-success);
  border-color: var(--h-success);
}
form {
  display: grid;
  gap: 20px;
}
@media (max-width: 500px) {
  .h-setup-steps {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
