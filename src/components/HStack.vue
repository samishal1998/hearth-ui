<script setup lang="ts">
withDefaults(
  defineProps<{
    as?: "div" | "section" | "nav";
    direction?: "row" | "column";
    gap?: number;
    align?: "start" | "center" | "end" | "stretch" | "baseline";
    justify?: "start" | "center" | "end" | "between";
    wrap?: boolean;
  }>(),
  {
    as: "div",
    direction: "column",
    gap: 4,
    align: "stretch",
    justify: "start",
  },
);
</script>
<template>
  <component
    :is="as"
    class="h-stack"
    part="base"
    :style="{
      flexDirection: direction,
      gap: `calc(var(--h-space,4px) * ${Math.max(0, gap)})`,
      alignItems:
        align === 'start' ? 'flex-start' : align === 'end' ? 'flex-end' : align,
      justifyContent:
        justify === 'between'
          ? 'space-between'
          : justify === 'start'
            ? 'flex-start'
            : justify === 'end'
              ? 'flex-end'
              : justify,
      flexWrap: wrap ? 'wrap' : 'nowrap',
    }"
    ><slot
  /></component>
</template>
<style scoped>
.h-stack {
  display: flex;
  min-width: 0;
}
.h-stack > * {
  min-width: 0;
}
</style>
