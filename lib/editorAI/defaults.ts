import { Page, SectionInstance, SectionType } from './types';

export const THEMES = {
  WanderWarm: { name: 'Wander Warm' },
  WanderBlue: { name: 'Wander Blue' },
  WanderDark: { name: 'Wander Dark' },
  Dawn: { name: 'Dawn Sunset' },
  EmeraldForest: { name: 'Emerald Forest' },
};

export const ACCENTS = ['#d9772b', '#7bb5cc', '#1f3d47', '#f97316', '#10b981', '#8b5cf6', '#ffffff'];

export function createDefaultSection(type: SectionType): SectionInstance {
  const id = `${type}-${Math.random().toString(36).slice(2, 9)}`;
  switch (type) {
    case 'hero':
      return {
        id,
        type,
        title: 'Brand New Dynamic Hero',
        subtitle:
          'Create an incredible first impression. Completely customize titles, subheadings, and CTAs in the panel or canvas.',
        badge: 'NEW DYNAMIC BLOCK',
        buttons: [{ text: 'Explore Now', link: '#', type: 'primary' }],
      };
    case 'features':
      return {
        id,
        type,
        title: 'Engineered Features Grid',
        subtitle: 'Why our custom product blocks lead the market in client satisfaction and conversion metrics.',
        items: [
          { title: '100% Fully Responsive', description: 'Beautiful presentation across mobile devices, desktop monitors, and tablets.' },
          { title: 'Tailwind Integration', description: 'Built with standard utility classes. Ultra-clean markup structure.' },
        ],
      };
    case 'stats':
      return {
        id,
        type,
        title: 'Statistics Section',
        subtitle: 'A simple metric list',
        items: [
          { value: '100K+', label: 'Registered Customers' },
          { value: '25+', label: 'Premium Integrations' },
        ],
      };
    case 'testimonials':
      return {
        id,
        type,
        title: 'Global Client Reviews',
        subtitle: 'Loved by hundreds of high-growth developers.',
        items: [
          {
            name: 'Charles Adams',
            role: 'CTO, Novus Inc',
            quote: 'The single-page client side exported site saved us weeks of mockup reviews. Absolute masterpiece.',
          },
        ],
      };
    case 'pricing':
      return {
        id,
        type,
        title: 'Transparent Project Pricing',
        subtitle: 'Simple plans suited for any growth velocity.',
        items: [
          { plan: 'Essential', price: '$9/mo', desc: 'Great for single projects.', features: ['Responsive Design', 'Standard Elements'] },
          { plan: 'Professional', price: '$29/mo', desc: 'Our most popular plan.', features: ['Unlimited Pages', 'Premium Accent Palette', 'Custom Fonts'] },
        ],
      };
    case 'contact':
      return {
        id,
        type,
        title: 'Get In Touch',
        subtitle: 'Submit any inquiries below. We look forward to building something awesome with you.',
      };
    case 'faq':
      return {
        id,
        type,
        title: 'Frequently Asked Questions',
        subtitle: 'Quick details about our platform.',
        items: [
          { q: 'Can I reuse the exported code?', a: 'Yes! Once code access is unlocked, you have full ownership to deploy, host, or rewrite it.' },
        ],
      };
    case 'team':
      return {
        id,
        type,
        title: 'Creative Core Team',
        subtitle: 'The engineering, styling, and design crew.',
        items: [{ name: 'Alex Rivera', role: 'Full Stack Engineer' }],
      };
    case 'portfolio':
      return {
        id,
        type,
        title: 'Our Creative Works',
        subtitle: 'A preview of designs compiled within the platform.',
        items: [{ title: 'SaaS Analytics Suite', category: 'Web App' }],
      };
    case 'newsletter':
      return {
        id,
        type,
        title: 'Capture Lead Updates',
        subtitle: 'Enter your email to join our exclusive weekly designer mailing list.',
        buttonText: 'Join Mailing List',
      };
    case 'footer':
      return {
        id,
        type,
        title: 'Default Footer Title',
        subtitle: 'Making web building accessible to all.',
      };
    default:
      return {
        id,
        type,
        title: 'Custom Content Block',
        subtitle: 'Customize this block to build out your vision.',
      };
  }
}

export const SECTION_SYNONYMS: Record<string, SectionType[]> = {
  hero: ['hero'],
  banner: ['hero'],
  header: ['hero'],
  intro: ['hero'],
  introduction: ['hero'],
  features: ['features'],
  feature: ['features'],
  benefits: ['features'],
  services: ['features'],
  service: ['features'],
  stats: ['stats'],
  stat: ['stats'],
  statistics: ['stats'],
  numbers: ['stats'],
  metrics: ['stats'],
  counter: ['stats'],
  testimonials: ['testimonials'],
  testimonial: ['testimonials'],
  reviews: ['testimonials'],
  review: ['testimonials'],
  clients: ['testimonials'],
  pricing: ['pricing'],
  price: ['pricing'],
  plans: ['pricing'],
  plan: ['pricing'],
  contact: ['contact'],
  'contact form': ['contact'],
  'get in touch': ['contact'],
  faq: ['faq'],
  faqs: ['faq'],
  questions: ['faq'],
  team: ['team'],
  members: ['team'],
  people: ['team'],
  portfolio: ['portfolio'],
  work: ['portfolio'],
  works: ['portfolio'],
  showcase: ['portfolio'],
  gallery: ['portfolio'],
  projects: ['portfolio'],
  newsletter: ['newsletter'],
  subscribe: ['newsletter'],
  footer: ['footer'],
};

export function detectSectionTypes(text: string): SectionType[] {
  const lower = text.toLowerCase();
  const found = new Set<SectionType>();
  for (const [keyword, types] of Object.entries(SECTION_SYNONYMS)) {
    if (lower.includes(keyword)) {
      types.forEach((t) => found.add(t));
    }
  }
  return Array.from(found);
}

export function mapColorNameToHex(input: string): string | null {
  const normalized = input.toLowerCase().trim();
  const map: Record<string, string> = {
    orange: '#d9772b',
    amber: '#f97316',
    blue: '#7bb5cc',
    dark: '#1f3d47',
    black: '#1f3d47',
    navy: '#1f3d47',
    green: '#10b981',
    emerald: '#10b981',
    purple: '#8b5cf6',
    violet: '#8b5cf6',
    white: '#ffffff',
    red: '#ef4444',
    rose: '#f43f5e',
    pink: '#ec4899',
    yellow: '#eab308',
    teal: '#14b8a6',
    cyan: '#06b6d4',
  };
  if (map[normalized]) return map[normalized];
  // hex detection
  const hexMatch = normalized.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) return normalized;
  const hexWithoutHash = normalized.match(/^([0-9a-f]{6}|[0-9a-f]{3})$/i);
  if (hexWithoutHash) return `#${normalized}`;
  // rgb? ignore
  return null;
}

export function generatePageId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) || `page-${Math.random().toString(36).slice(2, 6)}`;
}
