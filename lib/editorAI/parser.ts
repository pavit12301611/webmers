import { EditorAction, EditorState, ParseResult, SectionType, ThemeKey } from './types';
import { detectSectionTypes, generatePageId, mapColorNameToHex } from './defaults';

function stripQuotes(s: string): string {
  return s.trim().replace(/^["'`]+|["'`]+$/g, '').trim();
}

function extractAfterTo(message: string): string | null {
  // capture everything after "to", "as", "called", "=" etc.
  const patterns = [
    /(?:to|as|called|named|=)\s+["']?([^"'\n]{1,120}?)["']?\s*$/i,
    /(?:to|as|called|named|=)\s+["']?([^"'\n]{1,120})/i,
  ];
  for (const p of patterns) {
    const m = message.match(p);
    if (m && m[1]) {
      // avoid capturing very long trailing junk after like "to home page and also..."
      let val = m[1].trim();
      // If phrase contains " and " remove after
      // but for titles we want full. Only trim if it's clearly an extra clause for addSection.
      // We'll not cut for site title case separately.
      return stripQuotes(val);
    }
  }
  return null;
}

function extractTitleValue(message: string): string {
  // Try to get value after "to" quote
  const after = extractAfterTo(message);
  if (after) return after;
  // fallback: after first colon
  const colonIdx = message.indexOf(':');
  if (colonIdx > -1) return stripQuotes(message.slice(colonIdx + 1));
  return '';
}

function resolvePageIdByName(pages: EditorState['pages'], nameOrId: string): string | null {
  if (!nameOrId) return null;
  const normalized = nameOrId.toLowerCase().trim();
  // exact id match
  const byId = pages.find((p) => p.id.toLowerCase() === normalized);
  if (byId) return byId.id;
  // exact name match
  const byName = pages.find((p) => p.name.toLowerCase() === normalized);
  if (byName) return byName.id;
  // includes
  const includes = pages.find((p) => p.name.toLowerCase().includes(normalized) || normalized.includes(p.name.toLowerCase()));
  if (includes) return includes.id;
  // try id generation and match
  const gen = generatePageId(normalized);
  const byGen = pages.find((p) => p.id === gen);
  if (byGen) return byGen.id;
  return null;
}

function detectTargetPage(message: string, state: EditorState): string {
  const lower = message.toLowerCase();
  // look for "to X page" or "in X page" or "on X page"
  const pageMatch = message.match(/(?:to|in|on|for)\s+(?:the\s+)?([a-z0-9\s\-]+?)\s+page/i);
  if (pageMatch && pageMatch[1]) {
    const candidate = pageMatch[1].trim();
    // ignore common words like "home page" is valid
    const resolved = resolvePageIdByName(state.pages, candidate);
    if (resolved) return resolved;
    // If user says "new page" don't treat as target
    if (!['new', 'a', 'the'].includes(candidate.toLowerCase())) {
      // If not resolved, but user is adding page, we should not fallback to it as target
      // If adding section context, treat candidate as target page name possibly not existing
      // Only return if existing; else keep active
      // For add page, we don't want this to be target
    }
  }
  // also "home page", "about page" without preposition?
  const simplePageMentions = [
    /home\s+page/i,
    /about\s+page/i,
    /contact\s+page/i,
    /services?\s+page/i,
  ];
  // We'll scan known page names in message
  for (const p of state.pages) {
    if (lower.includes(p.name.toLowerCase()) || lower.includes(p.id.toLowerCase())) {
      // Ensure it's not part of add page creation itself? We'll allow.
      // Prioritize explicit mention
      // If message is "add page services", we don't want target to be services (which doesn't exist yet)
      // But if adding section "add pricing to services page", we want to detect services
      if (lower.includes(`to ${p.name.toLowerCase()}`) || lower.includes(`in ${p.name.toLowerCase()}`) || lower.includes(`${p.name.toLowerCase()} page`)) {
        return p.id;
      }
    }
  }
  return state.activePageId;
}

function detectSectionByTypeInPage(
  state: EditorState,
  pageId: string,
  sectionType?: SectionType,
  fallbackToSelected = true
): string | null {
  const page = state.pages.find((p) => p.id === pageId);
  if (!page) return null;
  if (fallbackToSelected && state.selectedSectionId) {
    // If user didn't specify type, use selected
    if (!sectionType) return state.selectedSectionId;
    // If selected section matches requested type, use it
    const sel = page.sections.find((s) => s.id === state.selectedSectionId);
    if (sel && sel.type === sectionType) return sel.id;
  }
  if (sectionType) {
    const found = page.sections.find((s) => s.type === sectionType);
    return found?.id || null;
  }
  // fallback first section
  return page.sections[0]?.id || null;
}

function parseOrdinalIndex(text: string): number | null {
  const lower = text.toLowerCase();
  const map: Record<string, number> = {
    first: 0,
    second: 1,
    third: 2,
    fourth: 3,
    fifth: 4,
    '1st': 0,
    '2nd': 1,
    '3rd': 2,
    '4th': 3,
    '5th': 4,
    '1': 0,
    '2': 1,
    '3': 2,
    '4': 3,
    '5': 4,
  };
  for (const k in map) {
    if (lower.includes(k)) return map[k];
  }
  const numMatch = lower.match(/item\s*(\d+)/);
  if (numMatch) {
    const n = parseInt(numMatch[1], 10);
    if (!isNaN(n) && n > 0) return n - 1;
  }
  return null;
}

function detectTheme(text: string): ThemeKey | null {
  const lower = text.toLowerCase();
  if (lower.includes('wander') || lower.includes('warm')) {
    if (lower.includes('blue')) return 'WanderBlue';
    if (lower.includes('dark')) return 'WanderDark';
    if (lower.includes('warm')) return 'WanderWarm';
  }
  if (lower.includes('warm')) return 'WanderWarm';
  if (lower.includes('blue') && !lower.includes('accent')) return 'WanderBlue';
  if (lower.includes('dark') && (lower.includes('theme') || lower.includes('wander') || lower.includes('mode'))) return 'WanderDark';
  if (lower.includes('dawn') || lower.includes('sunset')) return 'Dawn';
  if (lower.includes('emerald') || lower.includes('forest') || lower.includes('green')) {
    if (lower.includes('theme')) return 'EmeraldForest';
  }
  // direct
  if (lower.includes('wanderwarm')) return 'WanderWarm';
  if (lower.includes('wanderblue')) return 'WanderBlue';
  if (lower.includes('wanderdark')) return 'WanderDark';
  return null;
}

function detectFont(text: string): string | null {
  const lower = text.toLowerCase();
  if (lower.includes('outfit')) return 'Outfit';
  if (lower.includes('inter')) return 'Inter';
  if (lower.includes('serif')) return 'Serif';
  if (lower.includes('helvetica')) return 'Helvetica Neue';
  return null;
}

export function parseEditorCommand(message: string, state: EditorState): ParseResult {
  const lower = message.toLowerCase().trim();
  const actions: EditorAction[] = [];
  let reply = '';
  let intent = 'unknown';
  let confidence = 0;

  if (!lower) {
    return { actions: [], reply: 'Tell me what to edit! Try "Add a pricing section" or "Change site title to My Agency".', intent: 'empty', confidence: 0 };
  }

  // 1. SITE TITLE
  {
    const m = message.match(/(?:site title|brand name|site name|website title|brand)\s*(?:to|as|=|is)?\s*["']?([^"'\n]{1,80})["']?/i);
    const alt = message.match(/(?:rename|change)\s*(?:site|website)?\s*(?:title|brand|name)?\s*(?:to|as)?\s*["']?([^"'\n]{2,80})["']?/i);
    const candidate = (m?.[1] || alt?.[1] || '').trim();
    if (/(site title|brand name|site name|rename site|change.*site.*title)/i.test(message) && candidate && candidate.length >= 2 && candidate.length <= 80) {
      // Avoid capturing "to dark theme" etc.
      if (!/(theme|accent|color|font|section|page)/i.test(candidate)) {
        actions.push({ type: 'setSiteTitle', title: stripQuotes(candidate) });
        reply = `Got it! Changed site title to **"${stripQuotes(candidate)}"**.`;
        intent = 'setSiteTitle';
        confidence = 0.95;
        return { actions, reply, intent, confidence };
      }
    }
    // Also "change title to X" but ambiguous with section title. If active context is site? We'll handle later.
    // But if message is like "change site title to X" we already handled.
  }

  // 2. THEME
  {
    const theme = detectTheme(message);
    if (theme && /(theme|background|mode|atmospheric|wander)/i.test(message)) {
      actions.push({ type: 'setTheme', theme });
      reply = `Theme switched to **${theme}**. The canvas will update instantly.`;
      intent = 'setTheme';
      confidence = 0.9;
      return { actions, reply, intent, confidence };
    }
  }

  // 3. ACCENT / COLOR
  {
    if (/(accent|color|colour|primary color).*?(?:to|as|=)/i.test(message) || /(make|set|change).*(?:color|accent)/i.test(message) || /^make it (orange|blue|dark|green|purple|red|white)/i.test(message)) {
      // Extract color token after to/as
      let colorToken: string | null = null;
      const colorMatch = message.match(/(?:accent|color|colour).*?(?:to|as|=)\s*["']?([a-z0-9#]+)["']?/i);
      const makeItMatch = message.match(/make it\s+([a-z#0-9]+)/i);
      const setAccentMatch = message.match(/(?:set|change).*?accent\s*(?:to|as)?\s*([a-z0-9#]+)/i);
      const raw = (colorMatch?.[1] || makeItMatch?.[1] || setAccentMatch?.[1] || '').trim();
      if (raw) colorToken = raw;
      else {
        // look for hex directly anywhere
        const hex = message.match(/#[0-9a-f]{3,6}/i);
        if (hex) colorToken = hex[0];
        else {
          // find color name in message
          const colors = ['orange', 'blue', 'dark', 'green', 'purple', 'white', 'red', 'yellow', 'amber', 'emerald', 'pink', 'black', 'teal'];
          for (const c of colors) if (lower.includes(c)) { colorToken = c; break; }
        }
      }
      if (colorToken) {
        const hex = mapColorNameToHex(colorToken);
        if (hex) {
          actions.push({ type: 'setAccent', accent: hex });
          reply = `Accent color set to **${colorToken} (${hex})**. Looks fresh!`;
          intent = 'setAccent';
          confidence = 0.9;
          return { actions, reply, intent, confidence };
        }
      }
    }
  }

  // 4. FONT
  {
    const font = detectFont(message);
    if (font && /font|typography|typeface/i.test(message)) {
      actions.push({ type: 'setFont', font });
      reply = `Font changed to **${font}**. Your site's typography is updated.`;
      intent = 'setFont';
      confidence = 0.9;
      return { actions, reply, intent, confidence };
    }
  }

  // 5. DEVICE preview
  {
    if (/(preview|view).*(desktop|tablet|mobile)/i.test(message) || /(desktop|tablet|mobile)\s*(preview|view|mode)/i.test(message)) {
      const m = message.match(/(desktop|tablet|mobile)/i);
      if (m) {
        const dev = m[1].toLowerCase() as any;
        actions.push({ type: 'setDevice', device: dev });
        reply = `Switched to **${dev}** preview.`;
        intent = 'setDevice';
        confidence = 0.85;
        return { actions, reply, intent, confidence };
      }
    }
  }

  // 6. ADD PAGE
  {
    const addPagePatterns = [
      /(?:add|create|new)\s+(?:a\s+)?new\s+page\s+(?:called|named)?\s*["']?([^"'\n]{2,60})["']?/i,
      /(?:add|create)\s+page\s+["']?([^"'\n]{2,60})["']?/i,
      /create\s+(?:a\s+)?page\s+for\s+["']?([^"'\n]{2,60})["']?/i,
    ];
    for (const p of addPagePatterns) {
      const m = message.match(p);
      if (m && m[1]) {
        const name = stripQuotes(m[1]).replace(/\bpage\b$/i, '').trim();
        if (name.length >= 2 && !/(section|theme|color|font)/i.test(name)) {
          actions.push({ type: 'addPage', pageName: name, pageId: generatePageId(name) });
          reply = `Created new page **"${name}"** with hero, features and footer blocks. Switching to it now.`;
          intent = 'addPage';
          confidence = 0.95;
          return { actions, reply, intent, confidence };
        }
      }
    }
  }

  // 7. DELETE PAGE
  {
    const m = message.match(/(?:delete|remove)\s+(?:the\s+)?page\s+["']?([^"'\n]{1,60})["']?/i);
    if (m && m[1]) {
      const name = stripQuotes(m[1]).trim();
      const pageId = resolvePageIdByName(state.pages, name);
      if (pageId && pageId !== 'home') {
        actions.push({ type: 'deletePage', pageId });
        reply = `Deleted page **"${name}"**.`;
        intent = 'deletePage';
        confidence = 0.9;
        return { actions, reply, intent, confidence };
      } else if (pageId === 'home') {
        return { actions: [], reply: `Can't delete the Home page — it's required.`, intent: 'error', confidence: 0.9 };
      }
    }
  }

  // 8. RENAME PAGE
  {
    const m = message.match(/rename\s+page\s+["']?([^"'\n]{1,50})["']?\s+to\s+["']?([^"'\n]{1,60})["']?/i);
    if (m && m[1] && m[2]) {
      const oldName = stripQuotes(m[1]);
      const newName = stripQuotes(m[2]);
      const pageId = resolvePageIdByName(state.pages, oldName);
      if (pageId) {
        actions.push({ type: 'renamePage', pageId, newName });
        reply = `Renamed page "${oldName}" to **"${newName}"**.`;
        intent = 'renamePage';
        confidence = 0.9;
        return { actions, reply, intent, confidence };
      }
    }
  }

  // 9. SWITCH PAGE / GO TO PAGE
  {
    const m = message.match(/(?:go to|open|switch to|navigate to|show)\s+(?:the\s+)?page\s+["']?([^"'\n]{1,60})["']?/i) || message.match(/(?:go to|open|switch to)\s+["']?([^"'\n]{1,60})["']?\s+page/i);
    if (m && m[1]) {
      const name = stripQuotes(m[1]).trim();
      const pageId = resolvePageIdByName(state.pages, name);
      if (pageId) {
        actions.push({ type: 'switchPage', pageId });
        reply = `Switched to page **"${state.pages.find(p=>p.id===pageId)?.name || name}"**.`;
        intent = 'switchPage';
        confidence = 0.88;
        return { actions, reply, intent, confidence };
      }
    }
    // also just mention page name with "go to about"
    const simpleGo = message.match(/^(?:go to|open)\s+([a-z0-9\s\-]{2,30})$/i);
    if (simpleGo) {
      const name = stripQuotes(simpleGo[1]);
      const pageId = resolvePageIdByName(state.pages, name);
      if (pageId) {
        actions.push({ type: 'switchPage', pageId });
        reply = `Switched to **${state.pages.find(p=>p.id===pageId)?.name}**.`;
        intent = 'switchPage';
        confidence = 0.85;
        return { actions, reply, intent, confidence };
      }
    }
  }

  // 10. ADD SECTION (can be multiple)
  {
    if (/(add|create|insert|include)\s+/i.test(lower) && detectSectionTypes(lower).length > 0) {
      const types = detectSectionTypes(lower);
      // Avoid misinterpreting "add page" as section
      if (!/add\s+page/i.test(lower)) {
        const targetPageId = detectTargetPage(message, state);
        for (const t of types) {
          actions.push({ type: 'addSection', pageId: targetPageId, sectionType: t });
        }
        if (actions.length > 0) {
          const names = types.join(', ');
          const pageName = state.pages.find(p=>p.id===targetPageId)?.name || targetPageId;
          reply = `Added **${names}** section${types.length>1?'s':''} to **${pageName}** page.`;
          intent = 'addSection';
          confidence = 0.92;
          return { actions, reply, intent, confidence };
        }
      }
    }
  }

  // 11. REMOVE SECTION
  {
    if (/(remove|delete)\s+(?:this|the)?\s*(?:section)?/i.test(lower)) {
      // "remove this section" or "delete selected section"
      if (/(this section|selected section|current section)/i.test(lower) && state.selectedSectionId) {
        actions.push({ type: 'removeSection', pageId: state.activePageId, sectionId: state.selectedSectionId });
        reply = `Removed the selected section.`;
        intent = 'removeSection';
        confidence = 0.9;
        return { actions, reply, intent, confidence };
      }
      const types = detectSectionTypes(lower);
      if (types.length > 0) {
        const targetPageId = detectTargetPage(message, state);
        for (const t of types) {
          const secId = detectSectionByTypeInPage(state, targetPageId, t, false);
          if (secId) actions.push({ type: 'removeSection', pageId: targetPageId, sectionId: secId });
        }
        if (actions.length > 0) {
          reply = `Removed **${types.join(', ')}** section${actions.length>1?'s':''} from ${state.pages.find(p=>p.id===targetPageId)?.name}.`;
          intent = 'removeSection';
          confidence = 0.88;
          return { actions, reply, intent, confidence };
        }
      }
      // generic "remove section" without type but with selected
      if (state.selectedSectionId && /remove|delete/.test(lower) && /section/.test(lower)) {
        actions.push({ type: 'removeSection', pageId: state.activePageId, sectionId: state.selectedSectionId });
        reply = `Removed the selected section.`;
        intent = 'removeSection';
        confidence = 0.8;
        return { actions, reply, intent, confidence };
      }
    }
  }

  // 12. DUPLICATE SECTION
  {
    if (/(duplicate|copy|clone)\s+(?:this|the)?\s*section/i.test(lower) || (/duplicate/i.test(lower) && detectSectionTypes(lower).length>0)) {
      if (/(this|selected|current)/i.test(lower) && state.selectedSectionId) {
        actions.push({ type: 'duplicateSection', pageId: state.activePageId, sectionId: state.selectedSectionId });
        reply = `Duplicated the selected section.`;
        intent = 'duplicateSection';
        confidence = 0.9;
        return { actions, reply, intent, confidence };
      }
      const types = detectSectionTypes(lower);
      if (types.length>0) {
        const targetPageId = detectTargetPage(message, state);
        for (const t of types) {
          const secId = detectSectionByTypeInPage(state, targetPageId, t, true);
          if (secId) actions.push({ type: 'duplicateSection', pageId: targetPageId, sectionId: secId });
        }
        if (actions.length>0) {
          reply = `Duplicated **${types.join(', ')}** section${actions.length>1?'s':''}.`;
          intent = 'duplicateSection';
          confidence = 0.85;
          return { actions, reply, intent, confidence };
        }
      }
    }
  }

  // 13. MOVE SECTION
  {
    const moveMatch = message.match(/move\s+(?:the\s+)?([a-z]+)?\s*section\s*(up|down)/i) || message.match(/(?:move).*?(up|down)/i);
    if (moveMatch) {
      const dir = (moveMatch[2] || moveMatch[1] || '').toLowerCase() as 'up' | 'down';
      if (dir === 'up' || dir === 'down') {
        const types = detectSectionTypes(lower);
        let secId: string | null = null;
        let pageId = state.activePageId;
        if (types.length>0) {
          pageId = detectTargetPage(message, state);
          secId = detectSectionByTypeInPage(state, pageId, types[0], true);
        } else if (state.selectedSectionId) {
          secId = state.selectedSectionId;
        }
        if (secId) {
          actions.push({ type: 'moveSection', pageId, sectionId: secId, direction: dir });
          reply = `Moved section **${dir}**.`;
          intent = 'moveSection';
          confidence = 0.88;
          return { actions, reply, intent, confidence };
        }
      }
    }
  }

  // 14. UPDATE SECTION FIELD (title, subtitle, badge, buttonText)
  {
    // pattern: change/set/update [sectionType] title/subtitle/badge/button to value
    const fieldPattern = /(?:change|set|update|edit)\s+(?:the\s+)?(?:([a-z]+)\s+)?(title|heading|subtitle|description|badge|label|button text|button)\s*(?:to|as|=)?\s*["']?([^"'\n]{1,200})["']?/i;
    const m = message.match(fieldPattern);
    if (m) {
      const possibleTypeRaw = (m[1] || '').toLowerCase().trim();
      const fieldRaw = (m[2] || '').toLowerCase();
      let value = stripQuotes(m[3] || '').trim();
      if (value) {
        // map possibleTypeRaw to section type
        let secType: SectionType | undefined;
        if (possibleTypeRaw) {
          const detected = detectSectionTypes(possibleTypeRaw);
          if (detected.length>0) secType = detected[0];
        }
        // If no type but contains section type elsewhere
        if (!secType) {
          const elsewhere = detectSectionTypes(lower);
          if (elsewhere.length>0) secType = elsewhere[0];
        }

        let pageId = detectTargetPage(message, state);
        let secId = secType ? detectSectionByTypeInPage(state, pageId, secType, true) : (state.selectedSectionId || detectSectionByTypeInPage(state, pageId, undefined, true));

        if (secId) {
          let field: 'title' | 'subtitle' | 'badge' | 'buttonText' = 'title';
          if (fieldRaw.includes('subtitle') || fieldRaw.includes('description')) field = 'subtitle';
          else if (fieldRaw.includes('badge') || fieldRaw.includes('label')) field = 'badge';
          else if (fieldRaw.includes('button')) field = 'buttonText';
          else field = 'title';

          // sanity: value shouldn't be a section keyword alone
          if (value.length >= 2) {
            actions.push({ type: 'updateSection', pageId, sectionId: secId, field, value });
            reply = `Updated ${field} to **"${value}"**.`;
            intent = 'updateSection';
            confidence = 0.9;
            return { actions, reply, intent, confidence };
          }
        }
      }
    }

    // alternative: "change hero title to X" explicit
    const heroTitlePat = /(?:change|set|update)\s+([a-z]+)\s+(title|subtitle|badge)\s+(?:to|as)\s+["']?([^"'\n]{1,200})["']?/i;
    const m2 = message.match(heroTitlePat);
    if (m2) {
      const tRaw = m2[1].toLowerCase();
      const fieldRaw = m2[2].toLowerCase();
      const value = stripQuotes(m2[3]).trim();
      const detected = detectSectionTypes(tRaw);
      const secType = detected[0];
      if (secType && value) {
        const pageId = detectTargetPage(message, state);
        const secId = detectSectionByTypeInPage(state, pageId, secType, true);
        if (secId) {
          const field = fieldRaw.includes('subtitle') ? 'subtitle' as const : fieldRaw.includes('badge') ? 'badge' as const : 'title' as const;
          actions.push({ type: 'updateSection', pageId, sectionId: secId, field, value });
          reply = `Updated ${secType} ${field} to "${value}".`;
          intent = 'updateSection';
          confidence = 0.92;
          return { actions, reply, intent, confidence };
        }
      }
    }
  }

  // 15. UPDATE ITEM (e.g., "change first feature title to X")
  {
    const itemPat = /(?:change|set|update)\s+(?:the\s+)?(first|second|third|fourth|fifth|1st|2nd|3rd|4th|5th|\d+)?\s*(feature|stat|testimonial|pricing|plan|faq|team|member|portfolio|project)s?\s*(title|description|name|role|quote|price|value|label|question|answer|q|a|category|plan|desc)?\s*(?:to|as|=)?\s*["']?([^"'\n]{1,200})["']?/i;
    const m = message.match(itemPat);
    if (m) {
      const ordinalRaw = (m[1] || 'first').toLowerCase();
      const itemTypeRaw = (m[2] || '').toLowerCase();
      const fieldRaw = (m[3] || 'title').toLowerCase();
      const value = stripQuotes(m[4] || '').trim();
      if (value) {
        const types = detectSectionTypes(itemTypeRaw);
        const secType = types[0] || detectSectionTypes(lower)[0];
        const pageId = detectTargetPage(message, state);
        const secId = secType ? detectSectionByTypeInPage(state, pageId, secType, true) : (state.selectedSectionId || null);
        if (secId) {
          const idx = parseOrdinalIndex(ordinalRaw) ?? 0;
          // map fieldRaw to ItemConfig key
          let field: any = 'title';
          if (fieldRaw.includes('description') || fieldRaw.includes('desc')) field = 'description';
          else if (fieldRaw.includes('value')) field = 'value';
          else if (fieldRaw.includes('label')) field = 'label';
          else if (fieldRaw.includes('name')) field = 'name';
          else if (fieldRaw.includes('role')) field = 'role';
          else if (fieldRaw.includes('quote')) field = 'quote';
          else if (fieldRaw.includes('price')) field = 'price';
          else if (fieldRaw.includes('plan')) field = 'plan';
          else if (fieldRaw.includes('question') || fieldRaw === 'q') field = 'q';
          else if (fieldRaw.includes('answer') || fieldRaw === 'a') field = 'a';
          else if (fieldRaw.includes('category')) field = 'category';
          else field = 'title';

          actions.push({ type: 'updateSectionItem', pageId, sectionId: secId, itemIndex: idx, field, value });
          reply = `Updated item #${idx+1} ${field} to "${value}" in ${secType || 'selected'} section.`;
          intent = 'updateSectionItem';
          confidence = 0.85;
          return { actions, reply, intent, confidence };
        }
      }
    }
  }

  // 16. ADD ITEM to section
  {
    if (/(add|create|new)\s+(?:a\s+)?(feature|stat|testimonial|pricing|faq|team member|member|portfolio|project)/i.test(lower)) {
      const types = detectSectionTypes(lower);
      const secType = types[0];
      const pageId = detectTargetPage(message, state);
      const secId = secType ? detectSectionByTypeInPage(state, pageId, secType, true) : state.selectedSectionId;
      if (secId) {
        actions.push({ type: 'addSectionItem', pageId, sectionId: secId });
        reply = `Added a new item to **${secType || 'selected'}** section.`;
        intent = 'addSectionItem';
        confidence = 0.82;
        return { actions, reply, intent, confidence };
      }
    }
  }

  // 17. General help / fallback for editor
  if (/(how|what).*editor/i.test(lower) || /(help|what can you do)/i.test(lower)) {
    return {
      actions: [],
      reply: [
        'I can edit your website live! Try commands like:',
        '',
        '- **Add sections:** "Add a pricing section" or "Add hero and stats sections to home page"',
        '- **Edit text:** "Change hero title to Welcome to Our Agency"',
        '- **Change style:** "Set theme to dark", "Make accent orange", "Set font to Inter"',
        '- **Pages:** "Add page Services", "Go to about page", "Rename page home to Landing"',
        '- **Sections:** "Remove pricing section", "Duplicate hero section", "Move features up"',
        '- **Site brand:** "Change site title to My Agency"',
        '- **Preview:** "Show mobile preview"',
        '',
        'Just type what you want and I’ll update the canvas instantly.',
      ].join('\n'),
      intent: 'help',
      confidence: 0.9,
    };
  }

  // If no actions matched, fallback to general assistant but with suggestion
  return {
    actions: [],
    reply: `I didn't catch an edit command there. Try something like **"Add a pricing section"**, **"Change hero title to Hello"**, or **"Set theme to dark"**. If you need general help with Webmers, ask about buying, selling, refunds, etc.`,
    intent: 'fallback',
    confidence: 0.3,
  };
}
