<script setup lang="ts">
import { ref, useId } from "vue";
import HBrand from "./HBrand.vue";
import { safeHref } from "../internal";
import type { NavItem } from "../themes";
withDefaults(
  defineProps<{
    brand?: string;
    logo?: string;
    brandHref?: string;
    items?: NavItem[];
    active?: string;
    footerText?: string;
  }>(),
  {
    brand: "hearth",
    brandHref: "/",
    items: () => [],
    footerText: "A little order for your digital world.",
  },
);
const emit = defineEmits<{ navigate: [id: string] }>();
const main = ref<HTMLElement>();
const id = useId();
</script>
<template>
  <div class="h-public" part="base">
    <a class="h-skip" :href="`#${id}-main`" @click.prevent="main?.focus()"
      >Skip to content</a
    >
    <header class="h-public-header" part="header">
      <a :href="safeHref(brandHref)" class="h-brand-link"
        ><slot name="brand"><HBrand :name="brand" :logo="logo" /></slot
      ></a>
      <nav aria-label="Public pages">
        <slot name="navigation"
          ><component
            :is="safeHref(item.href) ? 'a' : 'button'"
            v-for="item in items"
            :key="item.id"
            :href="item.disabled ? undefined : safeHref(item.href)"
            :type="safeHref(item.href) ? undefined : 'button'"
            :disabled="safeHref(item.href) ? undefined : item.disabled"
            :aria-current="active === item.id ? 'page' : undefined"
            :aria-disabled="item.disabled || undefined"
            @click="
              (e: Event) => {
                if (item.disabled) {
                  e.preventDefault();
                  return;
                }
                emit('navigate', item.id);
              }
            "
            >{{ item.label }}</component
          ></slot
        >
      </nav>
      <div class="h-public-actions"><slot name="actions" /></div>
    </header>
    <main :id="`${id}-main`" ref="main" tabindex="-1" part="content">
      <slot />
    </main>
    <footer part="footer">
      <slot name="footer"
        ><HBrand :name="brand" /><span>{{ footerText }}</span></slot
      >
    </footer>
  </div>
</template>
<style scoped>
@import "../styles/base.css";
.h-public {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--h-bg);
  color: var(--h-text);
  font-family: var(--h-font);
  padding-inline: var(--h-page-padding);
}
.h-public-header {
  display: flex;
  align-items: center;
  gap: 30px;
  min-height: 92px;
  border-bottom: 1px solid var(--h-border);
  max-width: var(--h-content-max);
  width: 100%;
  margin: 0 auto;
}
.h-brand-link {
  display: inline-flex;
  text-decoration: none;
}
nav {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}
nav a,
nav button {
  padding: 10px 12px;
  border: 0;
  border-radius: var(--h-radius-control);
  background: none;
  color: var(--h-muted);
  font-size: 13px;
  text-decoration: none;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}
nav [aria-current="page"],
nav a:hover,
nav button:hover {
  color: var(--h-accent-text);
  background: var(--h-accent-subtle);
}
.h-public-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
main {
  flex: 1;
  min-width: 0;
  width: 100%;
  max-width: var(--h-content-max);
  margin: 0 auto;
  outline: none;
}
footer {
  display: flex;
  align-items: center;
  gap: 20px;
  max-width: var(--h-content-max);
  width: 100%;
  margin: 0 auto;
  padding: 28px 0;
  border-top: 1px solid var(--h-border);
  font-size: 12px;
  color: var(--h-muted);
}
footer :deep(.h-wordmark) {
  font-size: 22px;
}
.h-skip {
  position: fixed;
  top: -80px;
  left: 16px;
  z-index: 100;
  padding: 12px;
  background: var(--h-accent);
  color: var(--h-on-accent);
  border-radius: var(--h-radius-control);
}
.h-skip:focus {
  top: 16px;
}
@media (max-width: 650px) {
  .h-public-header {
    gap: 8px;
    flex-wrap: wrap;
    padding-block: 16px;
  }
  .h-public-actions {
    margin-left: auto;
  }
  nav {
    order: 3;
    width: 100%;
    margin-left: 0;
    flex-wrap: wrap;
  }
  .h-public-header:has(nav:empty) nav {
    display: none;
  }
  footer {
    flex-wrap: wrap;
    gap: 12px;
  }
}
</style>
