'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';

/**
 * A wishlist "heart" toggle. Requires a signed-in user (redirects to sign-in
 * otherwise). Calls the wishlist API and updates optimistically.
 */
export default function WishlistButton({
  listingId,
  initial = false,
  className = '',
  size = 16,
}: {
  listingId: string;
  initial?: boolean;
  className?: string;
  size?: number;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(initial);
  const [pending, setPending] = useState(false);

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (status === 'loading') return;
    if (!session) {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setPending(true);
    const next = !wishlisted;
    setWishlisted(next); // optimistic
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      });
      if (res.ok) {
        const data = await res.json();
        setWishlisted(!!data.wishlisted);
      } else {
        setWishlisted(!next); // revert on failure
      }
    } catch {
      setWishlisted(!next);
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={wishlisted}
      className={`p-2 rounded-full bg-black/30 backdrop-blur-md border border-white/10 hover:bg-white/15 transition-all disabled:opacity-60 ${className}`}
    >
      <Heart
        size={size}
        className={wishlisted ? 'text-rose-400' : 'text-white/80'}
        fill={wishlisted ? 'currentColor' : 'none'}
      />
    </button>
  );
}
