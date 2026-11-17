<script setup lang="ts">
import { computed, ref } from "vue";
import { HIcon, HInput, HInlineCopyText, iconNames, iconAliases } from "../src";
const query = ref("");
const names = computed(() =>
  iconNames.filter((name) => name.includes(query.value.trim().toLowerCase())),
);
</script>
<template>
  <section class="icon-gallery" aria-label="Built-in icons">
    <h2>Built-in icons</h2>
    <p>
      24 × 24 grid · 1.8px stroke · round caps and joins. Use the icon that
      matches the action.
    </p>
    <HInput
      v-model="query"
      label="Find an icon"
      type="search"
      placeholder="save, retry, snooze, admin…"
    />
    <p role="status">
      {{ names.length }} icon names, including explicit semantic aliases
    </p>
    <div class="icon-grid">
      <div v-for="name in names" :key="name" class="icon-tile">
        <HIcon :name="name" :size="24" /><HInlineCopyText
          :value="name"
          :label="`${name} icon name`"
        />
        <small v-if="iconAliases[name]"
          >Same glyph as {{ iconAliases[name] }}</small
        >
      </div>
    </div>
    <p v-if="!names.length">No icons match. Try another name.</p>
    <h3>Directions are not actions</h3>
    <p>
      <code>arrow</code> points right; <code>left</code>, <code>right</code>,
      <code>up</code>, and <code>down</code> are chevrons for navigation or
      disclosure. Use <code>refresh</code> to retry, <code>download</code>/<code
        >upload</code
      >
      to transfer files, and <code>play</code>/<code>pause</code> for execution.
      <code>launch</code> denotes an external destination.
    </p>
    <h3>Everyday actions and states</h3>
    <p>
      <code>success</code> and <code>error</code> are circled status marks;
      <code>check</code> is a plain checkmark, and <code>alert</code>/<code
        >warning</code
      >
      is a warning triangle. <code>cancel</code> shares the close glyph;
      <code>retry</code>/<code>reload</code> share refresh;
      <code>time</code> shares clock. <code>resend</code> is a message with a
      retry arrow, <code>snooze</code> a clock with a sleep mark,
      <code>later</code> a clock with a defer arrow, and <code>admin</code> a
      person with a shield. These indicate UI meaning, not permissions or
      application behavior.
    </p>
    <p>
      <code>link</code> connects, <code>unlink</code>/<code>link-off</code>
      disconnect, and <code>launch</code> opens an external destination. Glyphs
      do not automatically mirror in RTL; apply mirroring only when the
      surrounding navigation calls for it. <code>iconAliases</code> exposes the
      alias-to-canonical-name mapping in both packages.
    </p>
    <p>
      Import <code>iconDefinitions</code> to reuse a built-in as an
      <code>IconDefinition</code>, for example
      <code>{ ...iconDefinitions.refresh, strokeWidth: 2 }</code>. Definitions
      are immutable. Label the containing action; icons are decorative.
    </p>
  </section>
</template>
<style scoped>
code {
  white-space: normal;
  overflow-wrap: anywhere;
}
.icon-gallery {
  margin-top: 24px;
  padding: 24px;
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-card);
  background: var(--h-surface);
  min-width: 0;
}
h2 {
  font-size: 18px;
}
h3 {
  font-size: 15px;
  margin-top: 24px;
}
p {
  font-size: 12px;
  line-height: 1.8;
  color: var(--h-muted);
  overflow-wrap: anywhere;
}
.icon-gallery > .h-field {
  max-width: 360px;
  margin-top: 16px;
}
.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
}
.icon-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px 8px;
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-control);
  min-width: 0;
}
.icon-tile small {
  font-size: 11px;
  color: var(--h-muted);
  text-align: center;
  overflow-wrap: anywhere;
}
@media (max-width: 500px) {
  .icon-gallery {
    padding: 16px;
  }
  .icon-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
