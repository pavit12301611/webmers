/**
 * PSD — Deterministic local embedding generator.
 *
 * Ported from the PAVIT AI chatbot engine's "local fallback" embedding
 * (chatbot-main/src/services/geminiService.js). PSD runs 100% offline —
 * zero API keys, zero network calls — so the same deterministic hashing
 * embedder is used for the knowledge base AND every query. It produces
 * unit-norm vectors so cosine similarity behaves correctly, with unigram +
 * bigram hashing for decent semantic overlap.
 */

import { tokenize } from './normalize';

export const LOCAL_EMBEDDING_DIMENSION = 768;
export const LOCAL_EMBEDDING_MODEL = 'psd-local-hash-768';

/**
 * FNV-1a 32-bit hash of a string.
 */
function fnv1a(str: string): number {
  let hash = 2166136261;
  for (let j = 0; j < str.length; j++) {
    hash ^= str.charCodeAt(j);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Deterministic local vector generator (unit norm) — used by PSD so the
 * entire pipeline works with no API keys and no external services.
 */
export function generateFallbackEmbedding(text: string, dimension = LOCAL_EMBEDDING_DIMENSION): number[] {
  const vector = new Array(dimension).fill(0);
  const words = tokenize(text);
  if (words.length === 0) words.push('empty');

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const index = fnv1a(word) % dimension;
    vector[index] += 1.0 / Math.sqrt(words.length);
    // small bigram contribution for better semantics
    if (i + 1 < words.length) {
      const bigram = word + ' ' + words[i + 1];
      vector[fnv1a(bigram) % dimension] += 0.5 / Math.sqrt(words.length);
    }
  }

  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
  return vector.map((val) => val / norm);
}

export function embedText(text: string): number[] {
  return generateFallbackEmbedding(text);
}
