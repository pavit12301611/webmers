import { paletteFor } from '@/lib/palette';
import type { Listing } from '@/lib/types';

/**
 * A self-contained, dependency-free "website preview" thumbnail.
 *
 * Instead of loading random external images (which are slow, unreliable and can
 * be blocked), this renders a deterministic mock browser window showing an
 * abstract site layout, colored per listing. It scales to any aspect ratio via
 * the `className` prop.
 */
export default function Thumbnail({
  title,
  category,
  palette,
  className = '',
  showChrome = true,
}: {
  title: string;
  category?: string;
  palette?: [string, string];
  className?: string;
  showChrome?: boolean;
}) {
  const [from, to] = palette ?? paletteFor(title);
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const variant = hash(title) % 3;

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
      role="img"
      aria-label={`${title} preview`}
    >
      {/* Soft glow + vignette for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_55%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

      {/* Mock browser window */}
      <div className="absolute inset-[7%] rounded-xl bg-black/25 backdrop-blur-[2px] border border-white/20 shadow-2xl flex flex-col overflow-hidden">
        {showChrome && (
          <div className="flex items-center gap-1.5 px-3 h-6 bg-white/10 border-b border-white/10 shrink-0">
            <span className="w-2 h-2 rounded-full bg-rose-400/80" />
            <span className="w-2 h-2 rounded-full bg-amber-300/80" />
            <span className="w-2 h-2 rounded-full bg-emerald-400/80" />
            <span className="ml-2 flex-1 h-3 rounded-full bg-white/15 max-w-[60%]" title={slug} />
          </div>
        )}

        {/* Abstract site layout */}
        <div className="flex-1 p-4 flex flex-col gap-2 min-h-0">
          {variant === 0 && <HeroLayout />}
          {variant === 1 && <SplitLayout />}
          {variant === 2 && <GridLayout />}
        </div>
      </div>

      {category && (
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-md text-[10px] font-medium text-white/90 border border-white/10">
          {category}
        </span>
      )}
    </div>
  );
}

function HeroLayout() {
  return (
    <>
      <div className="h-2 w-1/3 rounded-full bg-white/40" />
      <div className="flex-1 flex flex-col items-center justify-center gap-2">
        <div className="h-3 w-3/4 rounded-full bg-white/70" />
        <div className="h-3 w-1/2 rounded-full bg-white/50" />
        <div className="h-2 w-2/3 rounded-full bg-white/25 mt-1" />
        <div className="h-5 w-1/4 rounded-full bg-white/80 mt-2" />
      </div>
    </>
  );
}

function SplitLayout() {
  return (
    <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
      <div className="flex flex-col justify-center gap-2">
        <div className="h-3 w-full rounded-full bg-white/70" />
        <div className="h-3 w-2/3 rounded-full bg-white/50" />
        <div className="h-2 w-full rounded-full bg-white/25" />
        <div className="h-5 w-1/2 rounded-full bg-white/80 mt-1" />
      </div>
      <div className="rounded-lg bg-white/20 border border-white/20" />
    </div>
  );
}

function GridLayout() {
  return (
    <>
      <div className="h-2 w-1/4 rounded-full bg-white/50" />
      <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-2 min-h-0">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-md bg-white/20 border border-white/15" />
        ))}
      </div>
    </>
  );
}

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

/** Convenience wrapper that renders a thumbnail from a full listing. */
export function ListingThumbnail({
  listing,
  className,
  showChrome = true,
}: {
  listing: Listing;
  className?: string;
  showChrome?: boolean;
}) {
  return (
    <Thumbnail
      title={listing.title}
      category={listing.category}
      palette={listing.palette}
      className={className}
      showChrome={showChrome}
    />
  );
}
