import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

/**
 * Shared empty-state panel for dashboard sections.
 */
export default function EmptyState({
  title,
  message,
  cta,
  icon: Icon,
}: {
  title: string;
  message: string;
  cta?: { label: string; href: string };
  icon?: LucideIcon;
}) {
  return (
    <div className="leaf-card rounded-[1.6rem] px-6 py-14 text-center">
      {Icon && (
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full border border-emerald-50/10 bg-emerald-50/[0.04] text-emerald-50/45">
          <Icon size={20} aria-hidden="true" />
        </div>
      )}
      <p className="mb-2 font-display text-xl font-semibold">{title}</p>
      <p className="mx-auto mb-6 max-w-sm text-sm text-emerald-50/40">{message}</p>
      {cta && (
        <Link href={cta.href} className="btn-forest px-6 py-2.5 text-sm">
          {cta.label}
        </Link>
      )}
    </div>
  );
}
