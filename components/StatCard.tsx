import type { LucideIcon } from 'lucide-react';

type Tone = 'default' | 'positive' | 'warning' | 'negative';

const TONE_VALUE: Record<Tone, string> = {
  default: 'text-emerald-50',
  positive: 'text-emerald-300',
  warning: 'text-amber-300',
  negative: 'text-rose-300',
};

/**
 * Compact metric tile used across the dashboards.
 */
export default function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = 'default',
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  tone?: Tone;
}) {
  return (
    <div className="leaf-card rounded-[1.4rem] p-5">
      <div className="mb-3 flex items-center gap-2.5 text-emerald-50/40">
        <Icon size={17} aria-hidden="true" />
        <span className="text-[11px] font-medium uppercase tracking-[0.14em]">{label}</span>
      </div>
      <div className={`font-display text-3xl font-semibold tracking-tight ${TONE_VALUE[tone]}`}>
        {value}
      </div>
      {hint && <p className="mt-1.5 text-xs text-emerald-50/35">{hint}</p>}
    </div>
  );
}
