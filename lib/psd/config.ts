/**
 * PSD — RAG configuration (ported from chatbot-main/src/config.js).
 * All values are safe defaults; PSD never needs API keys or env vars.
 */

export const config = {
  // RAG parameters
  chunkSize: 800,
  chunkOverlap: 150,
  topK: 4,
  minScore: 0.05,

  // Hybrid search weighting (lexical vs semantic)
  lexicalWeight: 0.35,
  semanticWeight: 0.65,
};
