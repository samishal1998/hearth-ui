# Publishing Hearth UI

Two npm workspaces share the component source and a synchronized version:

| Directory           | npm name              | Host dependency                                  |
| ------------------- | --------------------- | ------------------------------------------------ |
| `packages/vue`      | `@hearth-ui/vue`      | Vue 3.5+ peer                                    |
| `packages/elements` | `@hearth-ui/elements` | None; Vue runtime bundled, DOM-only declarations |

Both packages are MIT-licensed, public, ESM-only, and include styles, TypeScript declarations, and agent references. The repository root is private. The initial split-package version is **0.3.0**.

## Prepare the publishable artifacts

From the repository root:

```sh
npm ci
npm run docs:generate
npm run build
npx playwright install chromium
npm test
npm run test:package
npm run pack:packages
npm run publish:dry-run
```

Artifacts are written to `release-dist/`:

```text
hearth-ui-vue-0.5.0.tgz
hearth-ui-elements-0.5.0.tgz
SHA256SUMS
```

`pack:packages` requires a completed build. The build checks version alignment and prepares each workspace's ignored `dist/`, `docs/`, `llms.txt`, and `LICENSE` from source. `publish:dry-run` builds and inspects both public workspaces without uploading a package.

Package smoke checks install the tarballs into separate temporary consumers. The Vue consumer tests SSR and native component types. The elements consumer has no Vue dependency and validates DOM-based constructor/prop/event types, raw module imports, and asset availability.

## First publication

You must own or have publishing access to the **hearth-ui npm organization**. GitHub ownership does not establish npm organization ownership.

Authenticate in your own terminal:

```sh
npm login --registry=https://registry.npmjs.org/
npm whoami
```

After reviewing the dry run, publish the verified tarballs:

```sh
npm publish ./release-dist/hearth-ui-vue-0.5.0.tgz --access public --tag latest
npm publish ./release-dist/hearth-ui-elements-0.5.0.tgz --access public --tag latest
```

Complete any npm two-factor authentication prompts interactively. Do not put credentials in the repository. First publication may need to be done locally before the npm package settings needed for trusted publishing exist.

## Configure GitHub trusted publishing

For **each** package on npmjs.com, configure a GitHub Actions trusted publisher:

- Organization/user: `samishal1998`
- Repository: `hearth-ui`
- Workflow filename: `publish-npm.yml`
- Environment: leave blank (the workflow does not use a protected environment)
- Allowed action: enable direct **`npm publish`** for this workflow

The workflow uses GitHub-hosted runners, Node 24, OIDC (`id-token: write`), and provenance. It does not require an `NPM_TOKEN` secret. npm CLI 11.5.1+ and Node 22.14+ are required for trusted publishing; the workflow's Node 24 setup meets those requirements.

Once configured, run **Actions → Publish npm packages** with an existing tag's version, such as `0.3.1`. The workflow checks out `refs/tags/v0.3.1`, rebuilds and verifies the packages, then publishes the selected tarballs.

Choose **both**, **vue**, or **elements**. If one package succeeds and another fails, rerun with only the missing package; npm versions are immutable. Prereleases use the `next` dist-tag, while stable versions use `latest`.

## Future versions

1. Update the version in the root `package.json`, `packages/vue/package.json`, and `packages/elements/package.json`.
2. Run `npm install --package-lock-only --ignore-scripts` and `npm run docs:generate`.
3. Build, test, inspect the two tarballs, then commit and push a matching version tag.
4. The existing Release workflow attaches both tarballs to GitHub Releases.
5. Run Publish npm packages after npm trusted publishing has been configured.

Tag creation publishes GitHub artifacts, not npm packages. npm publication is a separate explicit workflow action.

## Migrating from the combined package

```text
@samishal1998/hearth-ui               → @hearth-ui/vue
@samishal1998/hearth-ui/styles.css    → @hearth-ui/vue/styles.css
@samishal1998/hearth-ui/elements      → @hearth-ui/elements
@samishal1998/hearth-ui/elements/auto → @hearth-ui/elements/auto
@samishal1998/hearth-ui/themes.css    → either package's themes.css export
```

Component names, custom-element tags, tokens, and event payloads are retained. The elements package now exposes framework-independent TypeScript types and does not install Vue in the consuming project.
