import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { getEditorState, getOrder, saveEditorState } from '@/lib/data';
import { rateLimit, tooManyRequests } from '@/lib/rateLimit';
import { readJsonBody } from '@/lib/validation';

const THEMES = ['Night', 'Dawn', 'Day'];
const FONTS = ['Inter', 'Space Grotesk', 'Serif'];
const SECTIONS = ['Hero', 'Stats', 'Featured', 'Footer'];
const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const MAX_TEXT_LENGTH = 500;

/** Confirms the signed-in user actually owns the order being edited. */
async function authorize(orderId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: 'Unauthorized', status: 401 as const };

  const order = await getOrder(orderId);
  if (!order) return { error: 'Order not found.', status: 404 as const };

  const isOwner = order.buyerId === session.user.id;
  if (!isOwner && session.user.role !== 'ADMIN') {
    return { error: 'Order not found.', status: 404 as const };
  }
  if (order.status === 'REFUNDED') {
    return { error: 'This order was refunded.', status: 403 as const };
  }

  return { session, order };
}

export async function GET(req: Request) {
  const orderId = new URL(req.url).searchParams.get('order') ?? '';
  if (!orderId) return NextResponse.json({ error: 'An order is required.' }, { status: 400 });

  const auth = await authorize(orderId);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  return NextResponse.json({ state: await getEditorState(orderId) });
}

export async function POST(req: Request) {
  try {
    const body = await readJsonBody(req);
    if (!body) return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });

    const orderId = typeof body.orderId === 'string' ? body.orderId : '';
    if (!orderId) return NextResponse.json({ error: 'An order is required.' }, { status: 400 });

    const auth = await authorize(orderId);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const limit = rateLimit(`editor:${auth.session.user.id}`, { limit: 60, windowMs: 60_000 });
    if (!limit.ok) return tooManyRequests(limit.retryAfter, 'Saving too frequently.');

    // Everything below is allowlisted — the editor must not become a way to
    // store arbitrary attacker-controlled payloads.
    const patch: Parameters<typeof saveEditorState>[1] = {};

    if (typeof body.theme === 'string' && THEMES.includes(body.theme)) patch.theme = body.theme;
    if (typeof body.font === 'string' && FONTS.includes(body.font)) patch.font = body.font;
    if (typeof body.accent === 'string' && HEX_RE.test(body.accent)) patch.accent = body.accent;
    if (typeof body.published === 'boolean') patch.published = body.published;

    if (body.sections && typeof body.sections === 'object' && !Array.isArray(body.sections)) {
      const sections: Record<string, boolean> = {};
      for (const [key, value] of Object.entries(body.sections as Record<string, unknown>)) {
        if (SECTIONS.includes(key) && typeof value === 'boolean') sections[key] = value;
      }
      patch.sections = sections;
    }

    if (body.content && typeof body.content === 'object' && !Array.isArray(body.content)) {
      const content: Record<string, string> = {};
      let count = 0;
      for (const [key, value] of Object.entries(body.content as Record<string, unknown>)) {
        if (count >= 40) break;
        if (typeof key === 'string' && key.length <= 64 && typeof value === 'string') {
          content[key] = value.slice(0, MAX_TEXT_LENGTH);
          count += 1;
        }
      }
      patch.content = content;
    }

    const state = await saveEditorState(orderId, patch);
    return NextResponse.json({ ok: true, state });
  } catch (err) {
    console.error('Editor save error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
