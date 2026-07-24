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
    <main className="nature-page min-h-screen overflow-hidden">
      <Header />
      <div className="mx-auto max-w-4xl px-6 pt-32 pb-24">
        <span className="section-eyebrow">Secure checkout</span>
        <h1 className="mb-2 font-display text-4xl font-bold md:text-5xl">Checkout</h1>
        <p className="mb-12 text-emerald-50/45">Secure payment protected by escrow</p>

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
          <div className="leaf-card rounded-[2rem] py-24 text-center">
            <p className="mb-2 font-display text-2xl font-semibold">No website selected</p>
            <p className="mb-6 text-emerald-50/45">Pick a website from the marketplace to check out.</p>
            <Link href="/marketplace" className="btn-forest px-6 py-3">
              Browse the marketplace
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
