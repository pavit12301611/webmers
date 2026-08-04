import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getPSDAnswer, type ChatMessage } from '@/lib/psd/answerEngine';
import { getKnowledge, PSD_NAME } from '@/lib/psd/knowledge';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * PSD — Webmers' built-in chatbot (zero API keys, runs fully locally).
 *
 * POST /api/psd
 * Body: { message: string, history?: Array<{ role: 'user'|'assistant', content: string }> }
 * Response: { reply, sources, intent, matched, meta }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    const history: ChatMessage[] = Array.isArray(body?.history)
      ? body.history
          .filter(
            (m: unknown): m is ChatMessage =>
              !!m &&
              typeof m === 'object' &&
              ((m as ChatMessage).role === 'user' ||
                (m as ChatMessage).role === 'assistant') &&
              typeof (m as ChatMessage).content === 'string',
          )
          .slice(-10)
      : [];

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required.' },
        { status: 400 },
      );
    }
    if (message.length > 4000) {
      return NextResponse.json(
        { error: 'Message must be under 4,000 characters.' },
        { status: 400 },
      );
    }

    const kb = await getKnowledge();
    const answer = await getPSDAnswer(message, history);

    return NextResponse.json({
      reply: answer.reply,
      sources: answer.sources,
      intent: answer.intent,
      matched: answer.matched ?? true,
      meta: {
        assistant: PSD_NAME,
        offline: true,
        knowledgeDocs: kb.docs,
        knowledgeChunks: kb.chunks,
        embeddingModel: kb.model,
      },
    });
  } catch (err) {
    console.error('[PSD] Error:', err);
    return NextResponse.json(
      {
        error: 'Something went wrong while thinking. Please try again.',
        reply:
          'Hmm, I hit a snag while thinking! 😅 Please try again in a moment.',
        sources: [],
        intent: 'error',
      },
      { status: 200 },
    );
  }
}

/** Health check for the PSD engine. */
export async function GET() {
  const kb = await getKnowledge().catch(() => null);
  return NextResponse.json({
    status: 'ok',
    assistant: PSD_NAME,
    offline: true,
    knowledgeDocs: kb?.docs ?? 0,
    knowledgeChunks: kb?.chunks ?? 0,
  });
}
