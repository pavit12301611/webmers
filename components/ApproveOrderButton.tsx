'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ApproveOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const approve = async () => {
    if (!window.confirm('Confirm you have independently verified the buyer payment in your UPI/bank app. This releases the order.')) return;
    setLoading(true);
    const response = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}/approve`, { method: 'POST' });
    if (!response.ok) alert((await response.json().catch(() => ({}))).error || 'Unable to approve order.');
    router.refresh(); setLoading(false);
  };
  return <button type="button" onClick={approve} disabled={loading} className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-medium text-emerald-700 disabled:opacity-50">{loading ? 'Approving…' : 'Approve payment'}</button>;
}
