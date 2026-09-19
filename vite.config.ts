import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";
import { catalog } from "./site/catalog.ts";

const agentFiles = [
  "llms.txt",
  ...catalog.map(
    (c) => `docs/components/${c.tag.slice("hearth-".length)}/llms.txt`,
  ),
];
const readAgentFile = (file: string) => readFileSync(resolve(file), "utf8");

export default defineConfig({
  root: "site",
  base: process.env.SITE_BASE || "/",
  resolve: {
    alias: {
      "@hearth/elements": resolve("packages/elements/dist/elements/index.js"),
    },
  },
  plugins: [
    {
      name: "hearth-agent-docs",
      generateBundle() {
        for (const fileName of agentFiles)
          this.emitFile({
            type: "asset",
            fileName,
            source: readAgentFile(fileName),
          });
      },
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.method !== "GET" && req.method !== "HEAD") return next();
          const path = new URL(req.url || "/", "http://localhost").pathname;
          const base = server.config.base;
          const file = path.startsWith(base) ? path.slice(base.length) : "";
          if (!agentFiles.includes(file)) return next();
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.end(req.method === "HEAD" ? undefined : readAgentFile(file));
        });
      },
    },
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
