/**
 * PSD — Local Answer Engine.
 *
 * PSD requires NO API keys and makes NO external AI calls. Answers are
 * produced locally in two ways:
 *
 *  1. INTENT TEMPLATES — the engine classifies the question (pricing, refund,
 *     selling, editor, code unlock, accounts, support...) and builds a precise
 *     answer from the live Webmers data layer + curated site facts.
 *  2. EXTRACTIVE RETRIEVAL — for anything else, PSD retrieves the most
 *     relevant chunks from its Webmers-only knowledge base (hybrid search,
 *     deterministic embeddings) and synthesizes a grounded answer from the
 *     best-matching sentences, with source citations.
 *
 * If a question is outside the site's scope, PSD says so instead of guessing.
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
import { getKnowledge } from './knowledge';
import { embedText } from './embeddings';
import { vectorStore, type SearchResult } from './vectorStore';
import { config } from './config';
import { tokenize } from './normalize';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface PSDAnswer {
  reply: string;
  sources: string[];
  intent: string;
  matched?: boolean;
}

/* ------------------------------------------------------------------ */
/* Intent classification                                               */
/* ------------------------------------------------------------------ */

type Intent =
  | 'identity'
  | 'greeting'
  | 'help'
  | 'about'
  | 'how_it_works'
  | 'buy'
  | 'pricing'
  | 'categories'
  | 'listing_lookup'
  | 'recommend'
  | 'editor'
  | 'code_unlock'
  | 'layout'
  | 'refund'
  | 'sell'
  | 'wishlist'
  | 'newsletter'
  | 'support'
  | 'account'
  | 'legal'
  | 'blog'
  | 'tech'
  | 'reviews'
  | 'thanks'
  | 'bye'
  | 'offtopic'
  | 'fallback';

interface Rule {
  intent: Intent;
  pattern: RegExp;
  priority?: number; // higher wins ties
}

const RULES: Rule[] = [
  // Identity
  { intent: 'identity', pattern: /(who are you|what are you|your name|what is psd|about psd|are you (a )?(bot|ai)|psd means|api ?keys?|openai|gemini|chatgpt|\bllm\b|gpt)/i, priority: 62 },
  { intent: 'identity', pattern: /(do you (need|require) (an|a|any|the)? ?(api ?key|key|internet|network)|without (api|keys?|internet)|how (are|were) you (trained|powered|built|made)|are you (offline|local|free|keyless))/i, priority: 61 },
  // Greetings & pleasantries
  { intent: 'greeting', pattern: /^(hi|hii+|hey|hello|yo|hola|namaste|good (morning|afternoon|evening))\b/i, priority: 40 },
  { intent: 'thanks', pattern: /(thank you|thanks|thx|appreciate|great help)/i, priority: 40 },
  { intent: 'bye', pattern: /(bye|goodbye|see you|see ya|gtg|have a good)/i, priority: 40 },
  // Capabilities
  { intent: 'help', pattern: /(what can you (do|help)|how can you help|what do you (know|answer)|your (capabilities|abilities)|help me with|what questions)/i, priority: 50 },
  // About the site
  { intent: 'about', pattern: /(what is webmers|what's webmers|about webmers|what is this (site|website|platform)|about this (site|website)|what does webmers (do|offer)|tell me about webmers|what pages|site pages|navigate the site|where can i (go|find)|main sections)/i, priority: 50 },
  { intent: 'how_it_works', pattern: /(how (does|do) (webmers|it|this|the site).*(work|works)|how it works|steps? (to|of)|three steps|explore secure cultivate|how (do i|can i) (start|begin|use))/i, priority: 45 },
  // Buying & checkout
  { intent: 'buy', pattern: /(how (do|can|does) (i|you|someone|buyers?)? ?(buy|purchase|get|order|checkout|pay)|buy (a|the)? ?website|purchase process|checkout|place an? order|escrow|payment process|pay for|how to buy|making a purchase|buying (a|the|on)? ?(website|site)|how does (the )?purchase|buying work)/i, priority: 45 },
  // Pricing
  { intent: 'pricing', pattern: /(price|prices|pricing|cost|costs|how much|rate|fee|fees|charge|charges|expensive|cheap|afford|worth|₹|rs\.?|rupee|dollar|\$|price range|budget|listings? under|under (rs|inr|₹)? ?\d+|show (me )?(the )?listings?|below \d+)/i, priority: 44 },
  // Categories
  { intent: 'categories', pattern: /(categor|niche|habitat|types of websites|what websites|what kinds|genres|vertical)/i, priority: 44 },
  // Listing lookup / specifics
  { intent: 'listing_lookup', pattern: /(meridian|nocturne|lumina|aurora|pulse|atlas|saas|portfolio|ecommerce|e-commerce|e commerce|blog theme|dashboard (kit|template)|agency site)/i, priority: 60 },
  // Recommendations
  { intent: 'recommend', pattern: /(recommend|suggest|best (website|listing|template|site)|which (one|website|site|template)|top (rated|sites|websites)|good (for|website)|looking for)/i, priority: 65 },
  // Editor
  { intent: 'editor', pattern: /(visual editor|edit(ing|or)? (my|the)? ?website|no-?code|without (coding|code)|inline (text|edit)|change (text|images|colors|font|layout)|customi[sz](e|ing)|theme presets|rollback|device preview|editor)/i, priority: 46 },
  // Code unlock
  { intent: 'code_unlock', pattern: /(source code|code unlock|unlock (the |full |complete )?code|full code|zip file|github repo|github access|download (the )?code|add-?on|code access)/i, priority: 47 },
  // Layouts
  { intent: 'layout', pattern: /(layout|variant|hero-?centered|split-?screen|video-?hero)/i, priority: 44 },
  // Refunds
  { intent: 'refund', pattern: /(refund|money back|satisfaction (window|guarantee)|guarantee|dispute|return|replacement|cancel (my )?(order|purchase))/i, priority: 48 },
  // Selling
  { intent: 'sell', pattern: /(sell(ing)?|seller|list (my|your|a) ?site|become a seller|earn|income|revenue|payout|commission|make money|proceeds|upi|paypal)/i, priority: 48 },
  // Wishlist
  { intent: 'wishlist', pattern: /(wishlist|save (a|the|this) (site|listing|website)|bookmark|heart (a|the|this)|favorite)/i, priority: 44 },
  // Newsletter
  { intent: 'newsletter', pattern: /(newsletter|subscribe|weekly harvest|email updates|in your inbox|newsletter signup)/i, priority: 44 },
  // Support
  { intent: 'support', pattern: /(support|contact (you|support|us|someone)|reach (you|support|a human|someone)|help desk|support@|email (you|support)|talk to (a|the|any)? ?(seller|sellers|human|person)|customer (service|care)|message (the|a|any)? ?sellers?|complaint|problem with (an? |my )?(order|purchase|account))/i, priority: 50 },
  // Accounts
  { intent: 'account', pattern: /(account|sign ?in|sign ?up|login|log in|register|create (an |a )?account|password reset|forgot password|role|buyer|seller|admin|dashboard|demo (account|credentials|login)|otp)/i, priority: 45 },
  // Legal
  { intent: 'legal', pattern: /(terms|privacy|cookies|legal|policy|policies|conditions)/i, priority: 44 },
  // Blog
  { intent: 'blog', pattern: /(blog|articles?|guides?|resources?|reading)/i, priority: 42 },
  // Tech stack
  { intent: 'tech', pattern: /(tech stack|technolog|built with|framework|next\.?js|react|tailwind|what (is|are) (the )?(sites|websites|templates) built)/i, priority: 44 },
  // Reviews
  { intent: 'reviews', pattern: /(review|rating|testimonial|field notes|what do people (say|think)|star)/i, priority: 43 },
  // Off-topic
  { intent: 'offtopic', pattern: /(weather|news today|joke|tell me a story|who won|football|cricket match|stock market|recipe|cook|movie|song|game (tips|cheats)|crypto price|bitcoin)/i, priority: 70 },
];

function classifyIntent(rawQuery: string, context = ''): Intent {
  const q = `${context} ${rawQuery}`.trim();
  let best: Intent = 'fallback';
  let bestPriority = -1;

  for (const rule of RULES) {
    if (rule.pattern.test(q) && (rule.priority ?? 0) > bestPriority) {
      best = rule.intent;
      bestPriority = rule.priority ?? 0;
    }
  }
  return best;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

function listingSummary(l: Listing, withPrice = true): string {
  const price = withPrice ? ` — **${inr(customerPrice(l.price))}**` : '';
  return `- **${l.title}** (${l.category})${price} — ${l.tagline} — ${l.rating}★ · ${l.sales} sales — [View listing](/listing/${l.id})`;
}

function sourceTags(...names: string[]): string[] {
  return names.filter(Boolean);
}

function suggestChips(): string {
  return [
    'You could ask me things like:',
    '',
    '- "What is Webmers?"',
    '- "How do I buy a website?"',
    '- "Show me listings under ₹200"',
    '- "How does the refund policy work?"',
    '- "How do I sell my website?"',
    '- "What is the code unlock add-on?"',
    '- "How do I contact support?"',
  ].join('\n');
}

/* ------------------------------------------------------------------ */
/* Intent handlers (live-data templates)                               */
/* ------------------------------------------------------------------ */

async function handleIntent(
  intent: Intent,
  query: string,
): Promise<PSDAnswer> {
  const [listings, categories, stats] = await Promise.all([
    getListings(),
    getCategories(),
    getLandingStats(),
  ]);

  switch (intent) {
    case 'identity':
      return {
        reply: [
          'Hi! I\'m **PSD** — Webmers\' built-in assistant 🤖',
          '',
          'I\'m trained **only on Webmers\' content**: the marketplace, listings, visual editor, selling, refunds, payments, accounts, support and legal pages. I run 100% locally with **zero API keys** — no external AI services — so I\'m fast, private and always available.',
          '',
          suggestChips(),
        ].join('\n'),
        sources: ['About PSD'],
        intent,
      };

    case 'greeting':
      return {
        reply: [
          'Hey there! 👋 Welcome to **Webmers** — the premium marketplace for fully-built websites (*Buy. Edit. Own.*).',
          '',
          'I\'m **PSD**, and I can help with anything on this site: finding listings, prices, buying & checkout, the visual editor, code unlock, selling, refunds, support and more.',
          '',
          'What would you like to know?',
        ].join('\n'),
        sources: [],
        intent,
      };

    case 'help':
      return {
        reply: [
          'I\'m **PSD**, your Webmers assistant. Here\'s what I can help you with:',
          '',
          '- **Marketplace** — browse listings, categories, prices & recommendations',
          '- **Buying** — checkout, layout variants, escrow & secure payments',
          '- **Visual Editor** — no-code editing, themes, publish & rollback',
          '- **Code unlock** — full source code add-on (₹49)',
          '- **Selling** — list your site, 20% fee, payouts via UPI/PayPal',
          '- **Refunds & disputes** — 48-hour full refund, 72-hour satisfaction window',
          '- **Accounts** — sign up, roles, dashboards, password reset',
          '- **Support** — support@webmers.io & seller messaging',
          '',
          'Just ask — e.g. *"how much is Meridian SaaS?"* or *"how do refunds work?"*',
        ].join('\n'),
        sources: [],
        intent,
      };

    case 'about':
      return {
        reply: [
          '**Webmers** is a premium marketplace for fully-built websites and digital gear — *Buy. Edit. Own.*',
          '',
          '- Browse curated, launch-ready websites organized by niche, stack and growth stage',
          '- Buy with confidence through escrow-protected checkout (Razorpay)',
          '- Edit everything in a no-code visual editor (text, images, colors, layouts)',
          '- Optionally unlock the complete source code (₹49 add-on)',
          '- Or sell your own builds — 20% transparent platform fee, paid via UPI/PayPal',
          '',
          `Right now the marketplace has **${listings.length} active listings** across ${categories.length} categories: ${categories.map((c) => `${c.name} (${c.count})`).join(', ')}.`,
          '',
          'Want me to show you the current catalog or recommend a website?',
        ].join('\n'),
        sources: sourceTags('About Webmers'),
        intent,
      };

    case 'how_it_works':
      return {
        reply: [
          'Webmers takes you from seed to launch in **three smooth steps**:',
          '',
          '1. **Explore** — walk through curated, launch-ready websites organized by niche, stack and growth stage.',
          '2. **Secure** — buy with confidence through protected checkout and a clear satisfaction window (escrow until you confirm, up to 72 hours).',
          '3. **Cultivate** — open the visual editor, tune the brand, connect a domain and let your site grow.',
          '',
          'No bulky frameworks, no confusing setup — just a clean path from finding a site to making it yours.',
        ].join('\n'),
        sources: sourceTags('How Webmers Works'),
        intent,
      };

    case 'buy':
      return {
        reply: [
          'Buying a website on Webmers is simple and protected:',
          '',
          '1. **Browse** the marketplace — filter by category, price range or search.',
          '2. **Open a listing** and pick a layout variant (**Hero-Centered**, **Split-Screen** or **Video-Hero**).',
          '3. Optionally add the **code unlock add-on** for ₹49.',
          '4. **Pay securely** through Razorpay (signed verification + webhook confirmation).',
          '5. After verification you get **instant access** to the visual editor and any download links.',
          '',
          `**Escrow protection:** funds are held until you confirm satisfaction within the **72-hour window**. If the site doesn't match the description, you can request a **full refund within 48 hours**.`,
          '',
          `Ready to browse? There are **${listings.length} active listings** — ask me to recommend one!`,
        ].join('\n'),
        sources: sourceTags('Buying & Checkout', 'Refund & Satisfaction Policy'),
        intent,
      };

    case 'pricing': {
      // Budget filter support: "under 200", "below ₹300", "budget of 250"...
      const budgetMatch = /(?:under|below|less than|max(?:imum)?|budget(?: of)?)\s*(?:rs\.?|inr|₹)?\s*(\d+(?:[.,]\d+)?)/i.exec(query);
      const budget = budgetMatch ? parseFloat(budgetMatch[1].replace(',', '.')) : null;

      let shown = listings;
      if (budget) {
        shown = listings.filter((l) => customerPrice(l.price) <= budget);
      }

      const listBlock =
        shown.length > 0
          ? shown.map((l) => listingSummary(l))
          : [
              `No listings found under ${inr(budget ?? 0)} — the cheapest option is **${inr(
                customerPrice(Math.min(...listings.map((l) => l.price))),
              )}**.`,
              '',
              'Here\'s the full catalog:',
              ...listings.map((l) => listingSummary(l)),
            ];

      return {
        reply: [
          budget
            ? `Here are the listings **under ${inr(budget)}** (customer price includes the 20% platform markup):`
            : 'Here\'s how pricing works on Webmers:',
          '',
          ...(budget ? [] : [`- A transparent **20% platform markup** is added to a seller's base price — that's what you pay; the seller keeps their base price.`, `- **Code unlock add-on:** ${inr(CODE_UNLOCK_PRICE)}`, '']),
          ...listBlock,
          '',
          budget
            ? `Tip: the **code unlock add-on** is ${inr(CODE_UNLOCK_PRICE)} extra. Want a specific niche?`
            : `Sellers have earned **${stats[2]?.value ?? '—'}** in total across the platform.`,
        ].join('\n'),
        sources: sourceTags('Pricing & Fees', 'Webmers Catalog'),
        intent,
      };
    }

    case 'categories':
      return {
        reply: [
          'You can browse the marketplace by category — these are live right now:',
          '',
          ...categories.map((c) => `- **${c.name}** — ${c.count} listing${c.count === 1 ? '' : 's'} ([/marketplace?cat=${encodeURIComponent(c.name)}](/marketplace?cat=${encodeURIComponent(c.name)}))`),
          '',
          'You can also filter by **price range** (`min`/`max`), **search term**, and sort by **most sold**, **highest rated**, **newest** or **price**.',
          '',
          'Which niche are you interested in?',
        ].join('\n'),
        sources: sourceTags('Webmers Catalog'),
        intent,
      };

    case 'listing_lookup': {
      const hits = listings.filter((l) => {
        const hay = `${l.title} ${l.tagline} ${l.description} ${l.category} ${l.techStack.join(' ')}`.toLowerCase();
        const words = tokenize(query).filter((w) => w.length > 3);
        return words.some((w) => hay.includes(w)) || query.toLowerCase().includes(l.id.toLowerCase());
      });
      if (hits.length === 0) {
        return {
          reply: [
            'I couldn\'t find a listing matching that. Here\'s the full catalog:',
            '',
            ...listings.map((l) => listingSummary(l)),
          ].join('\n'),
          sources: sourceTags('Webmers Catalog'),
          intent,
        };
      }
      return {
        reply: [
          ...hits.slice(0, 3).map((l) => [
            `### ${l.title}`,
            `${l.tagline}`,
            '',
            `- **Category:** ${l.category}`,
            `- **Price:** ${inr(customerPrice(l.price))} (seller base ${inr(l.price)} + 20% platform markup)`,
            `- **Tech stack:** ${l.techStack.join(', ')}`,
            `- **Seller:** ${l.sellerName}`,
            `- **Rating:** ${l.rating}★ · **Sales:** ${l.sales}`,
            l.featured ? '- ⭐ **Featured** on the homepage' : '',
            l.demoUrl ? `- 🖥️ [Live demo](${l.demoUrl})` : '',
            `- [View listing](/listing/${l.id})`,
          ].flat().join('\n')),
        ].join('\n\n'),
        sources: sourceTags(...hits.map((h) => `Listing: ${h.title}`)),
        intent,
      };
    }

    case 'recommend': {
      const q = query.toLowerCase();
      const catHit = categories.find((c) => q.includes(c.name.toLowerCase()))?.name;
      let pool = listings;
      if (catHit) pool = pool.filter((l) => l.category === catHit);
      const best = [...pool].sort((a, b) => b.rating - a.rating || b.sales - a.sales).slice(0, 3);
      return {
        reply: [
          `Here ${catHit ? `are my top picks in **${catHit}**` : 'are my top-rated picks'} from the Webmers marketplace:`,
          '',
          ...best.map((l) => listingSummary(l)),
          '',
          'Every listing includes the visual editor, escrow-protected checkout, and the 48-hour/72-hour satisfaction guarantee.',
        ].join('\n'),
        sources: sourceTags('Webmers Catalog'),
        intent,
      };
    }

    case 'editor':
      return {
        reply: [
          'The **Visual Editor** is included with every purchase — no code required! ✨',
          '',
          'You can:',
          '- ✏️ Edit text **inline** (headlines, buttons, copy)',
          '- 🖼️ Swap images',
          '- 🧱 Rearrange sections',
          '- 🎨 Change colors & fonts (theme presets + accent colors + typography)',
          '- ⏪ Version rollback (undo/redo, auto-save)',
          '- 🚀 Publish instantly',
          '',
          'It also has a live **device preview** (desktop / tablet / mobile) and built-in themes like Wander Warm, Wander Blue, Wander Dark and Dawn. Layout variants (Hero-Centered, Split-Screen, Video-Hero) can be changed any time inside the editor.',
          '',
          'Try it out at [/editor](/editor) — or [browse the marketplace](/marketplace) to find a site to edit!',
        ].join('\n'),
        sources: sourceTags('Visual Editor'),
        intent,
      };

    case 'code_unlock':
      return {
        reply: [
          `The **Code Unlock** add-on (${inr(CODE_UNLOCK_PRICE)}) gives you full ownership of a purchased website:`,
          '',
          '- 📦 Complete **source code ZIP** delivered to your verified email',
          '- 🔑 Optional **private GitHub repo** access',
          '- 🔗 Single-use, **time-limited download link**',
          '- 🎨 Full customization freedom beyond the visual editor',
          '',
          '**Note:** the code unlock add-on is **non-refundable once the download link has been accessed** (to protect against unauthorized redistribution). The visual editor itself is always included — code unlock is optional.',
        ].join('\n'),
        sources: sourceTags('Code Unlock Add-on'),
        intent,
      };

    case 'layout':
      return {
        reply: [
          'Every Webmers website offers **layout variants** you can pick at checkout or change anytime in the editor:',
          '',
          '- **Hero-Centered** — a bold centered hero with headline-focused landing',
          '- **Split-Screen** — side-by-side content for product/detail-driven pages',
          '- **Video-Hero** — immersive video-backed hero for maximum impact',
          '',
          'Pick one during checkout, or switch between them later in the visual editor — your content stays intact.',
        ].join('\n'),
        sources: sourceTags('Visual Editor'),
        intent,
      };

    case 'refund':
      return {
        reply: [
          'Webmers has a clear **Refund & Satisfaction Policy** 🛡️',
          '',
          '- **Full refund within 48 hours** if the website doesn\'t match the listing description.',
          '- **72-hour satisfaction window** — funds are held in escrow until you confirm.',
          '- **Disputes** are mediated by the admin team with partial refunds, full refunds, or replacement listings based on verified evidence.',
          '- The **code unlock add-on is non-refundable** once the download link has been accessed.',
          '',
          'Full details at [/refund](/refund). Need help starting a refund? Reach support via the [support page](/support) or **support@webmers.io** — include your order ID.',
        ].join('\n'),
        sources: sourceTags('Refund & Satisfaction Policy'),
        intent,
      };

    case 'sell':
      return {
        reply: [
          'Want to **sell on Webmers**? Here\'s the flow:',
          '',
          '1. **List your site** — upload screenshots, tech stack and description (every submission is reviewed for quality).',
          '2. **Get reviewed** — Webmers verifies the build & demo, then publishes it.',
          '3. **Get paid** — buyers purchase through protected checkout; funds release after the satisfaction window.',
          '',
          `- **Platform fee:** a transparent ${Math.round(PLATFORM_MARKUP_RATE * 100)}% — you keep the rest of your base price.`,
          `- **Payouts:** via UPI ID or PayPal email, after manual review.`,
          '- Every sale includes the visual editor, which raises the value of what you build.',
          '- Sellers have already earned **' + (stats[2]?.value ?? '—') + '** on the platform.',
          '',
          'Start at [/sell](/sell) or sign up and open the seller dashboard!',
        ].join('\n'),
        sources: sourceTags('Selling on Webmers', 'Pricing & Fees'),
        intent,
      };

    case 'wishlist':
      return {
        reply: [
          'Saving favorites is easy 💛',
          '',
          '1. Click the **heart** on any listing card (or the listing page) to add it to your wishlist.',
          '2. It\'s **synced to your account**, so it follows you across devices.',
          '3. Find all saved sites in your **Buyer dashboard**.',
          '',
          'You need to be signed in for wishlists to sync. Sign in at [/auth/signin](/auth/signin).',
        ].join('\n'),
        sources: sourceTags('Wishlist & Newsletter'),
        intent,
      };

    case 'newsletter':
      return {
        reply: [
          'The **Weekly Harvest** 🌾 — Webmers\' newsletter:',
          '',
          '- Curated new websites & digital gear delivered to your inbox each week',
          '- **No spam, unsubscribe anytime**',
          '',
          'Sign up right on the homepage (or ask me again when you\'re ready!).',
        ].join('\n'),
        sources: sourceTags('Wishlist & Newsletter'),
        intent,
      };

    case 'support':
      return {
        reply: [
          'Here\'s how to get help on Webmers:',
          '',
          '1. **Support email:** [support@webmers.io](mailto:support@webmers.io) — never include passwords or card details.',
          '2. **Seller messaging** — message a seller directly from your dashboard (in-app + email notifications).',
          '3. **Password issues** — use the [/auth/forgot-password](/auth/forgot-password) reset flow.',
          '4. **Order/listing concerns** — contact the seller with your **order ID** so we can help promptly.',
          '5. **Disputes** — the admin team mediates with partial/full refunds or replacements.',
          '',
          'The [FAQ page](/faq) also answers common questions!',
        ].join('\n'),
        sources: sourceTags('Support & Contact', 'Refund & Satisfaction Policy'),
        intent,
      };

    case 'account':
      return {
        reply: [
          'Here\'s the account rundown:',
          '',
          '- **Sign up** with email/password at [/auth/signup](/auth/signup) (Google OAuth also available).',
          '- **Roles:** Buyer, Seller, Admin — each with its own dashboard (orders/wishlist, listings/revenue, users/transactions/health).',
          '- **Password reset:** forgot your password? Use the OTP reset at [/auth/forgot-password](/auth/forgot-password).',
          '',
          '**Demo accounts you can try right now:**',
          '- Admin: `admin@webmers.io` / `Admin@123`',
          '- Seller: `seller@webmers.io` / `Seller@123`',
          '- Buyer: `buyer@webmers.io` / `Buyer@123`',
          '',
          'Sign in at [/auth/signin](/auth/signin).',
        ].join('\n'),
        sources: sourceTags('Accounts & Dashboards'),
        intent,
      };

    case 'legal':
      return {
        reply: [
          'Webmers\' legal pages are all live on the site:',
          '',
          '- **[Terms of service](/terms)** — marketplace role, accounts & purchases, acceptable use, digital delivery (updated July 30, 2026).',
          '- **[Privacy policy](/privacy)** — what\'s collected, how it\'s used, sharing & retention, your choices. Webmers does **not** sell personal information.',
          '- **[Cookies](/cookies)** — cookie usage details.',
          '- **[Refund policy](/refund)** — 48-hour full refund, 72-hour satisfaction window, code-unlock exception.',
          '',
          'Anything specific you\'d like to know about them?',
        ].join('\n'),
        sources: sourceTags('Legal'),
        intent,
      };

    case 'blog':
      return {
        reply: [
          'Webmers publishes guides & articles at [/blog](/blog):',
          '',
          '- **How to Choose the Right Website Template** — matching brand story with layout, typography & palette',
          '- **Selling Your Website on Webmers** — from draft to active listing',
          '- **Understanding Code Ownership** — what the source unlock includes & delivery',
          '- **Layout Variants Explained** — Hero-Centered vs Split-Screen vs Video-Hero',
          '',
          'Want a summary of any of these?',
        ].join('\n'),
        sources: sourceTags('Blog & Resources'),
        intent,
      };

    case 'tech':
      return {
        reply: [
          'The Webmers platform itself is built with **Next.js 14 (App Router) + React 18 + Tailwind CSS + lucide-react**, with NextAuth (JWT) for auth and a resilient data layer (in-memory by default, PostgreSQL/Prisma in production).',
          '',
          'The marketplace listings are built on stacks like:',
          ...listings.slice(0, 6).map((l) => `- **${l.title}** — ${l.techStack.join(', ')}`),
          '',
          'Check a listing page for its exact stack!',
        ].join('\n'),
        sources: sourceTags('Webmers Features'),
        intent,
      };

    case 'reviews':
      return {
        reply: [
          'Buyers love Webmers ⭐',
          '',
          '- *"Webmers made it possible to launch a professional website in a weekend. The visual editor is incredible."* — **Sarah K.**, Freelancer (Meridian SaaS)',
          '- *"I unlocked the code and customized everything. Delivery was instant and secure."* — **David R.**, Developer (Lumina E-commerce)',
          '',
          `The average marketplace rating is **${stats[3]?.value ?? '—'}**, and sellers have made **${stats[2]?.value ?? '—'}** in total.`,
          '',
          'Ask me about any specific listing for its rating and reviews!',
        ].join('\n'),
        sources: sourceTags('Testimonials'),
        intent,
      };

    case 'thanks':
      return {
        reply: [
          'You\'re very welcome! 😊 Happy building — if anything else comes up about Webmers, I\'m right here.',
        ].join('\n'),
        sources: [],
        intent,
      };

    case 'bye':
      return {
        reply: [
          'Goodbye! 👋 Thanks for stopping by Webmers — come back anytime. *Buy. Edit. Own.*',
        ].join('\n'),
        sources: [],
        intent,
      };

    case 'offtopic':
      return {
        reply: [
          'Hmm, that\'s outside my turf! 😅',
          '',
          'I\'m **PSD**, and I\'m trained **only on Webmers** — the marketplace, listings, visual editor, selling, refunds, support and legal info for this site. I don\'t answer general questions, and I never need API keys.',
          '',
          suggestChips(),
        ].join('\n'),
        sources: ['About PSD'],
        intent,
      };

    default:
      return { reply: '', sources: [], intent: 'fallback' };
  }
}

/* ------------------------------------------------------------------ */
/* Extractive fallback (retrieval + sentence synthesis)                */
/* ------------------------------------------------------------------ */

function sentenceScore(sentence: string, queryTokens: string[]): number {
  if (!sentence) return 0;
  const tokens = tokenize(sentence);
  if (tokens.length === 0) return 0;
  let hits = 0;
  for (const t of queryTokens) {
    if (tokens.includes(t)) hits++;
  }
  return hits / Math.max(1, queryTokens.length);
}

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    // Only split on sentence punctuation when the next word looks like a new
    // sentence (avoids breaking "Sarah K. is the seller...", "v1.2" etc.).
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'(])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12);
}

function buildExtractiveAnswer(query: string, results: SearchResult[]): PSDAnswer {
  const queryTokens = tokenize(query);
  const seen = new Set<string>();
  const picks: Array<{ text: string; doc: string }> = [];

  for (const r of results) {
    if (picks.length >= 4) break;
    // Strip the "[Heading chain]" prefix that is prepended at index time.
    const bodyText = r.text.replace(/^\[[^\]]*\]\s*/, '');
    const sentences = splitSentences(bodyText)
      .filter((s) => !seen.has(s.toLowerCase()))
      .map((s) => ({ s, score: sentenceScore(s, queryTokens) }))
      .sort((a, b) => b.score - a.score);

    for (const { s } of sentences.slice(0, 2)) {
      if (picks.length >= 4) break;
      const clean = s.replace(/^[-*•]\s*/, '').trim();
      seen.add(s.toLowerCase());
      picks.push({ text: clean, doc: r.docName });
    }
  }

  if (picks.length === 0) {
    // Fall back to raw chunk snippets (still grounded).
    for (const r of results.slice(0, 3)) {
      const bodyText = r.text.replace(/^\[[^\]]*\]\s*/, '');
      const snippet = bodyText.replace(/\s+/g, ' ').slice(0, 220).trim();
      if (snippet) picks.push({ text: snippet + (bodyText.length > 220 ? '…' : ''), doc: r.docName });
    }
  }

  const sources = Array.from(new Set(results.map((r) => r.docName))).slice(0, 5);

  if (picks.length === 0) {
    return {
      reply: [
        'I searched my Webmers knowledge base but couldn\'t find anything matching that. 😕',
        '',
        'I only answer questions about this site, but I can help with:',
        ...suggestChips().split('\n').slice(2),
      ].join('\n'),
      sources: [],
      intent: 'fallback',
      matched: false,
    };
  }

  return {
    reply: [
      'Here\'s what I found on Webmers:',
      '',
      ...picks.map((p, i) => `${i + 1}. **${p.text.replace(/\*\*/g, '')}**  \n   *— ${p.doc}*`),
      '',
      'Want more detail? Ask me something more specific, or check the source page directly.',
    ].join('\n'),
    sources,
    intent: 'fallback',
    matched: true,
  };
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

/**
 * Enrich a short follow-up query with the previous user message so that
 * questions like "what about refunds?" keep their context.
 */
function enrichQuery(query: string, history: ChatMessage[]): string {
  const trimmed = query.trim();
  const words = trimmed.split(/\s+/).length;
  if (words >= 5) return trimmed;
  const lastUser = [...history].reverse().find((m) => m.role === 'user');
  if (lastUser) return `${lastUser.content} ${trimmed}`;
  return trimmed;
}

function buildRetrievalQuery(query: string, history: ChatMessage[]): string {
  const recent = history.slice(-4).filter((m) => m.content);
  if (recent.length === 0) return query;
  const contextBits = recent
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content.replace(/\s+/g, ' ').trim()}`)
    .join('\n')
    .slice(0, 1200);
  return `${contextBits}\nCurrent question: ${query}`;
}

/**
 * Generate a PSD answer for a user message. Fully local — no API keys.
 */
export async function getPSDAnswer(
  message: string,
  history: ChatMessage[] = [],
): Promise<PSDAnswer> {
  const query = (message || '').trim();
  if (!query) {
    return {
      reply: 'Please type a question — I\'m happy to help with anything about Webmers!',
      sources: [],
      intent: 'greeting',
    };
  }

  await getKnowledge(); // ensure knowledge base is built

  const context = enrichQuery(query, history);
  const intent = classifyIntent(context, history.filter((m) => m.role === 'user').slice(-1)[0]?.content ?? '');

  if (intent !== 'fallback') {
    return handleIntent(intent, context);
  }

  // Extractive fallback: hybrid retrieval over the Webmers knowledge base.
  const retrievalQuery = buildRetrievalQuery(query, history);
  const queryVector = embedText(retrievalQuery);
  const { results } = vectorStore.similaritySearch(
    queryVector,
    config.topK,
    config.minScore,
    query,
  );

  const strongEnough =
    results.length > 0 &&
    (results[0].lexicalScore > 0.12 || results[0].semanticScore > 0.22);

  if (!strongEnough) {
    return {
      reply: [
        'I couldn\'t find that in my Webmers knowledge base. 🤔',
        '',
        'I\'m **PSD** — trained only on this site\'s content (marketplace, listings, editor, selling, refunds, support, legal).',
        '',
        suggestChips(),
      ].join('\n'),
      sources: [],
      intent: 'fallback',
      matched: false,
    };
  }

  return buildExtractiveAnswer(query, results);
}
