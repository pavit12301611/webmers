/**
 * PSD — In-memory vector store with hybrid (semantic + lexical) search.
 *
 * Ported from the PAVIT AI chatbot engine (chatbot-main/src/services/vectorDbService.js)
 * and trimmed for the Webmers integration: the store is rebuilt at boot from
 * the site's live data (see ./knowledge.ts), so answers always reflect the
 * current marketplace — including listings sellers add later.
 *
 * Hybrid scoring keeps retrieval useful even with deterministic local
 * embeddings: cosine similarity for semantics + a weighted keyword-overlap
 * score so exact-term queries ("refund", "code unlock") hit hard.
 */

import { config } from './config';
import { tokenize } from './normalize';

export interface ChunkVector {
  id: string;
  docId: string;
  docName: string;
  chunkIndex: number;
  text: string;
  vector: number[];
  dim: number;
  heading?: string;
}

export interface DocInfo {
  id: string;
  originalName: string;
  size: number;
  category: string;
  createdAt: string;
}

export interface SearchResult {
  id: string;
  docId: string;
  docName: string;
  chunkIndex: number;
  text: string;
  heading?: string;
  score: number;
  semanticScore: number;
  lexicalScore: number;
}

class VectorStore {
  private vectors: ChunkVector[] = [];

  /** Cosine similarity between two equal-length vectors. */
  cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Lightweight lexical similarity: weighted token overlap between query and
   * chunk. Boosts chunks that share rare/meaningful terms with the query.
   */
  lexicalScore(queryText: string, chunkText: string): number {
    if (!queryText || !chunkText) return 0;
    const queryTokens = tokenize(queryText);
    if (queryTokens.length === 0) return 0;

    const chunkTokens = tokenize(chunkText);
    if (chunkTokens.length === 0) return 0;

    const chunkFreq = new Map<string, number>();
    for (const t of chunkTokens) chunkFreq.set(t, (chunkFreq.get(t) || 0) + 1);

    let hits = 0;
    for (const t of queryTokens) {
      if (chunkFreq.has(t)) hits += 1 / Math.sqrt(chunkFreq.get(t) || 1); // IDF-ish discount
    }
    const coverage = hits / queryTokens.length;
    return Math.min(1, coverage * 1.4); // slight boost, capped
  }

  hybridScore(queryVector: number[], item: ChunkVector, queryText: string): number {
    const semantic = this.cosineSimilarity(queryVector, item.vector);
    const lexical = queryText ? this.lexicalScore(queryText, item.text) : 0;
    return config.semanticWeight * semantic + config.lexicalWeight * lexical;
  }

  /** Add a batch of chunks for one document. */
  addDocument(doc: DocInfo, chunks: Array<{ text: string; vector: number[]; heading?: string }>): number {
    for (let i = 0; i < chunks.length; i++) {
      this.vectors.push({
        id: `${doc.id}_chunk_${i}`,
        docId: doc.id,
        docName: doc.originalName,
        chunkIndex: i,
        text: chunks[i].text,
        vector: chunks[i].vector,
        dim: chunks[i].vector.length,
        heading: chunks[i].heading,
      });
    }
    return chunks.length;
  }

  /** Top-K hybrid similarity search. */
  similaritySearch(
    queryVector: number[],
    topK = config.topK,
    minScore = config.minScore,
    queryText = '',
  ): { results: SearchResult[]; totalScanned: number } {
    if (!queryVector || !Array.isArray(queryVector) || this.vectors.length === 0) {
      return { results: [], totalScanned: 0 };
    }
    const dim = queryVector.length;
    const scored: SearchResult[] = [];

    for (const item of this.vectors) {
      if (item.dim !== dim) continue;
      const score = this.hybridScore(queryVector, item, queryText);
      scored.push({
        id: item.id,
        docId: item.docId,
        docName: item.docName,
        chunkIndex: item.chunkIndex,
        text: item.text,
        heading: item.heading,
        score: parseFloat(score.toFixed(4)),
        semanticScore: parseFloat(this.cosineSimilarity(queryVector, item.vector).toFixed(4)),
        lexicalScore: queryText ? parseFloat(this.lexicalScore(queryText, item.text).toFixed(4)) : 0,
      });
    }

    const results = scored
      .filter((item) => item.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return { results, totalScanned: scored.length };
  }

  get size(): number {
    return this.vectors.length;
  }

  clear(): void {
    this.vectors = [];
  }
}

export const vectorStore = new VectorStore();
