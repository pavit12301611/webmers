import Link from 'next/link';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import CheckoutForm from '@/components/CheckoutForm';
import { getListing } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Secure checkout protected by escrow.',
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: { listing?: string };
}) {
  const listing = searchParams.listing ? await getListing(searchParams.listing) : null;

  return (
    <main className="relative min-h-screen">
      <Header />
      <div className="max-w-4xl mx-auto px-6 pt-28 pb-24">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-2">Checkout</h1>
        <p className="text-white/30 mb-12">Secure payment protected by escrow</p>

        {listing ? (
          <CheckoutForm
            listing={{
              id: listing.id,
              title: listing.title,
              tagline: listing.tagline,
              price: listing.price,
              category: listing.category,
              palette: listing.palette,
            }}
          />
        ) : (
          <div className="text-center py-24 rounded-3xl border border-white/[0.06] bg-white/[0.02]">
            <p className="text-2xl font-display font-semibold mb-2">No website selected</p>
            <p className="text-white/40 mb-6">Pick a website from the marketplace to check out.</p>
            <Link href="/marketplace" className="px-6 py-3 rounded-full bg-white text-black font-medium">
              Browse the marketplace
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
