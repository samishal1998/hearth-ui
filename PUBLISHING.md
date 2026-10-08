# Publishing Hearth UI

Two public npm packages share the source and a synchronized version:

| Directory           | npm package           | Host dependency                                 |
| ------------------- | --------------------- | ----------------------------------------------- |
| `packages/vue`      | `@hearth-ui/vue`      | Vue 3.5+ peer                                   |
| `packages/elements` | `@hearth-ui/elements` | None; runtime bundled and DOM-only declarations |

The version prepared in this workspace is **0.6.0**, including configurable mobile overlays. Both packages are MIT-licensed and ESM-only. The repository root is private.

## Prepare and preview

Run from the repository root with Node 24 (recommended):

```sh
npm ci
npx playwright install chromium
npm run publish:prepare
npm run publish:dry-run
```

`publish:prepare` regenerates the agent references, checks/types/builds both packages, runs browser and publishing tests, tests isolated package installation and SSR, then creates:

```text
release-dist/hearth-ui-vue-0.6.0.tgz
release-dist/hearth-ui-elements-0.6.0.tgz
release-dist/SHA256SUMS
release-dist/packages.json
```

`packages.json` records each archive's name, version, filename, SHA-512 integrity, and SHA-256 checksum. `publish:dry-run` validates these exact artifacts, checks the npm registry for version conflicts, and invokes `npm publish --dry-run` for each missing package. It uploads nothing and does not require npm login.

Neither the dry-run nor publication rebuilds an archive. If you change source, versions, or package READMEs, rerun `publish:prepare` and the dry-run before publication.

## Publish both packages

Authenticate with an npm account that can publish to the `hearth-ui` organization:

```sh
npm login --auth-type=web --registry=https://registry.npmjs.org/
npm whoami --registry=https://registry.npmjs.org/
```

Publish the prepared archives:

```sh
npm run publish:packages
```

The script publishes **both packages** to `https://registry.npmjs.org/` with public access. Stable versions use `latest`; prereleases such as `0.6.0-rc.1` use `next`. npm handles authentication and any interactive two-factor prompts through the terminal.

Before the first upload, the script checks every selected version:

- A matching published archive is verified and skipped.
- An existing version with different contents stops the command before any uploads. Change the version to publish different contents.
- A registry/network error stops the command rather than being treated as a missing package.

After npm accepts each upload, the script saves a receipt in `release-dist/.publish-state.json`, waits briefly for registry propagation, and compares downloaded SHA-512 and SHA-256 hashes with the local archive. If processing takes longer, it continues to the next package and explicitly reports verification as pending.

npm may return **202 Accepted** and take several minutes to make a version public. Re-uploading during that interval can return **409: Cannot publish over previously staged version**. Check status without uploading:

```sh
npm run publish:verify
```

The script preserves accepted-upload receipts across invocations and skips those uploads even if npm still returns 404 for their public metadata. Keep `.publish-state.json` alongside the original archives.

## Resume a partial publication

npm publishes packages individually. If the first succeeds and the second fails, fix the reported error and rerun:

```sh
npm run publish:packages
```

Keep the original archives. The matching first package is skipped and the missing second package is published. Rebuilding changed source under an already-published version produces a conflict.

You can also select one package:

```sh
npm run publish:packages -- --package vue
npm run publish:packages -- --package elements
npm run publish:dry-run -- --package elements
```

Skipping an identical published archive does not change its dist-tags. `publish:verify` never uploads a package and can also be scoped with `-- --package vue` or `-- --package elements`. A 409 for Vue does not block an elements-only publication.

Use `npm run publish:packages -- --help` for available flags.

## GitHub trusted publishing

For each package on npmjs.com, configure a GitHub Actions trusted publisher:

- Owner: `samishal1998`
- Repository: `hearth-ui`
- Workflow: `publish-npm.yml`
- Environment: leave blank
- Allowed action: direct `npm publish`

The workflow uses GitHub-hosted runners, Node 24, OIDC, and provenance. It does not need an `NPM_TOKEN` secret. The npm CLI must support trusted publishing (11.5.1+).

Commit and push the release source and its matching tag, then run **Actions → Publish npm packages**, choosing the version and **both**, **vue**, or **elements**. For `0.6.0`, it checks out `refs/tags/v0.6.0`, builds and tests the packages, packs the archives, and invokes the same script with `--provenance`.

The existing **Release** workflow attaches package archives and manifests to GitHub Releases. Pushing a tag does not itself publish to npm or rebuild the local docs container.

## Future versions

1. Update `package.json`, `packages/vue/package.json`, and `packages/elements/package.json` to the same version.
2. Run `npm install --package-lock-only --ignore-scripts`.
3. Update package READMEs and any pinned CDN versions.
4. Run `npm run publish:prepare` and `npm run publish:dry-run`.
5. Publish locally with `npm run publish:packages`, or from a committed tag using the trusted-publishing workflow.

## Migration from the combined package

```text
@samishal1998/hearth-ui               → @hearth-ui/vue
@samishal1998/hearth-ui/styles.css    → @hearth-ui/vue/styles.css
@samishal1998/hearth-ui/elements      → @hearth-ui/elements
@samishal1998/hearth-ui/elements/auto → @hearth-ui/elements/auto
@samishal1998/hearth-ui/themes.css    → either package's themes.css export
```

Component names, element tags, and event payloads are retained. The elements package exposes framework-independent TypeScript declarations and does not install Vue in the consuming application.
