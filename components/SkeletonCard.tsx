import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="rounded-[1.6rem] border border-white/[0.07] bg-white/[0.02] p-6 animate-pulse">
      <div className="aspect-[4/3] rounded-[1.2rem] bg-white/5 mb-4" />
      <div className="h-4 bg-white/10 rounded-full w-3/4 mb-3" />
      <div className="h-3 bg-white/5 rounded-full w-1/2" />
    </div>
  );
}
