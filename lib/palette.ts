/**
 * Deterministic thumbnail palettes.
 *
 * This lives in its own module (rather than in `lib/data.ts`) because it is
 * imported by client components. Pulling it from the data layer would drag the
 * whole server-only store — including Node's `fs` — into the browser bundle.
 */

const PALETTES: [string, string][] = [
  ['#f59e0b', '#f43f5e'],
  ['#8b5cf6', '#d946ef'],
  ['#10b981', '#06b6d4'],
  ['#0ea5e9', '#6366f1'],
  ['#22d3ee', '#3b82f6'],
  ['#fb7185', '#f59e0b'],
  ['#a3e635', '#10b981'],
  ['#f472b6', '#8b5cf6'],
];

export function paletteFor(seedStr: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) hash = (hash * 31 + seedStr.charCodeAt(i)) >>> 0;
  return PALETTES[hash % PALETTES.length];
}
