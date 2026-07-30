import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Resources & Articles',
  description: 'Guides and insights on buying, selling, and customizing websites.',
};

const articles = [
  {
    title: 'How to Choose the Right Website Template',
    excerpt: 'A measured guide to matching your brand story with the right layout, typography, and color palette.',
    tag: 'Guide',
    readTime: '4 min',
  },
  {
    title: 'Selling Your Website on Webmers',
    excerpt: 'From draft to active listing — how to describe your site, set pricing, and attract serious buyers.',
    tag: 'Seller',
    readTime: '6 min',
  },
  {
    title: 'Understanding Code Ownership',
    excerpt: 'What the full source unlock includes, how delivery works, and when it is the right choice.',
    tag: 'Technical',
    readTime: '3 min',
  },
  {
    title: 'Layout Variants Explained',
    excerpt: 'How Hero-Centered, Split-Screen, and Video-Hero shapes change the user experience.',
    tag: 'Design',
    readTime: '5 min',
  },
];

export default function BlogPage() {
  return (
    <main className="bg-[#0a0a0a] text-white px-6 md:px-10 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/50">
          Resources
        </span>
        <h1 className="text-4xl md:text-6xl tracking-tight mb-6" style={{ fontFamily: 'var(--font-instrument)' }}>
          Articles & Guides
        </h1>
        <p className="text-[15px] leading-7 text-white/45 mb-14 max-w-2xl">
          Measured insights for buyers, sellers, and anyone who believes a website should feel as precise as it looks.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {articles.map((a) => (
            <Link key={a.title} href="#" className="group rounded-[1.4rem] border border-white/[0.07] bg-white/[0.02] p-7 md:p-8 backdrop-blur-xl transition hover:bg-white/[0.04] hover:-translate-y-0.5 hover:shadow-[0_16px_60px_rgba(255,255,255,0.04)]">
              <div className="flex items-center gap-3 mb-4">
                <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/60">{a.tag}</span>
                <span className="text-[11px] text-white/30">{a.readTime} read</span>
              </div>
              <h3 className="text-xl md:text-2xl font-medium tracking-tight mb-3 group-hover:text-white/90 transition-colors">{a.title}</h3>
              <p className="text-[14px] leading-6 text-white/45">{a.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
