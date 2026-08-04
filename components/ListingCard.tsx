'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, ArrowUpRight, Wand2 } from 'lucide-react';
import { ListingThumbnail } from './Thumbnail';
import WishlistButton from './WishlistButton';
import { customerPrice, type Listing } from '@/lib/data';

/**
 * ListingCard - every listed site is editable via PSD AI at /editor?listing=ID
 * Fixed: no nested <a> tags, uses router.push for card click and stops propagation for edit/wishlist
 */
export default function ListingCard({
  listing,
  initialWishlisted = false,
}: {
  listing: Listing;
  initialWishlisted?: boolean;
}) {
  const router = useRouter();

  const goToListing = () => router.push(`/listing/${listing.id}`);
  const goToEditor = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    router.push(`/editor?listing=${listing.id}`);
  };

  return (
    <div className="group relative block overflow-hidden rounded-[1.75rem] bg-gradient-to-b from-[#fffdf9] to-[#faf5ee] border border-wander-dark/8 shadow-[0_8px_28px_rgba(143,113,80,0.08),0_2px_8px_rgba(143,113,80,0.04),inset_0_1px_0_rgba(255,255,255,0.75)] transition-all duration-350 hover:-translate-y-1 hover:border-wander-orange/25 hover:shadow-[0_14px_36px_rgba(143,113,80,0.12),0_4px_14px_rgba(143,113,80,0.06),inset_0_1px_0_rgba(255,255,255,0.8)]">
      {/* Main clickable area - NOT a Link to avoid nested anchors */}
      <div onClick={goToListing} className="block cursor-pointer">
        <div className="relative aspect-[4/3] overflow-hidden bg-wander-blue/20">
          <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.04] will-change-transform">
            <ListingThumbnail listing={listing} showChrome={false} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-wander-dark/85 via-transparent to-black/20" />

          <div className="absolute left-4 top-4 flex items-center gap-2">
            <span className="rounded-full bg-gradient-to-b from-white/95 to-[#faf8f4] backdrop-blur-md px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-wander-dark shadow-[0_2px_6px_rgba(143,113,80,0.08),inset_0_1px_0_rgba(255,255,255,0.85)] border border-white/50">
              {listing.category}
            </span>
          </div>

          <div className="absolute right-4 top-4 flex items-center gap-2">
            <button
              type="button"
              onClick={goToEditor}
              title={`Edit ${listing.title} with PSD AI`}
              className="rounded-full bg-[#1f3d47]/90 backdrop-blur-md p-1.5 text-white border border-white/20 shadow-[0_2px_8px_rgba(0,0,0,0.2)] hover:bg-[#d9772b] transition-colors"
            >
              <Wand2 size={14} />
            </button>
            <div
              className="rounded-full bg-gradient-to-b from-white/90 to-[#faf5ee] backdrop-blur-md p-1.5 shadow-[0_2px_8px_rgba(143,113,80,0.08),inset_0_1px_0_rgba(255,255,255,0.8)] border border-white/40"
              onClick={(e) => e.stopPropagation()}
            >
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
      </div>

      <div className="flex items-center justify-between px-5 py-3.5 text-xs text-wander-dark/80 bg-gradient-to-r from-white/30 to-[#faf5ee]/60 rounded-b-[1.75rem] border-t border-wander-dark/[0.04]">
        <span className="flex items-center gap-1.5 font-medium">
          <Star size={13} fill="currentColor" className="text-wander-orange" /> {listing.rating.toFixed(1)}
          <span className="ml-2 h-3 w-px bg-wander-dark/15" />
          <span>{listing.sales} sales</span>
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToEditor}
            className="inline-flex items-center gap-1 rounded-full bg-[#1f3d47] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-[#d9772b] transition-colors"
          >
            <Wand2 size={11} /> Edit with PSD
          </button>
          <Link
            href={`/listing/${listing.id}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-wander-dark transition-colors group-hover:text-wander-orange"
          >
            Explore <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
