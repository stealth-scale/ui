# ui

What a screen is drawn with. Read this if you are writing a component or consuming the design
system.

`foundations/` is what a component stands on. `components/` is the library itself, with one
package per heavy dependency. `catalogue/` is the site that documents it.

A package's name is its group's word in the singular, then its path below it, dashes for
slashes: `foundations/theme` is `@stealthscale/foundation-theme`, `components/charts` is
`@stealthscale/component-charts`. The rule has no exceptions and a guard refuses a manifest
whose name is not its path.

A module is the default; a package needs one of four reasons, and its README's first line
names which. A concern inside a package is a directory and a subpath entry, not a package.

## Working here

```sh
bun install
vp check          # format and lint, with --fix to apply
vp test           # the specs, at a 100% floor
vp run -r build   # pack every library
vp run ci         # what CI runs: install, audit, build, check, test
```

Every package resolves to its source through the `stealth-source` export condition, so there
is no build step between editing a package and running its consumers' specs. A consumer
outside the workspace never sees that condition and resolves `dist`.

A change to a published package carries a changeset, written by `bunx changeset`. The release
workflow turns the pending changesets into one version pull request, and merging it publishes
every package whose version is not on the registry yet, with provenance.
[CONTRIBUTING.md](CONTRIBUTING.md) is the rest.
