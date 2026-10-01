# Agents orientation — `langri-sha/prettier`

`@langri-sha/prettier` is the shared Prettier configuration: single quotes, no
semicolons, prose wrapped always, and INI formatting through
`prettier-plugin-ini`, which `.editorconfig` files are parsed with. The package
is the repository root.

## Who owns which file

| Owner                                   | Files                                                                                                                                                                                                                           |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Projen (`.projenrc.ts` → `pnpm projen`) | `package.json`, `.projen/`, `tsconfig*.json`, `pnpm-workspace.yaml`, `renovate.json5`, `beachball.config.cjs`, the ESLint, Prettier and lint-staged configs, `.husky/`, the ignore and attribute files, `CODEOWNERS`, `license` |
| Beachball                               | `CHANGELOG.md`, `CHANGELOG.json` and the `version` field                                                                                                                                                                        |
| You                                     | `src/**`, `readme.md`, `.github/workflows/`, this file                                                                                                                                                                          |

Synthesized files are read-only; change them in `.projenrc.ts`. Repository
settings, branch protection and the Actions secrets are managed by
`langri-sha/github-repos`.

## Common tasks

```sh
pnpm install
pnpm projen                             # re-synthesize from .projenrc.ts
pnpm tsc --build .                      # typecheck
pnpm eslint . && pnpm prettier --check .
pnpm change                             # write a change file
```

There are no tests.

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

Beachball versions the package and the Release workflow publishes it through npm
trusted publishing. Anything that reaches the tarball or builds it — `src/`,
`readme.md`, `package.json`, `tsconfig.build.json` — needs a change file in the
same pull request. Root tooling does not: `beachball.config.cjs` lists what is
exempt, so lock file maintenance never cuts a release.

The Release workflow calls the shared Packages workflow with
`tag-template: v{version}`, which tags each published version, e.g. `v0.4.8`,
and `github-releases: true`, which creates a GitHub release with generated notes
for it. Beachball's own `gitTags` stays off, since it would name the tags
`@langri-sha/prettier_v0.4.8`. A tag that already has a release is skipped, so
the workflow is safe to rerun.

`main` points at `src/index.js` in the repository, and `publishConfig` swaps
`main` and `types` for `dist/`, which `prepublishOnly` builds. The tarball ships
`src/` beside `dist/`, which the declaration maps point into, as every release
from `langri-sha/projen` did.

There is deliberately no `engines` field. Published from the root, it would bind
consumers to the Node.js release this repository is developed on, so that lives
in `devEngines`, where `actions/setup-node` reads it.

## Provenance

Extracted from `langri-sha/projen` at `6417104d` on 2026-10-01 with
`git filter-repo --subdirectory-filter packages/prettier`. All 49 commits that
touched the package keep their trees, authorship, dates and messages. The
history reaches back to 2024-05-01, when the package started in
`langri-sha/langri-sha.com`, which handed it to projen on 2026-07-20. Issue and
pull request numbers in those older messages refer to the two source
repositories.
