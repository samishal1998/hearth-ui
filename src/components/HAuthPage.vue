<script setup lang="ts">
import HBrand from "./HBrand.vue";
import HIcon from "./HIcon.vue";
import HInput from "./HInput.vue";
import HButton from "./HButton.vue";
import HAlert from "./HAlert.vue";
import type { AuthCredentials } from "../themes";
const props = withDefaults(
  defineProps<{
    brand?: string;
    logo?: string;
    title?: string;
    description?: string;
    eyebrow?: string;
    storyTitle?: string;
    storyAccent?: string;
    storyDescription?: string;
    storyEyebrow?: string;
    storyFooter?: string;
    submitLabel?: string;
    usernameLabel?: string;
    usernameType?: "text" | "email";
    passwordAutocomplete?: string;
    passwordMinLength?: number;
    loading?: boolean;
    error?: string;
    note?: string;
    scenery?: boolean;
  }>(),
  {
    brand: "hearth",
    title: "Welcome home.",
    description:
      "Sign in to your workspace. Everything is right where you left it.",
    eyebrow: "Your space is waiting",
    storyTitle: "Everything you host.",
    storyAccent: "One place to start.",
    storyDescription:
      "A home for the things you build, the services you run, and the little corner of the internet you call your own.",
    storyEyebrow: "Your self-hosted home",
    storyFooter: "Built for your corner of the internet.",
    submitLabel: "Sign in",
    usernameLabel: "Username",
    usernameType: "text",
    passwordAutocomplete: "current-password",
    note: "Private by default. Always yours.",
    scenery: true,
  },
);
const emit = defineEmits<{ submit: [credentials: AuthCredentials] }>();
function submit(e: SubmitEvent) {
  e.preventDefault();
  if (props.loading) return;
  const data = new FormData(e.currentTarget as HTMLFormElement);
  emit("submit", {
    username: String(data.get("username") || ""),
    password: String(data.get("password") || ""),
  });
}
</script>
<template>
  <main class="h-auth" part="base">
    <section class="h-auth-story" part="story">
      <div class="h-auth-brand">
        <slot name="brand"><HBrand :name="brand" :logo="logo" /></slot>
      </div>
      <div class="h-story-content">
        <p class="h-eyebrow">{{ storyEyebrow }}</p>
        <h1>
          {{ storyTitle }}<br /><span>{{ storyAccent }}</span>
        </h1>
        <p class="h-story-description">{{ storyDescription }}</p>
        <slot name="story-extra"
          ><div class="h-story-features">
            <span><HIcon name="server" :size="17" />Self-hosted</span
            ><span><HIcon name="lock" :size="17" />Yours by default</span>
          </div></slot
        >
      </div>
      <div class="h-story-footer">
        <HIcon name="server" :size="16" />{{ storyFooter }}
      </div>
      <div v-if="scenery" class="h-mountains" aria-hidden="true">
        <div />
        <div />
        <div />
      </div>
    </section>
    <section class="h-auth-panel" part="panel">
      <div class="h-auth-form">
        <p class="h-eyebrow">{{ eyebrow }}</p>
        <h2 part="title">{{ title }}</h2>
        <p class="h-auth-description">{{ description }}</p>
        <slot name="form"
          ><form @submit="submit">
            <HInput
              name="username"
              :label="usernameLabel"
              :type="usernameType"
              autocomplete="username"
              required
              :disabled="loading"
              :placeholder="usernameLabel"
            /><HInput
              name="password"
              label="Password"
              type="password"
              :autocomplete="passwordAutocomplete"
              :minlength="passwordMinLength"
              required
              :disabled="loading"
              placeholder="Your password"
            /><HAlert v-if="error" tone="danger" :description="error" /><HButton
              variant="primary"
              type="submit"
              :loading="loading"
              trailing-icon="arrow"
              >{{ submitLabel }}</HButton
            >
          </form></slot
        >
        <div class="h-auth-note">
          <slot name="note"><HIcon name="lock" :size="13" />{{ note }}</slot>
        </div>
        <slot name="footer" />
      </div>
    </section>
  </main>
</template>
<style scoped>
@import "../styles/base.css";
.h-auth {
  min-height: 100dvh;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  font-family: var(--h-font);
  color: var(--h-text);
  background: var(--h-bg);
}
.h-auth-story {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: clamp(32px, 5vw, 64px);
  min-height: 740px;
  background: var(--h-scene-bg);
  color: var(--h-scene-text);
}
.h-auth-brand {
  position: relative;
  z-index: 1;
}
.h-auth-brand :deep(.h-brand) {
  color: var(--h-scene-text);
}
.h-auth-brand :deep(.h-wordmark) {
  font-size: 34px;
}
.h-story-content {
  position: relative;
  z-index: 1;
  padding: 40px 0 50px;
  max-width: 540px;
}
.h-eyebrow {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  color: var(--h-muted);
}
.h-auth-story .h-eyebrow {
  color: var(--h-scene-muted);
}
h1 {
  font-size: clamp(35px, 4vw, 59px);
  font-weight: 550;
  letter-spacing: -2.3px;
  line-height: 1.17;
  margin: 24px 0;
}
h1 span {
  color: var(--h-accent-hover);
}
.h-story-description {
  font-size: 15px;
  line-height: 1.9;
  max-width: 420px;
  color: var(--h-scene-muted);
}
.h-story-features {
  display: flex;
  gap: 25px;
  margin-top: 35px;
  font-size: 12px;
  color: var(--h-scene-muted);
}
.h-story-features > span {
  display: flex;
  gap: 9px;
  align-items: center;
}
.h-story-features .h-icon {
  color: var(--h-accent-hover);
}
.h-story-footer {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 12px;
  color: var(--h-scene-muted);
}
.h-mountains {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  pointer-events: none;
  opacity: 0.5;
}
.h-mountains > div {
  position: absolute;
  inset: 0;
  clip-path: polygon(
    0 68%,
    22% 39%,
    40% 67%,
    71% 11%,
    100% 62%,
    100% 100%,
    0 100%
  );
  background: var(--h-mountain-back);
}
.h-mountains > div:nth-child(2) {
  transform: translateY(60px);
  background: var(--h-mountain-mid);
  clip-path: polygon(0 60%, 36% 20%, 70% 64%, 100% 35%, 100% 100%, 0 100%);
}
.h-mountains > div:nth-child(3) {
  transform: translateY(130px);
  background: var(--h-mountain-front);
}
.h-auth-panel {
  padding: 64px 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.h-auth-form {
  width: 100%;
  max-width: 360px;
}
h2 {
  font-size: 32px;
  font-weight: 550;
  letter-spacing: -1.2px;
  margin-top: 16px;
}
.h-auth-description {
  font-size: 13px;
  line-height: 1.8;
  color: var(--h-muted);
  margin: 12px 0 28px;
}
form {
  display: grid;
  gap: 20px;
}
form > .h-button {
  width: 100%;
  justify-content: space-between;
}
.h-auth-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 11px;
  color: var(--h-muted);
  margin-top: 27px;
}
@media (max-width: 750px) {
  .h-auth {
    display: block;
  }
  .h-auth-story {
    min-height: 0;
    padding: 30px;
  }
  .h-story-content {
    padding: 40px 0 12px;
    max-width: 100%;
  }
  h1 {
    font-size: 36px;
    letter-spacing: -1.5px;
    margin: 17px 0;
  }
  .h-story-description {
    font-size: 13px;
  }
  .h-story-features,
  .h-story-footer {
    display: none;
  }
  .h-auth-panel {
    padding: 42px 26px 60px;
  }
  .h-auth-form {
    max-width: 460px;
  }
  h2 {
    font-size: 29px;
  }
  .h-auth-brand :deep(.h-wordmark) {
    font-size: 29px;
  }
}
</style>
