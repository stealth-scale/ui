# @stealthscale/foundation-styling

A **library**: every component package links it, and nothing renders without it.

Holds `cn`, which merges the class names a component builds with the ones its caller passed
and lets the last conflicting Tailwind utility win. A caller passing `p-4` is replacing the
component's `p-2` rather than adding to it, and concatenation cannot express that.

```tsx
import { cn } from '@stealthscale/foundation-styling'

cn('rounded-sm px-1 text-xs', className)
```

## Install

```sh
bun add @stealthscale/foundation-styling
```
