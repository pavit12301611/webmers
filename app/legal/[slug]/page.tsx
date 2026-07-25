import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import SiteFooter from '@/components/SiteFooter';

interface LegalDoc {
  title: string;
  summary: string;
  sections: Array<{ heading: string; body: string[] }>;
}

const DOCS: Record<string, LegalDoc> = {
  privacy: {
    title: 'Privacy Policy',
    summary: 'What we collect, why we collect it, and the control you have over it.',
    sections: [
      {
        heading: 'Information we collect',
        body: [
          'Account details you provide when signing up: your name, email address and the role you select (buyer or seller).',
          'Transaction records for websites you buy or sell, including the amount, the layout variant chosen and whether the source-code add-on was purchased.',
          'Product activity such as wishlist entries and saved visual-editor documents, so your work is there when you return.',
        ],
      },
      {
        heading: 'How we use it',
        body: [
          'To operate your account, deliver purchases and provide customer support.',
          'To secure the platform — rate limiting, fraud prevention and abuse investigation.',
          'To send transactional email such as password reset codes. Marketing email is only sent if you subscribe, and every message includes an unsubscribe link.',
        ],
      },
      {
        heading: 'Passwords and security',
        body: [
          'Passwords are hashed with bcrypt and are never stored or logged in plain text. Nobody at Webmers can read your password.',
          'Password reset codes are stored only as a hash, expire after ten minutes, and are destroyed after five incorrect attempts.',
        ],
      },
      {
        heading: 'Sharing',
        body: [
          'We do not sell personal data. Information is shared only with the payment processor needed to complete a transaction, and where we are legally required to do so.',
          'When you buy a website, the seller receives the details necessary to fulfil the order.',
        ],
      },
      {
        heading: 'Your rights',
        body: [
          'You may request a copy of your data, ask for corrections, or ask us to delete your account and associated records.',
          'Contact privacy@webmers.io and we will respond within 30 days.',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms of Service',
    summary: 'The agreement between you and Webmers when you use the marketplace.',
    sections: [
      {
        heading: 'Accounts',
        body: [
          'You must provide accurate information and keep your credentials secure. You are responsible for activity that occurs under your account.',
          'One person or organisation per account. Accounts may not be shared, sold or transferred.',
        ],
      },
      {
        heading: 'Buying',
        body: [
          'Purchasing a website grants you a licence to use, modify and deploy that website for a single project, plus access to the visual editor for it.',
          'The source-code add-on, when purchased, grants you the complete codebase under the same single-project licence.',
          'Prices are shown in US dollars and are calculated on our servers at the time of purchase.',
        ],
      },
      {
        heading: 'Escrow and refunds',
        body: [
          'Funds for each purchase are held for 72 hours after payment. During this window you may confirm satisfaction to release them early.',
          'A full refund is available within 48 hours if the delivered website materially fails to match its listing description.',
          'Refunds are returned to the original payment method and the associated licence is revoked.',
        ],
      },
      {
        heading: 'Selling',
        body: [
          'Sellers warrant that they own or are licensed to sell everything in a listing, and that listings accurately describe what a buyer receives.',
          'Webmers retains a 10% platform fee on each completed sale. The remainder is paid out after the escrow window closes.',
          'Listings that infringe intellectual property, contain malware or misrepresent their contents will be removed.',
        ],
      },
      {
        heading: 'Acceptable use',
        body: [
          'Do not attempt to breach platform security, scrape the marketplace at scale, or use Webmers to distribute unlawful material.',
          'We may suspend accounts that violate these terms, with notice where practical.',
        ],
      },
      {
        heading: 'Liability',
        body: [
          'The marketplace is provided on an "as is" basis. To the maximum extent permitted by law, our aggregate liability is limited to the amount you paid in the twelve months preceding a claim.',
        ],
      },
    ],
  },
  cookies: {
    title: 'Cookie Policy',
    summary: 'The small number of cookies Webmers sets, and what each one does.',
    sections: [
      {
        heading: 'Essential cookies',
        body: [
          'Session cookie — set when you sign in, so the site knows who you are on each request. Removing it signs you out.',
          'CSRF token — protects sign-in and other form submissions against cross-site request forgery.',
          'These are required for the site to function and cannot be disabled while you are signed in.',
        ],
      },
      {
        heading: 'What we do not use',
        body: [
          'No third-party advertising cookies.',
          'No cross-site tracking or data brokerage.',
          'No analytics profiles tied to your identity.',
        ],
      },
      {
        heading: 'Managing cookies',
        body: [
          'Every browser lets you view and delete cookies for a site. Doing so signs you out of Webmers but does not delete your account or purchases.',
        ],
      },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(DOCS).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const doc = DOCS[params.slug];
  if (!doc) return { title: 'Not Found' };
  return { title: doc.title, description: doc.summary };
}

export default function LegalPage({ params }: { params: { slug: string } }) {
  const doc = DOCS[params.slug];
  if (!doc) notFound();

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />

      <article className="mx-auto max-w-3xl px-6 pb-24 pt-36 md:px-10">
        <h1
          className="mb-4 text-4xl tracking-tight md:text-5xl"
          style={{ fontFamily: 'var(--font-instrument)' }}
        >
          {doc.title}
        </h1>
        <p className="mb-3 text-[15px] leading-7 text-white/50">{doc.summary}</p>
        <p className="mb-12 text-[11px] uppercase tracking-[0.18em] text-white/25">
          Last updated 25 July 2026
        </p>

        <div className="space-y-10">
          {doc.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="mb-3 text-xl tracking-tight text-white/90">{section.heading}</h2>
              <div className="space-y-3">
                {section.body.map((paragraph, i) => (
                  <p key={i} className="text-[15px] leading-7 text-white/50">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-14 border-t border-white/[0.08] pt-8 text-sm text-white/35">
          Questions about this document? Reach us at{' '}
          <a
            href="mailto:legal@webmers.io"
            className="text-white/60 underline underline-offset-4 transition hover:text-white"
          >
            legal@webmers.io
          </a>
          .
        </p>
      </article>

      <SiteFooter />
    </main>
  );
}
