<script setup lang="ts">
import { ref } from "vue";
import {
  HTheme,
  HThemeSwitcher,
  HNumberInput,
  HTimePicker,
  HCalendar,
  HDatePicker,
  HDateRangePicker,
  HRangeSlider,
  HStepper,
  HCard,
  type Mode,
  type NumberRange,
  type DateRange,
} from "../src";
const mode = ref<Mode>("system");
const count = ref<number | null>(2);
const time = ref("09:30");
const date = ref("2026-09-20");
const range = ref<DateRange>(["2026-09-20", "2026-09-25"]);
const capacity = ref<NumberRange>([20, 80]);
const step = ref("configure");
</script>
<template>
  <section class="control-examples" aria-label="Upcoming controls">
    <h2>Everyday controls, ready to compose.</h2>
    <p class="muted">
      New in 0.5: controls for preferences, scheduling, and guided workflows.
    </p>
    <div class="control-grid">
      <HTheme :mode="mode"
        ><HCard title="Your preferred appearance"
          ><HThemeSwitcher v-model="mode" />
          <p class="muted">
            The selector updates this preview only. Your application decides how
            to persist the preference.
          </p></HCard
        ></HTheme
      ><HCard title="A little more, a little less"
        ><HNumberInput
          v-model="count"
          label="Replica count"
          :min="0"
          :max="10" />
        <p class="muted">Replicas: {{ count ?? "unset" }}</p>
        <HTimePicker v-model="time" label="Backup time" :step="900" /></HCard
      ><HCard title="A date at a glance"
        ><HCalendar
          v-model="date"
          label="Scheduling calendar"
          month="2026-09"
          :disabled-dates="['2026-09-22']"
        />
        <p class="muted">Selected date: {{ date }}</p></HCard
      ><HCard title="Plan the next maintenance window"
        ><HDatePicker v-model="date" label="Maintenance date" />
        <div class="spacer" />
        <HDateRangePicker v-model="range" label="Report window" /></HCard
      ><HCard title="Keep capacity in range"
        ><HRangeSlider v-model="capacity" label="Capacity" unit="%" />
        <p class="muted">Target: {{ capacity[0] }}–{{ capacity[1] }}%</p></HCard
      ><HCard title="One step at a time"
        ><HStepper
          v-model="step"
          label="Deployment steps"
          interactive
          orientation="vertical"
          :items="[
            {
              id: 'configure',
              label: 'Configure',
              description: 'Choose your provider.',
            },
            {
              id: 'review',
              label: 'Review',
              description: 'Check the configuration.',
            },
            { id: 'deploy', label: 'Deploy', disabled: true },
          ]"
        />
        <p class="muted">Current step: {{ step }}</p></HCard
      >
    </div>
  </section>
</template>
<style scoped>
.control-examples {
  margin-block: 32px;
}
.control-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin-top: 20px;
}
@media (max-width: 720px) {
  .control-grid {
    grid-template-columns: 1fr;
  }
}
</style>
