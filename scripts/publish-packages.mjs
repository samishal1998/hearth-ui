import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, renameSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { root } from "./component-api.mjs";
import { assertVersions } from "./prepare-npm.mjs";

const registry = "https://registry.npmjs.org/";
const names = ["@hearth-ui/vue", "@hearth-ui/elements"];
const digest = (bytes, algorithm) =>
  createHash(algorithm)
    .update(bytes)
    .digest(algorithm === "sha512" ? "base64" : "hex");

/** Read exactly the archives prepared and reviewed by publish:prepare. */
export function readRelease(directory, version) {
  let manifest;
  try {
    manifest = JSON.parse(
      readFileSync(resolve(directory, "packages.json"), "utf8"),
    );
  } catch {
    throw new Error(
      "Missing or invalid release-dist/packages.json. Run npm run publish:prepare first.",
    );
  }
  if (
    manifest.format !== 1 ||
    manifest.version !== version ||
    !Array.isArray(manifest.packages) ||
    manifest.packages.length !== 2
  )
    throw new Error(
      "Release manifest does not match the workspace version. Run npm run publish:prepare again.",
    );
  return names.map((name) => {
    const entry = manifest.packages.find((pkg) => pkg?.name === name);
    const filename = `${name.slice(1).replace("/", "-")}-${version}.tgz`;
    if (!entry || entry.version !== version || entry.filename !== filename)
      throw new Error(`Invalid release entry for ${name}@${version}.`);
    const path = resolve(directory, filename);
    const bytes = readFileSync(path);
    if (
      entry.integrity !== `sha512-${digest(bytes, "sha512")}` ||
      entry.sha256 !== digest(bytes, "sha256")
    )
      throw new Error(
        `Archive checksum mismatch: ${filename}. Run npm run publish:prepare again.`,
      );
    return { ...entry, path };
  });
}

async function metadata(pkg, request) {
  // Use the version endpoint: it also works while a newly published scope's index is propagating.
  const response = await request(`${registry}${pkg.name}/${pkg.version}`, {
    headers: { "cache-control": "no-cache" },
    signal: AbortSignal.timeout(15000),
  });
  if (response.status === 404) return null;
  if (!response.ok)
    throw new Error(
      `Registry lookup for ${pkg.name}@${pkg.version} failed: HTTP ${response.status}.`,
    );
  return response.json();
}

function assertSamePackage(pkg, remote) {
  if (
    remote.name !== pkg.name ||
    remote.version !== pkg.version ||
    remote.dist?.integrity !== pkg.integrity
  )
    throw new Error(
      `${pkg.name}@${pkg.version} already exists with different package content. Choose a new version; published versions cannot be replaced.`,
    );
}

async function verifyDownload(pkg, remote, request) {
  assertSamePackage(pkg, remote);
  if (!remote.dist.tarball)
    throw new Error(`No tarball URL returned for ${pkg.name}@${pkg.version}.`);
  const response = await request(remote.dist.tarball, {
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok)
    throw new Error(
      `Tarball download for ${pkg.name} failed: HTTP ${response.status}.`,
    );
  const bytes = Buffer.from(await response.arrayBuffer());
  if (
    `sha512-${digest(bytes, "sha512")}` !== pkg.integrity ||
    digest(bytes, "sha256") !== pkg.sha256
  )
    throw new Error(
      `Downloaded archive checksum mismatch for ${pkg.name}@${pkg.version}.`,
    );
}

/** Preflight every selected package before performing any uploads. Dependencies are injectable for offline failure-path tests. */
export async function publishPackages(
  packages,
  {
    dryRun = false,
    provenance = false,
    verifyOnly = false,
    accepted = {},
  } = {},
  {
    npm = (args) => execFileSync("npm", args, { cwd: root, stdio: "inherit" }),
    request = globalThis.fetch,
    wait = (milliseconds) =>
      new Promise((resolve) => setTimeout(resolve, milliseconds)),
    log = console.log,
    saveAccepted = () => {},
  } = {},
) {
  const plan = [];
  for (const pkg of packages) {
    const remote = await metadata(pkg, request);
    if (remote) {
      assertSamePackage(pkg, remote);
      await verifyDownload(pkg, remote, request);
    }
    const receipt = accepted[`${pkg.name}@${pkg.version}`];
    if (!remote && receipt && receipt !== pkg.integrity)
      throw new Error(
        `${pkg.name}@${pkg.version} was already accepted by npm with different local content. Restore the original archive or use a new version.`,
      );
    plan.push({ pkg, exists: !!remote, staged: receipt === pkg.integrity });
  }
  const results = [];
  for (const { pkg, exists, staged } of plan) {
    if (exists) {
      log(
        `${pkg.name}@${pkg.version}: identical archive already published; skipped.`,
      );
      results.push({ name: pkg.name, status: "already-published" });
      if (!dryRun) {
        accepted[`${pkg.name}@${pkg.version}`] = pkg.integrity;
        saveAccepted(accepted);
      }
      continue;
    }
    if (staged || verifyOnly) {
      log(
        `${pkg.name}@${pkg.version}: ${staged ? "npm previously accepted this archive; checking processing status" : "checking registry only"}; no upload attempted.`,
      );
    } else {
      const tag = pkg.version.includes("-") ? "next" : "latest";
      log(
        `${dryRun ? "Dry run" : "Publishing"} ${pkg.name}@${pkg.version} with tag ${tag}.`,
      );
      const args = [
        "publish",
        pkg.path,
        "--access",
        "public",
        "--tag",
        tag,
        "--registry",
        registry,
        "--ignore-scripts",
      ];
      if (dryRun) args.push("--dry-run");
      if (provenance) args.push("--provenance");
      try {
        await npm(args);
      } catch {
        throw new Error(
          `${pkg.name}@${pkg.version}: npm publish failed. If npm reports a previously staged version (409), use npm run publish:verify rather than uploading it again. Resolve other npm errors before retrying; --package elements or --package vue selects the other package.`,
        );
      }
      if (!dryRun) {
        accepted[`${pkg.name}@${pkg.version}`] = pkg.integrity;
        saveAccepted(accepted);
      }
    }
    if (!dryRun) {
      let remote;
      for (let attempt = 0; attempt < 6; attempt++) {
        remote = await metadata(pkg, request);
        if (remote) break;
        if (attempt < 5) await wait(1500 * (attempt + 1));
      }
      if (!remote) {
        log(
          `${pkg.name}@${pkg.version}: not publicly visible yet. Verification is pending; continuing with the other selected packages.`,
        );
        results.push({ name: pkg.name, status: "pending" });
        continue;
      }
      await verifyDownload(pkg, remote, request);
      log(
        `${pkg.name}@${pkg.version}: registry archive verified (SHA-512 and SHA-256).`,
      );
    }
    results.push({ name: pkg.name, status: dryRun ? "dry-run" : "published" });
  }
  return results;
}

async function main() {
  const { values } = parseArgs({
    options: {
      "dry-run": { type: "boolean" },
      "verify-only": { type: "boolean" },
      provenance: { type: "boolean" },
      package: { type: "string", default: "both" },
      help: { type: "boolean" },
    },
  });
  if (values.help) {
    console.log(
      "Usage: npm run publish:packages -- [--dry-run | --verify-only] [--package both|vue|elements] [--provenance]\nPrepare first with npm run publish:prepare. Stable versions use latest; prereleases use next.",
    );
    return;
  }
  if (!["both", "vue", "elements"].includes(values.package))
    throw new Error("--package must be both, vue, or elements.");
  if (values["dry-run"] && values["verify-only"])
    throw new Error("Choose either --dry-run or --verify-only.");
  const version = assertVersions();
  const prepared = readRelease(resolve(root, "release-dist"), version);
  const selected = prepared.filter(
    (pkg) =>
      values.package === "both" || pkg.name === `@hearth-ui/${values.package}`,
  );
  const statePath = resolve(root, "release-dist/.publish-state.json");
  let accepted = {};
  try {
    accepted = JSON.parse(readFileSync(statePath, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT")
      throw new Error(
        "Cannot read release-dist/.publish-state.json. Inspect the saved publication receipts before retrying.",
      );
  }
  if (
    !accepted ||
    Array.isArray(accepted) ||
    typeof accepted !== "object" ||
    Object.values(accepted).some((value) => typeof value !== "string")
  )
    throw new Error(
      "Invalid publication receipts in release-dist/.publish-state.json.",
    );
  const results = await publishPackages(
    selected,
    {
      dryRun: values["dry-run"],
      provenance: values.provenance,
      verifyOnly: values["verify-only"],
      accepted,
    },
    {
      saveAccepted: (state) => {
        const temporary = `${statePath}.${process.pid}.tmp`;
        writeFileSync(temporary, JSON.stringify(state, null, 2) + "\n");
        renameSync(temporary, statePath);
      },
    },
  );
  console.log(
    values["dry-run"]
      ? "Dry run complete; no packages were uploaded."
      : results.some((pkg) => pkg.status === "pending")
        ? "Some packages are still processing or not published. Run npm run publish:verify to check without uploading again."
        : "All selected packages are published and verified.",
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
