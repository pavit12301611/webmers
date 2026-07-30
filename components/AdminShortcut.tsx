'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { Shield } from 'lucide-react';
import Link from 'next/link';

export default function AdminShortcut() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!session?.user || session.user.role !== 'ADMIN') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Ctrl + Shift + A OR Ctrl + Alt + A
      const isCtrlShiftA = e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a';
      const isCtrlAltA = e.ctrlKey && e.altKey && e.key.toLowerCase() === 'a';

      if (isCtrlShiftA || isCtrlAltA) {
        e.preventDefault();
        router.push('/dashboard/admin');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [session, router]);

  if (!mounted) return null;
  if (!session?.user || session.user.role !== 'ADMIN') return null;

  // Don't show floating badge on the admin dashboard itself to avoid clutter
  if (pathname.startsWith('/dashboard/admin')) return null;

  return (
    <Link
      href="/dashboard/admin"
      title="Open Admin Dashboard (Ctrl+Shift+A)"
      className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2.5 rounded-full border border-lime-400/40 bg-[#07130e]/90 px-4 py-2.5 text-xs font-semibold text-lime-300 shadow-[0_8px_32px_rgba(163,230,53,0.15)] backdrop-blur-xl transition-all hover:bg-lime-400/10 hover:border-lime-400/60 hover:scale-105 active:scale-95"
    >
      <Shield size={14} className="animate-pulse text-lime-400" />
      <span>Admin Dashboard</span>
      <span className="rounded bg-lime-400/15 px-1.5 py-0.5 font-mono text-[9px] text-lime-200">
        Ctrl+Shift+A
      </span>
    </Link>
  );
}
