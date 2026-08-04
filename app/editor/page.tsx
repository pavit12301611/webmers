'use client';

import { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import EditorAI from '@/components/EditorAI';
import { EditorAction, EditorState } from '@/lib/editorAI/types';
import { listingToPages } from '@/lib/editorAI/listingAdapter';
import {
  Eye,
  Home,
  Image as ImageIcon,
  LayoutTemplate,
  Monitor,
  Palette,
  Redo,
  Save,
  Smartphone,
  Tablet,
  Trash2,
  Type,
  Undo,
  Plus,
  ArrowUp,
  ArrowDown,
  Copy,
  Code,
  CheckCircle,
  CreditCard,
  Lock,
  Sparkles,
  Check,
  HelpCircle,
  Users,
  Mail,
  Layers,
  Settings,
  X,
  Download,
  FileText,
  RefreshCw,
  PlusCircle,
  Mountain
} from 'lucide-react';

// Definitions for dynamic editor

type Device = 'desktop' | 'tablet' | 'mobile';

const DEVICE_WIDTH: Record<Device, string> = {
  desktop: 'max-w-5xl',
  tablet: 'max-w-[768px]',
  mobile: 'max-w-[375px]',
};

const THEMES = {
  WanderWarm: {
    name: 'Wander Warm',
    bg: 'bg-[#f3efe8] text-[#1f3d47]',
    card: 'bg-white/80 border-[#1f3d47]/10 hover:border-[#d9772b]/40 shadow-sm text-[#1f3d47]',
    innerCard: 'bg-white/90 border-[#1f3d47]/10',
    border: 'border-[#1f3d47]/15',
    muted: 'text-[#2a3b45]',
    accent: '#d9772b'
  },
  WanderBlue: {
    name: 'Wander Blue',
    bg: 'bg-[#7bb5cc] text-[#1f3d47]',
    card: 'bg-white/80 border-[#1f3d47]/10 hover:border-[#d9772b]/40 shadow-sm text-[#1f3d47]',
    innerCard: 'bg-white/90 border-[#1f3d47]/10',
    border: 'border-[#1f3d47]/15',
    muted: 'text-[#1f3d47]/80',
    accent: '#d9772b'
  },
  WanderDark: {
    name: 'Wander Dark',
    bg: 'bg-[#1f3d47] text-[#f3efe8]',
    card: 'bg-white/10 border-white/10 hover:border-white/20 text-[#f3efe8]',
    innerCard: 'bg-white/5 border-white/10',
    border: 'border-white/15',
    muted: 'text-[#f3efe8]/70',
    accent: '#d9772b'
  },
  Dawn: {
    name: 'Dawn Sunset',
    bg: 'bg-gradient-to-b from-[#1c1124] via-[#3a1d35] to-[#5c1e29] text-white',
    card: 'bg-white/5 border-white/10 backdrop-blur-md',
    innerCard: 'bg-white/5 border-white/5 backdrop-blur-sm',
    border: 'border-white/10',
    muted: 'text-white/70',
    accent: '#f43f5e'
  },
  EmeraldForest: {
    name: 'Emerald Forest',
    bg: 'bg-gradient-to-b from-[#020905] via-[#05170d] to-[#0b2416] text-[#ecfdf5]',
    card: 'bg-emerald-950/20 border-emerald-500/10 backdrop-blur-md text-[#ecfdf5]',
    innerCard: 'bg-emerald-950/30 border-emerald-500/5',
    border: 'border-emerald-500/10',
    muted: 'text-[#ecfdf5]/70',
    accent: '#10b981'
  }
};

type ThemeKey = keyof typeof THEMES;

const ACCENTS = ['#d9772b', '#7bb5cc', '#1f3d47', '#f97316', '#10b981', '#8b5cf6', '#ffffff'];

const FONTS: Record<string, string> = {
  Outfit: 'font-heading',
  Inter: 'font-sans',
  Serif: 'font-serif',
  'Helvetica Neue': 'font-helvetica'
};

const SECTION_LIBRARY = [
  { type: 'hero', name: 'Hero Banner', desc: 'Bold title, description, and action CTA buttons.', icon: Sparkles },
  { type: 'features', name: 'Features Grid', desc: 'Display key advantages, benefits, or services.', icon: LayoutTemplate },
  { type: 'stats', name: 'Stats Counter', desc: 'Highlight numerical metrics or business achievements.', icon: Layers },
  { type: 'testimonials', name: 'Testimonials', desc: 'Showcase reviews, quotes, or social proof.', icon: Users },
  { type: 'pricing', name: 'Pricing Plans', desc: 'Display plan options, details, features, and buy buttons.', icon: CreditCard },
  { type: 'contact', name: 'Contact Info & Form', desc: 'Interactive form + direct email/phone contacts.', icon: Mail },
  { type: 'faq', name: 'FAQ Accordion', desc: 'Provide collapsible answers to standard questions.', icon: HelpCircle },
  { type: 'team', name: 'Meet Team Grid', desc: 'Show images, names, and roles of team members.', icon: Users },
  { type: 'portfolio', name: 'Portfolio Showcase', desc: 'Display a stylish visual catalog of creative works.', icon: ImageIcon },
  { type: 'newsletter', name: 'Newsletter Opt-In', desc: 'Capture lead emails with an elegant join bar.', icon: Mail },
  { type: 'footer', name: 'Footer Links', desc: 'Provide copyright, social links, and brand details.', icon: Home }
] as const;

interface ButtonConfig {
  text: string;
  link: string;
  type: 'primary' | 'secondary';
}

interface ItemConfig {
  title?: string;
  description?: string;
  value?: string;
  label?: string;
  name?: string;
  role?: string;
  quote?: string;
  plan?: string;
  price?: string;
  desc?: string;
  features?: string[];
  q?: string;
  a?: string;
  category?: string;
}

interface SectionInstance {
  id: string;
  type: typeof SECTION_LIBRARY[number]['type'];
  title: string;
  subtitle: string;
  badge?: string;
  buttons?: ButtonConfig[];
  items?: ItemConfig[];
  buttonText?: string;
  emailPlaceholder?: string;
}

interface Page {
  id: string;
  name: string;
  sections: SectionInstance[];
}

// Initial structured data for standard pages
const INITIAL_PAGES: Page[] = [
  {
    id: 'home',
    name: 'Home Page',
    sections: [
      {
        id: 'hero-1',
        type: 'hero',
        title: 'Build Outstanding Websites Inline',
        subtitle: 'The premier code-free visual website maker. Rearrange components, customize theme gradients, and pay for the raw code when you are ready.',
        badge: 'NEW WEBMERS NO-CODE MAKER',
        buttons: [
          { text: 'Get Source Code', link: '#', type: 'primary' },
          { text: 'Learn More', link: '#', type: 'secondary' }
        ]
      },
      {
        id: 'stats-1',
        type: 'stats',
        title: 'Platform Statistics',
        subtitle: 'Our accomplishments',
        items: [
          { value: '45K+', label: 'Sites Created' },
          { value: '99.98%', label: 'Launch Success' },
          { value: '₹2.8M', label: 'Client Sales' },
          { value: '4.9★', label: 'Average Review' }
        ]
      },
      {
        id: 'features-1',
        type: 'features',
        title: 'Stunning No-Code Features',
        subtitle: 'Engineered from scratch for outstanding aesthetic value and top-tier execution.',
        items: [
          { title: 'Zero Coding Necessary', description: 'Simply click and type to edit text, swap components, or apply premium presets.' },
          { title: 'Dynamic Cost Calculation', description: 'Your codebase cost scales fairly based on design complexity and webpage counts.' },
          { title: 'Export HTML & CSS', description: 'Complete high-performance standalone code block package delivered in one payment.' }
        ]
      },
      {
        id: 'footer-1',
        type: 'footer',
        title: 'Webmers Builder',
        subtitle: 'The premium creator platform for modern developers and agency founders.'
      }
    ]
  },
  {
    id: 'about',
    name: 'About Us',
    sections: [
      {
        id: 'hero-about',
        type: 'hero',
        title: 'Our Journey & Strategy',
        subtitle: 'Redefining web creation. We enable anyone to design fully interactive websites and download pristine codebases on the fly.',
        badge: 'OUR MISSION',
        buttons: [{ text: 'View Creative Team', link: '#', type: 'primary' }]
      },
      {
        id: 'team-1',
        type: 'team',
        title: 'The Team Behind The Magic',
        subtitle: 'Creative visionaries pushing the limits of online presentation.',
        items: [
          { name: 'Dr. Alistair Finch', role: 'Head of Engineering' },
          { name: 'Isabella Mercer', role: 'Lead Architect' }
        ]
      },
      {
        id: 'footer-about',
        type: 'footer',
        title: 'Webmers Builder',
        subtitle: 'The premium creator platform for modern developers and agency founders.'
      }
    ]
  }
];

const createDefaultSection = (type: SectionInstance['type']): SectionInstance => {
  const id = `${type}-${Math.random().toString(36).slice(2, 9)}`;
  switch (type) {
    case 'hero':
      return {
        id,
        type,
        title: 'Brand New Dynamic Hero',
        subtitle: 'Create an incredible first impression. Completely customize titles, subheadings, and CTAs in the panel or canvas.',
        badge: 'NEW DYNAMIC BLOCK',
        buttons: [{ text: 'Explore Now', link: '#', type: 'primary' }]
      };
    case 'features':
      return {
        id,
        type,
        title: 'Engineered Features Grid',
        subtitle: 'Why our custom product blocks lead the market in client satisfaction and conversion metrics.',
        items: [
          { title: '100% Fully Responsive', description: 'Beautiful presentation across mobile devices, desktop monitors, and tablets.' },
          { title: 'Tailwind Integration', description: 'Built with standard utility classes. Ultra-clean markup structure.' }
        ]
      };
    case 'stats':
      return {
        id,
        type,
        title: 'Statistics Section',
        subtitle: 'A simple metric list',
        items: [
          { value: '100K+', label: 'Registered Customers' },
          { value: '25+', label: 'Premium Integrations' }
        ]
      };
    case 'testimonials':
      return {
        id,
        type,
        title: 'Global Client Reviews',
        subtitle: 'Loved by hundreds of high-growth developers.',
        items: [
          { name: 'Charles Adams', role: 'CTO, Novus Inc', quote: 'The single-page client side exported site saved us weeks of mockup reviews. Absolute masterpiece.' }
        ]
      };
    case 'pricing':
      return {
        id,
        type,
        title: 'Transparent Project Pricing',
        subtitle: 'Simple plans suited for any growth velocity.',
        items: [
          { plan: 'Essential', price: '$9/mo', desc: 'Great for single projects.', features: ['Responsive Design', 'Standard Elements'] },
          { plan: 'Professional', price: '$29/mo', desc: 'Our most popular plan.', features: ['Unlimited Pages', 'Premium Accent Palette', 'Custom Fonts'] }
        ]
      };
    case 'contact':
      return {
        id,
        type,
        title: 'Get In Touch',
        subtitle: 'Submit any inquiries below. We look forward to building something awesome with you.'
      };
    case 'faq':
      return {
        id,
        type,
        title: 'Frequently Asked Questions',
        subtitle: 'Quick details about our platform.',
        items: [
          { q: 'Can I reuse the exported code?', a: 'Yes! Once code access is unlocked, you have full ownership to deploy, host, or rewrite it.' }
        ]
      };
    case 'team':
      return {
        id,
        type,
        title: 'Creative Core Team',
        subtitle: 'The engineering, styling, and design crew.',
        items: [
          { name: 'Alex Rivera', role: 'Full Stack Engineer' }
        ]
      };
    case 'portfolio':
      return {
        id,
        type,
        title: 'Our Creative Works',
        subtitle: 'A preview of designs compiled within the platform.',
        items: [
          { title: 'SaaS Analytics Suite', category: 'Web App' }
        ]
      };
    case 'newsletter':
      return {
        id,
        type,
        title: 'Capture Lead Updates',
        subtitle: 'Enter your email to join our exclusive weekly designer mailing list.',
        buttonText: 'Join Mailing List'
      };
    case 'footer':
      return {
        id,
        type,
        title: 'Default Footer Title',
        subtitle: 'Making web building accessible to all.'
      };
    default:
      return {
        id,
        type,
        title: 'Custom Content Block',
        subtitle: 'Customize this block to build out your vision.'
      };
  }
};

function OverhauledEditorPageInner() {
  // Global States
  const [pages, setPages] = useState<Page[]>([]);
  const [activePageId, setActivePageId] = useState<string>('home');
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  
  // Customization States
  const [themeKey, setThemeKey] = useState<ThemeKey>('WanderWarm');
  const [accent, setAccent] = useState<string>('#d9772b');
  const [font, setFont] = useState<string>('Outfit');
  const [siteTitle, setSiteTitle] = useState<string>('My Custom Site');
  const [device, setDevice] = useState<Device>('desktop');
  const searchParams = useSearchParams();
  const [isLoadingListing, setIsLoadingListing] = useState(false);
  const [loadedListingId, setLoadedListingId] = useState<string | null>(null);

  // Interactive controls
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [isAutosaving, setIsAutosaved] = useState(false);
  const [toast, setToast] = useState('');
  const [historyStack, setHistoryStack] = useState<Page[][]>([]);
  const [redoStack, setRedoStack] = useState<Page[][]>([]);

  // Checkout states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'processing' | 'success'>('details');
  const [userEmail, setUserEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [processingLog, setProcessingLog] = useState<string>('');
  
  // Load initially or set defaults — now supports ?listing=ID for any listed site
  useEffect(() => {
    const loadFromListing = async (listingId: string) => {
      setIsLoadingListing(true);
      try {
        const res = await fetch(`/api/listings?id=${encodeURIComponent(listingId)}`);
        const data = await res.json();
        const listing = data.listing;
        if (listing && listing.id) {
          const { pages: mappedPages, accent: mappedAccent, theme: mappedTheme, siteTitle: mappedTitle } = listingToPages(listing as any, []);
          setPages(mappedPages as any);
          setThemeKey(mappedTheme as any);
          setAccent(mappedAccent);
          setSiteTitle(mappedTitle);
          setActivePageId(mappedPages[0]?.id || 'home');
          setLoadedListingId(listing.id);
          // Also save to localStorage as the new baseline so it persists
          localStorage.setItem('webmers_website_maker_data_v3', JSON.stringify({
            pages: mappedPages,
            themeKey: mappedTheme,
            accent: mappedAccent,
            font,
            siteTitle: mappedTitle,
            sourceListingId: listing.id,
          }));
          return true;
        }
      } catch (e) {
        console.error('Failed to load listing for editor', e);
      } finally {
        setIsLoadingListing(false);
      }
      return false;
    };

    const init = async () => {
      // 1. Check query param ?listing=xxx or ?id=xxx — this enables EVERY listed site to be editable via PSD AI
      const listingParam = searchParams.get('listing') || searchParams.get('id') || searchParams.get('listingId');
      if (listingParam) {
        const ok = await loadFromListing(listingParam);
        if (ok) return;
      }
      // 2. Otherwise load from localStorage autosave
      const saved = localStorage.getItem('webmers_website_maker_data_v3');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.pages && parsed.pages.length > 0) {
            setPages(parsed.pages);
            setThemeKey(parsed.themeKey || 'WanderWarm');
            setAccent(parsed.accent || '#d9772b');
            setFont(parsed.font || 'Outfit');
            setSiteTitle(parsed.siteTitle || 'My Custom Site');
            setActivePageId(parsed.pages[0].id);
            if (parsed.sourceListingId) setLoadedListingId(parsed.sourceListingId);
            return;
          }
        } catch (err) {
          console.error('Error loading config', err);
        }
      }
      // 3. Fallback to default template
      setPages(INITIAL_PAGES);
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Autosave when changes occur
  useEffect(() => {
    if (pages.length === 0) return;
    setIsAutosaved(true);
    const timer = setTimeout(() => {
      localStorage.setItem('webmers_website_maker_data_v3', JSON.stringify({
        pages,
        themeKey,
        accent,
        font,
        siteTitle
      }));
      setIsAutosaved(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [pages, themeKey, accent, font, siteTitle]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const saveStateToHistory = (newPages: Page[]) => {
    setHistoryStack(prev => [...prev.slice(-30), pages]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (historyStack.length === 0) {
      showToast('Nothing to undo');
      return;
    }
    const previous = historyStack[historyStack.length - 1];
    setRedoStack(prev => [...prev, pages]);
    setPages(previous);
    setHistoryStack(prev => prev.slice(0, -1));
    showToast('Undo completed');
  };

  const handleRedo = () => {
    if (redoStack.length === 0) {
      showToast('Nothing to redo');
      return;
    }
    const next = redoStack[redoStack.length - 1];
    setHistoryStack(prev => [...prev, pages]);
    setPages(next);
    setRedoStack(prev => prev.slice(0, -1));
    showToast('Redo completed');
  };

  // --- PSD AI: Apply actions coming from AI ---
  const applyAIActions = useCallback((actions: EditorAction[]) => {
    if (!actions || actions.length === 0) return;
    // Save snapshot once for undo
    setHistoryStack(prev => [...prev.slice(-30), pages]);
    setRedoStack([]);

    let newPages = [...pages];
    let newThemeKey = themeKey;
    let newAccent = accent;
    let newFont = font;
    let newSiteTitle = siteTitle;
    let newActivePageId = activePageId;
    let newSelectedSectionId: string | null = selectedSectionId;
    let newDevice = device;
    let toastMsg = '';

    const resolvePage = (idOrName: string): string | null => {
      const lower = idOrName.toLowerCase();
      const byId = newPages.find(p => p.id.toLowerCase() === lower);
      if (byId) return byId.id;
      const byName = newPages.find(p => p.name.toLowerCase() === lower);
      if (byName) return byName.id;
      const incl = newPages.find(p => p.name.toLowerCase().includes(lower) || lower.includes(p.name.toLowerCase()));
      if (incl) return incl.id;
      return null;
    };

    for (const act of actions) {
      switch (act.type) {
        case 'setSiteTitle': {
          newSiteTitle = act.title.slice(0, 80);
          toastMsg = `Site title → "${newSiteTitle}" via PSD`;
          break;
        }
        case 'setTheme': {
          if (THEMES[act.theme]) {
            newThemeKey = act.theme as ThemeKey;
            toastMsg = `Theme → ${act.theme} via PSD`;
          }
          break;
        }
        case 'setAccent': {
          newAccent = act.accent;
          toastMsg = `Accent → ${act.accent} via PSD`;
          break;
        }
        case 'setFont': {
          if (FONTS[act.font]) {
            newFont = act.font;
            toastMsg = `Font → ${act.font} via PSD`;
          }
          break;
        }
        case 'setDevice': {
          newDevice = act.device as Device;
          toastMsg = `Preview → ${act.device} via PSD`;
          break;
        }
        case 'addPage': {
          const cleanId = act.pageId || act.pageName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
          if (newPages.some(p => p.id === cleanId)) {
            toastMsg = `Page "${act.pageName}" already exists`;
            break;
          }
          const np: Page = {
            id: cleanId,
            name: act.pageName,
            sections: [createDefaultSection('hero'), createDefaultSection('features'), createDefaultSection('footer')],
          };
          newPages = [...newPages, np];
          newActivePageId = cleanId;
          newSelectedSectionId = null;
          toastMsg = `Page "${act.pageName}" created via PSD`;
          break;
        }
        case 'deletePage': {
          if (act.pageId === 'home') {
            toastMsg = 'Cannot delete Home page';
            break;
          }
          newPages = newPages.filter(p => p.id !== act.pageId);
          if (newActivePageId === act.pageId) newActivePageId = 'home';
          toastMsg = `Page deleted via PSD`;
          break;
        }
        case 'renamePage': {
          newPages = newPages.map(p => p.id === act.pageId ? { ...p, name: act.newName } : p);
          toastMsg = `Renamed to "${act.newName}" via PSD`;
          break;
        }
        case 'switchPage': {
          const resolved = resolvePage(act.pageId) || act.pageId;
          if (newPages.some(p => p.id === resolved)) {
            newActivePageId = resolved;
            newSelectedSectionId = null;
            toastMsg = `Switched to ${newPages.find(p=>p.id===resolved)?.name} via PSD`;
          }
          break;
        }
        case 'addSection': {
          const pid = resolvePage(act.pageId) || activePageId;
          const target = newPages.find(p => p.id === pid);
          if (!target) break;
          const newSec = createDefaultSection(act.sectionType);
          const footerIdx = target.sections.findIndex(s => s.type === 'footer');
          let updated = [...target.sections];
          if (footerIdx !== -1) updated.splice(footerIdx, 0, newSec);
          else updated.push(newSec);
          newPages = newPages.map(p => p.id === pid ? { ...p, sections: updated } : p);
          newSelectedSectionId = newSec.id;
          newActivePageId = pid;
          toastMsg = `Added ${act.sectionType} via PSD`;
          // scroll after render
          setTimeout(() => {
            const el = document.getElementById(`section-card-${newSec.id}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 300);
          break;
        }
        case 'removeSection': {
          const pid = resolvePage(act.pageId) || activePageId;
          const target = newPages.find(p => p.id === pid);
          if (!target) break;
          const filtered = target.sections.filter(s => s.id !== act.sectionId);
          newPages = newPages.map(p => p.id === pid ? { ...p, sections: filtered } : p);
          if (newSelectedSectionId === act.sectionId) newSelectedSectionId = null;
          toastMsg = `Removed section via PSD`;
          break;
        }
        case 'duplicateSection': {
          const pid = resolvePage(act.pageId) || activePageId;
          const target = newPages.find(p => p.id === pid);
          if (!target) break;
          const sec = target.sections.find(s => s.id === act.sectionId);
          if (!sec) break;
          const copy: SectionInstance = {
            ...sec,
            id: `${sec.type}-${Math.random().toString(36).slice(2, 9)}`,
            title: `${sec.title} (Copy)`,
            buttons: sec.buttons ? JSON.parse(JSON.stringify(sec.buttons)) : undefined,
            items: sec.items ? JSON.parse(JSON.stringify(sec.items)) : undefined,
          };
          const idx = target.sections.findIndex(s => s.id === act.sectionId);
          const updated = [...target.sections];
          updated.splice(idx + 1, 0, copy);
          newPages = newPages.map(p => p.id === pid ? { ...p, sections: updated } : p);
          newSelectedSectionId = copy.id;
          toastMsg = `Duplicated ${sec.type} via PSD`;
          break;
        }
        case 'moveSection': {
          const pid = resolvePage(act.pageId) || activePageId;
          const target = newPages.find(p => p.id === pid);
          if (!target) break;
          const idx = target.sections.findIndex(s => s.id === act.sectionId);
          if (idx === -1) break;
          if (act.direction === 'up' && idx === 0) break;
          if (act.direction === 'down' && idx === target.sections.length - 1) break;
          const updated = [...target.sections];
          const tIdx = act.direction === 'up' ? idx - 1 : idx + 1;
          const tmp = updated[idx];
          updated[idx] = updated[tIdx];
          updated[tIdx] = tmp;
          newPages = newPages.map(p => p.id === pid ? { ...p, sections: updated } : p);
          toastMsg = `Moved section ${act.direction} via PSD`;
          break;
        }
        case 'updateSection': {
          const pid = resolvePage(act.pageId) || activePageId;
          newPages = newPages.map(p => {
            if (p.id !== pid) return p;
            const secs = p.sections.map(s => s.id === act.sectionId ? { ...s, [act.field]: act.value } : s);
            return { ...p, sections: secs };
          });
          toastMsg = `Updated ${act.field} via PSD`;
          break;
        }
        case 'updateSectionItem': {
          const pid = resolvePage(act.pageId) || activePageId;
          newPages = newPages.map(p => {
            if (p.id !== pid) return p;
            const secs = p.sections.map(s => {
              if (s.id !== act.sectionId || !s.items) return s;
              const newItems = [...s.items];
              if (act.itemIndex >= 0 && act.itemIndex < newItems.length) {
                newItems[act.itemIndex] = { ...newItems[act.itemIndex], [act.field]: act.value };
              }
              return { ...s, items: newItems };
            });
            return { ...p, sections: secs };
          });
          toastMsg = `Updated item via PSD`;
          break;
        }
        case 'addSectionItem': {
          const pid = resolvePage(act.pageId) || activePageId;
          newPages = newPages.map(p => {
            if (p.id !== pid) return p;
            const secs = p.sections.map(s => {
              if (s.id !== act.sectionId) return s;
              const dummy = createDefaultSection(s.type);
              const sample = dummy.items?.[0] || { title: 'New Item', description: 'Description' };
              const newItems = [...(s.items || []), sample];
              return { ...s, items: newItems };
            });
            return { ...p, sections: secs };
          });
          toastMsg = `Added item via PSD`;
          break;
        }
        case 'removeSectionItem': {
          const pid = resolvePage(act.pageId) || activePageId;
          newPages = newPages.map(p => {
            if (p.id !== pid) return p;
            const secs = p.sections.map(s => {
              if (s.id !== act.sectionId || !s.items) return s;
              const filtered = s.items.filter((_, ix) => ix !== act.itemIndex);
              return { ...s, items: filtered };
            });
            return { ...p, sections: secs };
          });
          toastMsg = `Removed item via PSD`;
          break;
        }
        default:
          break;
      }
    }

    setPages(newPages);
    setThemeKey(newThemeKey);
    setAccent(newAccent);
    setFont(newFont);
    setSiteTitle(newSiteTitle);
    setActivePageId(newActivePageId);
    setSelectedSectionId(newSelectedSectionId);
    setDevice(newDevice as Device);
    if (toastMsg) showToast(toastMsg);
  }, [pages, themeKey, accent, font, siteTitle, activePageId, selectedSectionId, device]);

  // Helper getters
  const activePage = pages.find(p => p.id === activePageId) || pages[0] || null;
  const currentTheme = THEMES[themeKey] || THEMES.WanderWarm;

  // Pricing calculation
  const basePrice = 19;
  const additionalPagePrice = 10;
  const sectionPrice = 4;
  const premiumDesignPrice = 7;

  const pageCount = pages.length;
  const totalSectionsCount = pages.reduce((acc, p) => acc + p.sections.length, 0);
  const isPremiumDesign = accent !== '#d9772b' || font !== 'Outfit' || themeKey !== 'WanderWarm';

  const pagesCharge = Math.max(0, pageCount - 1) * additionalPagePrice;
  const sectionsCharge = Math.max(0, totalSectionsCount - 3) * sectionPrice;
  const designPremiumCharge = isPremiumDesign ? premiumDesignPrice : 0;
  const totalPrice = basePrice + pagesCharge + sectionsCharge + designPremiumCharge;
  const inrPrice = Math.round(totalPrice * 82);

  // Page Handlers
  const addPage = () => {
    const pName = prompt('Enter Webpage Name (e.g. Services, Contact, Gallery):');
    if (!pName) return;
    const cleanId = pName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    if (pages.some(p => p.id === cleanId)) {
      showToast('A page with this name already exists.');
      return;
    }
    saveStateToHistory(pages);
    const newPage: Page = {
      id: cleanId,
      name: pName,
      sections: [
        createDefaultSection('hero'),
        createDefaultSection('features'),
        createDefaultSection('footer')
      ]
    };
    setPages([...pages, newPage]);
    setActivePageId(cleanId);
    showToast(`Created page "${pName}"`);
  };

  const deletePage = (pageId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (pageId === 'home') {
      showToast('Cannot delete the primary Home page.');
      return;
    }
    if (confirm('Are you absolutely sure you want to delete this page?')) {
      saveStateToHistory(pages);
      const filtered = pages.filter(p => p.id !== pageId);
      setPages(filtered);
      setActivePageId('home');
      showToast('Page deleted');
    }
  };

  const renamePage = (pageId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const targetPage = pages.find(p => p.id === pageId);
    if (!targetPage) return;
    const newName = prompt('Rename page title:', targetPage.name);
    if (!newName) return;
    saveStateToHistory(pages);
    setPages(pages.map(p => p.id === pageId ? { ...p, name: newName } : p));
    showToast('Page renamed');
  };

  // Section Handlers
  const appendSection = (type: SectionInstance['type']) => {
    if (!activePage) return;
    saveStateToHistory(pages);
    const newSec = createDefaultSection(type);
    
    const footerIdx = activePage.sections.findIndex(s => s.type === 'footer');
    let updatedSections = [...activePage.sections];
    if (footerIdx !== -1) {
      updatedSections.splice(footerIdx, 0, newSec);
    } else {
      updatedSections.push(newSec);
    }

    setPages(pages.map(p => p.id === activePageId ? { ...p, sections: updatedSections } : p));
    setIsAddingSection(false);
    setSelectedSectionId(newSec.id);
    showToast(`Added ${type} section`);
    
    setTimeout(() => {
      const el = document.getElementById(`section-card-${newSec.id}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);
  };

  const moveSection = (sectionId: string, direction: 'up' | 'down', event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    if (!activePage) return;
    const idx = activePage.sections.findIndex(s => s.id === sectionId);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === activePage.sections.length - 1) return;

    saveStateToHistory(pages);
    const updated = [...activePage.sections];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;

    setPages(pages.map(p => p.id === activePageId ? { ...p, sections: updated } : p));
    showToast('Layout rearranged');
  };

  const duplicateSection = (sectionId: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    if (!activePage) return;
    const targetSec = activePage.sections.find(s => s.id === sectionId);
    if (!targetSec) return;

    saveStateToHistory(pages);
    const copy: SectionInstance = {
      ...targetSec,
      id: `${targetSec.type}-${Math.random().toString(36).slice(2, 9)}`,
      title: `${targetSec.title} (Copy)`,
      buttons: targetSec.buttons ? JSON.parse(JSON.stringify(targetSec.buttons)) : undefined,
      items: targetSec.items ? JSON.parse(JSON.stringify(targetSec.items)) : undefined
    };

    const idx = activePage.sections.findIndex(s => s.id === sectionId);
    const updated = [...activePage.sections];
    updated.splice(idx + 1, 0, copy);

    setPages(pages.map(p => p.id === activePageId ? { ...p, sections: updated } : p));
    setSelectedSectionId(copy.id);
    showToast('Section duplicated');
  };

  const removeSection = (sectionId: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    if (!activePage) return;
    if (confirm('Remove this section from layout?')) {
      saveStateToHistory(pages);
      const filtered = activePage.sections.filter(s => s.id !== sectionId);
      setPages(pages.map(p => p.id === activePageId ? { ...p, sections: filtered } : p));
      if (selectedSectionId === sectionId) setSelectedSectionId(null);
      showToast('Section removed');
    }
  };

  const handleInlineTextSync = (sectionId: string, field: 'title' | 'subtitle' | 'badge' | 'buttonText', value: string) => {
    if (!activePage) return;
    const updated = activePage.sections.map(s => {
      if (s.id !== sectionId) return s;
      return { ...s, [field]: value };
    });
    setPages(pages.map(p => p.id === activePageId ? { ...p, sections: updated } : p));
  };

  const handleInlineItemTextSync = (sectionId: string, itemIdx: number, field: string, value: string) => {
    if (!activePage) return;
    const updated = activePage.sections.map(s => {
      if (s.id !== sectionId || !s.items) return s;
      const newItems = [...s.items];
      newItems[itemIdx] = { ...newItems[itemIdx], [field]: value };
      return { ...s, items: newItems };
    });
    setPages(pages.map(p => p.id === activePageId ? { ...p, sections: updated } : p));
  };

  const selectedSection = activePage?.sections.find(s => s.id === selectedSectionId) || null;

  const updateSelectedSectionField = (field: keyof SectionInstance, value: any) => {
    if (!activePage || !selectedSectionId) return;
    saveStateToHistory(pages);
    const updated = activePage.sections.map(s => {
      if (s.id !== selectedSectionId) return s;
      return { ...s, [field]: value };
    });
    setPages(pages.map(p => p.id === activePageId ? { ...p, sections: updated } : p));
  };

  const triggerSimulatedPayment = () => {
    if (!userEmail) {
      alert('Please fill in your email address to deliver the source code.');
      return;
    }
    setCheckoutStep('processing');
    
    const logs = [
      'Authenticating secure session token...',
      'Compiling custom multi-page site structure...',
      'Injecting reactive SPA router JavaScript...',
      'Bundling Tailwind CSS theme palettes...',
      'Translating custom font pairings...',
      'Sanitizing raw HTML input tags...',
      'Optimizing asset paths & layouts...',
      'Encrypting ZIP package & download credentials...',
      'Code asset unlocked successfully! Delivery package initialized.'
    ];

    let currentLogIdx = 0;
    setProcessingLog(logs[0]);

    const interval = setInterval(() => {
      currentLogIdx++;
      if (currentLogIdx < logs.length) {
        setProcessingLog(logs[currentLogIdx]);
      } else {
        clearInterval(interval);
        setCheckoutStep('success');
        showToast('Code unlocked successfully! Download available.');
      }
    }, 700);
  };

  const downloadCompiledCode = () => {
    const htmlContent = generateFullWebsiteHTML(pages, themeKey, accent, font, siteTitle);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${siteTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}-website.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Website codebase downloaded');
  };

  return (
    <div className="min-h-screen bg-[#f3efe8] text-[#1f3d47] flex flex-col font-body select-none antialiased">
      {/* Top Header Bar */}
      <header className="h-16 border-b border-[#1f3d47]/10 bg-[#1f3d47] text-white flex items-center justify-between px-4 md:px-6 shrink-0 gap-3">
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors shrink-0" aria-label="Back to home">
            <Home size={18} />
          </Link>
          <div className="h-4 w-px bg-white/20" />
          <h1 className="font-heading font-bold text-sm md:text-base text-white truncate flex items-center gap-2">
            <Mountain size={18} className="text-[#d9772b]" /> WEBMERS Visual Editor
            <span className="hidden sm:inline-flex items-center gap-1.5 ml-3 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              PSD AI • LIVE EDITS
            </span>
          </h1>
          
          {loadedListingId && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#d9772b]/20 border border-[#d9772b]/30 text-[11px] text-orange-200">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d9772b] animate-pulse" />
              <span>Editing listed site: {siteTitle} ({loadedListingId}) via PSD AI</span>
            </div>
          )}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[11px] text-white/80">
            {isLoadingListing ? (
              <>
                <RefreshCw size={11} className="animate-spin text-[#d9772b]" />
                <span>Loading listed site...</span>
              </>
            ) : isAutosaving ? (
              <>
                <RefreshCw size={11} className="animate-spin text-[#d9772b]" />
                <span>Autosaving changes...</span>
              </>
            ) : (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-[#d9772b] animate-pulse" />
                <span>Synced &amp; Autosaved</span>
              </>
            )}
          </div>
        </div>

        {/* Toolbar responsive selectors */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 bg-white/10 rounded-xl p-1 border border-white/10">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1.5 rounded-lg transition-all ${device === 'desktop' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'}`}
              title="Desktop Preview"
            >
              <Monitor size={15} />
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-1.5 rounded-lg transition-all ${device === 'tablet' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'}`}
              title="Tablet Preview"
            >
              <Tablet size={15} />
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-1.5 rounded-lg transition-all ${device === 'mobile' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'}`}
              title="Mobile Preview"
            >
              <Smartphone size={15} />
            </button>
          </div>

          <div className="h-4 w-px bg-white/20 hidden sm:block" />

          <button
            onClick={handleUndo}
            disabled={historyStack.length === 0}
            className="p-2 rounded-lg bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-all disabled:opacity-30 disabled:pointer-events-none"
            title="Undo"
          >
            <Undo size={14} />
          </button>
          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="p-2 rounded-lg bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-all disabled:opacity-30 disabled:pointer-events-none"
            title="Redo"
          >
            <Redo size={14} />
          </button>

          <div className="h-4 w-px bg-white/20" />

          {/* Checkout Launch Action */}
          <button
            onClick={() => {
              setCheckoutStep('details');
              setIsCheckoutOpen(true);
            }}
            className="px-4 py-2 rounded-full text-xs font-bold bg-[#d9772b] text-white hover:bg-orange-500 transition-all shadow-md hover:scale-[1.03]"
          >
            Get Code · ${totalPrice}
          </button>
        </div>
      </header>

      {/* Main Workspace layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: PAGES & LAYOUT SECTIONS */}
        <aside className="w-64 border-r border-[#1f3d47]/10 bg-white/90 text-[#1f3d47] flex flex-col shrink-0 overflow-y-auto backdrop-blur-md">
          
          {/* Site Title Settings */}
          <div className="p-4 border-b border-[#1f3d47]/10">
            <label className="text-[10px] uppercase tracking-widest text-[#1f3d47]/60 block mb-1.5 font-bold">Site Brand Name</label>
            <div className="relative">
              <input
                type="text"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                className="w-full bg-[#f3efe8] border border-[#1f3d47]/15 rounded-xl px-3 py-2 text-xs text-[#1f3d47] font-semibold focus:outline-none focus:border-[#d9772b]"
                placeholder="Bespoke Agency"
              />
            </div>
          </div>

          {/* PAGE MANAGEMENT PANEL */}
          <div className="p-4 border-b border-[#1f3d47]/10">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[10px] uppercase tracking-widest text-[#1f3d47]/60 font-bold">Webpages</h2>
              <button
                onClick={addPage}
                className="p-1 rounded bg-[#1f3d47]/5 hover:bg-[#d9772b] hover:text-white text-[#d9772b] transition-colors flex items-center justify-center"
                title="Add New Page"
              >
                <Plus size={13} />
              </button>
            </div>
            
            <div className="space-y-1">
              {pages.map((p) => {
                const isActive = p.id === activePageId;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setActivePageId(p.id);
                      setSelectedSectionId(null);
                    }}
                    className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isActive
                        ? 'bg-[#d9772b]/15 border-[#d9772b]/40 text-[#d9772b] font-bold'
                        : 'bg-transparent border-transparent text-[#1f3d47]/70 hover:bg-[#1f3d47]/5 hover:text-[#1f3d47]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate text-xs">
                      <FileText size={13} className={isActive ? 'text-[#d9772b]' : 'text-[#1f3d47]/40'} />
                      <span className="truncate">{p.name}</span>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => renamePage(p.id, e)}
                        className="p-0.5 rounded text-[#1f3d47]/50 hover:text-[#1f3d47]"
                        title="Rename page"
                      >
                        <Settings size={11} />
                      </button>
                      {p.id !== 'home' && (
                        <button
                          onClick={(e) => deletePage(p.id, e)}
                          className="p-0.5 rounded text-rose-500/70 hover:text-rose-600"
                          title="Delete page"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTIVE PAGE SECTIONS MANAGER */}
          <div className="p-4 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[10px] uppercase tracking-widest text-[#1f3d47]/60 font-bold">Page Layout Sections</h2>
              <span className="text-[10px] font-bold text-[#d9772b] bg-[#d9772b]/10 px-2 py-0.5 rounded-full">
                {activePage?.sections.length || 0} Blocks
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 py-1">
              {activePage?.sections.map((sec, idx) => {
                const isSelected = sec.id === selectedSectionId;
                const totalSec = activePage.sections.length;
                return (
                  <div
                    key={sec.id}
                    onClick={() => {
                      setSelectedSectionId(sec.id);
                      const target = document.getElementById(`section-card-${sec.id}`);
                      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className={`w-full p-2.5 rounded-xl border flex flex-col gap-1 text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#1f3d47] text-white border-[#1f3d47] shadow-sm'
                        : 'bg-[#f3efe8]/60 border-[#1f3d47]/10 text-[#1f3d47]/80 hover:bg-[#1f3d47]/5 hover:text-[#1f3d47]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold capitalize truncate">{sec.type}</span>
                      <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => moveSection(sec.id, 'up')}
                          disabled={idx === 0}
                          className="p-0.5 rounded opacity-50 hover:opacity-100 disabled:opacity-20"
                          title="Move up"
                        >
                          <ArrowUp size={11} />
                        </button>
                        <button
                          onClick={() => moveSection(sec.id, 'down')}
                          disabled={idx === totalSec - 1}
                          className="p-0.5 rounded opacity-50 hover:opacity-100 disabled:opacity-20"
                          title="Move down"
                        >
                          <ArrowDown size={11} />
                        </button>
                        <button
                          onClick={() => duplicateSection(sec.id)}
                          className="p-0.5 rounded opacity-50 hover:opacity-100"
                          title="Duplicate section"
                        >
                          <Copy size={11} />
                        </button>
                        <button
                          onClick={() => removeSection(sec.id)}
                          className="p-0.5 rounded text-rose-500 opacity-70 hover:opacity-100"
                          title="Delete section"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                    <span className="text-[10px] opacity-60 truncate leading-tight">
                      {sec.title || sec.subtitle || 'Custom block content'}
                    </span>
                  </div>
                );
              })}

              <button
                onClick={() => setIsAddingSection(true)}
                className="w-full py-3 border border-dashed border-[#1f3d47]/20 rounded-xl hover:border-[#d9772b] hover:bg-white text-[#1f3d47]/60 hover:text-[#d9772b] flex items-center justify-center gap-1.5 transition-all text-xs font-bold"
              >
                <PlusCircle size={14} /> Add Content Section
              </button>
            </div>
          </div>
        </aside>

        {/* WORKSPACE PREVIEW CANVAS */}
        <main className="flex-1 bg-[#e8e4db] overflow-y-auto relative p-6 flex flex-col items-center">
          
          {/* Live Price floating display */}
          <div className="mb-4 bg-white/90 border border-[#1f3d47]/10 px-5 py-2.5 rounded-full text-xs text-[#1f3d47] flex items-center gap-4 shadow-sm select-none backdrop-blur-md">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#d9772b] animate-pulse" />
              Webpages: <strong className="text-[#1f3d47]">{pageCount}</strong>
            </span>
            <div className="w-px h-3 bg-[#1f3d47]/15" />
            <span>
              Total Sections: <strong className="text-[#1f3d47]">{totalSectionsCount}</strong>
            </span>
            <div className="w-px h-3 bg-[#1f3d47]/15" />
            <span className="flex items-center gap-1.5 text-[#d9772b] font-bold bg-[#d9772b]/10 px-2.5 py-0.5 rounded-full">
              Unlock Cost: ${totalPrice} <span className="text-[10px] opacity-60 font-normal">(₹{inrPrice})</span>
            </span>
          </div>

          {/* Active Canvas device wrapper */}
          <div className={`${DEVICE_WIDTH[device]} w-full mx-auto shadow-xl transition-all duration-300 rounded-3xl overflow-hidden border border-[#1f3d47]/15 relative`}>
            
            {/* Top Chrome Header for aesthetics */}
            <div className="h-9 bg-[#1f3d47] px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
              </div>
              <div className="text-[10px] text-white/60 font-mono truncate max-w-[50%]">
                {siteTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}.webmers.app / {activePage?.name}
              </div>
              <div className="w-8" />
            </div>

            {/* PREVIEW CANVAS INTERNAL RENDERER */}
            <div className={`${currentTheme.bg} ${FONTS[font]} min-h-[70vh] relative`}>
              
              {(!activePage || activePage.sections.length === 0) && (
                <div className="py-24 text-center">
                  <p className="text-sm opacity-50">This page layout is empty. Click "+ Add Content Section" to design elements.</p>
                </div>
              )}

              {/* Dynamic Pages Nav mockup inside page preview */}
              <div className="py-4 px-6 md:px-8 border-b border-current/10 flex items-center justify-between text-xs backdrop-blur-md sticky top-0 z-20">
                <div className="font-bold font-heading text-base" style={{ color: accent }}>{siteTitle}</div>
                <div className="flex items-center gap-4">
                  {pages.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setActivePageId(p.id)}
                      className={`font-semibold text-[11px] uppercase tracking-wider transition-colors ${
                        p.id === activePageId ? 'border-b-2 font-bold' : 'opacity-60 hover:opacity-100'
                      }`}
                      style={{ borderBottomColor: p.id === activePageId ? accent : 'transparent' }}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Loop and render page components */}
              {activePage?.sections.map((sec, idx) => {
                const isSelected = sec.id === selectedSectionId;

                return (
                  <div
                    key={sec.id}
                    id={`section-card-${sec.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSectionId(sec.id);
                    }}
                    className={`relative group/sec transition-all ${
                      isSelected ? 'ring-2 ring-[#d9772b] ring-offset-2 ring-offset-[#f3efe8] rounded-lg' : 'hover:ring-1 hover:ring-current/20'
                    }`}
                  >
                    
                    {/* Hover float action bar */}
                    <div className="absolute right-4 top-4 hidden group-hover/sec:flex items-center gap-1.5 bg-[#1f3d47] text-white border border-white/10 rounded-full px-2 py-1 z-30 shadow-md">
                      <span className="text-[10px] text-white/70 px-2 uppercase font-bold">{sec.type}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); moveSection(sec.id, 'up'); }}
                        disabled={idx === 0}
                        className="p-1 rounded-full text-white/60 hover:text-white disabled:opacity-20"
                        title="Move Up"
                      >
                        <ArrowUp size={11} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); moveSection(sec.id, 'down'); }}
                        disabled={idx === activePage.sections.length - 1}
                        className="p-1 rounded-full text-white/60 hover:text-white disabled:opacity-20"
                        title="Move Down"
                      >
                        <ArrowDown size={11} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); duplicateSection(sec.id); }}
                        className="p-1 rounded-full text-white/60 hover:text-white"
                        title="Duplicate Section"
                      >
                        <Copy size={11} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeSection(sec.id); }}
                        className="p-1 rounded-full text-rose-300 hover:text-rose-100"
                        title="Remove Section"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>

                    {/* RENDER COMPONENT LAYOUTS BASED ON TYPE */}
                    {/* Hero Section */}
                    {sec.type === 'hero' && (
                      <section className="relative min-h-[50vh] flex flex-col items-center justify-center px-6 py-16 text-center">
                        <div className="relative z-10 max-w-2xl mx-auto">
                          {sec.badge && (
                            <span
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => handleInlineTextSync(sec.id, 'badge', e.currentTarget.innerText)}
                              className="inline-block px-3.5 py-1 text-[11px] font-bold tracking-widest rounded-full mb-6 cursor-text uppercase"
                              style={{ backgroundColor: `${accent}15`, color: accent, border: `1px solid ${accent}40` }}
                            >
                              {sec.badge}
                            </span>
                          )}
                          <h2
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleInlineTextSync(sec.id, 'title', e.currentTarget.innerText)}
                            className="font-heading text-3xl md:text-5xl font-medium tracking-tight mb-5 leading-[1.05] cursor-text"
                          >
                            {sec.title}
                          </h2>
                          <p
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleInlineTextSync(sec.id, 'subtitle', e.currentTarget.innerText)}
                            className={`text-base md:text-lg mb-8 max-w-lg mx-auto cursor-text ${currentTheme.muted}`}
                          >
                            {sec.subtitle}
                          </p>
                          <div className="flex flex-wrap justify-center gap-3">
                            {(sec.buttons || []).map((b, bIdx) => (
                              <button
                                key={bIdx}
                                className="px-7 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-transform hover:scale-[1.02] shadow-sm"
                                style={
                                  b.type === 'primary'
                                    ? { backgroundColor: accent, color: '#ffffff' }
                                    : { border: `2px solid ${accent}`, color: 'inherit', backgroundColor: 'transparent' }
                                }
                              >
                                {b.text}
                              </button>
                            ))}
                          </div>
                        </div>
                      </section>
                    )}

                    {/* Features Section */}
                    {sec.type === 'features' && (
                      <section className={`py-16 px-6 border-t ${currentTheme.border}`}>
                        <div className="max-w-4xl mx-auto text-center mb-12">
                          <h2
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleInlineTextSync(sec.id, 'title', e.currentTarget.innerText)}
                            className="font-heading text-2xl md:text-4xl font-medium tracking-tight mb-3"
                          >
                            {sec.title}
                          </h2>
                          <p
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleInlineTextSync(sec.id, 'subtitle', e.currentTarget.innerText)}
                            className={`text-xs md:text-sm max-w-xl mx-auto ${currentTheme.muted}`}
                          >
                            {sec.subtitle}
                          </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                          {(sec.items || []).map((item, itemIdx) => (
                            <div key={itemIdx} className={`p-6 rounded-2xl border transition-all ${currentTheme.innerCard}`}>
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${accent}15`, color: accent }}>
                                <LayoutTemplate size={18} />
                              </div>
                              <h3
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => handleInlineItemTextSync(sec.id, itemIdx, 'title', e.currentTarget.innerText)}
                                className="font-heading text-lg font-bold mb-2 cursor-text"
                              >
                                {item.title}
                              </h3>
                              <p
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => handleInlineItemTextSync(sec.id, itemIdx, 'description', e.currentTarget.innerText)}
                                className={`text-xs leading-relaxed cursor-text ${currentTheme.muted}`}
                              >
                                {item.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Stats Section */}
                    {sec.type === 'stats' && (
                      <section className={`py-12 px-6 border-y ${currentTheme.border} ${currentTheme.innerCard}`}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center max-w-5xl mx-auto">
                          {(sec.items || []).map((item, itemIdx) => (
                            <div key={itemIdx}>
                              <div
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => handleInlineItemTextSync(sec.id, itemIdx, 'value', e.currentTarget.innerText)}
                                className="font-heading text-3xl md:text-5xl font-bold mb-1 cursor-text"
                                style={{ color: accent }}
                              >
                                {item.value}
                              </div>
                              <div
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => handleInlineItemTextSync(sec.id, itemIdx, 'label', e.currentTarget.innerText)}
                                className={`text-[10px] uppercase tracking-widest font-bold cursor-text ${currentTheme.muted}`}
                              >
                                {item.label}
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Testimonials Section */}
                    {sec.type === 'testimonials' && (
                      <section className={`py-16 px-6 border-t ${currentTheme.border}`}>
                        <div className="max-w-4xl mx-auto text-center mb-12">
                          <h2
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleInlineTextSync(sec.id, 'title', e.currentTarget.innerText)}
                            className="font-heading text-2xl md:text-4xl font-medium mb-3"
                          >
                            {sec.title}
                          </h2>
                          <p
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleInlineTextSync(sec.id, 'subtitle', e.currentTarget.innerText)}
                            className={`text-xs md:text-sm max-w-xl mx-auto ${currentTheme.muted}`}
                          >
                            {sec.subtitle}
                          </p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                          {(sec.items || []).map((item, itemIdx) => (
                            <div key={itemIdx} className={`p-6 rounded-2xl border ${currentTheme.innerCard} relative`}>
                              <p
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => handleInlineItemTextSync(sec.id, itemIdx, 'quote', e.currentTarget.innerText)}
                                className={`font-heading text-base italic mb-4 leading-relaxed cursor-text ${currentTheme.muted}`}
                              >
                                "{item.quote}"
                              </p>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: accent }}>
                                  {(item.name || 'U').charAt(0)}
                                </div>
                                <div>
                                  <h4
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e) => handleInlineItemTextSync(sec.id, itemIdx, 'name', e.currentTarget.innerText)}
                                    className="font-bold text-xs cursor-text"
                                  >
                                    {item.name}
                                  </h4>
                                  <p
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e) => handleInlineItemTextSync(sec.id, itemIdx, 'role', e.currentTarget.innerText)}
                                    className="text-[10px] opacity-60 cursor-text"
                                  >
                                    {item.role}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Pricing plans */}
                    {sec.type === 'pricing' && (
                      <section className={`py-16 px-6 border-t ${currentTheme.border}`}>
                        <div className="max-w-4xl mx-auto text-center mb-12">
                          <h2
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleInlineTextSync(sec.id, 'title', e.currentTarget.innerText)}
                            className="font-heading text-2xl md:text-4xl font-medium mb-3"
                          >
                            {sec.title}
                          </h2>
                          <p
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleInlineTextSync(sec.id, 'subtitle', e.currentTarget.innerText)}
                            className={`text-xs md:text-sm max-w-xl mx-auto ${currentTheme.muted}`}
                          >
                            {sec.subtitle}
                          </p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                          {(sec.items || []).map((item, itemIdx) => (
                            <div
                              key={itemIdx}
                              className={`p-6 rounded-2xl border flex flex-col justify-between transition-all ${
                                itemIdx === 1 ? 'border-2 scale-105 shadow-md' : currentTheme.innerCard
                              }`}
                              style={{ borderColor: itemIdx === 1 ? accent : undefined }}
                            >
                              <div>
                                <h3
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={(e) => handleInlineItemTextSync(sec.id, itemIdx, 'plan', e.currentTarget.innerText)}
                                  className="font-heading text-xl font-bold mb-1 cursor-text"
                                >
                                  {item.plan}
                                </h3>
                                <p
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={(e) => handleInlineItemTextSync(sec.id, itemIdx, 'desc', e.currentTarget.innerText)}
                                  className="text-xs opacity-70 mb-4 cursor-text"
                                >
                                  {item.desc}
                                </p>
                                <div
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={(e) => handleInlineItemTextSync(sec.id, itemIdx, 'price', e.currentTarget.innerText)}
                                  className="font-heading text-3xl font-bold mb-4 cursor-text"
                                  style={{ color: accent }}
                                >
                                  {item.price}
                                </div>
                                <ul className="space-y-2 mb-6">
                                  {(item.features || []).map((feat, featIdx) => (
                                    <li key={featIdx} className="flex items-center gap-2 text-xs font-medium">
                                      <Check size={13} style={{ color: accent }} />
                                      <span>{feat}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <button
                                className="w-full py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.01]"
                                style={
                                  itemIdx === 1
                                    ? { backgroundColor: accent, color: '#ffffff' }
                                    : { border: `2px solid ${accent}`, color: 'inherit' }
                                }
                              >
                                Select Plan
                              </button>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Contact Form Layout */}
                    {sec.type === 'contact' && (
                      <section className={`py-16 px-6 border-t ${currentTheme.border}`}>
                        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                          <div>
                            <h2
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => handleInlineTextSync(sec.id, 'title', e.currentTarget.innerText)}
                              className="font-heading text-2xl md:text-4xl font-medium tracking-tight mb-3 cursor-text"
                            >
                              {sec.title}
                            </h2>
                            <p
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => handleInlineTextSync(sec.id, 'subtitle', e.currentTarget.innerText)}
                              className={`text-xs md:text-sm mb-6 leading-relaxed cursor-text ${currentTheme.muted}`}
                            >
                              {sec.subtitle}
                            </p>
                            <div className="space-y-4 text-xs font-medium">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-current/5" style={{ color: accent }}>
                                  <Mail size={14} />
                                </div>
                                <span className="opacity-80">contact@brandmaker.com</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-current/5" style={{ color: accent }}>
                                  <Home size={14} />
                                </div>
                                <span className="opacity-80">742 Creativity District, San Francisco</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className={`p-6 rounded-2xl border ${currentTheme.innerCard}`}>
                            <form className="space-y-3" onSubmit={e => e.preventDefault()}>
                              <div>
                                <label className="block text-[10px] font-bold uppercase opacity-70 mb-1">Your Email</label>
                                <input type="email" placeholder="example@gmail.com" disabled className="w-full bg-current/5 border border-current/10 rounded-xl px-3 py-2 text-xs" />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold uppercase opacity-70 mb-1">Your Message</label>
                                <textarea rows={3} placeholder="How can we help?" disabled className="w-full bg-current/5 border border-current/10 rounded-xl px-3 py-2 text-xs resize-none" />
                              </div>
                              <button className="w-full py-3 rounded-full text-xs font-bold uppercase tracking-wider text-white" style={{ backgroundColor: accent }}>
                                Send Message
                              </button>
                            </form>
                          </div>
                        </div>
                      </section>
                    )}

                    {/* FAQ section */}
                    {sec.type === 'faq' && (
                      <section className={`py-16 px-6 border-t ${currentTheme.border} ${currentTheme.innerCard}`}>
                        <div className="max-w-3xl mx-auto">
                          <div className="text-center mb-10">
                            <h2
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => handleInlineTextSync(sec.id, 'title', e.currentTarget.innerText)}
                              className="font-heading text-2xl md:text-4xl font-medium cursor-text"
                            >
                              {sec.title}
                            </h2>
                            <p
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => handleInlineTextSync(sec.id, 'subtitle', e.currentTarget.innerText)}
                              className={`text-xs mt-2 cursor-text ${currentTheme.muted}`}
                            >
                              {sec.subtitle}
                            </p>
                          </div>
                          <div className="space-y-3">
                            {(sec.items || []).map((item, itemIdx) => (
                              <div key={itemIdx} className="p-4 rounded-xl border border-current/10 bg-current/5">
                                <h4
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={(e) => handleInlineItemTextSync(sec.id, itemIdx, 'q', e.currentTarget.innerText)}
                                  className="font-heading font-bold text-xs md:text-sm mb-1.5 cursor-text"
                                >
                                  {item.q}
                                </h4>
                                <p
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={(e) => handleInlineItemTextSync(sec.id, itemIdx, 'a', e.currentTarget.innerText)}
                                  className={`text-xs leading-relaxed cursor-text ${currentTheme.muted}`}
                                >
                                  {item.a}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </section>
                    )}

                    {/* Team Grid */}
                    {sec.type === 'team' && (
                      <section className={`py-16 px-6 border-t ${currentTheme.border}`}>
                        <div className="max-w-4xl mx-auto text-center mb-12">
                          <h2
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleInlineTextSync(sec.id, 'title', e.currentTarget.innerText)}
                            className="font-heading text-2xl md:text-4xl font-medium tracking-tight mb-3"
                          >
                            {sec.title}
                          </h2>
                          <p
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleInlineTextSync(sec.id, 'subtitle', e.currentTarget.innerText)}
                            className={`text-xs md:text-sm max-w-xl mx-auto ${currentTheme.muted}`}
                          >
                            {sec.subtitle}
                          </p>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto justify-center">
                          {(sec.items || []).map((item, itemIdx) => (
                            <div key={itemIdx} className={`p-6 rounded-2xl border text-center ${currentTheme.innerCard}`}>
                              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-lg font-bold text-white shadow-sm" style={{ backgroundColor: accent }}>
                                {(item.name || 'T').charAt(0)}
                              </div>
                              <h4
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => handleInlineItemTextSync(sec.id, itemIdx, 'name', e.currentTarget.innerText)}
                                className="font-bold text-xs md:text-sm cursor-text"
                              >
                                {item.name}
                              </h4>
                              <p
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => handleInlineItemTextSync(sec.id, itemIdx, 'role', e.currentTarget.innerText)}
                                className="text-[10px] opacity-60 mt-1 cursor-text font-medium"
                              >
                                {item.role}
                              </p>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Portfolio / Showcase grid */}
                    {sec.type === 'portfolio' && (
                      <section className={`py-16 px-6 border-t ${currentTheme.border}`}>
                        <div className="max-w-4xl mx-auto text-center mb-12">
                          <h2
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleInlineTextSync(sec.id, 'title', e.currentTarget.innerText)}
                            className="font-heading text-2xl md:text-4xl font-medium tracking-tight mb-3"
                          >
                            {sec.title}
                          </h2>
                          <p
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleInlineTextSync(sec.id, 'subtitle', e.currentTarget.innerText)}
                            className={`text-xs md:text-sm max-w-xl mx-auto ${currentTheme.muted}`}
                          >
                            {sec.subtitle}
                          </p>
                        </div>
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
                          {(sec.items || []).map((item, itemIdx) => (
                            <div key={itemIdx} className={`rounded-2xl overflow-hidden border ${currentTheme.innerCard}`}>
                              <div className="h-32 flex items-center justify-center relative overflow-hidden bg-current/10">
                                <ImageIcon size={22} className="opacity-40" />
                              </div>
                              <div className="p-4">
                                <span
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={(e) => handleInlineItemTextSync(sec.id, itemIdx, 'category', e.currentTarget.innerText)}
                                  className="text-[9px] font-bold tracking-wider uppercase opacity-60 mb-0.5 block cursor-text"
                                >
                                  {item.category}
                                </span>
                                <h4
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={(e) => handleInlineItemTextSync(sec.id, itemIdx, 'title', e.currentTarget.innerText)}
                                  className="font-bold text-xs cursor-text font-heading"
                                >
                                  {item.title}
                                </h4>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Newsletter bar */}
                    {sec.type === 'newsletter' && (
                      <section className={`py-16 px-6 border-t ${currentTheme.border}`}>
                        <div className={`max-w-3xl mx-auto p-8 rounded-3xl border text-center ${currentTheme.innerCard}`}>
                          <h2
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleInlineTextSync(sec.id, 'title', e.currentTarget.innerText)}
                            className="font-heading text-xl md:text-3xl font-medium mb-2 cursor-text"
                          >
                            {sec.title}
                          </h2>
                          <p
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleInlineTextSync(sec.id, 'subtitle', e.currentTarget.innerText)}
                            className={`text-xs md:text-sm mb-6 max-w-md mx-auto cursor-text ${currentTheme.muted}`}
                          >
                            {sec.subtitle}
                          </p>
                          <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                            <input type="email" placeholder="example@gmail.com" disabled className="flex-1 bg-current/5 border border-current/10 rounded-full px-5 py-3 text-xs" />
                            <button
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => handleInlineTextSync(sec.id, 'buttonText', e.currentTarget.innerText)}
                              className="px-7 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-white transition-transform hover:scale-[1.02]"
                              style={{ backgroundColor: accent }}
                            >
                              {sec.buttonText || 'Subscribe'}
                            </button>
                          </div>
                        </div>
                      </section>
                    )}

                    {/* Footer Section */}
                    {sec.type === 'footer' && (
                      <footer className={`py-12 px-6 border-t ${currentTheme.border} ${currentTheme.innerCard}`}>
                        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                          <div>
                            <h3
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => handleInlineTextSync(sec.id, 'title', e.currentTarget.innerText)}
                              className="font-heading text-lg font-bold tracking-tight mb-1 cursor-text"
                            >
                              {sec.title}
                            </h3>
                            <p
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => handleInlineTextSync(sec.id, 'subtitle', e.currentTarget.innerText)}
                              className={`text-xs cursor-text ${currentTheme.muted}`}
                            >
                              {sec.subtitle}
                            </p>
                          </div>
                          <p className="text-[10px] opacity-50 font-medium">All rights reserved. Made with Webmers Website Maker.</p>
                        </div>
                      </footer>
                    )}

                  </div>
                );
              })}

            </div>
          </div>
        </main>

        {/* RIGHT PANEL: DESIGN SETTINGS & BLOCK ATTRIBUTES */}
        <aside className="w-68 border-l border-[#1f3d47]/10 bg-white/90 text-[#1f3d47] overflow-y-auto shrink-0 flex flex-col backdrop-blur-md">
          
          <div className="p-4 border-b border-[#1f3d47]/10 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#1f3d47]/60">
              {selectedSectionId ? 'Block Inspector' : 'Global Settings'}
            </span>
            {selectedSectionId && (
              <button
                onClick={() => setSelectedSectionId(null)}
                className="text-[10px] font-bold text-[#d9772b] hover:underline"
              >
                Close Block
              </button>
            )}
          </div>

          <div className="flex-1 p-4 space-y-6">
            
            {/* RENDER DYNAMIC SECTION PROPERTIES IF SELECTED */}
            {selectedSectionId && selectedSection ? (
              <div className="space-y-5">
                <div className="bg-[#f3efe8] border border-[#1f3d47]/10 rounded-2xl p-3.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold capitalize text-[#d9772b]">{selectedSection.type} block</span>
                    <button
                      onClick={() => removeSection(selectedSection.id)}
                      className="p-1 text-rose-500 hover:bg-rose-500/10 rounded"
                      title="Delete Block"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <p className="text-[10px] text-[#1f3d47]/60 leading-relaxed">
                    Double-click any text inside the canvas to edit directly, or use inputs below.
                  </p>
                </div>

                {/* Section Specific Input Fields */}
                <div className="space-y-4">
                  {selectedSection.badge !== undefined && (
                    <div>
                      <label className="text-[10px] text-[#1f3d47]/60 font-bold block mb-1.5 uppercase">Section Badge</label>
                      <input
                        type="text"
                        value={selectedSection.badge}
                        onChange={(e) => updateSelectedSectionField('badge', e.target.value)}
                        className="w-full bg-[#f3efe8] border border-[#1f3d47]/15 rounded-xl px-3 py-2 text-xs text-[#1f3d47] font-medium focus:outline-none focus:border-[#d9772b]"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] text-[#1f3d47]/60 font-bold block mb-1.5 uppercase">Block Headline</label>
                    <textarea
                      value={selectedSection.title}
                      onChange={(e) => updateSelectedSectionField('title', e.target.value)}
                      rows={2}
                      className="w-full bg-[#f3efe8] border border-[#1f3d47]/15 rounded-xl px-3 py-2 text-xs text-[#1f3d47] font-medium focus:outline-none focus:border-[#d9772b] resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-[#1f3d47]/60 font-bold block mb-1.5 uppercase">Block Subtitle</label>
                    <textarea
                      value={selectedSection.subtitle}
                      onChange={(e) => updateSelectedSectionField('subtitle', e.target.value)}
                      rows={4}
                      className="w-full bg-[#f3efe8] border border-[#1f3d47]/15 rounded-xl px-3 py-2 text-xs text-[#1f3d47] font-medium focus:outline-none focus:border-[#d9772b] resize-none"
                    />
                  </div>

                  {selectedSection.buttonText !== undefined && (
                    <div>
                      <label className="text-[10px] text-[#1f3d47]/60 font-bold block mb-1.5 uppercase">Button Text</label>
                      <input
                        type="text"
                        value={selectedSection.buttonText}
                        onChange={(e) => updateSelectedSectionField('buttonText', e.target.value)}
                        className="w-full bg-[#f3efe8] border border-[#1f3d47]/15 rounded-xl px-3 py-2 text-xs text-[#1f3d47] font-medium focus:outline-none focus:border-[#d9772b]"
                      />
                    </div>
                  )}

                  {selectedSection.items && selectedSection.items.length > 0 && (
                    <div className="space-y-4 pt-3 border-t border-[#1f3d47]/10">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-[#1f3d47]/60 tracking-wider">Configure Items List</span>
                        <button
                          onClick={() => {
                            const dummy = createDefaultSection(selectedSection.type);
                            const sampleItem = dummy.items?.[0] || { title: 'New Item', description: 'Item description text' };
                            updateSelectedSectionField('items', [...(selectedSection.items || []), sampleItem]);
                            showToast('Added list item');
                          }}
                          className="flex items-center gap-1 text-[10px] font-bold text-[#d9772b] bg-[#d9772b]/10 px-2 py-1 rounded"
                        >
                          <Plus size={10} /> Add Item
                        </button>
                      </div>

                      <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                        {selectedSection.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="bg-[#f3efe8] border border-[#1f3d47]/10 p-3 rounded-xl space-y-2.5 relative">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-mono text-[#1f3d47]/50 font-bold">Item #{itemIdx + 1}</span>
                              <button
                                onClick={() => {
                                  const filtered = (selectedSection.items || []).filter((_, ix) => ix !== itemIdx);
                                  updateSelectedSectionField('items', filtered);
                                  showToast('Removed list item');
                                }}
                                className="p-0.5 rounded text-rose-500 hover:bg-rose-500/10"
                                title="Remove Item"
                              >
                                <X size={10} />
                              </button>
                            </div>

                            {item.title !== undefined && (
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) => {
                                  const newItems = [...(selectedSection.items || [])];
                                  newItems[itemIdx] = { ...newItems[itemIdx], title: e.target.value };
                                  updateSelectedSectionField('items', newItems);
                                }}
                                className="w-full bg-white border border-[#1f3d47]/15 rounded-lg px-2 py-1 text-[11px] text-[#1f3d47] font-medium focus:outline-none"
                                placeholder="Item Title"
                              />
                            )}

                            {item.description !== undefined && (
                              <textarea
                                value={item.description}
                                onChange={(e) => {
                                  const newItems = [...(selectedSection.items || [])];
                                  newItems[itemIdx] = { ...newItems[itemIdx], description: e.target.value };
                                  updateSelectedSectionField('items', newItems);
                                }}
                                rows={2}
                                className="w-full bg-white border border-[#1f3d47]/15 rounded-lg px-2 py-1 text-[11px] text-[#1f3d47] font-medium focus:outline-none resize-none"
                                placeholder="Item Description"
                              />
                            )}

                            {item.value !== undefined && (
                              <input
                                type="text"
                                value={item.value}
                                onChange={(e) => {
                                  const newItems = [...(selectedSection.items || [])];
                                  newItems[itemIdx] = { ...newItems[itemIdx], value: e.target.value };
                                  updateSelectedSectionField('items', newItems);
                                }}
                                className="w-full bg-white border border-[#1f3d47]/15 rounded-lg px-2 py-1 text-[11px] text-[#1f3d47] font-medium focus:outline-none"
                                placeholder="Value (e.g. 50K+)"
                              />
                            )}

                            {item.label !== undefined && (
                              <input
                                type="text"
                                value={item.label}
                                onChange={(e) => {
                                  const newItems = [...(selectedSection.items || [])];
                                  newItems[itemIdx] = { ...newItems[itemIdx], label: e.target.value };
                                  updateSelectedSectionField('items', newItems);
                                }}
                                className="w-full bg-white border border-[#1f3d47]/15 rounded-lg px-2 py-1 text-[11px] text-[#1f3d47] font-medium focus:outline-none"
                                placeholder="Label"
                              />
                            )}

                            {item.name !== undefined && (
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => {
                                  const newItems = [...(selectedSection.items || [])];
                                  newItems[itemIdx] = { ...newItems[itemIdx], name: e.target.value };
                                  updateSelectedSectionField('items', newItems);
                                }}
                                className="w-full bg-white border border-[#1f3d47]/15 rounded-lg px-2 py-1 text-[11px] text-[#1f3d47] font-medium focus:outline-none"
                                placeholder="Name"
                              />
                            )}

                            {item.role !== undefined && (
                              <input
                                type="text"
                                value={item.role}
                                onChange={(e) => {
                                  const newItems = [...(selectedSection.items || [])];
                                  newItems[itemIdx] = { ...newItems[itemIdx], role: e.target.value };
                                  updateSelectedSectionField('items', newItems);
                                }}
                                className="w-full bg-white border border-[#1f3d47]/15 rounded-lg px-2 py-1 text-[11px] text-[#1f3d47] font-medium focus:outline-none"
                                placeholder="Role"
                              />
                            )}

                            {item.quote !== undefined && (
                              <textarea
                                value={item.quote}
                                onChange={(e) => {
                                  const newItems = [...(selectedSection.items || [])];
                                  newItems[itemIdx] = { ...newItems[itemIdx], quote: e.target.value };
                                  updateSelectedSectionField('items', newItems);
                                }}
                                rows={2}
                                className="w-full bg-white border border-[#1f3d47]/15 rounded-lg px-2 py-1 text-[11px] text-[#1f3d47] font-medium focus:outline-none resize-none"
                                placeholder="Customer feedback text"
                              />
                            )}

                            {item.plan !== undefined && (
                              <input
                                type="text"
                                value={item.plan}
                                onChange={(e) => {
                                  const newItems = [...(selectedSection.items || [])];
                                  newItems[itemIdx] = { ...newItems[itemIdx], plan: e.target.value };
                                  updateSelectedSectionField('items', newItems);
                                }}
                                className="w-full bg-white border border-[#1f3d47]/15 rounded-lg px-2 py-1 text-[11px] text-[#1f3d47] font-medium focus:outline-none"
                                placeholder="Plan Name"
                              />
                            )}

                            {item.price !== undefined && (
                              <input
                                type="text"
                                value={item.price}
                                onChange={(e) => {
                                  const newItems = [...(selectedSection.items || [])];
                                  newItems[itemIdx] = { ...newItems[itemIdx], price: e.target.value };
                                  updateSelectedSectionField('items', newItems);
                                }}
                                className="w-full bg-white border border-[#1f3d47]/15 rounded-lg px-2 py-1 text-[11px] text-[#1f3d47] font-medium focus:outline-none"
                                placeholder="Price"
                              />
                            )}

                            {item.q !== undefined && (
                              <input
                                type="text"
                                value={item.q}
                                onChange={(e) => {
                                  const newItems = [...(selectedSection.items || [])];
                                  newItems[itemIdx] = { ...newItems[itemIdx], q: e.target.value };
                                  updateSelectedSectionField('items', newItems);
                                }}
                                className="w-full bg-white border border-[#1f3d47]/15 rounded-lg px-2 py-1 text-[11px] text-[#1f3d47] font-medium focus:outline-none"
                                placeholder="Question text"
                              />
                            )}

                            {item.a !== undefined && (
                              <textarea
                                value={item.a}
                                onChange={(e) => {
                                  const newItems = [...(selectedSection.items || [])];
                                  newItems[itemIdx] = { ...newItems[itemIdx], a: e.target.value };
                                  updateSelectedSectionField('items', newItems);
                                }}
                                rows={2}
                                className="w-full bg-white border border-[#1f3d47]/15 rounded-lg px-2 py-1 text-[11px] text-[#1f3d47] font-medium focus:outline-none resize-none"
                                placeholder="Answer details"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            ) : (
              /* GLOBAL GENERAL SETTINGS */
              <div className="space-y-6">
                
                {/* Background Theme Preset */}
                <div>
                  <label className="text-[10px] text-[#1f3d47]/60 font-bold block mb-2 uppercase tracking-wider">Atmospheric Theme</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(THEMES) as ThemeKey[]).map((tKey) => {
                      const isActive = themeKey === tKey;
                      return (
                        <button
                          key={tKey}
                          onClick={() => setThemeKey(tKey)}
                          className={`px-2 py-2 rounded-xl border text-[11px] font-bold text-center transition-all ${
                            isActive
                              ? 'bg-[#1f3d47] text-white border-[#1f3d47] shadow-sm'
                              : 'bg-[#f3efe8] border-[#1f3d47]/10 text-[#1f3d47]/70 hover:bg-[#1f3d47]/10'
                          }`}
                        >
                          {THEMES[tKey].name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Typography Select */}
                <div>
                  <label className="text-[10px] text-[#1f3d47]/60 font-bold block mb-2 uppercase tracking-wider">Typography font</label>
                  <select
                    value={font}
                    onChange={(e) => setFont(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#f3efe8] border border-[#1f3d47]/15 text-xs text-[#1f3d47] font-bold focus:outline-none focus:border-[#d9772b]"
                  >
                    {Object.keys(FONTS).map((f) => (
                      <option key={f} value={f} className="bg-white text-[#1f3d47]">{f}</option>
                    ))}
                  </select>
                </div>

                {/* Accent Color Palettes */}
                <div>
                  <label className="text-[10px] text-[#1f3d47]/60 font-bold block mb-2 uppercase tracking-wider">Accent Color Shade</label>
                  <div className="flex flex-wrap gap-2">
                    {ACCENTS.map((color) => {
                      const isSelected = accent === color;
                      return (
                        <button
                          key={color}
                          onClick={() => setAccent(color)}
                          className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center shadow-xs ${
                            isSelected ? 'border-[#1f3d47] scale-105 ring-2 ring-[#d9772b]/50' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                          aria-label={`Select accent ${color}`}
                        >
                          {isSelected && <Check size={11} className={color === '#ffffff' ? 'text-black' : 'text-white'} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Reset template storage */}
                <div className="pt-4 border-t border-[#1f3d47]/10 space-y-3.5">
                  <div className="text-[10px] text-[#1f3d47]/50 uppercase tracking-widest font-bold">Workspace Health</div>
                  
                  <div className="bg-[#f3efe8] border border-[#1f3d47]/10 p-3 rounded-2xl">
                    <p className="text-[11px] text-[#1f3d47]/70 leading-relaxed mb-2.5">
                      Want to scrap the current layout design and revert to standard Webmers default template?
                    </p>
                    <button
                      onClick={() => {
                        if (confirm('Revert all customizations back to template defaults? All text drafts will be cleared.')) {
                          localStorage.removeItem('webmers_website_maker_data_v3');
                          setPages(INITIAL_PAGES);
                          setThemeKey('WanderWarm');
                          setAccent('#d9772b');
                          setFont('Outfit');
                          setSiteTitle('My Custom Site');
                          setActivePageId('home');
                          showToast('Workspace reset to standard template');
                        }
                      }}
                      className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/20 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                    >
                      Reset Workspace Layout
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Bottom dynamic pricing checkout box */}
          <div className="p-4 border-t border-[#1f3d47]/10 bg-white space-y-3">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-[#1f3d47]/60">Accumulated Cost</span>
              <span className="font-bold text-[#d9772b] text-sm">${totalPrice}</span>
            </div>
            
            <button
              onClick={() => {
                setCheckoutStep('details');
                setIsCheckoutOpen(true);
              }}
              className="w-full py-3 rounded-xl bg-[#d9772b] hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all uppercase tracking-wider shadow-sm"
            >
              <Code size={13} /> Unlock Site Codebase
            </button>
          </div>
        </aside>
      </div>

      {/* COMPONENT STORE MODAL */}
      {isAddingSection && (
        <div className="fixed inset-0 z-50 bg-[#1f3d47]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#f3efe8] border border-[#1f3d47]/20 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-up text-[#1f3d47]">
            <div className="p-5 border-b border-[#1f3d47]/10 flex items-center justify-between bg-white/50">
              <div>
                <h3 className="text-sm font-bold font-heading tracking-tight">Content Section Catalog</h3>
                <p className="text-[11px] text-[#1f3d47]/60">Select a section block below to insert into your live webpage layout</p>
              </div>
              <button
                onClick={() => setIsAddingSection(false)}
                className="p-1.5 rounded-full hover:bg-[#1f3d47]/10 text-[#1f3d47]/60 hover:text-[#1f3d47]"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[380px] overflow-y-auto">
              {SECTION_LIBRARY.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.type}
                    onClick={() => appendSection(item.type)}
                    className="flex items-start gap-4 p-4 rounded-2xl border border-[#1f3d47]/10 bg-white/80 hover:bg-white hover:border-[#d9772b]/40 text-left transition-all group shadow-xs"
                  >
                    <div className="p-2.5 rounded-xl bg-[#d9772b]/10 text-[#d9772b] group-hover:bg-[#d9772b] group-hover:text-white transition-colors shrink-0">
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1f3d47] font-heading">{item.name}</h4>
                      <p className="text-[10px] text-[#1f3d47]/60 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CODE UNLOCK CHECKOUT MODAL FLOW */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-[#1f3d47]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#f3efe8] border border-[#1f3d47]/20 rounded-3xl w-full max-w-xl shadow-2xl animate-fade-up overflow-hidden text-[#1f3d47]">
            
            <div className="p-5 border-b border-[#1f3d47]/10 flex items-center justify-between bg-white/50">
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-[#d9772b]" />
                <h3 className="text-xs font-bold tracking-tight uppercase font-heading">Unlock Website Source Code</h3>
              </div>
              {checkoutStep !== 'processing' && (
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="p-1.5 rounded-full hover:bg-[#1f3d47]/10 text-[#1f3d47]/60 hover:text-[#1f3d47]"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* STEP 1: BILLING DETAILS & ORDER PREVIEW */}
            {checkoutStep === 'details' && (
              <div className="p-6 space-y-6">
                
                <div className="bg-white/80 border border-[#1f3d47]/10 rounded-2xl p-4 space-y-3">
                  <div className="text-[10px] text-[#1f3d47]/50 uppercase tracking-widest font-bold">Compiled Web Spec</div>
                  
                  <div className="space-y-2 text-xs font-medium">
                    <div className="flex justify-between text-[#1f3d47]/70">
                      <span>Base platform fee</span>
                      <span>${basePrice}</span>
                    </div>
                    <div className="flex justify-between text-[#1f3d47]/70">
                      <span>Designed pages ({pageCount})</span>
                      <span>+${pagesCharge}</span>
                    </div>
                    <div className="flex justify-between text-[#1f3d47]/70">
                      <span>Interactive layout blocks ({totalSectionsCount})</span>
                      <span>+${sectionsCharge}</span>
                    </div>
                    <div className="flex justify-between text-[#1f3d47]/70">
                      <span>Premium customization surcharge</span>
                      <span>+${designPremiumCharge}</span>
                    </div>
                    <div className="border-t border-[#1f3d47]/10 pt-2.5 flex justify-between items-center text-sm font-bold">
                      <span className="text-[#1f3d47]">Amount due for source code</span>
                      <span className="text-[#d9772b]">${totalPrice} <span className="text-[10px] text-[#1f3d47]/50 font-normal">(₹{inrPrice})</span></span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#1f3d47]/70 mb-1.5 uppercase tracking-wider">Deliver code to (Email Address)</label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      required
                      placeholder="your.gmail@gmail.com"
                      className="w-full bg-white border border-[#1f3d47]/15 rounded-xl px-3 py-2.5 text-xs text-[#1f3d47] placeholder-[#1f3d47]/40 focus:outline-none focus:border-[#d9772b] font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#1f3d47]/70 mb-1.5 uppercase tracking-wider">Payment Method</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setPaymentMethod('card')}
                        className={`py-2 rounded-xl text-xs font-bold border text-center transition-all ${
                          paymentMethod === 'card' ? 'bg-[#d9772b] border-[#d9772b] text-white' : 'bg-white border-[#1f3d47]/10 text-[#1f3d47]/70'
                        }`}
                      >
                        Credit/Debit Card
                      </button>
                      <button
                        onClick={() => setPaymentMethod('upi')}
                        className={`py-2 rounded-xl text-xs font-bold border text-center transition-all ${
                          paymentMethod === 'upi' ? 'bg-[#d9772b] border-[#d9772b] text-white' : 'bg-white border-[#1f3d47]/10 text-[#1f3d47]/70'
                        }`}
                      >
                        UPI / QR Code
                      </button>
                    </div>
                  </div>

                  {paymentMethod === 'card' ? (
                    <div className="grid grid-cols-3 gap-2 bg-white/80 border border-[#1f3d47]/10 p-3 rounded-2xl">
                      <div className="col-span-3">
                        <label className="block text-[9px] font-bold text-[#1f3d47]/60 mb-1">Card Number</label>
                        <input type="text" placeholder="4242 •••• •••• 4242" disabled className="w-full bg-[#f3efe8] border border-[#1f3d47]/10 rounded-xl px-2.5 py-2 text-[11px] text-[#1f3d47]/60" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-[#1f3d47]/60 mb-1">Expiry</label>
                        <input type="text" placeholder="12/29" disabled className="w-full bg-[#f3efe8] border border-[#1f3d47]/10 rounded-xl px-2.5 py-2 text-[11px] text-[#1f3d47]/60" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-[#1f3d47]/60 mb-1">CVC</label>
                        <input type="text" placeholder="•••" disabled className="w-full bg-[#f3efe8] border border-[#1f3d47]/10 rounded-xl px-2.5 py-2 text-[11px] text-[#1f3d47]/60" />
                      </div>
                      <div className="flex items-end text-[10px] text-[#d9772b] pb-1.5 font-bold">
                        Sandbox Verified
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-white/80 border border-[#1f3d47]/10 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-[#1f3d47]/60 block">UPI QR Payment</span>
                        <span className="text-xs text-[#1f3d47] font-semibold font-mono">webmers.pay@upi</span>
                      </div>
                      <span className="text-[10px] font-bold text-[#d9772b] bg-[#d9772b]/10 px-2 py-1 rounded">
                        Secure Redirect Supported
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={triggerSimulatedPayment}
                  className="w-full py-4 rounded-xl bg-[#d9772b] hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md"
                >
                  Pay &amp; Authorize Code Delivery (${totalPrice})
                </button>
              </div>
            )}

            {/* STEP 2: PROCESSING SIMULATION */}
            {checkoutStep === 'processing' && (
              <div className="p-12 text-center flex flex-col items-center justify-center space-y-6">
                <RefreshCw className="animate-spin text-[#d9772b]" size={32} />
                <div className="space-y-2">
                  <h4 className="text-sm font-bold tracking-tight uppercase font-heading">Building Your Web Package</h4>
                  <p className="text-xs text-[#1f3d47]/60">Compiling interactive files, variables, and styling...</p>
                </div>
                <div className="w-full bg-[#1f3d47] text-white border border-[#1f3d47]/20 rounded-xl p-3 font-mono text-[10px] text-[#7bb5cc] text-left h-24 overflow-y-auto leading-relaxed">
                  &gt; {processingLog}
                </div>
              </div>
            )}

            {/* STEP 3: SUCCESS & DOWNLOAD SCREEN */}
            {checkoutStep === 'success' && (
              <div className="p-6 space-y-6 text-center">
                <div className="w-12 h-12 bg-[#d9772b]/10 text-[#d9772b] rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle size={28} />
                </div>
                
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold tracking-tight uppercase font-heading">Payment Complete &amp; Code Unlocked!</h4>
                  <p className="text-xs text-[#1f3d47]/60">
                    A copy of your multi-page SPA code package has been generated successfully.
                  </p>
                </div>

                <div className="bg-white/80 border border-[#1f3d47]/10 rounded-2xl p-4 space-y-3.5 text-left">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-[#1f3d47]/50 uppercase tracking-widest">
                    <FileText size={12} /> Deliverables included in package
                  </div>
                  
                  <div className="space-y-2.5 text-xs text-[#1f3d47] font-semibold">
                    <div className="flex items-center gap-2">
                      <Check size={12} className="text-[#d9772b]" />
                      <span>Single-File Interactive Multi-page SPA index.html</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check size={12} className="text-[#d9772b]" />
                      <span>Full responsive layouts for mobile, tablet, and widescreen monitors</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check size={12} className="text-[#d9772b]" />
                      <span>Compiled Tailwind CSS styling and theme fonts</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={downloadCompiledCode}
                    className="py-3.5 rounded-xl bg-[#d9772b] hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md"
                  >
                    <Download size={14} /> Download Site Code
                  </button>
                  <button
                    onClick={() => setIsCheckoutOpen(false)}
                    className="py-3.5 rounded-xl bg-white hover:bg-[#f3efe8] text-[#1f3d47] font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-all border border-[#1f3d47]/15"
                  >
                    Return to Builder
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* PSD AI — Visual Editor Live Connection */}
      {pages.length > 0 && (
        <EditorAI
          editorState={{
            pages,
            activePageId,
            selectedSectionId,
            themeKey,
            accent,
            font,
            siteTitle,
          }}
          onApplyActions={applyAIActions}
        />
      )}

      {/* Dynamic Toast feedback */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-[#1f3d47] text-white text-xs font-bold shadow-xl animate-fade-up">
          {toast}
        </div>
      )}

    </div>
  );
}

export default function OverhauledEditorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f3efe8] flex items-center justify-center text-[#1f3d47]"><div className="text-sm">Loading PSD Editor...</div></div>}>
      <OverhauledEditorPageInner />
    </Suspense>
  );
}

// ----------------------------------------------------
// FULL CODE SERIALIZATION SYSTEM FOR COMPILATION
// ----------------------------------------------------
function generateFullWebsiteHTML(
  pages: Page[],
  currentThemeKey: ThemeKey,
  accentColor: string,
  fontFamily: string,
  siteTitle: string
) {
  const currentTheme = THEMES[currentThemeKey];

  let fontImport = '';
  let fontCSS = '';
  if (fontFamily === 'Outfit') {
    fontImport = '<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">';
    fontCSS = "font-family: 'Outfit', sans-serif;";
  } else if (fontFamily === 'Serif') {
    fontImport = '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">';
    fontCSS = "font-family: 'Playfair Display', serif;";
  } else if (fontFamily === 'Inter') {
    fontImport = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">';
    fontCSS = "font-family: 'Inter', sans-serif;";
  } else {
    fontCSS = "font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;";
  }

  let themeBgClass = '';
  let themeInnerCardClass = '';
  let themeBorderClass = '';
  let themeMutedClass = '';

  if (currentThemeKey === 'WanderWarm') {
    themeBgClass = 'bg-[#f3efe8] text-[#1f3d47]';
    themeInnerCardClass = 'bg-white/90 border-[#1f3d47]/10';
    themeBorderClass = 'border-[#1f3d47]/15';
    themeMutedClass = 'text-[#2a3b45]';
  } else if (currentThemeKey === 'WanderBlue') {
    themeBgClass = 'bg-[#7bb5cc] text-[#1f3d47]';
    themeInnerCardClass = 'bg-white/90 border-[#1f3d47]/10';
    themeBorderClass = 'border-[#1f3d47]/15';
    themeMutedClass = 'text-[#1f3d47]/80';
  } else if (currentThemeKey === 'WanderDark') {
    themeBgClass = 'bg-[#1f3d47] text-[#f3efe8]';
    themeInnerCardClass = 'bg-white/5 border-white/10';
    themeBorderClass = 'border-white/15';
    themeMutedClass = 'text-[#f3efe8]/70';
  } else if (currentThemeKey === 'Dawn') {
    themeBgClass = 'bg-gradient-to-b from-[#1c1124] via-[#3a1d35] to-[#5c1e29] text-white';
    themeInnerCardClass = 'bg-white/5 border-white/5 backdrop-blur-sm';
    themeBorderClass = 'border-white/10';
    themeMutedClass = 'text-white/70';
  } else if (currentThemeKey === 'EmeraldForest') {
    themeBgClass = 'bg-gradient-to-b from-[#020905] via-[#05170d] to-[#0b2416] text-[#ecfdf5]';
    themeInnerCardClass = 'bg-emerald-950/30 border-emerald-500/5';
    themeBorderClass = 'border-emerald-500/10';
    themeMutedClass = 'text-[#ecfdf5]/70';
  }

  const pagesHTML = pages.map((p, pIdx) => {
    const isFirst = pIdx === 0;

    const sectionsHTML = p.sections.map(s => {
      switch (s.type) {
        case 'hero':
          return `
            <section class="relative min-h-[60vh] flex flex-col items-center justify-center px-8 py-24 text-center">
              <div class="max-w-3xl mx-auto">
                ${s.badge ? `<span class="inline-block px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full mb-6" style="background-color: ${accentColor}20; color: ${accentColor}; border: 1px solid ${accentColor}40;">${s.badge}</span>` : ''}
                <h1 class="text-4xl md:text-6xl font-medium tracking-tight mb-6 leading-[1.05]">${s.title}</h1>
                <p class="text-lg md:text-xl ${themeMutedClass} font-normal mb-8 max-w-xl mx-auto leading-relaxed">${s.subtitle}</p>
                <div class="flex justify-center gap-4">
                  ${(s.buttons || []).map(b => `
                    <a href="${b.link}" class="px-8 py-4 rounded-full font-bold uppercase tracking-wider text-xs transition-all transform hover:scale-[1.02] shadow-sm text-center" style="background-color: ${accentColor}; color: #ffffff;">
                      ${b.text}
                    </a>
                  `).join('')}
                </div>
              </div>
            </section>
          `;
        case 'features':
          return `
            <section class="py-24 px-8 border-t ${themeBorderClass}">
              <div class="max-w-6xl mx-auto text-center mb-16">
                <h2 class="text-3xl md:text-5xl font-medium mb-4">${s.title}</h2>
                <p class="text-lg ${themeMutedClass} max-w-2xl mx-auto">${s.subtitle}</p>
              </div>
              <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                ${(s.items || []).map(item => `
                  <div class="p-8 rounded-2xl border transition-all ${themeInnerCardClass}">
                    <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style="background-color: ${accentColor}15; color: ${accentColor};">
                      <i class="fa-solid fa-cube text-xl"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-3">${item.title}</h3>
                    <p class="${themeMutedClass} text-sm leading-relaxed">${item.description}</p>
                  </div>
                `).join('')}
              </div>
            </section>
          `;
        case 'stats':
          return `
            <section class="py-16 px-8 border-y ${themeBorderClass} ${themeInnerCardClass}">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto text-center">
                ${(s.items || []).map(item => `
                  <div>
                    <div class="text-3xl md:text-5xl font-bold mb-2" style="color: ${accentColor};">${item.value}</div>
                    <div class="text-xs ${themeMutedClass} uppercase tracking-widest font-bold">${item.label}</div>
                  </div>
                `).join('')}
              </div>
            </section>
          `;
        case 'testimonials':
          return `
            <section class="py-24 px-8 border-t ${themeBorderClass}">
              <div class="max-w-6xl mx-auto text-center mb-16">
                <h2 class="text-3xl md:text-5xl font-medium mb-4">${s.title}</h2>
                <p class="text-lg ${themeMutedClass} max-w-2xl mx-auto">${s.subtitle}</p>
              </div>
              <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                ${(s.items || []).map(item => `
                  <div class="p-8 rounded-2xl border ${themeInnerCardClass} relative">
                    <p class="${themeMutedClass} italic text-lg mb-6 leading-relaxed">"${item.quote}"</p>
                    <div class="flex items-center gap-4">
                      <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white" style="background-color: ${accentColor};">
                        ${(item.name || 'U').charAt(0)}
                      </div>
                      <div>
                        <h4 class="font-bold text-sm">${item.name}</h4>
                        <p class="text-xs opacity-60">${item.role}</p>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </section>
          `;
        case 'pricing':
          return `
            <section class="py-24 px-8 border-t ${themeBorderClass}">
              <div class="max-w-6xl mx-auto text-center mb-16">
                <h2 class="text-3xl md:text-5xl font-medium mb-4">${s.title}</h2>
                <p class="text-lg ${themeMutedClass} max-w-2xl mx-auto">${s.subtitle}</p>
              </div>
              <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                ${(s.items || []).map((item, idx) => `
                  <div class="p-8 rounded-2xl border flex flex-col justify-between transition-all ${idx === 1 ? 'border-2 scale-105 shadow-md' : themeInnerCardClass}" style="${idx === 1 ? `border-color: ${accentColor};` : ''}">
                    <div>
                      ${idx === 1 ? `<span class="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full mb-4 text-white" style="background-color: ${accentColor};">MOST POPULAR</span>` : ''}
                      <h3 class="text-2xl font-bold mb-2">${item.plan}</h3>
                      <p class="opacity-60 text-sm mb-6">${item.desc}</p>
                      <div class="text-4xl font-bold mb-6" style="color: ${accentColor};">${item.price}</div>
                      <ul class="space-y-3 mb-8">
                        ${(item.features || []).map(f => `
                          <li class="flex items-center gap-3 text-sm">
                            <i class="fa-solid fa-check text-xs" style="color: ${accentColor};"></i>
                            <span class="opacity-80">${f}</span>
                          </li>
                        `).join('')}
                      </ul>
                    </div>
                    <button class="w-full py-3.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all" style="background-color: ${idx === 1 ? accentColor : 'transparent'}; color: ${idx === 1 ? '#ffffff' : 'inherit'}; border: 2px solid ${accentColor};">
                      Get Started
                    </button>
                  </div>
                `).join('')}
              </div>
            </section>
          `;
        case 'contact':
          return `
            <section class="py-24 px-8 border-t ${themeBorderClass}">
              <div class="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                <div>
                  <h2 class="text-3xl md:text-5xl font-medium mb-4">${s.title}</h2>
                  <p class="text-lg ${themeMutedClass} mb-8 leading-relaxed">${s.subtitle}</p>
                  <div class="space-y-6">
                    <div class="flex items-center gap-4">
                      <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background-color: ${accentColor}15; color: ${accentColor};">
                        <i class="fa-solid fa-envelope"></i>
                      </div>
                      <span class="${themeMutedClass}">contact@yourbrand.com</span>
                    </div>
                    <div class="flex items-center gap-4">
                      <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background-color: ${accentColor}15; color: ${accentColor};">
                        <i class="fa-solid fa-location-dot"></i>
                      </div>
                      <span class="${themeMutedClass}">742 Creative Way, Design District, San Francisco</span>
                    </div>
                  </div>
                </div>
                <div class="p-8 rounded-2xl border ${themeInnerCardClass}">
                  <form class="space-y-4">
                    <div>
                      <label class="block text-xs font-semibold mb-2 opacity-60 uppercase">Full Name</label>
                      <input type="text" class="w-full px-4 py-3 rounded-xl bg-transparent border ${themeBorderClass} focus:outline-none" style="border-color: ${accentColor}30; color: inherit;" placeholder="John Doe" />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold mb-2 opacity-60 uppercase">Email Address</label>
                      <input type="email" class="w-full px-4 py-3 rounded-xl bg-transparent border ${themeBorderClass} focus:outline-none" style="border-color: ${accentColor}30; color: inherit;" placeholder="john@example.com" />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold mb-2 opacity-60 uppercase">Message</label>
                      <textarea rows="4" class="w-full px-4 py-3 rounded-xl bg-transparent border ${themeBorderClass} focus:outline-none" style="border-color: ${accentColor}30; color: inherit;" placeholder="How can we help?"></textarea>
                    </div>
                    <button type="button" class="w-full py-3.5 rounded-full text-xs font-bold uppercase tracking-wider text-white transition-all" style="background-color: ${accentColor};">
                      Send Message
                    </button>
                  </form>
                </div>
              </div>
            </section>
          `;
        case 'faq':
          return `
            <section class="py-24 px-8 border-t ${themeBorderClass} ${themeInnerCardClass}">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-16">
                  <h2 class="text-3xl md:text-5xl font-medium mb-4">${s.title}</h2>
                  <p class="text-lg ${themeMutedClass}">${s.subtitle}</p>
                </div>
                <div class="space-y-4">
                  ${(s.items || []).map(item => `
                    <div class="p-6 rounded-xl border ${themeInnerCardClass}">
                      <h4 class="font-bold text-lg mb-2">${item.q}</h4>
                      <p class="${themeMutedClass} text-sm leading-relaxed">${item.a}</p>
                    </div>
                  `).join('')}
                </div>
              </div>
            </section>
          `;
        case 'team':
          return `
            <section class="py-24 px-8 border-t ${themeBorderClass}">
              <div class="max-w-6xl mx-auto text-center mb-16">
                <h2 class="text-3xl md:text-5xl font-medium mb-4">${s.title}</h2>
                <p class="text-lg ${themeMutedClass} max-w-2xl mx-auto">${s.subtitle}</p>
              </div>
              <div class="grid sm:grid-cols-3 gap-8 max-w-5xl mx-auto">
                ${(s.items || []).map(item => `
                  <div class="p-8 rounded-2xl border text-center ${themeInnerCardClass}">
                    <div class="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-2xl font-bold text-white shadow-sm" style="background-color: ${accentColor};">
                      ${(item.name || 'T').charAt(0)}
                    </div>
                    <h4 class="font-bold text-lg">${item.name}</h4>
                    <p class="text-xs opacity-60 mt-1">${item.role}</p>
                  </div>
                `).join('')}
              </div>
            </section>
          `;
        case 'portfolio':
          return `
            <section class="py-24 px-8 border-t ${themeBorderClass}">
              <div class="max-w-6xl mx-auto text-center mb-16">
                <h2 class="text-3xl md:text-5xl font-medium mb-4">${s.title}</h2>
                <p class="text-lg ${themeMutedClass} max-w-2xl mx-auto">${s.subtitle}</p>
              </div>
              <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                ${(s.items || []).map(item => `
                  <div class="rounded-2xl overflow-hidden border ${themeInnerCardClass} transition-all">
                    <div class="h-48 flex items-center justify-center relative overflow-hidden bg-current/10">
                      <i class="fa-solid fa-image text-4xl opacity-30"></i>
                    </div>
                    <div class="p-6">
                      <span class="text-xs font-semibold tracking-wider uppercase opacity-50 mb-1 block">${item.category}</span>
                      <h4 class="font-bold text-lg">${item.title}</h4>
                    </div>
                  </div>
                `).join('')}
              </div>
            </section>
          `;
        case 'newsletter':
          return `
            <section class="py-24 px-8 border-t ${themeBorderClass}">
              <div class="max-w-3xl mx-auto p-12 rounded-3xl border text-center ${themeInnerCardClass}">
                <h2 class="text-3xl font-medium mb-4">${s.title}</h2>
                <p class="text-base ${themeMutedClass} mb-8 max-w-md mx-auto">${s.subtitle}</p>
                <form class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input type="email" class="flex-1 px-5 py-3.5 rounded-full bg-transparent border ${themeBorderClass} focus:outline-none" style="border-color: ${accentColor}40; color: inherit;" placeholder="Enter your email" />
                  <button type="button" class="px-8 py-3.5 rounded-full font-bold uppercase tracking-wider text-xs text-white transition-all" style="background-color: ${accentColor};">
                    ${s.buttonText || 'Subscribe'}
                  </button>
                </form>
              </div>
            </section>
          `;
        case 'footer':
          return `
            <footer class="py-16 px-8 border-t ${themeBorderClass} ${themeInnerCardClass}">
              <div class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <h3 class="text-2xl font-bold tracking-tight mb-2">${s.title}</h3>
                  <p class="text-sm ${themeMutedClass} max-w-md">${s.subtitle}</p>
                </div>
                <p class="text-xs opacity-50">All rights reserved. Designed with Webmers Website Maker.</p>
              </div>
            </footer>
          `;
        default:
          return '';
      }
    }).join('');

    return `
      <div id="page-${p.id}" class="webmers-page-container ${isFirst ? '' : 'hidden'} min-h-screen">
        ${sectionsHTML}
      </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${siteTitle}</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Font Awesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    ${fontImport}
    <style>
        body {
            ${fontCSS}
        }
        .webmers-page-container {
            transition: opacity 0.2s ease-in-out;
        }
    </style>
</head>
<body class="${themeBgClass} min-h-screen selection:bg-[${accentColor}]/30">

    <!-- Sticky Navigation Header -->
    <header class="sticky top-0 z-50 backdrop-blur-md border-b ${themeBorderClass} bg-transparent py-5 px-6 md:px-12 flex items-center justify-between">
        <div class="font-bold text-xl tracking-tight" style="color: ${accentColor};">${siteTitle}</div>
        
        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-8">
            ${pages.map(p => `
                <a href="#page-${p.id}" onclick="showPage('${p.id}'); event.preventDefault();" class="text-sm font-bold tracking-wider uppercase opacity-85 hover:opacity-100 transition-colors py-1 hover:border-b-2" style="border-color: ${accentColor};">${p.name}</a>
            `).join('')}
        </nav>
        
        <!-- Mobile menu toggle -->
        <div class="md:hidden">
            <button onclick="toggleMobileMenu()" class="opacity-80 hover:opacity-100 py-1" style="color: ${accentColor};">
                <i class="fa-solid fa-bars text-2xl"></i>
            </button>
        </div>
    </header>

    <!-- Mobile Navigation Drawer -->
    <div id="mobile-drawer" class="hidden fixed inset-0 z-40 bg-[#1f3d47]/90 backdrop-blur-md flex flex-col justify-center items-center gap-8 text-white">
        <button onclick="toggleMobileMenu()" class="absolute top-6 right-6 text-2xl opacity-80 hover:opacity-100">
            <i class="fa-solid fa-xmark"></i>
        </button>
        ${pages.map(p => `
            <a href="#page-${p.id}" onclick="showPage('${p.id}'); toggleMobileMenu(); event.preventDefault();" class="text-2xl font-bold uppercase tracking-widest hover:opacity-100 transition-colors" style="color: ${accentColor};">${p.name}</a>
        `).join('')}
    </div>

    <!-- Main Content Pages -->
    <main>
        ${pagesHTML}
    </main>

    <!-- SPA Client-Side Router Script -->
    <script>
        function showPage(pageId) {
            const pages = document.querySelectorAll('.webmers-page-container');
            pages.forEach(p => p.classList.add('hidden'));
            
            const activePage = document.getElementById('page-' + pageId);
            if (activePage) {
                activePage.classList.remove('hidden');
                activePage.style.opacity = 0;
                setTimeout(() => {
                    activePage.style.opacity = 1;
                }, 50);
            }
            
            const links = document.querySelectorAll('nav a');
            links.forEach(l => {
                const href = l.getAttribute('href');
                if (href === '#page-' + pageId) {
                    l.style.opacity = '1';
                    l.style.borderBottomWidth = '2px';
                } else {
                    l.style.opacity = '0.7';
                    l.style.borderBottomWidth = '0px';
                }
            });
        }

        function toggleMobileMenu() {
            const drawer = document.getElementById('mobile-drawer');
            if (drawer.classList.contains('hidden')) {
                drawer.classList.remove('hidden');
            } else {
                drawer.classList.add('hidden');
            }
        }

        window.onload = function() {
            showPage('${pages[0]?.id || "home"}');
        }
    </script>
</body>
</html>`;
}
