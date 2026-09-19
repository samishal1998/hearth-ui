<script setup lang="ts">
import { computed } from "vue";
import HPublicShell from "./HPublicShell.vue";
import HPageHeader from "./HPageHeader.vue";
import HBadge from "./HBadge.vue";
import HCard from "./HCard.vue";
import HList from "./HList.vue";
import HListItem from "./HListItem.vue";
import HEmptyState from "./HEmptyState.vue";
import type {
  StatusGroup,
  StatusIncident,
  ServiceState,
  Tone,
} from "../themes";
const props = withDefaults(
  defineProps<{
    brand?: string;
    title?: string;
    description?: string;
    groups: StatusGroup[];
    incidents?: StatusIncident[];
    updatedAt?: string;
  }>(),
  {
    brand: "hearth",
    title: "Service status",
    description: "A clear picture of the services you depend on.",
    groups: () => [],
    incidents: () => [],
  },
);
const tones: Record<ServiceState, Tone> = {
  operational: "success",
  degraded: "warning",
  outage: "danger",
  maintenance: "info",
  unknown: "neutral",
};
const labels: Record<ServiceState, string> = {
  operational: "Operational",
  degraded: "Degraded",
  outage: "Outage",
  maintenance: "Maintenance",
  unknown: "Unknown",
};
const overall = computed<ServiceState>(() => {
  const states = props.groups.flatMap((g) => g.services.map((s) => s.status));
  for (const state of ["outage", "degraded", "maintenance", "unknown"] as const)
    if (states.includes(state)) return state;
  return states.length ? "operational" : "unknown";
});
</script>
<template>
  <HPublicShell :brand="brand"
    ><template #actions><slot name="actions" /></template>
    <div class="h-status-page" part="base">
      <HPageHeader
        :title="title"
        :description="description"
        eyebrow="Keeping you in the loop"
        ><HBadge
          :label="
            overall === 'operational'
              ? 'All systems operational'
              : overall === 'unknown'
                ? 'Status not fully reported'
                : `Service ${labels[overall].toLowerCase()}`
          "
          :tone="tones[overall]"
          dot
      /></HPageHeader>
      <p v-if="updatedAt" class="h-status-updated">
        Last updated: {{ updatedAt }}
      </p>
      <HEmptyState
        v-if="!groups.length"
        title="No services reported yet."
        description="Your application supplies the service data."
      /><HCard v-for="group in groups" :key="group.id" :title="group.label"
        ><HList :label="group.label"
          ><HListItem
            v-for="service in group.services"
            :key="service.id"
            :title="service.name"
            :description="service.description"
            :href="service.href"
            :badge="labels[service.status] || labels.unknown"
            :tone="tones[service.status] || 'neutral'"
            icon="server" /></HList
      ></HCard>
      <section v-if="incidents.length" class="h-incidents">
        <h2>Incident updates</h2>
        <HCard
          v-for="incident in incidents"
          :key="incident.id"
          :title="incident.title"
          :description="incident.description"
          ><HBadge
            :label="incident.status"
            :tone="incident.status === 'resolved' ? 'success' : 'warning'"
          />
          <p v-if="incident.updatedAt" class="h-status-updated">
            {{ incident.updatedAt }}
          </p></HCard
        >
      </section>
      <slot /></div
  ></HPublicShell>
</template>
<style scoped>
.h-status-page {
  display: grid;
  gap: 24px;
  max-width: 920px;
  margin: 50px auto 65px;
  color: var(--h-text);
  font-family: var(--h-font);
}
.h-status-updated {
  font-size: 11px;
  color: var(--h-muted);
  margin: 0;
  line-height: 1.8;
}
.h-incidents {
  display: grid;
  gap: 18px;
}
.h-incidents h2 {
  font-size: 23px;
  font-weight: 550;
  letter-spacing: -0.6px;
}
</style>
