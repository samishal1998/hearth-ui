import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { root } from "./component-api.mjs";
import { assertPrepared, packageDirectories } from "./prepare-npm.mjs";

export function packPackages(destination = resolve(root, "release-dist")) {
  const version = assertPrepared();
  mkdirSync(destination, { recursive: true });
  const packages = [];
  for (const directory of packageDirectories) {
    const [packed] = JSON.parse(
      execFileSync(
        "npm",
        [
          "pack",
          "--ignore-scripts",
          "--json",
          "--pack-destination",
          destination,
        ],
        { cwd: resolve(root, directory), encoding: "utf8" },
      ),
    );
    const path = join(destination, packed.filename);
    packages.push({
      ...packed,
      path,
      sha256: createHash("sha256").update(readFileSync(path)).digest("hex"),
    });
  }
  writeFileSync(
    join(destination, "SHA256SUMS"),
    packages.map((pkg) => `${pkg.sha256}  ${pkg.filename}`).join("\n") + "\n",
  );
  writeFileSync(
    join(destination, "packages.json"),
    JSON.stringify(
      {
        format: 1,
        version,
        packages: packages.map(
          ({ name, version, filename, integrity, sha256 }) => ({
            name,
            version,
            filename,
            integrity,
            sha256,
          }),
        ),
      },
      null,
      2,
    ) + "\n",
  );
  return packages;
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  for (const pkg of packPackages(
    process.argv[2] ? resolve(process.argv[2]) : undefined,
  ))
    console.log(`${pkg.name}@${pkg.version}: ${pkg.path}`);
}
