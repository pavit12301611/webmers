import Link from 'next/link';
import { Star } from 'lucide-react';
import { ListingThumbnail } from './Thumbnail';
import WishlistButton from './WishlistButton';
import { getCurrentUser } from '@/lib/auth';
import { isWishlisted, type Listing } from '@/lib/data';

/** A marketplace card linking to the listing detail page. */
export default async function ListingCard({ listing }: { listing: Listing }) {
  const user = await getCurrentUser();
  const wishlisted = user ? await isWishlisted(user.id, listing.id) : false;

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group block relative overflow-hidden rounded-3xl aspect-[4/5] border border-white/[0.08] bg-white/[0.02] hover:border-white/25 transition-all duration-500 hover:-translate-y-1 shadow-xl shadow-black/50"
    >
      <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.03]">
        <ListingThumbnail listing={listing} showChrome={false} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

      <div className="absolute top-4 right-4">
        <WishlistButton listingId={listing.id} initial={wishlisted} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-7">
        <h3 className="text-2xl md:text-[1.7rem] font-display font-bold mb-1 leading-tight">{listing.title}</h3>
        <p className="text-sm text-white/45 mb-3 line-clamp-1">{listing.tagline}</p>
        <div className="flex items-center gap-3 text-sm">
          <span className="font-semibold text-white text-base">${listing.price}</span>
          <span className="text-white/30">·</span>
          <span className="flex items-center gap-1 text-white/70">
            <Star size={13} fill="currentColor" className="text-amber-400" /> {listing.rating.toFixed(1)}
          </span>
          <span className="text-white/30">·</span>
          <span className="text-white/40">{listing.sales} sales</span>
        </div>
      </div>
    </Link>
  );
}
