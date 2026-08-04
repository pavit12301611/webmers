import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, ArrowRight, BadgeCheck, ExternalLink, Star, Wand2, Sparkles } from 'lucide-react';
import Header from '@/components/Header';
import SiteFooter from '@/components/SiteFooter';
import ListingCard from '@/components/ListingCard';
import Thumbnail from '@/components/Thumbnail';
import WishlistButton from '@/components/WishlistButton';
import { getCurrentUser } from '@/lib/auth';
import { customerPrice, getListing, getListings, getReviews, isWishlisted } from '@/lib/data';

export const metadata: Metadata = { title: 'Website' };

export default async function ListingPage({ params }: { params: { id: string } }) {
  const listing = await getListing(params.id);
  if (!listing) notFound();

  const [reviews, related, user] = await Promise.all([
    getReviews(listing.id),
    getListings({ category: listing.category }),
    getCurrentUser(),
  ]);
  const wishlisted = user ? await isWishlisted(user.id, listing.id) : false;
  const relatedListings = related.filter((l) => l.id !== listing.id).slice(0, 3);

  const galleryTitles = [listing.title, `${listing.title} alt`, `${listing.title} preview`];

  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <Header />

      <section className="relative mx-auto max-w-7xl px-6 pb-20 pt-32 md:px-10">
        <div className="absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%"><defs><pattern id="lp-grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M 48 0 L 0 0 0 48" fill="none" stroke="#64748b" strokeWidth="0.6" /></pattern></defs><rect width="100%" height="100%" fill="url(#lp-grid)" /></svg>
        </div>

        <div className="relative">
          <Link href="/marketplace" className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-foreground/50 transition-colors hover:text-foreground">
            <ArrowLeft size={14} /> Back to marketplace
          </Link>

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Gallery */}
            <div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#121212] p-2">
                <div className="h-full overflow-hidden rounded-[1.2rem]">
                  <Thumbnail title={galleryTitles[0]} palette={listing.palette} category={listing.category} />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4">
                {galleryTitles.map((t, i) => (
                  <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 opacity-80 transition-opacity hover:opacity-100">
                    <Thumbnail title={t} palette={listing.palette} showChrome={false} />
                  </div>
                ))}
              </div>
            </div>

            {/* Details */}
            <div>
              <span className="mb-3 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-foreground/40">
                {listing.category}
              </span>
              <h1 className="mb-4 text-balance text-4xl tracking-tight text-foreground md:text-5xl" style={{ fontFamily: "'Instrument Serif', serif" }}>
                {listing.title}
              </h1>
              <p className="mb-6 text-[16px] leading-7 text-foreground/50">{listing.tagline}</p>

              <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-foreground/50">
                <span className="flex items-center gap-1">
                  <Star size={14} fill="currentColor" className="text-foreground" /> {listing.rating.toFixed(1)}
                </span>
                <span className="h-3 w-px bg-white/10" />
                <span>{listing.sales} sales</span>
                <span className="h-3 w-px bg-white/10" />
                <span>
                  by{' '}
                  <Link href={`/seller/${listing.sellerId}`} className="text-foreground/80 transition hover:text-foreground">
                    {listing.sellerName}
                  </Link>
                </span>
              </div>

              <p className="mb-8 leading-relaxed text-foreground/50">{listing.description}</p>

              <div className="mb-8 flex flex-wrap gap-2">
                {listing.techStack.map((tech) => (
                  <span key={tech} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] text-foreground/50">
                    {tech}
                  </span>
                ))}
              </div>

              <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                <div className="mb-5 flex items-end justify-between">
                  <div>
                    <div className="mb-1 text-[11px] uppercase tracking-widest text-foreground/30">One-time price</div>
                    <div className="text-4xl text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>₹{customerPrice(listing.price)}</div>
                  </div>
                  <div className="liquid-glass rounded-full p-1">
                    <WishlistButton listingId={listing.id} initial={wishlisted} size={20} />
                  </div>
                </div>
                <Link href={`/checkout?listing=${listing.id}`} className="flex w-full items-center justify-center gap-2 rounded-full bg-white py-4 text-sm font-medium text-black transition hover:bg-white/90">
                  Buy Now <ArrowRight size={14} />
                </Link>
                <Link href={`/editor?listing=${listing.id}`} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#d9772b] to-[#b85e1f] py-4 text-sm font-bold text-white shadow-[0_4px_14px_rgba(217,119,43,0.35)] transition hover:scale-[1.01]">
                  <Wand2 size={16} /> Edit with PSD AI <Sparkles size={12} className="opacity-80" />
                </Link>
                {listing.demoUrl && (
                  <a href={listing.demoUrl} target="_blank" rel="noopener noreferrer" className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-white/10 py-3 text-sm text-foreground/60 transition hover:bg-white/[0.04] hover:text-foreground">
                    <ExternalLink size={14} /> View live demo
                  </a>
                )}
                <p className="mt-4 text-center text-[11px] uppercase tracking-wide text-foreground/25">
                  Escrow protected · Every site editable via PSD AI at /editor?listing={listing.id}
                </p>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="mt-20">
            <h2 className="mb-8 text-3xl tracking-tight text-foreground md:text-4xl" style={{ fontFamily: "'Instrument Serif', serif" }}>Reviews</h2>
            {reviews.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2">
                {reviews.map((r) => (
                  <div key={r.id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-6">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} size={12} fill="currentColor" className={i <= r.rating ? 'text-foreground' : 'text-foreground/15'} />
                        ))}
                      </div>
                      {r.verified && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-foreground/50">
                          <BadgeCheck size={12} /> Verified
                        </span>
                      )}
                    </div>
                    <p className="mb-4 leading-relaxed text-foreground/70">“{r.comment}”</p>
                    <div className="text-[13px] text-foreground/30">{r.buyerName}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-foreground/30">No reviews yet.</p>
            )}
          </div>

          {relatedListings.length > 0 && (
            <div className="mt-20">
              <h2 className="mb-8 text-3xl tracking-tight text-foreground md:text-4xl" style={{ fontFamily: "'Instrument Serif', serif" }}>
                More in {listing.category}
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relatedListings.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
