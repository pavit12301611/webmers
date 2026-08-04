'use client';

/**
 * PSD — Tiny markdown renderer (safe, no dangerouslySetInnerHTML).
 * Supports the subset PSD emits: headings, bullet/numbered lists, **bold**,
 * *italic*, `inline code`, [links](url) and paragraph breaks.
 */
import React from 'react';

type InlineNode =
  | { type: 'text'; value: string }
  | { type: 'bold'; value: string }
  | { type: 'italic'; value: string }
  | { type: 'code'; value: string }
  | { type: 'link'; value: string; href: string };

const INLINE_RE =
  /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const re = new RegExp(INLINE_RE.source, 'g');

  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      nodes.push({ type: 'bold', value: token.slice(2, -2) });
    } else if (token.startsWith('*') && token.endsWith('*')) {
      nodes.push({ type: 'italic', value: token.slice(1, -1) });
    } else if (token.startsWith('`') && token.endsWith('`')) {
      nodes.push({ type: 'code', value: token.slice(1, -1) });
    } else {
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (linkMatch) {
        nodes.push({ type: 'link', value: linkMatch[1], href: linkMatch[2] });
      } else {
        nodes.push({ type: 'text', value: token });
      }
    }
    lastIndex = match.index + token.length;
  }
  if (lastIndex < text.length) {
    nodes.push({ type: 'text', value: text.slice(lastIndex) });
  }
  return nodes;
}

function InlineText({ text }: { text: string }) {
  const nodes = parseInline(text);
  return (
    <>
      {nodes.map((node, i) => {
        switch (node.type) {
          case 'bold':
            return (
              <strong key={i} className="font-bold text-inherit">
                {node.value}
              </strong>
            );
          case 'italic':
            return <em key={i}>{node.value}</em>;
          case 'code':
            return (
              <code
                key={i}
                className="rounded-md bg-wander-dark/10 px-1.5 py-0.5 font-mono text-[0.9em]"
              >
                {node.value}
              </code>
            );
          case 'link':
            return (
              <a
                key={i}
                href={node.href}
                className="font-semibold text-wander-orange underline decoration-wander-orange/40 underline-offset-2 hover:decoration-wander-orange transition-colors"
              >
                {node.value}
              </a>
            );
          default:
            return <React.Fragment key={i}>{node.value}</React.Fragment>;
        }
      })}
    </>
  );
}

export default function PSDMarkdown({ text }: { text: string }) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const blocks: React.ReactNode[] = [];
  let para: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let listItems: string[] = [];

  const flushPara = (key: number) => {
    if (para.length === 0) return;
    blocks.push(
      <p key={key} className="leading-relaxed">
        <InlineText text={para.join(' ')} />
      </p>,
    );
    para = [];
  };

  const flushList = (key: number) => {
    if (!listType || listItems.length === 0) return;
    const items = listItems;
    blocks.push(
      listType === 'ol' ? (
        <ol key={key} className="my-1 space-y-1 pl-5 list-decimal marker:text-wander-orange marker:font-bold">
          {items.map((item, i) => (
            <li key={i} className="leading-relaxed">
              <InlineText text={item} />
            </li>
          ))}
        </ol>
      ) : (
        <ul key={key} className="my-1 space-y-1 pl-4 list-disc marker:text-wander-orange">
          {items.map((item, i) => (
            <li key={i} className="leading-relaxed">
              <InlineText text={item} />
            </li>
          ))}
        </ul>
      ),
    );
    listItems = [];
    listType = null;
  };

  let blockKey = 0;

  for (const raw of lines) {
    const line = raw.trimEnd();
    const trimmed = line.trim();

    if (trimmed === '') {
      flushPara(blockKey++);
      flushList(blockKey++);
      continue;
    }

    // Headings
    const headingMatch = /^(#{1,6})\s+(.+)$/.exec(trimmed);
    if (headingMatch) {
      flushPara(blockKey++);
      flushList(blockKey++);
      blocks.push(
        <h4
          key={blockKey++}
          className="font-heading text-[15px] font-bold tracking-tight mt-1.5 first:mt-0"
        >
          <InlineText text={headingMatch[2]} />
        </h4>,
      );
      continue;
    }

    // Bullet lists
    const bulletMatch = /^[-*•]\s+(.*)$/.exec(trimmed);
    if (bulletMatch) {
      flushPara(blockKey++);
      if (listType !== 'ul') {
        flushList(blockKey++);
        listType = 'ul';
      }
      listItems.push(bulletMatch[1]);
      continue;
    }

    // Numbered lists
    const numMatch = /^(\d+)[.)]\s+(.*)$/.exec(trimmed);
    if (numMatch) {
      flushPara(blockKey++);
      if (listType !== 'ol') {
        flushList(blockKey++);
        listType = 'ol';
      }
      listItems.push(numMatch[2]);
      continue;
    }

    // Blockquote-ish (used for source notes)
    if (trimmed.startsWith('>')) {
      flushPara(blockKey++);
      flushList(blockKey++);
      blocks.push(
        <p key={blockKey++} className="border-l-2 border-wander-orange/40 pl-3 text-[0.92em] opacity-80">
          <InlineText text={trimmed.replace(/^>\s?/, '')} />
        </p>,
      );
      continue;
    }

    // Ordinary paragraph text
    flushList(blockKey++);
    para.push(trimmed);
  }

  flushPara(blockKey++);
  flushList(blockKey++);

  return <div className="space-y-1.5 text-[13.5px]">{blocks}</div>;
}
