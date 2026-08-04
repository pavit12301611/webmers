/**
 * PSD — Lightweight text normalization utilities for hybrid retrieval &
 * deterministic local embeddings.
 *
 * Ported from the PAVIT AI chatbot engine (chatbot-main/src/utils/textNormalize.js)
 * into the Webmers codebase. Simple morphological stemming so plural/singular
 * and common verb forms match each other (e.g. "deployments" ~ "deployment").
 * The same stemmer is applied to both query and chunk text, so consistency
 * is what matters — not linguistic perfection.
 */

function stemLite(word: string): string {
  if (!word || word.length <= 3) return word;
  let w = word.toLowerCase();
  // -ies -> -y  (policies -> policy)
  if (w.endsWith('ies') && w.length > 4) return w.slice(0, -3) + 'y';
  // plain plural/verb -s -> drop (deployments -> deployment, cases -> case),
  // but keep double-s endings (class, process)
  if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) {
    return w.slice(0, -1);
  }
  return w;
}

export function tokenize(text: string): string[] {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9+#_./-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .map(stemLite);
}

export { stemLite };
