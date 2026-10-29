import { Project, TypeScriptConfig } from '@langri-sha/projen-project'

const project = new Project({
  name: '@langri-sha/prettier',
  package: {
    authorEmail: 'filip.dupanovic@gmail.com',
    authorName: 'Filip Dupanović',
    authorOrganization: false,
    authorUrl: 'https://langri-sha.com',
    bugsUrl: 'https://github.com/langri-sha/prettier/issues',
    copyrightYear: '2024',
    description:
      'Opinionated Prettier config for easy to read and maintainable code',
    entrypoint: 'src/index.js',
    homepage: 'https://github.com/langri-sha/prettier#readme',
    keywords: ['prettier', 'prettier-config'],
    license: 'MIT',
    licensed: true,
    minNodeVersion: '24.22.1',
    peerDependencyOptions: {
      pinnedDevDependency: false,
    },
    repository: 'git+https://github.com/langri-sha/prettier.git',
    type: 'module',

    deps: ['prettier-plugin-ini@1.3.0'],
    devDeps: [
      '@langri-sha/eslint-config@0.10.0',
      '@langri-sha/lint-staged@0.9.11',
      '@langri-sha/projen-project@*',
      '@langri-sha/tsconfig@1.1.1',
      '@types/node@24.19.2',
      'prettier@3.9.10',
    ],
    peerDeps: ['prettier@^3.0.0'],
  },
  beachball: {
    config: {
      // The package is the repository root, so these would otherwise demand a
      // release for changes that never reach the tarball.
      ignorePatterns: [
        '.editorconfig',
        '.gitattributes',
        '.gitignore',
        '.prettierignore',
        '.projenrc.ts',
        'AGENTS.md',
        'CODEOWNERS',
        'beachball.config.cjs',
        'dagger.lock',
        'dagger.toml',
        'eslint.config.js',
        'lint-staged.config.js',
        'pnpm-lock.yaml',
        'pnpm-workspace.yaml',
        'prettier.config.js',
        'renovate.json5',
        'tsconfig.json',
      ],
    },
  },
  claude: {
    settings: {
      attribution: { commit: '', pr: '', sessionUrl: false },
    },
  },
  codeowners: {
    '*': '@langri-sha',
  },
  dagger: {},
  editorConfig: {},
  eslint: {},
  githubTemplates: {},
  husky: {
    'pre-commit': 'lint-staged',
  },
  lintStaged: {},
  lintSynthesized: {},
  npmIgnore: {
    ignorePatterns: [
      '/*.config.*',
      '/*.json5',
      '/*.yaml',
      '/AGENTS.md',
      '/CODEOWNERS',
      '/change/',
      '/dagger.lock',
      '/dagger.toml',
    ],
  },
  pnpmWorkspace: {
    minimumReleaseAgeExclude: ['@langri-sha/*', ...Project.presetPackages],
  },
  prettier: {
    // Format with the working tree rather than the last release, so a change
    // to the config applies to the repository in the same pull request.
    extends: './src/index.js',
  },
  readme: {
    filename: 'readme.md',
  },
  renovate: {
    extends: ['github>langri-sha/renovate-config'],
  },
  typeScriptConfig: {
    config: {
      compilerOptions: {
        noEmit: true,
      },
      include: ['src'],
    },
  },
  worktrunk: {},
  skills: {
    ignore: false,
    skills: [
      {
        source: 'langri-sha/skills',
        ref: '7ddfbbeeccb409ca87856691a39b79db520cfc04',
        skills: ['create-commit', 'create-pr'],
      },
    ],
  },
})

project.package?.addField('packageManager', 'pnpm@12.15.0')
project.package?.addField('publishConfig', {
  access: 'public',
  main: 'dist/index.js',
  types: 'dist/index.d.ts',
})

// Published from the root, so `engines` would bind every consumer to the Node.js
// release this repository is developed on. `actions/setup-node` reads the same
// version from `devEngines`, which the registry leaves to the maintainers.
project.package?.file.addDeletionOverride('engines')
project.package?.addField('devEngines', {
  runtime: {
    name: 'node',
    version: `>= ${project.package.minNodeVersion}`,
  },
})

project.package?.setScript(
  'prepublishOnly',
  'rm -rf dist; tsc --project tsconfig.build.json',
)

new TypeScriptConfig(project, {
  fileName: 'tsconfig.build.json',
  config: {
    extends: '@langri-sha/tsconfig/build',
    include: ['src'],
  },
})

project.synth()
