import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync } from "node:fs";

for (const mode of ["vue", "elements"])
  execFileSync(
    process.execPath,
    [
      "node_modules/vite/bin/vite.js",
      "build",
      "--config",
      "vite.lib.config.ts",
      "--mode",
      mode,
    ],
    { stdio: "inherit" },
  );
execFileSync(
  process.execPath,
  ["node_modules/vue-tsc/bin/vue-tsc.js", "-p", "tsconfig.build.json"],
  { stdio: "inherit" },
);
mkdirSync("dist", { recursive: true });
cpSync("src/styles/themes.css", "dist/themes.css");
