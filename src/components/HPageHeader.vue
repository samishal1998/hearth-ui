<script setup lang="ts">
import HIcon from "./HIcon.vue";
withDefaults(
  defineProps<{
    title: string;
    accent?: string;
    description?: string;
    eyebrow?: string;
    variant?: "plain" | "hero";
    decoration?: boolean;
    size?: "sm" | "md" | "lg";
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    actionsPlacement?: "below" | "end";
  }>(),
  { variant: "plain", decoration: true, level: 1, actionsPlacement: "below" },
);
</script>
<template>
  <section
    class="h-page-header"
    :class="[variant, size, `actions-${actionsPlacement}`]"
    part="base"
  >
    <slot name="leading" />
    <div class="h-page-copy">
      <p v-if="eyebrow" class="h-eyebrow" part="eyebrow">{{ eyebrow }}</p>
      <component :is="`h${level}`" class="h-page-title" part="title">
        <slot name="title"
          >{{ title
          }}<template v-if="accent"
            ><br /><span>{{ accent }}</span></template
          ></slot
        >
      </component>
      <p v-if="description" class="h-description" part="description">
        {{ description }}
      </p>
    </div>
    <div class="h-header-actions" part="actions">
      <slot name="actions"><slot /></slot>
    </div>
    <div
      v-if="variant === 'hero' && decoration"
      class="h-hero-art"
      aria-hidden="true"
    >
      <div class="h-orbit" />
      <div class="h-glow" />
      <div class="h-tile one"><HIcon name="server" :size="30" /></div>
      <div class="h-tile two"><HIcon name="apps" :size="34" /></div>
      <div class="h-tile three"><HIcon name="lock" :size="22" /></div>
    </div>
    <slot name="aside" />
  </section>
</template>
<style scoped>
@import "../styles/base.css";
.h-page-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  color: var(--h-text);
  font-family: var(--h-font);
  min-width: 0;
  flex-wrap: wrap;
}
.h-page-copy {
  position: relative;
  z-index: 1;
  min-width: 0;
}
.h-eyebrow {
  color: var(--h-muted);
  font-size: max(var(--h-font-min-size, 12px), 10px);
  font-weight: 550;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 13px;
}
.h-page-title {
  font-size: clamp(28px, 3vw, 38px);
  font-weight: 550;
  letter-spacing: -1.3px;
  line-height: 1.2;
}
.h-page-title span {
  color: var(--h-accent-text);
}
.h-description {
  font-size: 13px;
  line-height: 1.8;
  color: var(--h-muted);
  margin-top: 13px;
  max-width: 600px;
}
.h-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 23px;
}
.h-header-actions:empty {
  display: none;
}
.actions-below .h-header-actions {
  flex-basis: 100%;
  order: 3;
  margin-top: 0;
}
.actions-end .h-header-actions {
  margin-top: 0;
  margin-inline-start: auto;
}
.sm .h-page-title {
  font-size: 22px;
  letter-spacing: -0.5px;
}
.md .h-page-title {
  font-size: 28px;
}
.lg .h-page-title {
  font-size: 38px;
}
.hero {
  padding: clamp(26px, 4vw, 40px);
  border-radius: var(--h-radius-panel);
  border: 1px solid var(--h-border);
  background: var(--h-scene-bg);
  color: var(--h-scene-text);
  min-height: 280px;
  overflow: hidden;
}
.hero .h-eyebrow,
.hero .h-description {
  color: var(--h-scene-muted);
}
.hero .h-page-title span {
  color: var(--h-accent-hover);
}
.h-hero-art {
  position: relative;
  align-self: stretch;
  min-height: 200px;
  width: 240px;
  flex-shrink: 0;
}
.h-orbit {
  position: absolute;
  width: 220px;
  height: 220px;
  border: 1px dashed color-mix(in srgb, var(--h-accent) 25%, transparent);
  border-radius: 50%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.h-glow {
  position: absolute;
  width: 120px;
  height: 120px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: var(--h-accent);
  opacity: 0.3;
  filter: blur(30px);
}
.h-tile {
  position: absolute;
  display: grid;
  place-items: center;
  width: 66px;
  height: 66px;
  border-radius: calc(var(--h-radius-control) + 7px);
  border: 1px solid #ffffff25;
  background: color-mix(in srgb, var(--h-info) 22%, #101a2b);
  color: var(--h-info);
  box-shadow: 0 12px 26px #050a1744;
}
.one {
  left: 10%;
  top: 25%;
  transform: rotate(-12deg);
}
.two {
  left: 48%;
  top: 42%;
  transform: rotate(10deg);
  width: 78px;
  height: 78px;
  background: color-mix(in srgb, var(--h-accent) 35%, #101a2b);
  color: var(--h-accent-hover);
}
.three {
  left: 42%;
  top: 0;
  width: 48px;
  height: 48px;
  transform: rotate(6deg);
  background: color-mix(in srgb, var(--h-success) 20%, #101a2b);
  color: var(--h-success);
}
@media (max-width: 650px) {
  .h-hero-art {
    position: absolute;
    right: -25px;
    top: 20px;
    bottom: 20px;
    opacity: 0.15;
    pointer-events: none;
  }
  .hero {
    min-height: 290px;
  }
  .h-description {
    max-width: 400px;
  }
}
</style>
