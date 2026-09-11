import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";

export default defineConfig({
  root: "site",
  base: process.env.SITE_BASE || "/",
  resolve: { alias: { "@hearth/elements": resolve("dist/elements/index.js") } },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith("hearth-"),
        },
      },
    }),
  ],
  server: { fs: { allow: [resolve(".")] } },
  build: {
    outDir: "../site-dist",
    emptyOutDir: true,
    rolldownOptions: {
      input: {
        main: resolve("site/index.html"),
        elements: resolve("site/elements.html"),
        react: resolve("site/react.html"),
      },
    },
  },
});
