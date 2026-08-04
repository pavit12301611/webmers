import { Sparkles } from 'lucide-react';

export default function EmptyState({ title, desc, action }: { title: string; desc: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-16 rounded-3xl border border-white/[0.06] bg-white/[0.02]">
      <Sparkles size={32} className="mx-auto text-foreground/20 mb-4" />
      <h3 className="text-xl font-display font-semibold mb-2">{title}</h3>
      <p className="text-sm text-foreground/40 mb-5">{desc}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
