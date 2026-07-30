import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Refund Policy',
  description: 'Our refund, dispute resolution, and satisfaction guarantee policies.',
};

export default function RefundPage() {
  return (
    <main className="bg-[#f8f8f6] text-black px-6 md:px-10 py-20 md:py-28">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-black/40 hover:text-black mb-8 transition-colors">
          <ArrowLeft size={14} /> Back to home
        </Link>
        <h1 className="text-4xl md:text-5xl tracking-tight mb-6" style={{ fontFamily: 'var(--font-instrument)' }}>
          Refund & Satisfaction Policy
        </h1>
        <div className="prose prose-lg text-black/70 leading-7 space-y-6">
          <p>Every purchase includes full visual editing access and a satisfaction window. If a website does not match the listing description, buyers may request a full refund within 48 hours of purchase.</p>
          <h2 className="text-xl font-display font-bold mt-8 mb-3">Dispute Resolution</h2>
          <p>If a disagreement arises between buyer and seller, our admin team mediates the dispute. We offer partial refunds, full refunds, or replacement listings based on verified evidence and the 72-hour satisfaction window.</p>
          <h2 className="text-xl font-display font-bold mt-8 mb-3">Code Unlock Refunds</h2>
          <p>The full source code unlock add-on is non-refundable once the time-limited download link has been accessed. This protects against unauthorized redistribution.</p>
        </div>
      </div>
    </main>
  );
}
