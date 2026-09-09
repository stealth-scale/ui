import { defineConfig } from 'vite-plus'

import { lintConfig, runConfig, stealthDefaults, testConfig } from '@stealthscale/tool-config'
import { storiesProject } from '@stealthscale/tool-storybook/config'

/**
 * Configures this workspace once, at its root.
 *
 * `stealthDefaults` carries everything true of every stealth repository. A block replaced
 * beside it, built by that block's own function, carries what is true only of this one.
 */
export default defineConfig({
  ...stealthDefaults({ sourceCondition: 'ui-source' }),

  // Everything here renders, so the whole tree takes the `web` rules and nothing takes the
  // node ones. That is the difference between this repository and the toolchain, where the
  // console is the interface for all but one package.
  lint: lintConfig({
    layers: [
      {
        because: 'every component is built on the foundations',
        files: ['foundations/**'],
        forbid: ['@stealthscale/component-*'],
      },
      {
        because: 'the catalogue documents the components',
        files: ['components/**', 'foundations/**'],
        forbid: ['@stealthscale/catalogue-*'],
      },
      {
        because: 'a component draws with the tokens rather than with one theme',
        files: ['components/**', 'foundations/**'],
        forbid: ['@stealthscale/theme-*'],
      },
    ],
    overrides: [
      {
        // A hook that reads the platform names the platform's own types, and the shared list
        // the jsdoc plugin resolves against does not carry these two yet.
        files: ['foundations/hooks/**'],
        rules: {
          'jsdoc-js/no-undefined-types': [
            'error',
            { definedTypes: ['MediaQueryList', 'ReadonlyMap', 'ReadonlySet', 'Storage'] },
          ],
        },
      },
      {
        // jest-dom registers its matchers by being imported, which is what a setup file is
        // for. There is nothing to assign.
        files: ['vitest.setup.ts', '**/*.d.ts'],
        rules: { 'import/no-unassigned-import': 'off' },
      },
    ],
    web: ['**'],
  }),

  // The Storybook kit is a dependency here rather than this repository's own source, so its
  // preview sits under `node_modules`, which Vite's dependency scanner already crawls.
  run: runConfig({ storybook: true }),

  test: testConfig({
    dom: true,
    projects: [storiesProject()],
    setupFiles: ['./vitest.setup.ts'],
  }),
})
