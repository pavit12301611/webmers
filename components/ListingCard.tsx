import Link from 'next/link';
import { Star, ArrowUpRight } from 'lucide-react';
import { ListingThumbnail } from './Thumbnail';
import WishlistButton from './WishlistButton';
import { customerPrice, type Listing } from '@/lib/data';

/**
 * ListingCard styled for the Wander design system.
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
      className="group relative block overflow-hidden rounded-[24px] bg-white/80 border border-wander-dark/10 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-wander-orange/40 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-wander-blue/20">
        <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.04] will-change-transform">
          <ListingThumbnail listing={listing} showChrome={false} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-wander-dark/85 via-transparent to-black/20" />

        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-wander-dark shadow-sm">
            {listing.category}
          </span>
        </div>

        <div className="absolute right-4 top-4">
          <div className="rounded-full bg-white/80 backdrop-blur-md p-1 shadow-sm">
            <WishlistButton listingId={listing.id} initial={initialWishlisted} />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h3 className="line-clamp-1 font-heading text-2xl font-medium leading-tight tracking-tight text-white">
                {listing.title}
              </h3>
              <p className="mt-1 line-clamp-1 text-xs text-white/80 font-body">{listing.tagline}</p>
            </div>
            <span className="shrink-0 rounded-full bg-wander-orange px-3.5 py-1 text-xs font-bold text-white shadow-sm">
              ₹{customerPrice(listing.price)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-5 py-3.5 text-xs text-wander-dark/80">
        <span className="flex items-center gap-1.5 font-medium">
          <Star size={13} fill="currentColor" className="text-wander-orange" /> {listing.rating.toFixed(1)}
          <span className="ml-2 h-3 w-px bg-wander-dark/15" />
          <span>{listing.sales} sales</span>
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-wander-dark transition-colors group-hover:text-wander-orange">
          Explore <ArrowUpRight size={14} />
        </span>
      </div>
    </Link>
  );
}
