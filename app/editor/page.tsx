import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { Lock } from 'lucide-react';
import { authOptions } from '@/lib/auth/authOptions';
import EditorWorkspace from '@/components/editor/EditorWorkspace';
import {
  DEFAULT_EDITOR_STATE,
  getBuyerOrders,
  getEditorState,
  getOrder,
} from '@/lib/data';

export const metadata: Metadata = { title: 'Visual Editor' };

/**
 * The visual editor is a paid feature: it requires a signed-in user and an
 * order they actually own. Previously this route was fully public and edited
 * nothing in particular.
 */
export default async function EditorPage({
  searchParams,
}: {
  searchParams: { order?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    const target = searchParams.order
      ? `/editor?order=${encodeURIComponent(searchParams.order)}`
      : '/editor';
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(target)}`);
  }

  const orders = (await getBuyerOrders(session.user.id)).filter((o) => o.status !== 'REFUNDED');

  // No order selected: let the buyer choose which purchase to edit.
  if (!searchParams.order) {
    if (orders.length === 0) return <NoPurchases />;
    if (orders.length === 1) redirect(`/editor?order=${encodeURIComponent(orders[0].id)}`);
    return <ChooseOrder orders={orders} />;
  }

  const order = await getOrder(searchParams.order);
  const isOwner = order?.buyerId === session.user.id;
  if (!order || (!isOwner && session.user.role !== 'ADMIN')) notFound();
  if (order.status === 'REFUNDED') notFound();

  const saved = await getEditorState(order.id);

  return (
    <EditorWorkspace
      orderId={order.id}
      listingTitle={order.listingTitle}
      initialState={{
        theme: saved?.theme ?? DEFAULT_EDITOR_STATE.theme,
        accent: saved?.accent ?? DEFAULT_EDITOR_STATE.accent,
        font: saved?.font ?? DEFAULT_EDITOR_STATE.font,
        sections: { ...DEFAULT_EDITOR_STATE.sections, ...saved?.sections },
        content: saved?.content ?? {},
        published: saved?.published ?? false,
      }}
      lastSavedAt={saved?.updatedAt ? new Date(saved.updatedAt).toISOString() : null}
    />
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="nature-page flex min-h-screen items-center justify-center px-6 py-24">
      <div className="w-full max-w-lg text-center">{children}</div>
    </main>
  );
}

function NoPurchases() {
  return (
    <Shell>
      <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-full border border-emerald-50/10 bg-emerald-50/[0.04] text-emerald-50/50">
        <Lock size={22} />
      </div>
      <h1 className="mb-3 font-display text-3xl font-semibold text-emerald-50">
        The editor unlocks with your first website
      </h1>
      <p className="mb-8 text-emerald-50/45">
        Buy any website in the marketplace and you can customise it here — themes, layout, copy and
        colours, no code required.
      </p>
      <Link href="/marketplace" className="btn-forest px-6 py-3">
        Browse the marketplace
      </Link>
    </Shell>
  );
}

function ChooseOrder({
  orders,
}: {
  orders: Array<{ id: string; listingTitle: string; layoutChoice: string }>;
}) {
  return (
    <Shell>
      <h1 className="mb-2 font-display text-3xl font-semibold text-emerald-50">
        Which site are you editing?
      </h1>
      <p className="mb-8 text-emerald-50/45">Choose one of your purchased websites.</p>
      <ul className="space-y-3 text-left">
        {orders.map((o) => (
          <li key={o.id}>
            <Link
              href={`/editor?order=${encodeURIComponent(o.id)}`}
              className="leaf-card flex items-center justify-between rounded-2xl px-5 py-4 transition-transform hover:-translate-y-0.5"
            >
              <span>
                <span className="block font-medium text-emerald-50">{o.listingTitle}</span>
                <span className="block text-xs text-emerald-50/40">{o.layoutChoice}</span>
              </span>
              <span className="text-emerald-50/40">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </Shell>
  );
}
