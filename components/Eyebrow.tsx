import { ReactNode } from 'react';

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
      className={`inline-flex w-fit items-center gap-2 rounded-full border border-wander-dark/15 bg-wander-dark/5 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.25em] text-wander-dark ${className}`}
    >
      {icon ? <span className="grid place-items-center text-wander-orange">{icon}</span> : null}
      {children}
    </span>
  );
}
