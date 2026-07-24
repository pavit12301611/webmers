import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, ArrowRight, BadgeCheck, ExternalLink, Star } from 'lucide-react';
import Header from '@/components/Header';
import SiteFooter from '@/components/SiteFooter';
import ListingCard from '@/components/ListingCard';
import Thumbnail from '@/components/Thumbnail';
import WishlistButton from '@/components/WishlistButton';
import { getCurrentUser } from '@/lib/auth';
import { getListing, getListings, getReviews, isWishlisted } from '@/lib/data';

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
    <main className="relative min-h-screen">
      <Header />

      <section className="relative pt-28 pb-20 px-6 md:px-16 max-w-7xl mx-auto">
        <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors mb-8">
          <ArrowLeft size={16} /> Back to marketplace
        </Link>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Gallery */}
          <div>
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/60 aspect-[4/3]">
              <Thumbnail title={galleryTitles[0]} palette={listing.palette} category={listing.category} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              {galleryTitles.map((t, i) => (
                <div key={i} className="relative rounded-2xl overflow-hidden border border-white/10 aspect-[4/3] opacity-80 hover:opacity-100 transition-opacity">
                  <Thumbnail title={t} palette={listing.palette} showChrome={false} />
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs font-medium border border-white/10 mb-4">
              {listing.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-3">{listing.title}</h1>
            <p className="text-lg text-white/50 mb-6">{listing.tagline}</p>

            <div className="flex items-center gap-4 mb-8 text-sm">
              <span className="flex items-center gap-1 text-white/80">
                <Star size={16} fill="currentColor" className="text-amber-400" /> {listing.rating.toFixed(1)}
              </span>
              <span className="text-white/30">·</span>
              <span className="text-white/50">{listing.sales} sales</span>
              <span className="text-white/30">·</span>
              <span className="text-white/50">by <span className="text-white/80">{listing.sellerName}</span></span>
            </div>

            <p className="text-white/60 leading-relaxed mb-8">{listing.description}</p>

            {/* Tech stack */}
            <div className="flex flex-wrap gap-2 mb-8">
              {listing.techStack.map((tech) => (
                <span key={tech} className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs text-white/60">
                  {tech}
                </span>
              ))}
            </div>

            {/* Purchase box */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10">
              <div className="flex items-end justify-between mb-5">
                <div>
                  <div className="text-sm text-white/40 mb-1">One-time price</div>
                  <div className="text-4xl font-display font-bold">${listing.price}</div>
                </div>
                <WishlistButton listingId={listing.id} initial={wishlisted} size={20} className="bg-white/5" />
              </div>
              <Link
                href={`/checkout?listing=${listing.id}`}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-lg hover:scale-[1.01] transition-transform shadow-[0_0_40px_rgba(251,191,36,0.2)]"
              >
                Buy Now <ArrowRight size={18} />
              </Link>
              {listing.demoUrl && (
                <a
                  href={listing.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-2 w-full py-3 rounded-full border border-white/15 text-white/80 font-medium hover:bg-white/5 transition-colors"
                >
                  <ExternalLink size={16} /> View live demo
                </a>
              )}
              <p className="mt-4 text-xs text-white/30 text-center">
                Escrow protected · 72-hour satisfaction window · Includes the visual editor
              </p>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-20">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-8">Reviews</h2>
          {reviews.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {reviews.map((r) => (
                <div key={r.id} className="p-6 rounded-3xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} size={14} fill="currentColor" className={i <= r.rating ? 'text-amber-400' : 'text-white/15'} />
                      ))}
                    </div>
                    {r.verified && (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-300">
                        <BadgeCheck size={14} /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-white/70 leading-relaxed mb-4">“{r.comment}”</p>
                  <div className="text-sm text-white/40">{r.buyerName}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/40">No reviews yet.</p>
          )}
        </div>

        {/* Related */}
        {relatedListings.length > 0 && (
          <div className="mt-20">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-8">More in {listing.category}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {relatedListings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          </div>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
