/**
 * Shared input validation.
 *
 * Every API route funnels user input through here so limits are consistent and
 * enforced server-side (the client is never trusted).
 */

/** RFC 5321 practical maximum. */
export const MAX_EMAIL_LENGTH = 254;
export const MAX_NAME_LENGTH = 100;
export const MIN_PASSWORD_LENGTH = 8;
/** bcrypt only considers the first 72 bytes; reject beyond that. */
export const MAX_PASSWORD_LENGTH = 72;

/** Layout variants offered at checkout — the server accepts nothing else. */
export const LAYOUT_CHOICES = ['Hero-Centered', 'Split-Screen', 'Video-Hero'] as const;
export type LayoutChoice = (typeof LAYOUT_CHOICES)[number];

export function isLayoutChoice(value: unknown): value is LayoutChoice {
  return typeof value === 'string' && (LAYOUT_CHOICES as readonly string[]).includes(value);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  const value = email.trim();
  return value.length > 0 && value.length <= MAX_EMAIL_LENGTH && EMAIL_RE.test(value);
}

/** Reads a string field defensively: wrong types become ''. */
export function readString(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return value.slice(0, maxLength).trim();
}

/** A handful of passwords that pass a length check but must never be allowed. */
const COMMON_PASSWORDS = new Set([
  'password', 'password1', 'password12', 'password123', 'password1234',
  '12345678', '123456789', '1234567890', 'qwertyui', 'qwerty123',
  'letmein1', 'welcome1', 'welcome123', 'iloveyou', 'admin123',
  'abc12345', 'football', 'baseball', 'sunshine', 'princess',
  'passw0rd', 'p@ssword', 'p@ssw0rd', 'trustno1', 'starwars',
  'monkey123', 'dragon123', 'master123', 'shadow123', 'superman',
]);

export interface PasswordCheck {
  ok: boolean;
  error?: string;
}

/**
 * Password policy: length plus a light complexity requirement and a
 * common-password denylist. Deliberately not draconian — length does the heavy
 * lifting, per NIST 800-63B guidance.
 */
export function validatePassword(password: string): PasswordCheck {
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return { ok: false, error: `Password must be at most ${MAX_PASSWORD_LENGTH} characters.` };
  }
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    return { ok: false, error: 'That password is too common. Please choose a less predictable one.' };
  }

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumberOrSymbol = /[^a-zA-Z]/.test(password);
  if (!hasLetter || !hasNumberOrSymbol) {
    return {
      ok: false,
      error: 'Password must contain both letters and at least one number or symbol.',
    };
  }

  return { ok: true };
}

/** Guards against oversized JSON bodies before parsing. */
export const MAX_BODY_BYTES = 16 * 1024;

export async function readJsonBody(req: Request): Promise<Record<string, unknown> | null> {
  const declared = req.headers.get('content-length');
  if (declared && Number(declared) > MAX_BODY_BYTES) return null;

  try {
    const text = await req.text();
    if (text.length > MAX_BODY_BYTES) return null;
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}
