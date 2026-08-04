import { Page, SectionInstance, ThemeKey } from './types';

function makeId(type: string) {
  return `${type}-${Math.random().toString(36).slice(2, 9)}`;
}

function themeForCategory(cat: string): ThemeKey {
  const lower = cat.toLowerCase();
  if (lower.includes('portfolio')) return 'WanderDark';
  if (lower.includes('saas')) return 'WanderWarm';
  if (lower.includes('e-commerce') || lower.includes('ecommerce')) return 'EmeraldForest';
  if (lower.includes('blog')) return 'WanderBlue';
  if (lower.includes('dashboard')) return 'Dawn';
  if (lower.includes('agency')) return 'WanderWarm';
  return 'WanderWarm';
}

function customerPriceLocal(base: number) {
  return Math.round(base * 1.2 * 100) / 100;
}

export interface SimpleListing {
  id: string;
  title: string;
  tagline: string;
  description: string;
  price: number;
  category: string;
  techStack: string[];
  palette: [string, string];
  demoUrl?: string | null;
  sellerName: string;
  rating: number;
  sales: number;
}

export interface SimpleReview {
  buyerName: string;
  rating: number;
  comment: string;
}

export function listingToPages(
  listing: SimpleListing,
  reviews: SimpleReview[] = []
): { pages: Page[]; accent: string; theme: ThemeKey; siteTitle: string } {
  const accent = listing.palette?.[0] || '#d9772b';
  const theme = themeForCategory(listing.category);
  const siteTitle = listing.title;
  const price = customerPriceLocal(listing.price);

  const hero: SectionInstance = {
    id: makeId('hero'),
    type: 'hero',
    title: listing.title,
    subtitle: `${listing.tagline}\n\n${listing.description.slice(0, 220)}`,
    badge: `${listing.category.toUpperCase()} • ${listing.techStack.slice(0, 2).join(' • ')}`,
    buttons: [
      { text: `Buy Now • ₹${price}`, link: `/checkout?listing=${listing.id}`, type: 'primary' },
      { text: 'Live Demo', link: listing.demoUrl || `/listing/${listing.id}`, type: 'secondary' },
    ],
  };

  const stats: SectionInstance = {
    id: makeId('stats'),
    type: 'stats',
    title: 'At a glance',
    subtitle: 'Real metrics from this listing',
    items: [
      { value: `${listing.sales}`, label: 'Sales' },
      { value: `${listing.rating.toFixed(1)}★`, label: 'Rating' },
      { value: `₹${price}`, label: 'Price (inc. fee)' },
      { value: `${listing.techStack.length}`, label: 'Tech Stack Items' },
    ],
  };

  const features: SectionInstance = {
    id: makeId('features'),
    type: 'features',
    title: `Built for ${listing.category} - Ready to Launch`,
    subtitle: listing.description,
    items: listing.techStack.map((tech) => ({
      title: tech,
      description: `Professional ${tech} implementation — production-ready, documented, and scalable for your ${listing.category.toLowerCase()} project.`,
    })),
  };

  const testimonials: SectionInstance = {
    id: makeId('testimonials'),
    type: 'testimonials',
    title: `${listing.title} - Loved by buyers`,
    subtitle: `${listing.sales} teams have launched with this template. Verified reviews inside Webmers.`,
    items:
      reviews.length > 0
        ? reviews.slice(0, 4).map((r) => ({
            name: r.buyerName,
            role: `Verified buyer • ${r.rating}★`,
            quote: r.comment,
          }))
        : [
            {
              name: listing.sellerName,
              role: `Seller • ${listing.category}`,
              quote: `${listing.title} — ${listing.tagline}. Built for speed and ownership.`,
            },
            {
              name: 'Sarah K.',
              role: 'Top Seller',
              quote: `Launched in a weekend, editor made customization effortless. Highly recommend ${listing.title}.`,
            },
          ],
  };

  const pricing: SectionInstance = {
    id: makeId('pricing'),
    type: 'pricing',
    title: 'Own it forever',
    subtitle: `One-time purchase includes visual editor, hosting setup, and optional code unlock. No subscriptions.`,
    items: [
      {
        plan: 'Visual Edit',
        price: `₹${price}`,
        desc: 'Included with purchase',
        features: ['No-code visual editor + PSD AI', 'Text, images, layout editing', 'Theme presets + publish', '72h satisfaction window'],
      },
      {
        plan: 'Full Code',
        price: `₹${price + 49}`,
        desc: 'Most popular — own the source',
        features: ['Everything in Visual Edit', 'Complete source ZIP', 'Private GitHub access', 'Full customization freedom'],
      },
    ],
  };

  const team: SectionInstance = {
    id: makeId('team'),
    type: 'team',
    title: `Built by ${listing.sellerName}`,
    subtitle: `Seller behind ${listing.title} — crafting high-quality ${listing.category} templates.`,
    items: [{ name: listing.sellerName, role: `${listing.category} Specialist` }],
  };

  const portfolio: SectionInstance = {
    id: makeId('portfolio'),
    type: 'portfolio',
    title: 'Stack & Deliverables',
    subtitle: `Everything included in ${listing.title} — tech, layouts, and assets.`,
    items: listing.techStack.map((tech, idx) => ({
      title: `${tech} Implementation`,
      category: idx === 0 ? 'Core Stack' : 'Included',
    })),
  };

  const contact: SectionInstance = {
    id: makeId('contact'),
    type: 'contact',
    title: `Questions about ${listing.title}?`,
    subtitle: `Chat with ${listing.sellerName} directly via Webmers messaging. Escrow protected checkout, 48h refund if not as described. PSD AI can edit this site live in the editor.`,
  };

  const faq: SectionInstance = {
    id: makeId('faq'),
    type: 'faq',
    title: 'FAQ about this listing',
    subtitle: `Common questions about ${listing.title}`,
    items: [
      { q: 'Do I get the visual editor + PSD AI?', a: 'Yes — every listing is editable at /editor?listing=ID. Click Edit with PSD AI on listing page, then type what you want and AI edits live.' },
      { q: 'What tech stack does it use?', a: `Built with ${listing.techStack.join(', ')} — production-ready and documented.` },
      { q: 'Can I unlock full source?', a: 'Yes — add Full Code for ₹49 extra, delivered to your verified email as ZIP + optional GitHub repo.' },
    ],
  };

  const newsletter: SectionInstance = {
    id: makeId('newsletter'),
    type: 'newsletter',
    title: `More ${listing.category} sites like this`,
    subtitle: 'Get weekly curated sites in your inbox — no spam.',
    buttonText: 'Join Newsletter',
  };

  const footer: SectionInstance = {
    id: makeId('footer'),
    type: 'footer',
    title: listing.title,
    subtitle: listing.tagline,
  };

  const homePage: Page = {
    id: 'home',
    name: 'Home',
    sections: [hero, stats, features, testimonials, pricing, team, portfolio, faq, contact, newsletter, footer],
  };

  const aboutPage: Page = {
    id: 'about',
    name: 'About',
    sections: [
      {
        id: makeId('hero'),
        type: 'hero',
        title: `About ${listing.title}`,
        subtitle: `${listing.description}\n\nSeller: ${listing.sellerName} • ${listing.category}`,
        badge: 'ABOUT THIS TEMPLATE',
        buttons: [{ text: 'Buy Now', link: `/checkout?listing=${listing.id}`, type: 'primary' }],
      },
      team,
      stats,
      footer,
    ],
  };

  const contactPage: Page = {
    id: 'contact-page',
    name: 'Contact',
    sections: [contact, faq, footer],
  };

  return {
    pages: [homePage, aboutPage, contactPage],
    accent,
    theme,
    siteTitle,
  };
}
