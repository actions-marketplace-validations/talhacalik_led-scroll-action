# led-scroll-action

A GitHub Action that generates a purple, contribution-graph-style scrolling
LED text SVG for your profile README

Every character sits on a 7-row grid (row 0 and row 6 always empty), matching
the row count of a real GitHub contribution graph.

## Usage

```yaml
name: Update LED banner

on:
  workflow_dispatch:
  schedule:
    - cron: '0 0 * * *'

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: talhacalik/led-scroll-action@v1
        with:
          text: TALHACALIK
          color: '#b026ff'

      - uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: 'chore: update led banner'
          file_pattern: led.svg
```

Then embed it in your profile README:

```markdown
<img src="./led.svg" alt="talhacalik" />
```

A ready-to-copy version of this workflow is in
[`.github/workflows/example.yml`](.github/workflows/example.yml).

## Inputs

| Input        | Required | Default    | Description                                                          |
| ------------ | -------- | ---------- | ---------------------------------------------------------------------|
| `text`       | yes      | —          | Text to render. Lowercase is auto-uppercased.                        |
| `color`      | no       | `#b026ff`  | Hex color for lit cells.                                             |
| `background` | no       | `#0d1117`  | Hex color for the panel background.                                  |
| `off_color`  | no       | `#21262d`  | Hex color for unlit grid cells.                                      |
| `speed`      | no       | `50`       | Scroll speed in pixels/second.                                       |
| `output`     | no       | `led.svg`  | Output SVG file path.                                                |

## Outputs

| Output     | Description                        |
| ---------- | ----------------------------------- |
| `svg-path` | Path of the generated SVG file.     |

## Supported characters

`A`-`Z`, `0`-`9`, space, `-`, `_`, `!`, `.`, `?`. Any other character is
replaced with a space and logged as a workflow warning.

## Local usage

The action is a plain Node script with no dependencies, so it also runs
outside of GitHub Actions:

```bash
INPUT_TEXT="TALHACALIK" INPUT_COLOR="#b026ff" node index.js
```
