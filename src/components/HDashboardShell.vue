<script setup lang="ts">
import { ref, useId } from "vue";
import HBrand from "./HBrand.vue";
import HIcon from "./HIcon.vue";
import HButton from "./HButton.vue";
import HNavList from "./HNavList.vue";
import type { NavItem } from "../themes";
withDefaults(
  defineProps<{
    brand?: string;
    logo?: string;
    workspace?: string;
    workspaceDescription?: string;
    items: NavItem[];
    active?: string;
    pageTitle?: string;
    username?: string;
    userRole?: string;
    footerNote?: string;
  }>(),
  {
    brand: "hearth",
    workspace: "My workspace",
    workspaceDescription: "Self-hosted & personal",
    items: () => [],
    pageTitle: "Overview",
    userRole: "Workspace owner",
    footerNote: "Hosted by you. Right where it belongs.",
  },
);
const emit = defineEmits<{ navigate: [id: string]; logout: [] }>();
const drawer = ref<HTMLDialogElement>();
const main = ref<HTMLElement>();
const id = useId();
function navigate(id: string) {
  emit("navigate", id);
  drawer.value?.close();
}
</script>
<template>
  <div class="h-dashboard" part="base">
    <a class="h-skip" :href="`#${id}-main`" @click.prevent="main?.focus()"
      >Skip to content</a
    >
    <aside class="h-sidebar" part="sidebar">
      <div class="h-sidebar-brand">
        <slot name="brand"><HBrand :name="brand" :logo="logo" /></slot>
      </div>
      <div class="h-workspace">
        <span class="h-workspace-icon"><HIcon name="lock" :size="18" /></span>
        <div>
          <strong>{{ workspace }}</strong
          ><small>{{ workspaceDescription }}</small>
        </div>
      </div>
      <span class="h-nav-label">Your space</span
      ><slot name="navigation"
        ><HNavList :items="items" :active="active" @navigate="navigate"
      /></slot>
      <div class="h-sidebar-end">
        <slot name="sidebar-footer"
          ><p class="h-host-note"><i />{{ footerNote }}</p>
          <div v-if="username" class="h-account">
            <span class="h-avatar">{{
              username.slice(0, 1).toUpperCase()
            }}</span>
            <div>
              <strong>{{ username }}</strong
              ><small>{{ userRole }}</small>
            </div>
            <HButton
              variant="ghost"
              icon="logout"
              icon-only
              label="Sign out"
              @click="emit('logout')"
            /></div
        ></slot>
      </div>
    </aside>
    <div class="h-dashboard-main">
      <header class="h-topbar" part="header">
        <HButton
          class="h-mobile-toggle"
          icon="menu"
          icon-only
          variant="ghost"
          label="Open navigation"
          @click="drawer?.showModal()"
        />
        <div class="h-breadcrumb">
          <HIcon name="home" :size="15" /><span>/</span>{{ pageTitle }}
        </div>
        <div class="h-top-actions"><slot name="header-actions" /></div>
      </header>
      <main
        :id="`${id}-main`"
        ref="main"
        tabindex="-1"
        class="h-main-content"
        part="content"
      >
        <slot />
      </main>
      <footer class="h-shell-footer" part="footer">
        <slot name="footer"
          ><HBrand :name="brand" /><span
            >Your infrastructure. Your starting point.</span
          ></slot
        >
      </footer>
    </div>
    <dialog
      ref="drawer"
      class="h-drawer"
      aria-label="Main navigation"
      part="mobile-navigation"
    >
      <div class="h-drawer-head">
        <HBrand :name="brand" :logo="logo" /><HButton
          variant="ghost"
          icon="close"
          icon-only
          label="Close navigation"
          @click="drawer?.close()"
        />
      </div>
      <HNavList :items="items" :active="active" @navigate="navigate" />
      <div v-if="username" class="h-mobile-user">
        <span>{{ username }} · {{ userRole }}</span
        ><HButton
          icon="logout"
          label="Sign out"
          @click="
            emit('logout');
            drawer?.close();
          "
        />
      </div>
    </dialog>
  </div>
</template>
<style scoped>
@import "../styles/base.css";
.h-dashboard {
  min-height: 100dvh;
  background: var(--h-bg);
  color: var(--h-text);
  font-family: var(--h-font);
  display: flex;
}
.h-sidebar {
  width: var(--h-sidebar-width);
  flex: 0 0 var(--h-sidebar-width);
  height: 100dvh;
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  padding: 35px 20px 0;
  border-right: 1px solid var(--h-border);
  background: var(--h-bg);
  overflow: auto;
}
.h-sidebar-brand {
  padding: 0 13px;
}
.h-workspace {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 32px 0 28px;
  padding: 13px 10px;
  border: 1px solid var(--h-border);
  border-radius: calc(var(--h-radius-control) + 2px);
  background: var(--h-surface);
}
.h-workspace-icon {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--h-accent-subtle);
  color: var(--h-accent-text);
  flex-shrink: 0;
}
.h-workspace strong {
  display: block;
  font-size: 12px;
  font-weight: 550;
}
.h-workspace small {
  display: block;
  font-size: 10px;
  color: var(--h-muted);
  margin-top: 4px;
}
.h-nav-label {
  font-size: 10px;
  letter-spacing: 1.4px;
  color: var(--h-muted);
  text-transform: uppercase;
  padding: 0 15px;
  margin-bottom: 12px;
}
.h-sidebar-end {
  margin-top: auto;
}
.h-host-note {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-size: 11px;
  line-height: 1.8;
  color: var(--h-muted);
  margin: 30px 10px 22px;
}
.h-host-note i {
  width: 5px;
  height: 5px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--h-success);
  margin-top: 7px;
}
.h-account {
  display: flex;
  align-items: center;
  gap: 9px;
  border-top: 1px solid var(--h-border);
  padding: 20px 0;
}
.h-avatar {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 33px;
  height: 33px;
  border-radius: 50%;
  background: var(--h-accent-subtle);
  color: var(--h-accent-text);
  border: 1px solid color-mix(in srgb, var(--h-accent) 25%, transparent);
  font-size: 12px;
}
.h-account > div {
  min-width: 0;
  flex: 1;
}
.h-account strong {
  display: block;
  font-size: 12px;
  font-weight: 550;
  overflow: hidden;
  text-overflow: ellipsis;
}
.h-account small {
  display: block;
  font-size: 10px;
  color: var(--h-muted);
  margin-top: 3px;
}
.h-dashboard-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.h-topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 76px;
  flex-shrink: 0;
  padding: 0 var(--h-page-padding);
  border-bottom: 1px solid var(--h-border);
}
.h-breadcrumb {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 12px;
  color: var(--h-muted);
}
.h-breadcrumb > span {
  opacity: 0.5;
}
.h-top-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex-wrap: wrap;
}
.h-main-content {
  flex: 1;
  min-width: 0;
  width: 100%;
  max-width: var(--h-content-max);
  padding: var(--h-page-padding);
  margin: 0 auto;
  outline: none;
}
.h-shell-footer {
  display: flex;
  align-items: center;
  gap: 20px;
  border-top: 1px solid var(--h-border);
  padding: 24px var(--h-page-padding);
  font-size: 11px;
  color: var(--h-muted);
}
.h-shell-footer :deep(.h-wordmark) {
  font-size: 20px;
}
.h-mobile-toggle {
  display: none;
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
.h-drawer {
  position: fixed;
  margin: 0;
  height: 100dvh;
  max-height: 100dvh;
  width: min(340px, 90vw);
  border: 0;
  border-right: 1px solid var(--h-border);
  padding: 25px 20px;
  background: var(--h-bg);
  color: var(--h-text);
  font-family: var(--h-font);
}
.h-drawer::backdrop {
  background: #020612bb;
  backdrop-filter: blur(4px);
}
.h-drawer-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}
.h-mobile-user {
  border-top: 1px solid var(--h-border);
  padding-top: 20px;
  margin-top: 30px;
  display: grid;
  gap: 15px;
  font-size: 12px;
  color: var(--h-muted);
}
@media (max-width: 800px) {
  .h-sidebar {
    display: none;
  }
  .h-mobile-toggle {
    display: inline-flex;
  }
  .h-topbar {
    height: 66px;
    padding: 0 16px;
  }
  .h-shell-footer {
    flex-wrap: wrap;
    gap: 10px;
  }
  .h-breadcrumb .h-icon,
  .h-breadcrumb > span {
    display: none;
  }
  .h-top-actions {
    gap: 6px;
  }
}
@media (max-width: 500px) {
  .h-topbar {
    height: auto;
    min-height: 66px;
    padding: 12px 16px;
    flex-wrap: wrap;
  }
  .h-top-actions {
    flex-basis: 100%;
    margin-left: 0;
    justify-content: flex-end;
  }
}
</style>
