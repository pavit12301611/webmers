import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export default function Toast({ message, open, onClose }: { message: string; open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (open) {
      const t = setTimeout(onClose, 3000);
      return () => clearTimeout(t);
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full bg-background border border-white/10 text-foreground text-sm font-medium shadow-2xl flex items-center gap-3 animate-fade-up">
      <span>{message}</span>
      <button onClick={onClose} aria-label="Close" className="text-foreground/30 hover:text-foreground transition-colors"><X size={14} /></button>
    </div>
  );
}
