# Agents orientation — `langri-sha/prettier`

`@langri-sha/prettier` is the shared Prettier configuration: single quotes, no
semicolons, prose wrapped always, and INI formatting through
`prettier-plugin-ini`, which `.editorconfig` files are parsed with. The package
is the repository root.

## Who owns which file

Projen writes `package.json` and every file listed in `.projen/files.json`; they
are read-only. Change them in `.projenrc.ts`, then run `pnpm exec projen`.
Beachball owns `CHANGELOG.md`, `CHANGELOG.json` and the `version` field.
Everything else — `src/`, `readme.md`, `.github/workflows/`, this file — is
edited by hand. Repository settings, branch protection and the Actions secrets
are managed by Terraform outside this repository; don't change them in the
GitHub UI.

## Common tasks

```sh
pnpm install
pnpm exec projen                        # re-synthesize from .projenrc.ts
pnpm tsc --build .                      # typecheck
pnpm eslint . && pnpm prettier --check .
pnpm change                             # write a change file
```

There are no tests.

CI (`workspace.yml` → `langri-sha/github` `check.yml`) runs `dagger check`, with
the modules `dagger.toml` installs: ESLint, Prettier, the `package.json` checks,
`tsc --build` and `beachball check`. It fails when synthesized files drift from
`.projenrc.ts` or the package lacks a change file. On Renovate pull requests it
re-synthesizes through Dagger and commits the result. `dagger check` runs the
same checks locally. Beachball's needs `.merge-base/` first, which
langri-sha/github's
[merge-base script](https://github.com/langri-sha/github/tree/main/actions/merge-base#locally)
writes.

## Formatting with the working tree

`prettier.config.js` imports `./src/index.js` rather than the published package,
so the repository is formatted with the configuration it is about to release: a
change to the config reformats the repository in the same pull request, and the
package never depends on itself. ESLint, lint-staged and `@langri-sha/tsconfig`
come from npm, pinned.

`prettier` is a peer, so the config runs on its consumer's Prettier. It is also
a devDependency at the current release, so the repository formats itself with
newer releases as Renovate moves it.

## Release

Beachball versions the package. Anything that reaches the tarball or builds it —
`src/`, `readme.md`, `package.json`, `tsconfig.build.json` — needs a change file
in the same pull request: run `pnpm change`. Use `none` for edits that shouldn't
cut a release on their own, such as readme-only changes. Root tooling is exempt;
`beachball.config.cjs` lists it, so lock file maintenance never cuts a release.
On Renovate pull requests that touch the package, CI writes a `patch` change
file itself.

Nothing publishes on merge. Run the Release workflow (`publish.yml`) from the
Actions tab to publish the pending change files through npm trusted publishing.
It tags the version `v<version>` and creates a GitHub release with generated
notes; a tag that already has a release is skipped, so the workflow is safe to
rerun. Beachball's own `gitTags` stays off, since it would name the tags
`@langri-sha/prettier_v<version>`.

`main` points at `src/index.js` in the repository, and `publishConfig` points
`main` and `types` at `dist/`, which `prepublishOnly` builds. The tarball ships
`src/` beside `dist/`, which the declaration maps point into.

There is deliberately no `engines` field. Published from the root, it would bind
consumers to the Node.js release this repository is developed on, so that lives
in `devEngines`, where `actions/setup-node` reads it.
