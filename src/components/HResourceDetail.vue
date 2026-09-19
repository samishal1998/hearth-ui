<script setup lang="ts">
import { ref, watch } from "vue";
import HBreadcrumbs from "./HBreadcrumbs.vue";
import HPageHeader from "./HPageHeader.vue";
import HDescriptionList from "./HDescriptionList.vue";
import HBadge from "./HBadge.vue";
import HTabs from "./HTabs.vue";
import type { NavItem, DescriptionItem, TabItem, Tone } from "../themes";
const props = withDefaults(
  defineProps<{
    title: string;
    description?: string;
    breadcrumbs?: NavItem[];
    fields?: DescriptionItem[];
    tabs?: TabItem[];
    activeTab?: string;
    status?: string;
    tone?: Tone;
  }>(),
  { breadcrumbs: () => [], fields: () => [], tabs: () => [], tone: "neutral" },
);
const emit = defineEmits<{
  navigate: [id: string];
  "update:activeTab": [value: string];
}>();
const active = ref(props.activeTab);
watch(
  () => props.activeTab,
  (v) => (active.value = v),
);
</script>
<template>
  <section class="h-resource" part="base">
    <HBreadcrumbs
      v-if="breadcrumbs.length"
      :items="breadcrumbs"
      @navigate="emit('navigate', $event)"
    /><HPageHeader :title="title" :description="description"
      ><HBadge v-if="status" :label="status" :tone="tone" dot /><slot
        name="actions" /></HPageHeader
    ><HDescriptionList v-if="fields.length" :items="fields" :columns="2" /><slot
      name="summary"
    /><HTabs
      v-if="tabs.length"
      v-model="active"
      :items="tabs"
      :label="`${title} sections`"
      @update:model-value="emit('update:activeTab', $event)"
      ><template v-for="tab in tabs" :key="tab.value" #[tab.value]
        ><slot :name="tab.value" /></template></HTabs
    ><slot v-else />
  </section>
</template>
<style scoped>
.h-resource {
  display: grid;
  gap: 25px;
  min-width: 0;
  color: var(--h-text);
  font-family: var(--h-font);
}
</style>
