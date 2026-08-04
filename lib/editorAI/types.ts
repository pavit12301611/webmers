export type ThemeKey = 'WanderWarm' | 'WanderBlue' | 'WanderDark' | 'Dawn' | 'EmeraldForest';
export type SectionType =
  | 'hero'
  | 'features'
  | 'stats'
  | 'testimonials'
  | 'pricing'
  | 'contact'
  | 'faq'
  | 'team'
  | 'portfolio'
  | 'newsletter'
  | 'footer';

export type Device = 'desktop' | 'tablet' | 'mobile';

export interface ButtonConfig {
  text: string;
  link: string;
  type: 'primary' | 'secondary';
}

export interface ItemConfig {
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

export interface SectionInstance {
  id: string;
  type: SectionType;
  title: string;
  subtitle: string;
  badge?: string;
  buttons?: ButtonConfig[];
  items?: ItemConfig[];
  buttonText?: string;
  emailPlaceholder?: string;
}

export interface Page {
  id: string;
  name: string;
  sections: SectionInstance[];
}

export interface EditorState {
  pages: Page[];
  activePageId: string;
  selectedSectionId: string | null;
  themeKey: ThemeKey;
  accent: string;
  font: string;
  siteTitle: string;
}

export type EditorAction =
  | { type: 'setSiteTitle'; title: string }
  | { type: 'setTheme'; theme: ThemeKey }
  | { type: 'setAccent'; accent: string }
  | { type: 'setFont'; font: string }
  | { type: 'setDevice'; device: Device }
  | { type: 'addPage'; pageName: string; pageId?: string }
  | { type: 'deletePage'; pageId: string }
  | { type: 'renamePage'; pageId: string; newName: string }
  | { type: 'switchPage'; pageId: string }
  | { type: 'addSection'; pageId: string; sectionType: SectionType }
  | { type: 'removeSection'; pageId: string; sectionId: string }
  | { type: 'duplicateSection'; pageId: string; sectionId: string }
  | { type: 'moveSection'; pageId: string; sectionId: string; direction: 'up' | 'down' }
  | { type: 'updateSection'; pageId: string; sectionId: string; field: 'title' | 'subtitle' | 'badge' | 'buttonText'; value: string }
  | { type: 'updateSectionButton'; pageId: string; sectionId: string; buttonIndex: number; field: 'text' | 'link' | 'type'; value: string }
  | { type: 'updateSectionItem'; pageId: string; sectionId: string; itemIndex: number; field: keyof ItemConfig; value: string }
  | { type: 'addSectionItem'; pageId: string; sectionId: string }
  | { type: 'removeSectionItem'; pageId: string; sectionId: string; itemIndex: number }
  | { type: 'clearSelection' };

export interface ParseResult {
  actions: EditorAction[];
  reply: string;
  intent: string;
  confidence: number;
}
