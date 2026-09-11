<script setup lang="ts">
import {
  themeStyle,
  type ThemeTokens,
  type Mode,
  type Density,
} from "../themes";
withDefaults(
  defineProps<{
    theme?: string;
    mode?: Mode;
    density?: Density;
    tokens?: ThemeTokens;
  }>(),
  { theme: "sunset", mode: "dark", density: "comfortable" },
);
</script>
<template>
  <div
    class="h-theme"
    part="base"
    :data-hearth-theme="theme"
    :data-hearth-mode="mode"
    :data-hearth-density="density"
    :style="themeStyle(tokens)"
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
