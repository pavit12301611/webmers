import Link from 'next/link';
import Header from './Header';
import SiteFooter from './SiteFooter';

type Section = { title: string; body: React.ReactNode };

export default function LegalPage({ eyebrow, title, updated, sections }: { eyebrow: string; title: string; updated: string; sections: Section[] }) {
  return (
    <main className="min-h-screen overflow-hidden bg-[#0a0a0a]">
      <Header />
      <article className="mx-auto max-w-3xl px-6 pb-24 pt-36 md:px-10">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/40">{eyebrow}</p>
        <h1 className="mt-4 text-5xl tracking-tight text-white md:text-7xl" style={{ fontFamily: 'var(--font-instrument)' }}>{title}</h1>
        <p className="mt-5 text-sm text-white/40">Last updated: {updated}</p>
        <div className="mt-12 space-y-10 text-[15px] leading-7 text-white/60">
          {sections.map((section) => <section key={section.title}><h2 className="mb-3 text-2xl text-white" style={{ fontFamily: 'var(--font-instrument)' }}>{section.title}</h2>{section.body}</section>)}
        </div>
        <p className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-6 text-white/50">
          Questions about these terms? <Link className="text-white underline underline-offset-4" href="/support">Contact Webmers support</Link>.
        </p>
      </article>
      <SiteFooter />
    </main>
  );
}
