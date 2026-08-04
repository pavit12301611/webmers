import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getPSDAnswer, type ChatMessage } from '@/lib/psd/answerEngine';
import { getKnowledge, PSD_NAME } from '@/lib/psd/knowledge';
import { parseEditorCommand } from '@/lib/editorAI/parser';
import type { EditorState } from '@/lib/editorAI/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function normalizeEditorState(raw: any): EditorState | null {
  try {
    if (!raw || typeof raw !== 'object') return null;
    const pages = Array.isArray(raw.pages) ? raw.pages : [];
    if (pages.length === 0) return null;
    return {
      pages,
      activePageId: typeof raw.activePageId === 'string' ? raw.activePageId : pages[0]?.id || 'home',
      selectedSectionId: raw.selectedSectionId ?? null,
      themeKey: raw.themeKey || 'WanderWarm',
      accent: raw.accent || '#d9772b',
      font: raw.font || 'Outfit',
      siteTitle: raw.siteTitle || 'My Custom Site',
    } as EditorState;
  } catch {
    return null;
  }
}

/**
 * PSD — Webmers' built-in chatbot (zero API keys, runs fully locally).
 * Now also connected to visual editor: if editorState is provided and
 * the message is an editing command, it returns { actions } alongside reply
 * so the editor can apply live edits.
 *
 * POST /api/psd
 * Body: { message: string, history?, editorState? }
 * Response: { reply, sources, intent, matched, actions?, meta }
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
    const editorState = normalizeEditorState(body?.editorState);

    // If editor context is present, try editor command parsing first
    if (editorState) {
      const parsed = parseEditorCommand(message, editorState);
      if (parsed.actions.length > 0) {
        return NextResponse.json({
          reply: parsed.reply,
          actions: parsed.actions,
          sources: [],
          intent: parsed.intent,
          matched: true,
          meta: {
            assistant: PSD_NAME,
            offline: true,
            mode: 'editor',
            knowledgeDocs: kb.docs,
            knowledgeChunks: kb.chunks,
            embeddingModel: kb.model,
          },
        });
      }
      if (parsed.intent === 'help') {
        return NextResponse.json({
          reply: parsed.reply,
          actions: [],
          sources: [],
          intent: parsed.intent,
          matched: true,
          meta: {
            assistant: PSD_NAME,
            offline: true,
            mode: 'editor-help',
            knowledgeDocs: kb.docs,
            knowledgeChunks: kb.chunks,
            embeddingModel: kb.model,
          },
        });
      }
    }

    const answer = await getPSDAnswer(message, history);

    return NextResponse.json({
      reply: answer.reply,
      sources: answer.sources,
      intent: answer.intent,
      matched: answer.matched ?? true,
      actions: [],
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
