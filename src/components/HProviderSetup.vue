<script setup lang="ts">
import { ref, watch } from "vue";
import HPageHeader from "./HPageHeader.vue";
import HCard from "./HCard.vue";
import HInput from "./HInput.vue";
import HButton from "./HButton.vue";
import HButtonBar from "./HButtonBar.vue";
import HConnectionState from "./HConnectionState.vue";
import type { ConnectionDraft } from "../themes";
const props = withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    modelValue?: ConnectionDraft;
    testing?: boolean;
    saving?: boolean;
    state?: "connecting" | "connected" | "reconnecting" | "failed" | "offline";
    message?: string;
    endpointPlaceholder?: string;
  }>(),
  {
    title: "Connect your infrastructure.",
    description:
      "Give your connection a name and tell your application where to find it.",
    modelValue: () => ({ name: "", endpoint: "" }),
    state: "offline",
    endpointPlaceholder: "https://service.example.com",
  },
);
const emit = defineEmits<{
  "update:modelValue": [draft: ConnectionDraft];
  test: [draft: ConnectionDraft];
  save: [draft: ConnectionDraft];
}>();
const name = ref(props.modelValue.name);
const endpoint = ref(props.modelValue.endpoint);
const form = ref<HTMLFormElement>();
watch(
  () => props.modelValue,
  (v) => {
    name.value = v.name;
    endpoint.value = v.endpoint;
  },
);
function changed() {
  emit("update:modelValue", { name: name.value, endpoint: endpoint.value });
}
function request(kind: "test" | "save") {
  if (props.testing || props.saving || !form.value?.reportValidity()) return;
  const draft = { name: name.value, endpoint: endpoint.value };
  if (kind === "test") emit("test", draft);
  else emit("save", draft);
}
</script>
<template>
  <section class="h-provider-setup" part="base">
    <HPageHeader
      :title="title"
      :description="description"
      eyebrow="Your next connection"
    /><HCard title="Connection details"
      ><form ref="form" @submit.prevent="request('save')">
        <HInput
          v-model="name"
          label="Provider name"
          name="providerName"
          required
          :disabled="testing || saving"
          placeholder="e.g. Local Docker"
          @update:model-value="changed"
        /><HInput
          v-model="endpoint"
          label="Endpoint"
          name="endpoint"
          required
          :disabled="testing || saving"
          :placeholder="endpointPlaceholder"
          hint="Use the endpoint format supported by your application."
          @update:model-value="changed"
        /><HConnectionState
          :state="testing ? 'connecting' : state"
          label="Provider"
          :description="message"
          :retryable="false"
        /><HButtonBar align="end" label="Provider actions"
          ><HButton
            :loading="testing"
            :disabled="saving"
            @click="request('test')"
            >Test connection</HButton
          ><HButton
            type="submit"
            variant="primary"
            :loading="saving"
            :disabled="testing"
            >Save provider</HButton
          ></HButtonBar
        >
      </form></HCard
    ><slot name="footer" />
  </section>
</template>
<style scoped>
.h-provider-setup {
  display: grid;
  gap: 25px;
  min-width: 0;
  max-width: 800px;
  margin-inline: auto;
}
form {
  display: grid;
  gap: 22px;
}
</style>
