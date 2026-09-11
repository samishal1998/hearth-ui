import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ mode }) => ({
  plugins: [vue({ customElement: mode === "elements" })],
  build: {
    outDir: `dist/${mode}`,
    lib: {
      entry: (mode === "elements"
        ? { index: "src/elements.ts", auto: "src/auto.ts" }
        : { index: "src/vue-entry.ts" }) as Record<string, string>,
      formats: ["es"],
      fileName: (_, name) => `${name}.js`,
      cssFileName: "hearth-ui",
    },
    rolldownOptions: { external: mode === "elements" ? [] : ["vue"] },
  },
}));
