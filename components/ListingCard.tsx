import Link from 'next/link';
import { Star } from 'lucide-react';
import { ListingThumbnail } from './Thumbnail';
import WishlistButton from './WishlistButton';
import { customerPrice, type Listing } from '@/lib/data';

/**
 * Optimized ListingCard - no per-card auth fetch.
 * Parent should pass initialWishlisted after batching wishlist lookup.
 * This removes N+1 getCurrentUser + isWishlisted calls that were killing TTFB.
 */
export default function ListingCard({
  listing,
  initialWishlisted = false,
}: {
  listing: Listing;
  initialWishlisted?: boolean;
}) {
  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group relative block overflow-hidden rounded-[1.8rem] bg-[#121212] ring-1 ring-white/[0.06] transition-all duration-300 hover:-translate-y-1 hover:ring-white/15"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.04] will-change-transform">
          <ListingThumbnail listing={listing} showChrome={false} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/90 via-[#0a0a0a]/10 to-transparent" />

        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-white/80 backdrop-blur-md ring-1 ring-white/10">
            {listing.category}
          </span>
        </div>

        <div className="absolute right-4 top-4">
          <div className="liquid-glass rounded-full p-1">
            <WishlistButton listingId={listing.id} initial={initialWishlisted} />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h3
                className="line-clamp-1 text-[22px] font-[500] leading-tight tracking-tight text-white"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                {listing.title}
              </h3>
              <p className="mt-1 line-clamp-1 text-[13px] text-white/45">{listing.tagline}</p>
            </div>
            <span className="shrink-0 rounded-full bg-white px-3 py-1 text-[12px] font-semibold text-black">
              ₹{customerPrice(listing.price)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-5 py-3.5 text-[12px]">
        <span className="flex items-center gap-1.5 text-white/50">
          <Star size={12} fill="currentColor" className="text-white/70" /> {listing.rating.toFixed(1)}
          <span className="ml-2 h-3 w-px bg-white/10" />
          <span>{listing.sales} sales</span>
        </span>
        <span className="text-[11px] uppercase tracking-[0.14em] text-white/30 transition group-hover:text-white/60">
          View →
        </span>
      </div>
    </Link>
  );
}
