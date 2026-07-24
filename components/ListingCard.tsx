import Link from 'next/link';
import { Leaf, Star } from 'lucide-react';
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
      className="group leaf-card block relative overflow-hidden rounded-[2rem] aspect-[4/5] transition-all duration-500 hover:-translate-y-1.5 hover:border-lime-100/25"
    >
      <div className="absolute inset-3 overflow-hidden rounded-[1.45rem] transition-transform duration-700 group-hover:scale-[1.025]">
        <ListingThumbnail listing={listing} showChrome={false} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#07130e]/95 via-[#07130e]/20 to-transparent" />
      <div className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full border border-emerald-50/10 bg-[#07130e]/45 px-3 py-1 text-xs font-medium text-emerald-50/75 backdrop-blur-md">
        <Leaf size={12} /> {listing.category}
      </div>

      <div className="absolute top-5 right-5">
        <WishlistButton listingId={listing.id} initial={wishlisted} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-7">
        <h3 className="mb-1 font-display text-2xl font-bold leading-tight md:text-[1.7rem]">{listing.title}</h3>
        <p className="mb-4 line-clamp-1 text-sm text-emerald-50/46">{listing.tagline}</p>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-full bg-lime-200/90 px-3 py-1 font-bold text-[#07130e]">${listing.price}</span>
          <span className="flex items-center gap-1 text-emerald-50/76">
            <Star size={13} fill="currentColor" className="text-[#f4d58d]" /> {listing.rating.toFixed(1)}
          </span>
          <span className="text-emerald-50/40">{listing.sales} sales</span>
        </div>
      </div>
    </Link>
  );
}
