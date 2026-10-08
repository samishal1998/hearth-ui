import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readRelease, publishPackages } from "../scripts/publish-packages.mjs";

function release(t, version = "0.6.0") {
  const directory = mkdtempSync(join(tmpdir(), "hearth-publish-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const packages = ["vue", "elements"].map((alias) => {
    const name = `@hearth-ui/${alias}`,
      filename = `hearth-ui-${alias}-${version}.tgz`,
      bytes = Buffer.from(`Verified test archive for ${name}@${version}`);
    writeFileSync(join(directory, filename), bytes);
    return {
      name,
      version,
      filename,
      integrity: `sha512-${createHash("sha512").update(bytes).digest("base64")}`,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    };
  });
  writeFileSync(
    join(directory, "packages.json"),
    JSON.stringify({ format: 1, version, packages }),
  );
  return { directory, version, packages: readRelease(directory, version) };
}

function registry(packages) {
  const state = {
    remote: new Map(),
    downloads: new Map(),
    calls: [],
    waits: [],
    failOnce: undefined,
    delayAfterPublish: 0,
  };
  const remaining = new Map();
  const record = (pkg) => ({
    name: pkg.name,
    version: pkg.version,
    dist: {
      integrity: pkg.integrity,
      tarball: `https://registry.npmjs.org/${pkg.name}/-/${pkg.filename}`,
    },
  });
  for (const pkg of packages)
    state.downloads.set(record(pkg).dist.tarball, readFileSync(pkg.path));
  state.record = record;
  state.dependencies = {
    request: async (url) => {
      if (state.downloads.has(url))
        return new Response(state.downloads.get(url));
      const pkg = packages.find(
        (pkg) =>
          url === `https://registry.npmjs.org/${pkg.name}/${pkg.version}`,
      );
      assert.ok(pkg, `Unexpected request: ${url}`);
      if (!state.remote.has(pkg.name)) return new Response("", { status: 404 });
      if ((remaining.get(pkg.name) || 0) > 0) {
        remaining.set(pkg.name, remaining.get(pkg.name) - 1);
        return new Response("", { status: 404 });
      }
      return Response.json(state.remote.get(pkg.name));
    },
    npm: async (args) => {
      state.calls.push(args);
      const pkg = packages.find((pkg) => pkg.path === args[1]);
      assert.ok(pkg);
      if (state.failOnce === pkg.name) {
        state.failOnce = undefined;
        throw new Error("Simulated npm authentication failure");
      }
      if (!args.includes("--dry-run")) {
        state.remote.set(pkg.name, record(pkg));
        remaining.set(pkg.name, state.delayAfterPublish);
      }
    },
    wait: async (delay) => state.waits.push(delay),
    log: () => {},
  };
  return state;
}

test("prepared release rejects stale versions, tampered archives, and unexpected filenames", (t) => {
  const fixture = release(t);
  assert.throws(
    () => readRelease(fixture.directory, "9.0.0"),
    /does not match/,
  );
  writeFileSync(fixture.packages[0].path, "changed after review");
  assert.throws(
    () => readRelease(fixture.directory, fixture.version),
    /checksum mismatch/,
  );
  const manifest = JSON.parse(
    readFileSync(join(fixture.directory, "packages.json"), "utf8"),
  );
  manifest.packages[0].filename = "../another-package.tgz";
  writeFileSync(
    join(fixture.directory, "packages.json"),
    JSON.stringify(manifest),
  );
  assert.throws(
    () => readRelease(fixture.directory, fixture.version),
    /Invalid release entry/,
  );
});

test("a conflict in the second package prevents uploading either package", async (t) => {
  const { packages } = release(t),
    mock = registry(packages);
  mock.remote.set(packages[1].name, {
    ...mock.record(packages[1]),
    dist: { integrity: "sha512-different" },
  });
  await assert.rejects(
    publishPackages(packages, {}, mock.dependencies),
    /already exists with different package content/,
  );
  assert.equal(mock.calls.length, 0);
});

test("dry-run invokes npm for both archives with next/provenance but never uploads", async (t) => {
  const { packages } = release(t, "0.6.0-rc.1"),
    mock = registry(packages);
  const result = await publishPackages(
    packages,
    { dryRun: true, provenance: true },
    mock.dependencies,
  );
  assert.deepEqual(
    result.map((pkg) => pkg.status),
    ["dry-run", "dry-run"],
  );
  assert.equal(mock.calls.length, 2);
  assert.equal(mock.remote.size, 0);
  for (const args of mock.calls) {
    assert.ok(args.includes("--dry-run"));
    assert.ok(args.includes("--provenance"));
    assert.ok(args.includes("--ignore-scripts"));
    assert.equal(args[args.indexOf("--tag") + 1], "next");
    assert.equal(args[args.indexOf("--access") + 1], "public");
    assert.equal(
      args[args.indexOf("--registry") + 1],
      "https://registry.npmjs.org/",
    );
  }
});

test("partial publication resumes with identical first archive skipped", async (t) => {
  const { packages } = release(t),
    mock = registry(packages);
  mock.failOnce = packages[1].name;
  await assert.rejects(
    publishPackages(packages, {}, mock.dependencies),
    /elements@0\.6\.0: npm publish failed/,
  );
  assert.ok(mock.remote.has(packages[0].name));
  assert.ok(!mock.remote.has(packages[1].name));
  const result = await publishPackages(packages, {}, mock.dependencies);
  assert.deepEqual(
    result.map((pkg) => pkg.status),
    ["already-published", "published"],
  );
  assert.equal(
    mock.calls.filter((args) => args[1] === packages[0].path).length,
    1,
  );
  assert.equal(
    mock.calls.filter((args) => args[1] === packages[1].path).length,
    2,
  );
  for (const args of mock.calls)
    assert.equal(args[args.indexOf("--tag") + 1], "latest");
});

test("publication waits for registry propagation and verifies downloaded bytes", async (t) => {
  const { packages } = release(t),
    mock = registry(packages);
  mock.delayAfterPublish = 2;
  const result = await publishPackages(packages, {}, mock.dependencies);
  assert.deepEqual(
    result.map((pkg) => pkg.status),
    ["published", "published"],
  );
  assert.deepEqual(mock.waits, [1500, 3000, 1500, 3000]);
});

test("a corrupted published download stops before the second upload", async (t) => {
  const { packages } = release(t),
    mock = registry(packages);
  mock.downloads.set(
    mock.record(packages[0]).dist.tarball,
    Buffer.from("corrupted registry archive"),
  );
  await assert.rejects(
    publishPackages(packages, {}, mock.dependencies),
    /Downloaded archive checksum mismatch/,
  );
  assert.equal(mock.calls.length, 1);
});

test("registry failures are not mistaken for absent versions", async (t) => {
  const { packages } = release(t),
    mock = registry(packages);
  mock.dependencies.request = async () => new Response("", { status: 503 });
  await assert.rejects(
    publishPackages(packages, {}, mock.dependencies),
    /HTTP 503/,
  );
  assert.equal(mock.calls.length, 0);
});

test("staged publication continues to the second package and receipts prevent duplicate uploads", async (t) => {
  const { packages } = release(t),
    mock = registry(packages),
    accepted = {};
  mock.delayAfterPublish = 100;
  const result = await publishPackages(
    packages,
    { accepted },
    mock.dependencies,
  );
  assert.deepEqual(
    result.map((pkg) => pkg.status),
    ["pending", "pending"],
  );
  assert.equal(mock.calls.length, 2);
  for (const pkg of packages)
    assert.equal(accepted[`${pkg.name}@${pkg.version}`], pkg.integrity);
  const restored = JSON.parse(JSON.stringify(accepted));
  const retry = await publishPackages(
    packages,
    { accepted: restored },
    mock.dependencies,
  );
  assert.deepEqual(
    retry.map((pkg) => pkg.status),
    ["pending", "pending"],
  );
  assert.equal(
    mock.calls.length,
    2,
    "retry must not PUT a version that npm has already accepted",
  );
});

test("verify-only never uploads missing or staged versions", async (t) => {
  const { packages } = release(t),
    mock = registry(packages);
  const result = await publishPackages(
    packages,
    { verifyOnly: true },
    mock.dependencies,
  );
  assert.deepEqual(
    result.map((pkg) => pkg.status),
    ["pending", "pending"],
  );
  assert.equal(mock.calls.length, 0);
});

test("receipts reject changed artifacts while a version is still processing", async (t) => {
  const { packages } = release(t),
    mock = registry(packages);
  const accepted = {
    [`${packages[1].name}@${packages[1].version}`]:
      "sha512-original-accepted-content",
  };
  await assert.rejects(
    publishPackages(packages, { accepted }, mock.dependencies),
    /already accepted by npm with different local content/,
  );
  assert.equal(mock.calls.length, 0);
});
