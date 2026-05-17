import type { StorybookConfig } from '@storybook/react-vite'
import path from 'path'
import { fileURLToPath } from 'url'

const storybookDir = path.dirname(fileURLToPath(import.meta.url))

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => {
    config.resolve ??= {}
    config.resolve.alias = {
      ...(typeof config.resolve.alias === 'object' ? config.resolve.alias : {}),
      '@': path.resolve(storybookDir, '../src'),
    }
    return config
  },
}

export default config
