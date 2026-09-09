# Contributing

## Getting set up

bun 1.4 or later. `bun install` downloads the pinned bun when yours is older, and runs
`vp config`, which writes the git hooks.

```sh
git clone git@github.com:stealth-scale/ui.git
cd ui
bun install
vp run ci
```

A dependency published in the last three days is refused by `bun install`; `bunfig.toml`
says why and how to override it for one install.

## Before you open a pull request

```sh
vp check --fix   # format and lint, applying what can be fixed
vp test          # every specification, at a 100% floor
vp run ci        # what CI runs: install, audit, build, check, test
```

`vp run ci` is the same task the workflow runs, on the same lockfile.

## A change to a published package

`bunx changeset` writes a changeset naming the package and the bump: a `!` commit is a
major, a `feat` a minor, a `fix` a patch. The release workflow turns pending changesets into
one version pull request, and merging that pull request publishes.

## Conventions

The standards every stealth repository follows are at https://docs.stealthscale.io:
repositories and packages, code standards, docblocks, commit messages, documentation.
Documenting a component has the four files a component is, and what each one holds.

## Review

A pull request is reviewed by a maintainer of the stealth-scale organisation. A change to a
component's props or its markup names the packages that compose it.
