// By package name, as every repository writes it. Storybook loads this file in Node, where
// the workspace's source condition is off, so the kit resolves to what it publishes rather
// than to a source tree this repository does not hold.
import { storybookConfig } from '@stealthscale/tool-storybook/config'

export default storybookConfig({ sourceCondition: 'ui-source' })
