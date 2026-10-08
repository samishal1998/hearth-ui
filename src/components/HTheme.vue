<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import {
  themeStyle,
  type ThemeTokens,
  type ThemeModeTokens,
  type Mode,
  type Density,
} from "../themes";
const props = withDefaults(
  defineProps<{
    theme?: string;
    mode?: Mode;
    density?: Density;
    tokens?: ThemeTokens;
    modeTokens?: ThemeModeTokens;
    mobileBreakpoint?: number;
  }>(),
  { theme: "sunset", mode: "dark", density: "comfortable" },
);
const systemMode = ref<"dark" | "light">();
let preference: MediaQueryList | undefined;
function syncMode() {
  systemMode.value = preference?.matches ? "dark" : "light";
}
onMounted(() => {
  preference = window.matchMedia("(prefers-color-scheme: dark)");
  syncMode();
  preference.addEventListener("change", syncMode);
});
onBeforeUnmount(() => preference?.removeEventListener("change", syncMode));
const styles = computed(() => {
  const resolved = props.mode === "system" ? systemMode.value : props.mode;
  return {
    ...themeStyle(props.tokens),
    ...themeStyle(resolved ? props.modeTokens?.[resolved] : {}),
    ...(props.mobileBreakpoint !== undefined &&
    Number.isFinite(props.mobileBreakpoint) &&
    props.mobileBreakpoint >= 0
      ? { "--h-mobile-breakpoint": `${props.mobileBreakpoint}px` }
      : {}),
  };
});
</script>
<template>
  <div
    class="h-theme"
    part="base"
    :data-hearth-theme="theme"
    :data-hearth-mode="mode"
    :data-hearth-density="density"
    :style="styles"
  >
    <slot />
  </div>
</template>
<style src="../styles/themes.css"></style>
<style scoped>
.h-theme {
  color: var(--h-text);
  background: var(--h-bg);
  font-family: var(--h-font);
  font-size: var(--h-font-size);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  min-width: 0;
}
</style>
