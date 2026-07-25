import Link from 'next/link';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { BadgeCheck } from 'lucide-react';
import Header from '@/components/Header';
import CheckoutForm from '@/components/CheckoutForm';
import { authOptions } from '@/lib/auth/authOptions';
import { getListing, hasPurchased } from '@/lib/data';

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
  const session = await getServerSession(authOptions);

  // Surface these states before the buyer fills anything in, rather than
  // letting them press "Pay" and hit a server-side rejection.
  const owned =
    listing && session?.user?.id ? await hasPurchased(session.user.id, listing.id) : false;
  const isOwnListing = !!listing && session?.user?.id === listing.sellerId;

  return (
    <main className="nature-page min-h-screen overflow-hidden">
      <Header />
      <div className="mx-auto max-w-4xl px-6 pb-24 pt-32">
        <span className="section-eyebrow">Secure checkout</span>
        <h1 className="mb-2 font-display text-4xl font-bold md:text-5xl">Checkout</h1>
        <p className="mb-12 text-emerald-50/45">Secure payment protected by escrow</p>

        {!listing ? (
          <Notice
            title="No website selected"
            message="Pick a website from the marketplace to check out."
            cta={{ label: 'Browse the marketplace', href: '/marketplace' }}
          />
        ) : owned ? (
          <Notice
            icon
            title="You already own this website"
            message={`${listing.title} is in your account. Open your dashboard to launch the editor.`}
            cta={{ label: 'Go to dashboard', href: '/dashboard/buyer' }}
          />
        ) : isOwnListing ? (
          <Notice
            title="This is your own listing"
            message="Sellers can't purchase their own websites."
            cta={{ label: 'Back to marketplace', href: '/marketplace' }}
          />
        ) : (
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
        )}
      </div>
    </main>
  );
}

function Notice({
  title,
  message,
  cta,
  icon = false,
}: {
  title: string;
  message: string;
  cta: { label: string; href: string };
  icon?: boolean;
}) {
  return (
    <div className="leaf-card rounded-[2rem] px-6 py-20 text-center">
      {icon && (
        <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-full bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/30">
          <BadgeCheck size={22} />
        </div>
      )}
      <p className="mb-2 font-display text-2xl font-semibold">{title}</p>
      <p className="mx-auto mb-6 max-w-md text-emerald-50/45">{message}</p>
      <Link href={cta.href} className="btn-forest px-6 py-3">
        {cta.label}
      </Link>
    </div>
  );
}
