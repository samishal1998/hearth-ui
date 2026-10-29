<script setup lang="ts">
import { computed, ref, watch, useId } from "vue";
import HButton from "./HButton.vue";
const props = withDefaults(
  defineProps<{
    values?: number[];
    label: string;
    active?: boolean;
    height?: number;
  }>(),
  {
    values: () => [
      0.2, 0.4, 0.7, 0.3, 0.5, 0.9, 0.6, 0.35, 0.8, 0.45, 0.65, 0.25, 0.5, 0.85,
      0.4, 0.7, 0.3, 0.55, 0.95, 0.45, 0.6, 0.8, 0.35, 0.2,
    ],
    height: 80,
  },
);
const emit = defineEmits<{ "update:active": [active: boolean] }>();
const moving = ref(props.active),
  id = useId();
watch(
  () => props.active,
  (value) => (moving.value = value),
);
const samples = computed(() =>
  props.values
    .slice(-128)
    .map((value) =>
      Number.isFinite(value)
        ? Math.max(0.04, Math.min(1, Math.abs(value)))
        : 0.04,
    ),
);
function toggle() {
  moving.value = !moving.value;
  emit("update:active", moving.value);
}
</script>
<template>
  <figure
    class="h-waveform"
    :class="{ moving }"
    :aria-labelledby="`${id}-label`"
    part="base"
  >
    <figcaption :id="`${id}-label`">{{ label }}</figcaption>
    <div
      v-if="samples.length"
      class="h-waveform-bars"
      aria-hidden="true"
      part="bars"
      :style="{
        height: `${Math.max(32, Math.min(320, Number.isFinite(height) ? height : 80))}px`,
        gap: `min(5px, ${100 / (samples.length * 3)}%)`,
      }"
    >
      <span
        v-for="(value, index) in samples"
        :key="index"
        part="bar"
        :style="{
          height: `${value * 100}%`,
          '--h-wave-delay': `${index * -83}ms`,
          '--h-wave-duration': `${700 + (index % 5) * 170}ms`,
        }"
      />
    </div>
    <p v-else>No signal data.</p>
    <div class="h-waveform-footer">
      <span class="h-waveform-state">{{
        moving ? "Active signal" : "Signal paused"
      }}</span
      ><HButton size="compact" :aria-pressed="!!moving" @click="toggle">{{
        moving ? "Pause animation" : "Resume animation"
      }}</HButton>
    </div>
  </figure>
</template>
<style scoped>
@import "../styles/base.css";
.h-waveform {
  margin: 0;
  min-width: 0;
  color: var(--h-text);
  font: var(--h-font-size)/1.6 var(--h-font);
}
figcaption {
  font-weight: 600;
  overflow-wrap: anywhere;
}
.h-waveform-bars {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(1px, 0.5vw, 5px);
  margin-block: 12px;
  overflow: hidden;
}
.h-waveform-bars span {
  display: block;
  flex: 1;
  max-width: 8px;
  min-width: 1px;
  border-radius: 999px;
  background: var(--h-accent);
  transform-origin: center;
}
.h-waveform-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.h-waveform-state,
p {
  color: var(--h-muted);
  font-size: 12px;
}
@media (prefers-reduced-motion: no-preference) {
  .h-waveform-bars span {
    animation: h-wave var(--h-wave-duration) ease-in-out var(--h-wave-delay)
      infinite alternate;
    animation-play-state: paused;
    transition: height 200ms var(--h-ease);
  }
  .moving .h-waveform-bars span {
    animation-play-state: running;
  }
  @keyframes h-wave {
    from {
      scale: 1 0.35;
    }
    to {
      scale: 1 1;
    }
  }
}
</style>
