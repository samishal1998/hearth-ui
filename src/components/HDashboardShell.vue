<script setup lang="ts">
import { ref, useId, watch, nextTick, onMounted } from "vue";
import { useSlotPresence } from "../slots";
import { useMobileLayout } from "../mobile";
import HBrand from "./HBrand.vue";
import HIcon from "./HIcon.vue";
import HButton from "./HButton.vue";
import HNavList from "./HNavList.vue";
import type { NavItem, IconValue } from "../themes";
const props = withDefaults(
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
    mobileBreakpoint?: number;
    showWorkspace?: boolean;
    showWorkspaceIcon?: boolean;
    workspaceIcon?: IconValue;
    navigationLabel?: string;
    navLabel?: string;
    contentMaxWidth?: string;
    innerScroll?: boolean;
    titleAsHeading?: boolean;
    contentTag?: "main" | "div";
  }>(),
  {
    brand: "hearth",
    workspace: "My workspace",
    workspaceDescription: "Self-hosted & personal",
    items: () => [],
    pageTitle: "Overview",
    userRole: "Workspace owner",
    footerNote: "Hosted by you. Right where it belongs.",
    showWorkspace: true,
    showWorkspaceIcon: true,
    workspaceIcon: "lock",
    navigationLabel: "Your space",
    navLabel: "Main navigation",
    contentTag: "main",
  },
);
const emit = defineEmits<{ navigate: [id: string]; logout: [] }>();
const drawer = ref<HTMLDialogElement>();
const mobile = useMobileLayout(drawer, () => props.mobileBreakpoint);
const main = ref<HTMLElement>();
const sidebar = ref<HTMLElement>(),
  sidebarContent = ref<HTMLElement>(),
  drawerBody = ref<HTMLElement>(),
  root = ref<HTMLElement>();
const hasSlot = useSlotPresence(() => root.value);
async function moveSidebar() {
  await nextTick();
  const target = mobile.value ? drawerBody.value : sidebar.value;
  if (
    target &&
    sidebarContent.value &&
    sidebarContent.value.parentElement !== target
  )
    target.append(sidebarContent.value);
}
watch(mobile, moveSidebar, { flush: "post" });
onMounted(moveSidebar);
const id = useId();
watch(mobile, async (value) => {
  if (!value && drawer.value?.open) {
    drawer.value.close();
    await nextTick();
    main.value?.focus({ preventScroll: true });
  }
});
function navigate(id: string) {
  emit("navigate", id);
  drawer.value?.close();
}
</script>
<template>
  <div
    ref="root"
    class="h-dashboard"
    :class="{ 'h-mobile': mobile, 'inner-scroll': innerScroll }"
    :style="{ '--h-content-max': contentMaxWidth }"
    part="base"
  >
    <a class="h-skip" :href="`#${id}-main`" @click.prevent="main?.focus()"
      >Skip to content</a
    >
    <aside ref="sidebar" class="h-sidebar" part="sidebar">
      <div ref="sidebarContent" class="h-sidebar-content">
        <div class="h-sidebar-brand">
          <slot name="brand"><HBrand :name="brand" :logo="logo" /></slot>
        </div>
        <slot name="workspace"
          ><div v-if="showWorkspace" class="h-workspace">
            <span v-if="showWorkspaceIcon" class="h-workspace-icon"
              ><slot name="workspace-icon"
                ><HIcon :name="workspaceIcon" :size="18" /></slot
            ></span>
            <div>
              <strong>{{ workspace }}</strong
              ><small>{{ workspaceDescription }}</small>
            </div>
          </div></slot
        >
        <span v-if="navigationLabel" class="h-nav-label">{{
          navigationLabel
        }}</span
        ><slot name="navigation"
          ><HNavList
            :items="items"
            :active="active"
            :label="navLabel"
            @navigate="navigate"
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
        <component :is="titleAsHeading ? 'h1' : 'div'" class="h-breadcrumb">
          <slot name="page-title"
            ><template v-if="!titleAsHeading"
              ><HIcon name="home" :size="15" /><span>/</span></template
            >{{ pageTitle }}</slot
          >
        </component>
        <div class="h-top-actions"><slot name="header-actions" /></div>
      </header>
      <div class="h-work-area">
        <component
          :is="contentTag"
          :role="contentTag === 'div' ? 'region' : undefined"
          :aria-label="contentTag === 'div' ? pageTitle : undefined"
          :id="`${id}-main`"
          ref="main"
          tabindex="-1"
          class="h-main-content"
          part="content"
        >
          <slot />
        </component>
        <aside
          v-if="hasSlot('side-pane')"
          class="h-shell-pane"
          part="side-pane"
        >
          <slot name="side-pane" />
        </aside>
      </div>
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
      class="h-drawer h-mobile-overlay"
      :class="{ 'h-mobile': mobile }"
      :aria-label="navLabel"
      part="mobile-navigation"
    >
      <div class="h-drawer-head h-overlay-header">
        <HBrand :name="brand" :logo="logo" /><HButton
          variant="ghost"
          icon="close"
          icon-only
          label="Close navigation"
          @click="drawer?.close()"
        />
      </div>
      <div ref="drawerBody" class="h-overlay-body" />
    </dialog>
  </div>
</template>
<style scoped>
@import "../styles/base.css";
@import "../styles/mobile-overlay.css";
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
  font-size: max(var(--h-font-min-size, 12px), 10px);
  color: var(--h-muted);
  margin-top: 4px;
}
.h-nav-label {
  font-size: max(var(--h-font-min-size, 12px), 10px);
  letter-spacing: 1.4px;
  color: var(--h-muted);
  text-transform: uppercase;
  padding: 0 15px;
  margin-bottom: 12px;
}
.h-sidebar-end {
  margin-top: auto;
}
.h-sidebar-content {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
}
.h-work-area {
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
}
.h-shell-pane {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
}
.inner-scroll {
  height: 100dvh;
  overflow: hidden;
}
.inner-scroll .h-main-content {
  overflow: auto;
  min-height: 0;
  overscroll-behavior: contain;
}
.inner-scroll .h-shell-footer {
  flex-shrink: 0;
}
.h-breadcrumb {
  margin: 0;
  font-weight: 500;
}
.h-drawer .h-sidebar-brand {
  display: none;
}
.h-drawer .h-sidebar-content {
  min-height: 0;
}
.h-host-note {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-size: max(var(--h-font-min-size, 12px), 11px);
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
  font-size: max(var(--h-font-min-size, 12px), 10px);
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
  font-size: max(var(--h-font-min-size, 12px), 11px);
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
.h-dashboard.h-mobile .h-sidebar {
  display: none;
}
.h-dashboard.h-mobile .h-mobile-toggle {
  display: inline-flex;
}
.h-dashboard.h-mobile .h-topbar {
  height: 66px;
  padding: 0 16px;
}
.h-dashboard.h-mobile .h-shell-footer {
  flex-wrap: wrap;
  gap: 10px;
}
.h-dashboard.h-mobile .h-breadcrumb .h-icon,
.h-dashboard.h-mobile .h-breadcrumb > span {
  display: none;
}
.h-dashboard.h-mobile .h-top-actions {
  gap: 6px;
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
