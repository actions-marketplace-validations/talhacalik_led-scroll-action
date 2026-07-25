# led-scroll-action

[![GitHub release](https://img.shields.io/github/v/tag/talhacalik/led-scroll-action?label=release&style=flat-square)](https://github.com/talhacalik/led-scroll-action/tags)

A GitHub Action that generates a contribution-graph-style scrolling LED
text SVG (color customizable) for your profile README.

<p align="center">
  <img alt="led scroll banner example" src="https://raw.githubusercontent.com/talhacalik/talhacalik/main/led.svg" width="480" />
</p>

Every character sits on a 7-row grid (row 0 and row 6 always empty), matching
the row count of a real GitHub contribution graph. Letters are variable
width — narrow ones like `I` stay slim, wide ones like `M`/`W` get extra
columns — and where the text loops back to the start, a wide stretch of
unlit (off) cells is inserted, not blank space, so the grid stays
continuous.

## Usage

```yaml
name: Update LED banner

on:
  workflow_dispatch:

permissions:
  contents: write

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: talhacalik/led-scroll-action@v1
        with:
          text: HELLO WORLD !
          color: '#bff7ff'

      - uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: 'chore: update led banner'
          file_pattern: led.svg
```

> `permissions: contents: write` is required — without it, the commit step
> fails to push. Your repo's **Settings → Actions → General → Workflow
> permissions** must also allow write access, or this setting is ignored.

Then embed it in your profile README, centered:

```markdown
<p align="center">
  <img src="./led.svg" alt="led-scroll-action" />
</p>
```

A ready-to-copy version of this workflow is in
[`.github/workflows/example.yml`](.github/workflows/example.yml).

## Inputs

| Input        | Required | Default   | Description                                       |
| ------------ | -------- | --------- | --------------------------------------------------|
| `text`       | yes      | —         | Text to render. Lowercase is auto-uppercased.      |
| `color`      | no       | `#bff7ff` | Hex color for lit cells.                           |
| `background` | no       | `#0d1117` | Hex color for the panel background.                |
| `off_color`  | no       | `#21262d` | Hex color for unlit grid cells.                    |
| `speed`      | no       | `50`      | Scroll speed in pixels/second.                     |
| `output`     | no       | `led.svg` | Output SVG file path.                              |

## Outputs

| Output     | Description                        |
| ---------- | ----------------------------------- |
| `svg-path` | Path of the generated SVG file.     |

## Supported characters

`A`-`Z`, `0`-`9`, space, `-`, `_`, `!`, `.`, `?`. Any other character is
replaced with a space and logged as a workflow warning.

## Font

A hand-drawn, variable-width 5-row dot-matrix font (see `index.js`). Cell
size and spacing (`10px` cells, `3px` gap) match a real GitHub contribution
graph, so the rendered panel reads as an extension of it rather than a
separate widget.

## Local usage

The action is a plain Node script with no dependencies, so it also runs
outside of GitHub Actions:

```bash
INPUT_TEXT="HELLO WORLD !" INPUT_COLOR="#bff7ff" node index.js
```
