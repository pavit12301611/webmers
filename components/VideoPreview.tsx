import { Play, ExternalLink } from 'lucide-react';

export default function VideoPreview({ url, title }: { url?: string; title: string }) {
  if (!url) return null;
  return (
    <div className="relative rounded-[1.2rem] overflow-hidden border border-white/10 bg-[#121212]">
      <iframe
        src={url}
        title={`${title} preview`}
        className="w-full aspect-video"
        allow="autoplay; encrypted-media"
        sandbox="allow-scripts allow-same-origin"
      />
      <div className="absolute top-3 right-3 rounded-full bg-black/50 backdrop-blur-md px-3 py-1 text-[11px] text-white/70 flex items-center gap-1.5">
        <Play size={10} /> Sandbox Preview
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-3 left-3 rounded-full bg-black/50 backdrop-blur-md px-3 py-1.5 text-[11px] text-white/70 hover:text-white hover:bg-black/70 transition-colors flex items-center gap-1.5"
      >
        <ExternalLink size={10} /> Open full demo
      </a>
    </div>
  );
}
