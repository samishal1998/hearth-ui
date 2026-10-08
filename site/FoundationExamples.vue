<script setup lang="ts">
import { ref } from "vue";
import {
  HSurface,
  HInput,
  HSelect,
  HCombobox,
  HCheckbox,
  HSwitch,
  HTextarea,
  HButton,
  type IconDefinition,
} from "../src";
const query = ref(""),
  provider = ref("all"),
  project = ref(""),
  selected = ref(false),
  pinned = ref(false),
  notes = ref("");
const saved = ref("");
const customIcon: IconDefinition = {
  viewBox: "0 0 24 24",
  paths: ["M4 7h16M4 12h10M4 17h16"],
};
</script>
<template>
  <section class="foundation-examples" aria-label="Foundation examples">
    <h2>Build your own interface.</h2>
    <p class="muted">
      A surface, compact controls, and custom icons. Every control keeps its
      accessible name.
    </p>
    <HSurface as="section" aria-label="Custom workspace panel"
      ><form
        aria-label="Foundation form"
        @submit.prevent="saved = 'Preferences saved in this example.'"
      >
        <div class="foundation-toolbar">
          <HInput
            v-model="query"
            name="query"
            label="Find sessions"
            type="search"
            leading-icon="search"
            hide-label
            size="compact"
            placeholder="Find sessions…"
          /><HSelect
            v-model="provider"
            name="provider"
            label="Provider filter"
            hide-label
            size="compact"
            :options="[
              { value: 'all', label: 'All providers' },
              { value: 'local', label: 'Local' },
            ]"
          /><HCombobox
            v-model="project"
            name="project"
            label="Project filter"
            hide-label
            size="compact"
            placeholder="All projects"
            :options="[
              { value: 'hearth', label: 'Hearth UI' },
              { value: 'trail', label: 'Apptrail' },
            ]"
          />
        </div>
        <HSurface tone="inset" padding="sm"
          ><div class="foundation-row">
            <HCheckbox
              v-model="selected"
              name="selected"
              label="Select foundation session"
              hide-label
              size="compact"
            />
            <div class="foundation-copy">
              <strong>Refine the dashboard</strong>
              <p class="muted">A custom row built from public primitives.</p>
            </div>
            <HButton
              icon-only
              label="Inspect foundation session"
              :icon="customIcon"
              @click="saved = 'Inspect action requested.'"
            /></div
        ></HSurface>
        <div class="foundation-preferences">
          <div class="foundation-switch-label">
            <span>Pinned sessions only</span
            ><HSwitch
              v-model="pinned"
              name="pinned"
              label="Pinned sessions only"
              hide-label
              size="compact"
            />
          </div>
          <HTextarea
            v-model="notes"
            name="notes"
            label="Session notes"
            hide-label
            size="compact"
            placeholder="Add a note…"
            :rows="2"
          />
        </div>
        <HButton type="submit" variant="primary"
          ><template #icon
            ><svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
            >
              <path d="m5 12 4 4L19 6" /></svg></template
          >Save preferences</HButton
        >
        <p v-if="saved" role="status">{{ saved }}</p>
      </form></HSurface
    >
  </section>
</template>
<style scoped>
.foundation-examples {
  margin-block: 32px;
}
.foundation-examples > p {
  margin-bottom: 20px;
}
.foundation-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}
.foundation-toolbar > * {
  flex: 1 1 180px;
  min-width: 0;
}
.foundation-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.foundation-copy {
  flex: 1;
  min-width: 0;
  font-size: 13px;
}
.foundation-copy p {
  margin: 4px 0 0;
  font-size: 12px;
}
.foundation-preferences {
  display: grid;
  gap: 16px;
  margin-block: 20px;
}
.foundation-switch-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  gap: 16px;
}
</style>
