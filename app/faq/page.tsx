import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Wand2, Globe, MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Common questions about buying, editing, and selling websites on Webmers.',
};

const faqs = [
  {
    question: 'How does the purchase process work?',
    answer:
      'Browse listings, select a layout variant, add optional code unlock, and complete payment through our secure Razorpay gateway. After verification, you receive instant access to the visual editor and download links.',
  },
  {
    question: 'Can I edit my website without coding?',
    answer:
      'Yes. Every purchase includes a full visual editor with inline text editing, image swapping, section rearranging, theme presets, and responsive preview. No HTML, CSS, or JavaScript exposure is required.',
  },
  {
    question: 'What is the code unlock add-on?',
    answer:
      'For an additional ₹49, you can unlock the complete source code as a ZIP file delivered to your verified email. It includes a time-limited, single-use download link and optional private GitHub repo access.',
  },
  {
    question: 'Is there a refund policy?',
    answer:
      'Yes. Full refunds are available within 48 hours if the website does not match the listing description. We also offer dispute resolution with admin mediation and partial refund options.',
  },
  {
    question: 'How do sellers get paid?',
    answer:
      'Sellers receive proceeds (their base price, excluding the 20% marketplace fee) via UPI ID or PayPal email. Manual reviews are conducted before payouts to ensure compliance.',
  },
  {
    question: 'Can I change the layout after purchase?',
    answer:
      'Yes. Layout variants (Hero-Centered, Split-Screen, Video-Hero) can be selected during checkout or changed at any time in the visual editor.',
  },
  {
    question: 'Are my payments secure?',
    answer:
      'All payments are processed through Razorpay with signed verification and webhook confirmation. Funds are held in escrow until the buyer confirms satisfaction within a 72-hour window.',
  },
  {
    question: 'Can I message the seller before buying?',
    answer:
      'Yes. Our messaging system allows pre-purchase questions. Real-time notifications are delivered both in-app and via email for new messages.',
  },
];

export default function FAQPage() {
  return (
    <main className="bg-[#0a0a0a] text-white px-6 md:px-10 py-20 md:py-28">
      <div className="mx-auto max-w-4xl">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/50">
          <ShieldCheck size={12} /> Support
        </span>
        <h1 className="text-4xl md:text-6xl tracking-tight mb-6" style={{ fontFamily: 'var(--font-instrument)' }}>
          Frequently Asked Questions
        </h1>
        <p className="text-[15px] leading-7 text-white/45 mb-14 max-w-2xl">
          Everything you need to know about buying, editing, and owning a fully-built website on Webmers.
        </p>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details key={i} className="group rounded-[1.4rem] border border-white/[0.07] bg-white/[0.02] backdrop-blur-xl overflow-hidden">
              <summary className="cursor-pointer px-6 md:px-8 py-6 text-[16px] font-medium tracking-tight text-white hover:bg-white/[0.03] transition-colors list-none flex items-center justify-between gap-4 select-none">
                <span>{faq.question}</span>
                <span className="text-white/20 text-xl leading-none group-open:rotate-45 transition-transform duration-300">+</span>
              </summary>
              <div className="px-6 md:px-8 pb-6 text-[14px] leading-6 text-white/50">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>

        <div className="mt-14 rounded-[1.6rem] border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-8 md:p-10 backdrop-blur-xl text-center">
          <h3 className="text-xl font-display font-bold mb-3">Still have questions?</h3>
          <p className="text-sm text-white/45 mb-6 max-w-md mx-auto">
            Reach out through our messaging system or explore the marketplace to see how it all works.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/messages" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black hover:bg-white/90 transition-colors">
              <MessageCircle size={16} /> Contact Support
            </Link>
            <Link href="/marketplace" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm text-white/60 hover:border-white/20 hover:text-white transition-colors">
              <Globe size={16} /> Browse Websites
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
