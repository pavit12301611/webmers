import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { parseEditorCommand } from '@/lib/editorAI/parser';
import { getPSDAnswer, type ChatMessage } from '@/lib/psd/answerEngine';
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
              ((m as ChatMessage).role === 'user' || (m as ChatMessage).role === 'assistant') &&
              typeof (m as ChatMessage).content === 'string'
          )
          .slice(-10)
      : [];

    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }
    if (message.length > 4000) {
      return NextResponse.json({ error: 'Message must be under 4000 characters.' }, { status: 400 });
    }

    const editorState = normalizeEditorState(body?.editorState);

    if (editorState) {
      const result = parseEditorCommand(message, editorState);
      // If high confidence edit, return immediately
      if (result.actions.length > 0) {
        return NextResponse.json({
          reply: result.reply,
          actions: result.actions,
          intent: result.intent,
          confidence: result.confidence,
          meta: { mode: 'editor', offline: true },
        });
      }
      // If low confidence but looks like editor help, return help
      if (result.intent === 'help') {
        return NextResponse.json({
          reply: result.reply,
          actions: [],
          intent: result.intent,
          confidence: result.confidence,
          meta: { mode: 'editor', offline: true },
        });
      }
      // Else fallback to PSD for general questions, but still include help hint
      const psdAnswer = await getPSDAnswer(message, history);
      return NextResponse.json({
        reply: psdAnswer.reply + '\n\n---\n\n**Editor tip:** You can also say things like “Add a pricing section” or “Change hero title to Hello”.',
        actions: [],
        sources: psdAnswer.sources,
        intent: psdAnswer.intent,
        confidence: result.confidence,
        meta: { mode: 'hybrid', offline: true },
      });
    } else {
      // No editor state: just run PSD
      const psdAnswer = await getPSDAnswer(message, history);
      return NextResponse.json({
        reply: psdAnswer.reply,
        sources: psdAnswer.sources,
        intent: psdAnswer.intent,
        matched: psdAnswer.matched ?? true,
        actions: [],
        meta: { mode: 'psd', offline: true },
      });
    }
  } catch (err) {
    console.error('[editor-ai] Error:', err);
    return NextResponse.json(
      {
        error: 'Something went wrong.',
        reply: 'Hmm, I hit a snag while thinking! 😅 Please try again.',
        actions: [],
        intent: 'error',
      },
      { status: 200 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    assistant: 'PSD Editor AI',
    offline: true,
    message: 'POST a message with editorState to get edit actions.',
  });
}
