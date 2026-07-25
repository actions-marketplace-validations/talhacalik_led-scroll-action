#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

// Variable-width 5-row dot-matrix font — A-Z, 0-9, and a few symbols.
// Every glyph sits in a 7-row grid with row 0 and row 6 always empty,
// matching a GitHub contribution graph's row count.
const font = {
  A: ['.##.', '#..#', '####', '#..#', '#..#'],
  B: ['###.', '#..#', '###.', '#..#', '###.'],
  C: ['.###', '#...', '#...', '#...', '.###'],
  D: ['###.', '#..#', '#..#', '#..#', '###.'],
  E: ['####', '#...', '###.', '#...', '####'],
  F: ['####', '#...', '###.', '#...', '#...'],
  G: ['.###', '#...', '#.##', '#..#', '.###'],
  H: ['#..#', '#..#', '####', '#..#', '#..#'],
  I: ['###', '.#.', '.#.', '.#.', '###'],
  J: ['..##', '...#', '...#', '#..#', '.##.'],
  K: ['#..#', '#.#.', '##..', '#.#.', '#..#'],
  L: ['#..', '#..', '#..', '#..', '###'],
  M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'],
  N: ['#..#', '##.#', '#.##', '#..#', '#..#'],
  O: ['.##.', '#..#', '#..#', '#..#', '.##.'],
  P: ['###.', '#..#', '###.', '#...', '#...'],
  Q: ['.##.', '#..#', '#..#', '#.#.', '.###'],
  R: ['###.', '#..#', '###.', '#.#.', '#..#'],
  S: ['.###', '#...', '.##.', '...#', '###.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..'],
  U: ['#..#', '#..#', '#..#', '#..#', '.##.'],
  V: ['#...#', '#...#', '.#.#.', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#.#.#', '##.##', '#...#'],
  X: ['#...#', '.#.#.', '..#..', '.#.#.', '#...#'],
  Y: ['#...#', '.#.#.', '..#..', '..#..', '..#..'],
  Z: ['####', '...#', '..#.', '.#..', '####'],
  '0': ['.##.', '#..#', '#..#', '#..#', '.##.'],
  '1': ['.#..', '##..', '.#..', '.#..', '###.'],
  '2': ['.##.', '#..#', '..#.', '.#..', '####'],
  '3': ['###.', '...#', '.##.', '...#', '###.'],
  '4': ['#..#', '#..#', '####', '...#', '...#'],
  '5': ['####', '#...', '####', '...#', '####'],
  '6': ['.##.', '#...', '###.', '#..#', '.##.'],
  '7': ['####', '...#', '..#.', '.#..', '.#..'],
  '8': ['.##.', '#..#', '.##.', '#..#', '.##.'],
  '9': ['.##.', '#..#', '.###', '...#', '.##.'],
  ' ': ['..', '..', '..', '..', '..'],
  '-': ['...', '...', '###', '...', '...'],
  '_': ['....', '....', '....', '....', '####'],
  '!': ['#', '#', '#', '.', '#'],
  '.': ['.', '.', '.', '.', '#'],
  '?': ['.###.', '#...#', '..##.', '.....', '..#..'],
};

function getInput(name, fallback) {
  const value = process.env['INPUT_' + name];
  return value === undefined || value === '' ? fallback : value;
}

function escapeXmlAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
}

function main() {
  const rawText = getInput('TEXT', undefined);
  if (!rawText) {
    console.log('::error::`text` input is required.');
    process.exitCode = 1;
    return;
  }

  const color = getInput('COLOR', '#b026ff');
  const background = getInput('BACKGROUND', '#0d1117');
  const offColor = getInput('OFF_COLOR', '#21262d');
  const speed = parseFloat(getInput('SPEED', '50')) || 50;
  const outputPath = getInput('OUTPUT', 'led.svg');

  const letters = [];
  for (const ch of rawText.toUpperCase()) {
    if (font[ch]) {
      letters.push(ch);
    } else {
      console.log('::warning::Unsupported character "' + ch + '" skipped (treated as space).');
      letters.push(' ');
    }
  }

  const cellSize = 10, cellGap = 3, pitch = cellSize + cellGap, radius = 2;
  const rows = 7, letterGap = 1, glyphRows = 5, glyphRowOffset = 1;
  const loopGapCells = 10; // extra blank space where the text loops, so end and start don't run together
  const padY = 10;

  let gridWidth = 0;
  for (const ch of letters) gridWidth += (font[ch][0].length + letterGap) * pitch;
  gridWidth += loopGapCells * pitch;
  const gridHeight = rows * pitch;
  const viewH = gridHeight + padY * 2;
  const viewW = Math.min(gridWidth, 720); // ~720px matches a real GitHub contribution graph's rendered width
  const duration = (gridWidth / speed).toFixed(1);

  let cells = '';
  let colOffset = 0;
  for (const ch of letters) {
    const bitmap = font[ch];
    const w = bitmap[0].length;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < w + letterGap; c++) {
        const x = (colOffset + c) * pitch;
        const y = padY + r * pitch;
        cells += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="${radius}" fill="${offColor}"/>`;
      }
    }
    for (let r = 0; r < glyphRows; r++) {
      for (let c = 0; c < w; c++) {
        if (bitmap[r][c] === '#') {
          const x = (colOffset + c) * pitch;
          const y = padY + (r + glyphRowOffset) * pitch;
          cells += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="${radius}" fill="${color}"/>`;
        }
      }
    }
    colOffset += w + letterGap;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewW} ${viewH}" width="100%" height="${viewH}" role="img" aria-label="${escapeXmlAttr(rawText)}">
  <style>
    .led-track { animation: led-scroll ${duration}s linear infinite; }
    @keyframes led-scroll { to { transform: translateX(-${gridWidth}px); } }
    @media (prefers-reduced-motion: reduce) { .led-track { animation: none; } }
  </style>
  <rect x="0" y="0" width="${viewW}" height="${viewH}" fill="${background}"/>
  <defs>
    <g id="grid">${cells}</g>
  </defs>
  <g class="led-track">
    <use href="#grid" x="0" y="0"/>
    <use href="#grid" x="${gridWidth}" y="0"/>
  </g>
</svg>
`;

  fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
  fs.writeFileSync(outputPath, svg, 'utf8');
  console.log(`Generated ${outputPath} (${letters.length} chars, ${gridWidth}px wide, ${duration}s loop)`);

  const githubOutput = process.env.GITHUB_OUTPUT;
  if (githubOutput) {
    fs.appendFileSync(githubOutput, `svg-path=${outputPath}\n`);
  }
}

main();
