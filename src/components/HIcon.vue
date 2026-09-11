<script setup lang="ts">
withDefaults(defineProps<{ name?: string; size?: number }>(), {
  name: "apps",
  size: 20,
});
const paths: Record<string, string> = {
  apps: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  home: "m3 10 9-7 9 7v10H15v-6H9v6H3z",
  search: "M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  plus: "M12 5v14M5 12h14",
  close: "m6 6 12 12M18 6 6 18",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  launch: "M14 3h7v7m0-7L10 14M10 3H3v18h18v-7",
  check: "m5 12 4 4L19 6",
  star: "m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z",
  lock: "M5 10h14v11H5zM8 10V7a4 4 0 0 1 8 0v3m-4 4v3",
  globe:
    "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M3 12h18M12 3c-5 5-5 13 0 18 5-5 5-13 0-18",
  server: "M3 3h18v7H3zM3 14h18v7H3zM7 6.5h.01M7 17.5h.01M12 6.5h5M12 17.5h5",
  providers: "M12 3v7M5 17l7-7 7 7M9 3h6v4H9zM2 17h6v4H2zM16 17h6v4h-6z",
  health: "M3 12h4l3-8 4 16 3-8h4",
  settings:
    "m10 3-1 3-3 1-3 3 2 2-2 2 3 3 3 1 1 3h4l1-3 3-1 3-3-2-2 2-2-3-3-3-1-1-3zM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  menu: "M4 6h16M4 12h16M4 18h16",
  logout: "M9 4H4v16h5M10 12h11m-4-4 4 4-4 4",
  moon: "M20 14A8 8 0 0 1 10 4a8.5 8.5 0 1 0 10 10Z",
  sun: "M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2",
  down: "m6 9 6 6 6-6",
  up: "m6 15 6-6 6 6",
  info: "M12 11v6m0-10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0",
  layout: "M3 3h6v18H3zM13 3h8v7h-8zM13 14h8v7h-8z",
  code: "m8 6-6 6 6 6m8-12 6 6-6 6m-3-14-2 16",
  copy: "M8 8h13v13H8zM16 8V3H3v13h5",
};
</script>
<template>
  <svg
    class="h-icon"
    part="icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path :d="paths[name] || paths.apps" />
  </svg>
</template>
<style scoped>
.h-icon {
  display: inline-block;
  flex: 0 0 auto;
  vertical-align: middle;
}
</style>
