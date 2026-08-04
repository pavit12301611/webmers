/**
 * PSD — Knowledge Base.
 *
 * PSD is trained ONLY on Webmers content. This module compiles that training
 * corpus from two sources:
 *
 *  1. STATIC_DOCS — curated markdown distilled from the live Webmers pages
 *     (home, marketplace, editor, sell, faq, support, legal, blog...).
 *  2. LIVE DATA   — pulled straight from `lib/data.ts` (listings, categories,
 *     stats), so PSD always knows the *current* marketplace, including any
 *     listings sellers add later.
 *
 * Every document is heading-aware chunked, embedded with the deterministic
 * local embedder (zero API keys) and indexed into the in-memory vector store.
 */

import {
  getCategories,
  getLandingStats,
  getListings,
  customerPrice,
  CODE_UNLOCK_PRICE,
  PLATFORM_MARKUP_RATE,
  type Listing,
} from '@/lib/data';
import { recursiveTextSplitter, type SplitResult } from './splitter';
import { embedText, LOCAL_EMBEDDING_MODEL } from './embeddings';
import { vectorStore, type DocInfo } from './vectorStore';

export const PSD_NAME = 'PSD';
export const PSD_TAGLINE = 'Webmers Assistant';

/* ------------------------------------------------------------------ */
/* Static training documents (curated from the site)                   */
/* ------------------------------------------------------------------ */

const staticDocs: Array<{ id: string; title: string; markdown: string }> = [
  {
    id: 'about',
    title: 'About Webmers',
    markdown: `# About Webmers

Webmers is a premium marketplace for fully-built websites and digital gear. The tagline is "Buy. Edit. Own." — browse launch-ready websites, purchase them with escrow-protected checkout, edit them in a no-code visual editor, and optionally unlock the full source code.

Webmers positions itself as "The premier marketplace for launch-ready websites and precision digital gear. Re-think your digital journey with speed, ownership, and simplicity." The hero message is "Explore Uncharted Territories" with "Launch-ready websites and premium digital gear precision-built for your next venture."

Key values: measured, light, alive. The platform runs with zero setup — out of the box it ships with a self-contained in-memory data layer for quick previews, and can be pointed at PostgreSQL for production.

Website pages: Home (/), Marketplace (/marketplace), Visual Editor (/editor), Sell (/sell), Blog (/blog), FAQ (/faq), Support (/support), Terms (/terms), Privacy (/privacy), Cookies (/cookies), Refund policy (/refund).`,
  },
  {
    id: 'how-it-works',
    title: 'How Webmers Works',
    markdown: `# How Webmers works

Webmers takes you from seed to launch in three smooth steps:

1. Explore — Walk through curated, launch-ready websites organized by niche, stack and growth stage.
2. Secure — Buy with confidence through protected checkout and a clear satisfaction window.
3. Cultivate — Open the visual editor, tune the brand, connect a domain and let your site grow.

There are no bulky frameworks and no confusing setup — just a clean path from finding a site to making it yours.`,
  },
  {
    id: 'features',
    title: 'Webmers Features',
    markdown: `# Webmers features

- No-Code Editor — change copy, images, colors and sections in a calm visual workspace.
- Secure Payments — Razorpay-ready checkout with escrow-style protection and buyer confidence.
- Code Ownership — unlock the complete source when you need full customization freedom.
- Custom Domains — launch on your own domain with SSL-ready publishing flows.
- Human Support — talk with sellers and get admin mediation if anything needs attention.
- Fair Guarantee — refund protection when a purchase does not match the listing description.

The platform is built with Next.js 14 (App Router), React 18, Tailwind CSS and lucide-react. Auth uses NextAuth with JWT sessions (email/password, optional Google OAuth). Data uses a resilient layer that defaults to an in-memory store and can bridge to PostgreSQL via Prisma.`,
  },
  {
    id: 'editor',
    title: 'Visual Editor',
    markdown: `# Visual Editor

Every purchase on Webmers includes a full visual editor — no HTML, CSS, or JavaScript exposure required.

What you can do in the editor:
- Inline text editing
- Image swapping
- Section rearranging
- Colors and fonts (theme presets + accent colors + typography controls)
- Version rollback (undo/redo)
- Instant publish

The editor has a live device preview with desktop, tablet and mobile views. Built-in themes include Wander Warm, Wander Blue, Wander Dark, Dawn and more. You can tune every detail without touching code — text, imagery, layout and brand changes — precise, fast, and completely effortless.

Layout variants (Hero-Centered, Split-Screen, Video-Hero) can be selected during checkout or changed at any time inside the editor.`,
  },
  {
    id: 'code-unlock',
    title: 'Code Unlock Add-on',
    markdown: `# Code Unlock add-on

Every purchase includes full visual editing. For an additional ₹49 (approximately $0.60) you can unlock the complete source code as a premium add-on.

What the Full Code Access plan includes:
- Complete source code ZIP delivered to your verified email
- Private GitHub repo access
- Delivered to your inbox
- Single-use, time-limited download link
- Full customization freedom

Important: the code unlock add-on is non-refundable once the time-limited download link has been accessed — this protects against unauthorized redistribution.`,
  },
  {
    id: 'pricing-fees',
    title: 'Pricing & Fees',
    markdown: `# Pricing and marketplace fees

Listings on Webmers are priced in Indian Rupees (INR). A transparent platform markup of 20% is added to a seller's base listing price, and that markup is what the buyer pays as the customer price. The seller keeps their base price.

- Platform markup rate: 20% (PLATFORM_MARKUP_RATE)
- Customer price = seller base price × 1.20
- The seller's proceeds are their base price, excluding the 20% marketplace fee
- Code unlock add-on: ₹49 (CODE_UNLOCK_PRICE)
- Sellers are paid via UPI ID or PayPal email, after the satisfaction window

Example: if a seller lists a website at ₹299, the buyer pays approximately ₹359 (₹299 × 1.2) and the seller receives ₹299.`,
  },
  {
    id: 'buying',
    title: 'Buying & Checkout',
    markdown: `# Buying a website & checkout

How the purchase process works:

1. Browse listings on the marketplace, optionally filtering by category, price range or search term.
2. Open a listing and choose a layout variant (Hero-Centered, Split-Screen or Video-Hero).
3. Optionally add the code unlock add-on for ₹49.
4. Complete payment through the secure Razorpay gateway (signed verification + webhook confirmation).
5. After verification you get instant access to the visual editor and any download links.

Funds are held in escrow until the buyer confirms satisfaction within a 72-hour window. Prices, taxes, payment processing, and any applicable refund process are shown before purchase. Payments are processed with signed verification and webhook confirmation, keeping both sides safe.`,
  },
  {
    id: 'refund',
    title: 'Refund & Satisfaction Policy',
    markdown: `# Refund & satisfaction policy

Every purchase includes full visual editing access and a satisfaction window.

- If a website does not match the listing description, buyers may request a FULL refund within 48 hours of purchase.
- A 72-hour satisfaction window applies — funds are held in escrow until the buyer confirms satisfaction.
- Dispute resolution: if a disagreement arises between buyer and seller, the admin team mediates. Webmers offers partial refunds, full refunds, or replacement listings based on verified evidence and the 72-hour satisfaction window.
- The code unlock add-on (full source code) is non-refundable once the time-limited download link has been accessed, to protect against unauthorized redistribution.`,
  },
  {
    id: 'selling',
    title: 'Selling on Webmers',
    markdown: `# Selling on Webmers

Turn your fully-built websites into income. Sellers list what they have already built, reach buyers who want to launch fast, and get paid — measured and protected.

How selling works (3 steps):
1. List your site — upload your website with screenshots, tech stack and a clear description. The team reviews every submission for quality.
2. Get reviewed — Webmers verifies the build, checks the demo, and publishes it once it meets the measured standard.
3. Get paid — buyers purchase through protected checkout; funds are released after the satisfaction window. No chasing invoices.

Seller perks:
- Keep most of it — a transparent 20% platform fee; the rest is your proceeds, paid out on completion.
- Protected checkout — escrow-style payments and a satisfaction window keep both sides safe.
- Visual editor buyers love — every sale includes the in-browser editor, raising the value of what you build.
- Custom domains — buyers launch on their own domain, so your template reaches real audiences.

Sellers receive proceeds (their base price, excluding the 20% marketplace fee) via UPI ID or PayPal email. Manual reviews are conducted before payouts to ensure compliance.`,
  },
  {
    id: 'wishlist-newsletter',
    title: 'Wishlist & Newsletter',
    markdown: `# Wishlist & newsletter

Wishlist: you can save any listing by toggling the heart on a listing card. Wishlists are synced to your account, so saved sites follow you across devices and appear in your buyer dashboard.

Newsletter: the "Weekly harvest" — curated sites delivered to your inbox every week. Discover the best new websites and digital gear. No spam, unsubscribe anytime.`,
  },
  {
    id: 'account',
    title: 'Accounts & Dashboards',
    markdown: `# Accounts, roles & dashboards

You can create a Webmers account with email and password (optional Google OAuth). There are three roles: Buyer, Seller, and Admin.

- Buyer dashboard: your orders and wishlist.
- Seller dashboard: your listings and revenue.
- Admin dashboard: users, transactions, and platform health.

Demo accounts you can try right now:
- Admin: admin@webmers.io / Admin@123
- Seller: seller@webmers.io / Seller@123
- Buyer: buyer@webmers.io / Buyer@123

If you cannot sign in, use the password reset flow (forgot password) which sends a reset OTP by email.

Sign up at /auth/signup, sign in at /auth/signin.`,
  },
  {
    id: 'support',
    title: 'Support & Contact',
    markdown: `# Support & contact

How can Webmers help? Three ways:

1. Account access — use the password reset flow (/auth/forgot-password) if you cannot sign in.
2. Orders and listings — for an order, delivery, or listing concern, contact the seller through your dashboard. Include your order ID so Webmers can help promptly.
3. Contact — email support@webmers.io. Never include passwords or payment card details in email.

You can also message sellers before buying via the messaging system, and real-time notifications are delivered both in-app and via email for new messages. Admin mediation is available for disputes.

The FAQ page (/faq) answers common questions about buying, editing, and selling websites on Webmers.`,
  },
  {
    id: 'legal',
    title: 'Legal — Terms, Privacy & Cookies',
    markdown: `# Legal

Terms of service (updated July 30, 2026):
- Marketplace role: Webmers provides a marketplace for digital website assets. Listing descriptions, delivery commitments, and rights granted by sellers must be accurate and lawful.
- Accounts and purchases: you are responsible for your account credentials and accurate information. Prices, taxes, payment processing, and any applicable refund process are shown before purchase.
- Acceptable use: do not misuse the platform, violate intellectual-property rights, attempt unauthorized access, or submit harmful, deceptive, or unlawful content.
- Digital delivery: website assets are digital goods. Ownership, licensing, source-code access, and post-sale support are governed by the listing and order terms presented at checkout.

Privacy policy (updated July 30, 2026):
- What we collect: account details you provide, purchase and support records, and limited technical data needed to operate and secure Webmers.
- How we use it: to provide the marketplace, process transactions, prevent abuse, communicate service updates, and meet legal obligations. Webmers does not sell personal information.
- Sharing and retention: data is shared only with service providers required to run the service, sellers involved in your order, or where law requires it. Records are retained only as long as needed.
- Your choices: you may request access, correction, deletion, or a copy of your personal information by contacting support. Transaction records may be retained where legally required.

Cookies policy is available at /cookies.`,
  },
  {
    id: 'blog',
    title: 'Blog & Resources',
    markdown: `# Blog & resources

Webmers publishes articles and guides for buyers, sellers, and anyone who believes a website should feel as precise as it looks.

- How to Choose the Right Website Template — a measured guide to matching your brand story with the right layout, typography, and color palette.
- Selling Your Website on Webmers — from draft to active listing: how to describe your site, set pricing, and attract serious buyers.
- Understanding Code Ownership — what the full source unlock includes, how delivery works, and when it is the right choice.
- Layout Variants Explained — how Hero-Centered, Split-Screen, and Video-Hero shapes change the user experience.

Read them at /blog.`,
  },
  {
    id: 'testimonials',
    title: 'Testimonials',
    markdown: `# Testimonials — "Field notes"

- "Webmers made it possible to launch a professional website in a weekend. The visual editor is incredible." — Sarah K., Freelancer, purchased Meridian SaaS.
- "I unlocked the code and customized everything. Delivery was instant and secure." — David R., Developer, purchased Lumina E-commerce.

Real reviews on listings:
- Meridian SaaS: "Incredible design and the editor made customization a breeze." (David R., 5★) — "Launched in a weekend. The layout variants are a great touch." (Maria L., 5★)
- Nocturne Portfolio: "Beautiful minimal style. Would recommend for any portfolio." (David R., 4★)
- Lumina E-commerce: "The checkout flow just works. Great starting point for a store." (Maria L., 5★)`,
  },
  {
    id: 'psd-identity',
    title: 'About PSD',
    markdown: `# About PSD

PSD is Webmers' built-in assistant. It is named PSD and lives right on the site as a floating chat widget.

PSD is trained ONLY on Webmers' content — the marketplace, the visual editor, selling, refunds, support, legal pages, FAQ, blog and live listings. It runs 100% offline with zero API keys and no external AI services, so it answers fast and works even with no network to external LLM providers.

PSD can help with: what Webmers is, how buying works, listing prices and details, the visual editor, the code unlock add-on, selling on Webmers, refunds, payments, accounts, support contacts, categories, legal pages, and more — anything that is documented on webmers.io.

If a question is not about Webmers, PSD politely explains it only knows Webmers content.`,
  },
];

/* ------------------------------------------------------------------ */
/* Live documents (built from lib/data.ts at boot)                     */
/* ------------------------------------------------------------------ */

function listingMarkdown(l: Listing): string {
  return `# ${l.title}

${l.tagline}

## Category
${l.category}

## Description
${l.description}

## Price
Base seller price ₹${l.price.toLocaleString('en-IN')}. Customer price (with 20% platform markup) ₹${customerPrice(l.price).toLocaleString('en-IN')}.

## Tech stack
${l.techStack.join(', ')}

## Seller
${l.sellerName} is the seller of this ${l.category} website on Webmers.

## Rating & sales
${l.rating}★ from verified buyers · ${l.sales} sales

${l.featured ? 'This listing is featured on the Webmers homepage.' : ''}

${l.demoUrl ? `Live demo: ${l.demoUrl}` : ''}

Listing page: /listing/${l.id}`;
}

async function buildLiveDocs(): Promise<
  Array<{ id: string; title: string; markdown: string }>
> {
  const [listings, categories, stats] = await Promise.all([
    getListings(),
    getCategories(),
    getLandingStats(),
  ]);

  const docs: Array<{ id: string; title: string; markdown: string }> = [];

  // One document per listing — always current.
  for (const l of listings) {
    docs.push({
      id: `listing-${l.id}`,
      title: `Listing: ${l.title}`,
      markdown: listingMarkdown(l),
    });
  }

  // Catalog overview document (useful for "what can I buy / prices").
  if (listings.length > 0) {
    const catalog = `# Current Webmers catalog

There are ${listings.length} active website listings across ${categories.length} categories: ${categories
      .map((c) => `${c.name} (${c.count})`)
      .join(', ')}.

${listings
  .map(
    (l) =>
      `- **${l.title}** — ${l.tagline} — ${l.category} — ₹${customerPrice(l.price).toLocaleString('en-IN')} (seller base ₹${l.price.toLocaleString('en-IN')}) — ${l.rating}★ — ${l.techStack.join(', ')} — /listing/${l.id}`,
  )
  .join('\n')}

Live demos are available for listings that provide one. You can filter the marketplace by category, price range, and search term.`;
    docs.push({ id: 'catalog', title: 'Webmers Catalog', markdown: catalog });
  }

  // Landing stats document.
  const statsDoc = `# Webmers platform live stats

- Websites sold: ${stats[0]?.value ?? '—'}
- Users: ${stats[1]?.value ?? '—'}
- Earned by sellers: ${stats[2]?.value ?? '—'}
- Average rating: ${stats[3]?.value ?? '—'}`;
  docs.push({ id: 'stats', title: 'Webmers Stats', markdown: statsDoc });

  return docs;
}

/* ------------------------------------------------------------------ */
/* Build (cached singleton — survives HMR)                             */
/* ------------------------------------------------------------------ */

interface BuiltKnowledge {
  docs: number;
  chunks: number;
  model: string;
}

const g = globalThis as unknown as { __psdKnowledge?: Promise<BuiltKnowledge> };

async function buildKnowledge(): Promise<BuiltKnowledge> {
  vectorStore.clear();

  const liveDocs = await buildLiveDocs();
  const allDocs = [...staticDocs, ...liveDocs];
  let totalChunks = 0;

  for (const doc of allDocs) {
    const splits: SplitResult[] = recursiveTextSplitter(doc.markdown, 800, 150);
    const chunks = splits.map((s) => ({
      text: s.heading ? `[${s.heading}] ${s.text}` : s.text,
      vector: embedText(s.text),
      heading: s.heading,
    }));
    const info: DocInfo = {
      id: doc.id,
      originalName: doc.title,
      size: Buffer.byteLength(doc.markdown, 'utf8'),
      category: 'knowledge',
      createdAt: new Date().toISOString(),
    };
    totalChunks += vectorStore.addDocument(info, chunks);
  }

  return {
    docs: allDocs.length,
    chunks: totalChunks,
    model: LOCAL_EMBEDDING_MODEL,
  };
}

/**
 * Returns the (cached) built knowledge base. Safe to call from any server
 * route; rebuilds automatically if the store is empty.
 */
export async function getKnowledge(): Promise<BuiltKnowledge> {
  if (!g.__psdKnowledge) {
    g.__psdKnowledge = buildKnowledge();
  }
  const result = await g.__psdKnowledge;
  // Safety net: if the store got cleared, rebuild.
  if (vectorStore.size === 0) {
    g.__psdKnowledge = buildKnowledge();
    return g.__psdKnowledge;
  }
  return result;
}

export { CODE_UNLOCK_PRICE, PLATFORM_MARKUP_RATE };
