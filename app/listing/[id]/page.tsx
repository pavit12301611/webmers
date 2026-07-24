import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, ArrowRight, BadgeCheck, ExternalLink, Leaf, Star } from 'lucide-react';
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
    <main className="nature-page min-h-screen overflow-hidden">
      <Header />

      <section className="nature-container relative pt-32 pb-20">
        <div className="absolute right-0 top-20 -z-10 h-80 w-80 rounded-full bg-lime-200/10 blur-3xl" />
        <Link href="/marketplace" className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-50/10 bg-emerald-950/20 px-4 py-2 text-sm text-emerald-50/50 transition-colors hover:text-emerald-50">
          <ArrowLeft size={16} /> Back to marketplace
        </Link>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Gallery */}
          <div>
            <div className="leaf-card relative aspect-[4/3] overflow-hidden rounded-[2rem] p-3">
              <div className="h-full overflow-hidden rounded-[1.5rem] border border-emerald-50/10">
                <Thumbnail title={galleryTitles[0]} palette={listing.palette} category={listing.category} />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              {galleryTitles.map((t, i) => (
                <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-emerald-50/10 opacity-80 transition-opacity hover:opacity-100">
                  <Thumbnail title={t} palette={listing.palette} showChrome={false} />
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <span className="section-eyebrow"><Leaf size={14} /> {listing.category}</span>
            <h1 className="mb-4 font-display text-4xl font-bold tracking-tight md:text-6xl">{listing.title}</h1>
            <p className="mb-6 text-lg leading-8 text-emerald-50/55">{listing.tagline}</p>

            <div className="mb-8 flex flex-wrap items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-emerald-50/82">
                <Star size={16} fill="currentColor" className="text-[#f4d58d]" /> {listing.rating.toFixed(1)}
              </span>
              <span className="text-emerald-50/25">·</span>
              <span className="text-emerald-50/52">{listing.sales} sales</span>
              <span className="text-emerald-50/25">·</span>
              <span className="text-emerald-50/52">by <span className="text-emerald-50/82">{listing.sellerName}</span></span>
            </div>

            <p className="mb-8 leading-relaxed text-emerald-50/62">{listing.description}</p>

            {/* Tech stack */}
            <div className="mb-8 flex flex-wrap gap-2">
              {listing.techStack.map((tech) => (
                <span key={tech} className="rounded-full border border-emerald-50/10 bg-emerald-950/25 px-3 py-1.5 text-xs text-emerald-50/62">
                  {tech}
                </span>
              ))}
            </div>

            {/* Purchase box */}
            <div className="leaf-card rounded-[2rem] p-6">
              <div className="mb-5 flex items-end justify-between">
                <div>
                  <div className="mb-1 text-sm text-emerald-50/42">One-time price</div>
                  <div className="font-display text-5xl font-bold">${listing.price}</div>
                </div>
                <WishlistButton listingId={listing.id} initial={wishlisted} size={20} className="bg-emerald-950/30" />
              </div>
              <Link href={`/checkout?listing=${listing.id}`} className="btn-forest flex w-full py-4 text-lg">
                Buy Now <ArrowRight size={18} />
              </Link>
              {listing.demoUrl && (
                <a href={listing.demoUrl} target="_blank" rel="noopener noreferrer" className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-emerald-50/15 py-3 font-medium text-emerald-50/82 transition-colors hover:bg-emerald-50/[0.06]">
                  <ExternalLink size={16} /> View live demo
                </a>
              )}
              <p className="mt-4 text-center text-xs text-emerald-50/34">
                Escrow protected · 72-hour satisfaction window · Includes the visual editor
              </p>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-20">
          <h2 className="mb-8 font-display text-3xl font-bold md:text-4xl">Reviews</h2>
          {reviews.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {reviews.map((r) => (
                <div key={r.id} className="leaf-card rounded-[1.8rem] p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} size={14} fill="currentColor" className={i <= r.rating ? 'text-[#f4d58d]' : 'text-emerald-50/15'} />
                      ))}
                    </div>
                    {r.verified && (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-200">
                        <BadgeCheck size={14} /> Verified
                      </span>
                    )}
                  </div>
                  <p className="mb-4 leading-relaxed text-emerald-50/72">“{r.comment}”</p>
                  <div className="text-sm text-emerald-50/42">{r.buyerName}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-emerald-50/42">No reviews yet.</p>
          )}
        </div>

        {/* Related */}
        {relatedListings.length > 0 && (
          <div className="mt-20">
            <h2 className="mb-8 font-display text-3xl font-bold md:text-4xl">More in {listing.category}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
