/**
 * Durable snapshot for the built-in data store.
 *
 * The in-memory store is fast and needs zero setup, but on its own it loses
 * every account, order and wishlist entry whenever the process restarts. This
 * module transparently mirrors the store to a JSON file on disk so the default
 * (no-database) configuration survives restarts and redeploys of a single
 * instance.
 *
 * It is intentionally conservative:
 *  - Writes are debounced and atomic (temp file + rename) so a crash mid-write
 *    cannot corrupt the snapshot.
 *  - Any failure degrades to pure in-memory behaviour instead of throwing.
 *  - Disabled automatically when a real database is configured, on read-only
 *    filesystems, or when WEBMERS_PERSIST=0.
 *
 * For multi-instance / serverless deployments use PostgreSQL (see README) —
 * a local file cannot be shared between instances.
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';

const DATA_DIR = process.env.WEBMERS_DATA_DIR || join(process.cwd(), '.data');
const SNAPSHOT_PATH = join(DATA_DIR, 'store.json');
const TEMP_PATH = `${SNAPSHOT_PATH}.tmp`;

/** Snapshot format version — bump to invalidate incompatible old snapshots. */
const SNAPSHOT_VERSION = 1;

let enabled: boolean | null = null;
let writeTimer: ReturnType<typeof setTimeout> | null = null;
let pendingSnapshot: (() => unknown) | null = null;

function isEnabled(): boolean {
  if (enabled !== null) return enabled;

  if (process.env.WEBMERS_PERSIST === '0' || process.env.DATABASE_URL) {
    enabled = false;
    return enabled;
  }

  try {
    mkdirSync(DATA_DIR, { recursive: true });
    enabled = true;
  } catch {
    // Read-only filesystem (common on serverless) — stay in memory.
    enabled = false;
  }

  return enabled;
}

/** Dates survive JSON as ISO strings; convert the known date fields back. */
const DATE_KEYS = new Set(['createdAt', 'updatedAt']);

function reviveDates(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(reviveDates);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (DATE_KEYS.has(key) && typeof val === 'string') {
        const parsed = new Date(val);
        out[key] = Number.isNaN(parsed.getTime()) ? val : parsed;
      } else {
        out[key] = reviveDates(val);
      }
    }
    return out;
  }
  return value;
}

/** Loads a previously written snapshot, or `null` when there is none. */
export function loadSnapshot<T>(): T | null {
  if (!isEnabled()) return null;

  try {
    if (!existsSync(SNAPSHOT_PATH)) return null;
    const raw = readFileSync(SNAPSHOT_PATH, 'utf8');
    if (!raw.trim()) return null;

    const parsed = JSON.parse(raw);
    if (parsed?.version !== SNAPSHOT_VERSION || !parsed.data) return null;

    return reviveDates(parsed.data) as T;
  } catch (err) {
    console.warn('[persistence] Could not read snapshot, starting fresh:', (err as Error).message);
    return null;
  }
}

function writeNow() {
  if (!pendingSnapshot || !isEnabled()) return;

  const snapshot = pendingSnapshot;
  pendingSnapshot = null;

  try {
    const payload = JSON.stringify({ version: SNAPSHOT_VERSION, data: snapshot() });
    mkdirSync(dirname(TEMP_PATH), { recursive: true });
    // Atomic: write to a temp file then rename over the target.
    writeFileSync(TEMP_PATH, payload, 'utf8');
    renameSync(TEMP_PATH, SNAPSHOT_PATH);
  } catch (err) {
    console.warn('[persistence] Snapshot write failed:', (err as Error).message);
  }
}

/**
 * Schedules a debounced snapshot write. Safe to call on every mutation —
 * bursts collapse into a single write.
 */
export function scheduleSnapshot(getSnapshot: () => unknown): void {
  if (!isEnabled()) return;

  pendingSnapshot = getSnapshot;

  if (writeTimer) return;
  writeTimer = setTimeout(() => {
    writeTimer = null;
    writeNow();
  }, 250);

  // Never hold the event loop open just for a pending snapshot.
  if (typeof writeTimer === 'object' && 'unref' in writeTimer) writeTimer.unref();
}

let exitHooked = false;

/** Flushes any pending write on shutdown so the last mutation is not lost. */
export function installShutdownFlush(): void {
  if (exitHooked || !isEnabled()) return;
  exitHooked = true;

  const flush = () => {
    if (writeTimer) {
      clearTimeout(writeTimer);
      writeTimer = null;
    }
    writeNow();
  };

  process.once('exit', flush);
  process.once('SIGINT', () => { flush(); process.exit(0); });
  process.once('SIGTERM', () => { flush(); process.exit(0); });
}
