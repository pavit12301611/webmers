import { ReactNode } from 'react';

/**
 * Consistent section eyebrow pill — matches the hero's muted, glassy label style.
 * Used by every landing section so the page reads as one continuous system.
 */
export default function Eyebrow({
  children,
  icon,
  className = '',
}: {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-2 rounded-full border border-border bg-foreground/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground ${className}`}
    >
      {icon ? <span className="grid place-items-center">{icon}</span> : null}
      {children}
    </span>
  );
}
