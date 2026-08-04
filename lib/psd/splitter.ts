/**
 * PSD — Recursive, heading-aware text splitter designed for RAG chunking.
 *
 * Ported from the PAVIT AI chatbot engine (chatbot-main/src/utils/textSplitter.js):
 *  - Markdown heading detection: sections are split on `#` headings first and
 *    each chunk carries its heading chain as context (big win for retrieval).
 *  - Overlap is clamped so it can never exceed 50% of chunk size.
 *  - Splits on paragraph, sentence and word boundaries before hard-splitting.
 *  - Guarantees non-empty chunks and never produces an infinite loop.
 */

function clampOverlap(chunkSize: number, chunkOverlap: number): number {
  if (!Number.isFinite(chunkSize) || chunkSize <= 0) chunkSize = 800;
  if (!Number.isFinite(chunkOverlap) || chunkOverlap < 0) chunkOverlap = 0;
  return Math.min(chunkOverlap, Math.floor(chunkSize * 0.5));
}

interface Heading {
  level: number;
  text: string;
  index: number;
  length: number;
}

function extractHeadings(text: string): Heading[] {
  const headings: Heading[] = [];
  const regex = /^(#{1,6})\s+(.+?)\s*$/gm;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    headings.push({
      level: match[1].length,
      text: match[2].trim(),
      index: match.index,
      length: match[0].length,
    });
  }
  return headings;
}

interface Section {
  heading: Heading;
  body: string;
}

interface Chunk {
  headingChain: string;
  body: string;
}

function splitByHeadings(text: string): Chunk[] {
  const headings = extractHeadings(text);
  if (headings.length === 0) {
    return [{ headingChain: '', body: text }];
  }

  const sections: Section[] = [];
  for (let i = 0; i < headings.length; i++) {
    const start = headings[i].index;
    const end = i + 1 < headings.length ? headings[i + 1].index : text.length;
    sections.push({
      heading: headings[i],
      body: text.slice(start + headings[i].length, end).trim(),
    });
  }

  // Build heading chains: a section inherits all ancestor headings
  const chainStack: Array<{ level: number; text: string }> = [];
  const result: Chunk[] = [];
  for (const section of sections) {
    while (
      chainStack.length &&
      chainStack[chainStack.length - 1].level >= section.heading.level
    ) {
      chainStack.pop();
    }
    chainStack.push({ level: section.heading.level, text: section.heading.text });
    const headingChain = chainStack.map((h) => h.text).join(' > ');
    result.push({ headingChain, body: section.body });
  }
  // Drop empty bodies that were only kept for context
  return result.filter((s) => s.body.length > 0).length > 0
    ? result.filter((s) => s.body.length > 0)
    : [{ headingChain: headings.map((h) => h.text).join(' > '), body: text }];
}

function splitTextInternal(
  str: string,
  seps: string[],
  chunkSize: number,
  chunkOverlap: number,
): string[] {
  if (!str || str.length === 0) return [];
  if (str.length <= chunkSize) return [str];

  const results: string[] = [];
  let remaining = str;

  for (const sep of seps) {
    if (remaining.length <= chunkSize) break;
    let segments = remaining.split(sep);
    let rebuilt = '';

    for (let seg of segments) {
      const candidate = rebuilt ? rebuilt + sep + seg : seg;
      if (candidate.length <= chunkSize) {
        rebuilt = candidate;
      } else {
        if (rebuilt) results.push(rebuilt);
        rebuilt = seg;
      }
    }
    remaining = rebuilt;
  }

  // Hard split any oversized remainder
  while (remaining.length > chunkSize) {
    let cut = chunkSize;
    while (cut > 0 && !/[\s.,;!?)]$/.test(remaining[cut - 1])) cut--;
    if (cut < Math.floor(chunkSize * 0.6)) cut = chunkSize;

    const piece = remaining.slice(0, cut).trim();
    if (piece) results.push(piece);
    remaining = remaining.slice(cut);
  }
  if (remaining.trim()) results.push(remaining.trim());

  // Merge tiny tail chunks into the previous chunk when sensible
  const merged: string[] = [];
  for (const r of results) {
    const last = merged[merged.length - 1];
    if (last && last.length + r.length <= chunkSize + chunkOverlap) {
      merged[merged.length - 1] = last + '\n' + r;
    } else {
      merged.push(r);
    }
  }
  return merged;
}

export interface SplitResult {
  text: string;
  heading: string;
}

/**
 * Heading-aware recursive splitter.
 * Returns an array of `{ text, heading }` chunks.
 */
export function recursiveTextSplitter(
  text: string,
  chunkSize = 800,
  chunkOverlap = 150,
): SplitResult[] {
  if (!text) return [];
  chunkSize = Number.isFinite(chunkSize) ? chunkSize : 800;
  chunkOverlap = clampOverlap(chunkSize, Number.isFinite(chunkOverlap) ? chunkOverlap : 150);

  const sections = splitByHeadings(text);
  const chunks: SplitResult[] = [];

  for (const section of sections) {
    const body = (section.body || '').replace(/\r\n/g, '\n');
    if (!body.trim()) continue;
    const pieces = splitTextInternal(body, ['\n\n', '\n', '. ', ' '], chunkSize, chunkOverlap);
    for (const piece of pieces) {
      chunks.push({
        text: piece,
        heading: section.headingChain,
      });
    }
  }

  return chunks;
}
