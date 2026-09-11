import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ mode }) => ({
  plugins: [vue({ customElement: mode === "elements" })],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    __VUE_OPTIONS_API__: "true",
    __VUE_PROD_DEVTOOLS__: "false",
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false",
  },
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
