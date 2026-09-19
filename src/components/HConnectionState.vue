<script setup lang="ts">
import HIcon from "./HIcon.vue";
import HButton from "./HButton.vue";
withDefaults(
  defineProps<{
    state?: "connecting" | "connected" | "reconnecting" | "failed" | "offline";
    label?: string;
    description?: string;
    retryable?: boolean;
  }>(),
  { state: "offline", label: "Connection", retryable: true },
);
const emit = defineEmits<{ retry: [] }>();
const labels = {
  connecting: "Connecting",
  connected: "Connected",
  reconnecting: "Reconnecting",
  failed: "Connection failed",
  offline: "Offline",
};
</script>
<template>
  <div
    class="h-connection"
    :class="state"
    :role="state === 'failed' ? 'alert' : 'status'"
    part="base"
  >
    <HIcon
      :name="
        state === 'connected' ? 'check' : state === 'failed' ? 'info' : 'server'
      "
    />
    <div class="h-connection-copy">
      <strong part="title">{{ label }} · {{ labels[state] }}</strong>
      <p v-if="description" part="description">{{ description }}</p>
    </div>
    <HButton
      v-if="retryable && (state === 'failed' || state === 'offline')"
      size="compact"
      @click="emit('retry')"
      >Retry connection</HButton
    >
  </div>
</template>
<style scoped>
@import "../styles/base.css";
.h-connection {
  --connection-color: var(--h-muted);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 17px;
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-card);
  background: var(--h-panel);
  color: var(--h-text);
  font-family: var(--h-font);
  flex-wrap: wrap;
}
.connected {
  --connection-color: var(--h-success);
}
.failed {
  --connection-color: var(--h-danger);
}
.connecting,
.reconnecting {
  --connection-color: var(--h-info);
}
.h-connection > .h-icon {
  color: var(--connection-color);
}
.h-connection-copy {
  flex: 1;
  min-width: 160px;
}
strong {
  font-size: 13px;
  font-weight: 550;
}
p {
  color: var(--h-muted);
  font-size: 12px;
  line-height: 1.8;
  margin-top: 3px;
}
</style>
