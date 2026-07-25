/**
 * Webmers data layer.
 *
 * This module is the single source of truth for all data access in the app.
 *
 * It is designed to be *resilient*: it works with zero external infrastructure
 * by defaulting to a fast, seeded in-memory store (great for local dev, demos,
 * previews and tests). When a real database is configured (`DATABASE_URL`) and
 * a generated Prisma client is available, it transparently uses PostgreSQL via
 * Prisma instead — and gracefully falls back to the in-memory store if anything
 * goes wrong, so the app never crashes because of a missing DB.
 */
import { compare, hashSync } from 'bcryptjs';
import { createHash, randomInt, randomUUID, timingSafeEqual } from 'crypto';
import { installShutdownFlush, loadSnapshot, scheduleSnapshot } from './persistence';
import { paletteFor as computePalette } from './palette';
import type {
  Category,
  EditorState,
  Listing,
  ListingStatus,
  Order,
  OrderStatus,
  Review,
  Role,
  User,
} from './types';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type {
  Role,
  ListingStatus,
  OrderStatus,
  User,
  Listing,
  Order,
  Review,
  Category,
  EditorState,
} from './types';

export { paletteFor } from './palette';

/** bcrypt cost factor for real user passwords (signup + password reset). */
export const BCRYPT_ROUNDS = 12;

/**
 * Cheaper cost for the throwaway demo fixtures only — these are public
 * credentials in development, so spending 4x the CPU on them at every cold
 * start buys nothing.
 */
const SEED_ROUNDS = 10;

/**
 * Demo accounts (public passwords) must never exist in a production database.
 * See `seed()` — they are omitted entirely when NODE_ENV is production.
 */
export const DEMO_ACCOUNTS_ENABLED = process.env.NODE_ENV !== 'production';

/** Price of the "unlock full source code" add-on, in USD. */
export const CODE_UNLOCK_PRICE = 49;

interface WishlistItem {
  id: string;
  userId: string;
  listingId: string;
  createdAt: Date;
}

interface Store {
  users: User[];
  listings: Listing[];
  orders: Order[];
  reviews: Review[];
  wishlist: WishlistItem[];
  newsletter: string[];
  /** Saved visual-editor documents, keyed by order id. */
  editorStates: Record<string, EditorState>;
  passwordResets: Array<{
    email: string;
    /** SHA-256 of the OTP — the plaintext code is never stored. */
    otpHash: string;
    expiresAt: number;
    attempts: number;
  }>;
}

/* ------------------------------------------------------------------ */
/* Optional Prisma bridge (production)                                 */
/* ------------------------------------------------------------------ */

let prismaPromise: Promise<any> | null = null;

/**
 * Returns a Prisma client when a database is configured and the generated
 * client is available, otherwise `null`. The dynamic, string-based import
 * keeps the build completely decoupled from the (generated) Prisma client so
 * the app always builds, even without running `prisma generate`.
 */
function getPrismaClient(): Promise<any | null> {
  if (!process.env.DATABASE_URL) return Promise.resolve(null);
  if (!prismaPromise) {
    prismaPromise = (async () => {
      try {
        const pkg = '@prisma/client';
        // Variable specifier => not statically analysed/bundled by webpack or tsc.
        const mod: any = await import(/* webpackIgnore: true */ pkg);
        const Ctor = mod?.PrismaClient;
        if (!Ctor) return null;
        return new Ctor();
      } catch {
        return null;
      }
    })();
  }
  return prismaPromise;
}

/* ------------------------------------------------------------------ */
/* In-memory store (seeded, survives HMR via globalThis)               */
/* ------------------------------------------------------------------ */

const g = globalThis as unknown as { __webmersStore?: Store };

/**
 * Cryptographically secure identifier.
 *
 * Order IDs in particular must not be guessable — they used to be derived from
 * `Math.random()` (~41 bits, predictable PRNG), which made order records
 * enumerable.
 */
function id(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, '')}`;
}

function seed(): Store {
  const now = Date.now();
  const days = (n: number) => new Date(now - n * 86_400_000);

  const users: User[] = [
    { id: 'u_admin', email: 'admin@webmers.io', name: 'Admin User', role: 'ADMIN', passwordHash: hashSync('Admin@123', SEED_ROUNDS), createdAt: days(400) },
    { id: 'u_seller', email: 'seller@webmers.io', name: 'Sarah K.', role: 'SELLER', passwordHash: hashSync('Seller@123', SEED_ROUNDS), createdAt: days(320) },
    { id: 'u_buyer', email: 'buyer@webmers.io', name: 'David R.', role: 'BUYER', passwordHash: hashSync('Buyer@123', SEED_ROUNDS), createdAt: days(210) },
    { id: 'u_maria', email: 'maria@example.com', name: 'Maria L.', role: 'BUYER', passwordHash: hashSync('Maria@123', SEED_ROUNDS), createdAt: days(90) },
  ];

  const listings: Listing[] = [
    {
      id: 'meridian',
      title: 'Meridian SaaS',
      tagline: 'Conversion-focused SaaS landing page',
      description:
        'A fully-built SaaS landing page with a modern design, interactive components, pricing tables, and Stripe-ready checkout. Built for conversions with a clean, trustworthy aesthetic.',
      price: 299,
      category: 'SaaS',
      techStack: ['Next.js', 'Tailwind CSS', 'Stripe', 'Framer Motion'],
      palette: ['#f59e0b', '#f43f5e'],
      demoUrl: 'https://demo.webmers.io/meridian',
      status: 'ACTIVE',
      sellerId: 'u_seller',
      sellerName: 'Sarah K.',
      rating: 4.9,
      sales: 42,
      featured: true,
      createdAt: days(120),
    },
    {
      id: 'nocturne',
      title: 'Nocturne Portfolio',
      tagline: 'Minimal portfolio for creatives',
      description:
        'A minimal portfolio template for designers and photographers. Clean typography, elegant scroll animations, and a distraction-free gallery layout.',
      price: 149,
      category: 'Portfolio',
      techStack: ['React', 'Tailwind CSS', 'GSAP'],
      palette: ['#8b5cf6', '#d946ef'],
      demoUrl: 'https://demo.webmers.io/nocturne',
      status: 'ACTIVE',
      sellerId: 'u_seller',
      sellerName: 'Sarah K.',
      rating: 4.8,
      sales: 28,
      featured: true,
      createdAt: days(95),
    },
    {
      id: 'lumina',
      title: 'Lumina E-commerce',
      tagline: 'Complete storefront, ready to sell',
      description:
        'A complete online store with product grids, cart functionality, filters, and secure checkout integration. Includes an admin-friendly product model.',
      price: 399,
      category: 'E-commerce',
      techStack: ['Next.js', 'Tailwind CSS', 'Stripe', 'PostgreSQL'],
      palette: ['#10b981', '#06b6d4'],
      demoUrl: 'https://demo.webmers.io/lumina',
      status: 'ACTIVE',
      sellerId: 'u_seller',
      sellerName: 'Sarah K.',
      rating: 5.0,
      sales: 19,
      featured: true,
      createdAt: days(80),
    },
    {
      id: 'aurora',
      title: 'Aurora Blog',
      tagline: 'Editorial blog with a reading experience',
      description:
        'An editorial blog theme with reading-time estimation, newsletter signup, category filters, and beautiful typography for long-form content.',
      price: 89,
      category: 'Blog',
      techStack: ['Next.js', 'Tailwind CSS', 'Markdown'],
      palette: ['#0ea5e9', '#6366f1'],
      demoUrl: 'https://demo.webmers.io/aurora',
      status: 'ACTIVE',
      sellerId: 'u_seller',
      sellerName: 'Sarah K.',
      rating: 4.7,
      sales: 33,
      featured: false,
      createdAt: days(60),
    },
    {
      id: 'pulse',
      title: 'Pulse Dashboard',
      tagline: 'Analytics dashboard UI kit',
      description:
        'A polished analytics dashboard with charts, tables, and a responsive sidebar. Themeable, accessible, and ready to wire to your data.',
      price: 249,
      category: 'Dashboard',
      techStack: ['React', 'Tailwind CSS', 'Recharts'],
      palette: ['#22d3ee', '#3b82f6'],
      demoUrl: 'https://demo.webmers.io/pulse',
      status: 'ACTIVE',
      sellerId: 'u_seller',
      sellerName: 'Sarah K.',
      rating: 4.6,
      sales: 15,
      featured: false,
      createdAt: days(40),
    },
    {
      id: 'atlas',
      title: 'Atlas Agency',
      tagline: 'Bold site for studios & agencies',
      description:
        'A bold, animated agency website with case-study layouts, a services grid, and a contact flow. Designed to make a strong first impression.',
      price: 199,
      category: 'Agency',
      techStack: ['Next.js', 'Tailwind CSS', 'Framer Motion'],
      palette: ['#fb7185', '#f59e0b'],
      demoUrl: 'https://demo.webmers.io/atlas',
      status: 'ACTIVE',
      sellerId: 'u_seller',
      sellerName: 'Sarah K.',
      rating: 4.8,
      sales: 22,
      featured: false,
      createdAt: days(20),
    },
  ];

  const orders: Order[] = [
    { id: 'o_1', buyerId: 'u_buyer', sellerId: 'u_seller', listingId: 'meridian', listingTitle: 'Meridian SaaS', amount: 299, status: 'COMPLETED', layoutChoice: 'Hero-Centered', codeUnlocked: true, createdAt: days(50) },
    { id: 'o_2', buyerId: 'u_buyer', sellerId: 'u_seller', listingId: 'nocturne', listingTitle: 'Nocturne Portfolio', amount: 149, status: 'COMPLETED', layoutChoice: 'Split-Screen', codeUnlocked: false, createdAt: days(30) },
    { id: 'o_3', buyerId: 'u_buyer', sellerId: 'u_seller', listingId: 'lumina', listingTitle: 'Lumina E-commerce', amount: 399, status: 'PAID', layoutChoice: 'Video-Hero', codeUnlocked: false, createdAt: days(5) },
    { id: 'o_4', buyerId: 'u_maria', sellerId: 'u_seller', listingId: 'meridian', listingTitle: 'Meridian SaaS', amount: 348, status: 'COMPLETED', layoutChoice: 'Hero-Centered', codeUnlocked: true, createdAt: days(18) },
    { id: 'o_5', buyerId: 'u_maria', sellerId: 'u_seller', listingId: 'aurora', listingTitle: 'Aurora Blog', amount: 89, status: 'REFUNDED', layoutChoice: 'Split-Screen', codeUnlocked: false, createdAt: days(8) },
  ];

  const reviews: Review[] = [
    { id: 'r_1', listingId: 'meridian', buyerId: 'u_buyer', buyerName: 'David R.', rating: 5, comment: 'Incredible design and the editor made customization a breeze.', verified: true, createdAt: days(45) },
    { id: 'r_2', listingId: 'meridian', buyerId: 'u_maria', buyerName: 'Maria L.', rating: 5, comment: 'Launched in a weekend. The layout variants are a great touch.', verified: true, createdAt: days(20) },
    { id: 'r_3', listingId: 'nocturne', buyerId: 'u_buyer', buyerName: 'David R.', rating: 4, comment: 'Beautiful minimal style. Would recommend for any portfolio.', verified: true, createdAt: days(28) },
    { id: 'r_4', listingId: 'lumina', buyerId: 'u_maria', buyerName: 'Maria L.', rating: 5, comment: 'The checkout flow just works. Great starting point for a store.', verified: true, createdAt: days(10) },
  ];

  const wishlist: WishlistItem[] = [
    { id: 'w_1', userId: 'u_buyer', listingId: 'aurora', createdAt: days(12) },
    { id: 'w_2', userId: 'u_buyer', listingId: 'atlas', createdAt: days(3) },
  ];

  if (!DEMO_ACCOUNTS_ENABLED) {
    // Production: keep the catalogue, drop every demo identity and the
    // activity attached to it. Nobody can sign in with a published password.
    return {
      users: [],
      listings,
      orders: [],
      reviews: [],
      wishlist: [],
      newsletter: [],
      editorStates: {},
      passwordResets: [],
    };
  }

  return {
    users,
    listings,
    orders,
    reviews,
    wishlist,
    newsletter: [],
    editorStates: {},
    passwordResets: [],
  };
}

function store(): Store {
  if (!g.__webmersStore) {
    // Restore the previous snapshot when present so accounts, orders and
    // wishlists survive a restart; otherwise start from the demo seed.
    const restored = loadSnapshot<Store>();
    if (restored) {
      // Tolerate snapshots written by an older build.
      restored.editorStates ??= {};
      restored.passwordResets ??= [];
      restored.newsletter ??= [];
    }
    g.__webmersStore = restored ?? seed();
    installShutdownFlush();
  }
  return g.__webmersStore;
}

/**
 * Marks the store dirty so it is written to disk shortly after.
 * Call this after every mutation.
 */
function persist(): void {
  scheduleSnapshot(() => g.__webmersStore);
}

/* ------------------------------------------------------------------ */
/* Users & auth                                                        */
/* ------------------------------------------------------------------ */

export async function getUserByEmail(email: string): Promise<User | null> {
  const prisma = await getPrismaClient();
  if (prisma) {
    try {
      const u = await prisma.user.findUnique({ where: { email } });
      if (u) return normalizeUser(u);
    } catch {
      /* fall through to in-memory */
    }
  }
  const normalized = email.trim().toLowerCase();
  return store().users.find((u) => u.email.toLowerCase() === normalized) ?? null;
}

export async function getUserById(userId: string): Promise<User | null> {
  return store().users.find((u) => u.id === userId) ?? null;
}

export async function verifyPassword(user: User, password: string): Promise<boolean> {
  if (!user.passwordHash) return false;
  return compare(password, user.passwordHash);
}

export async function createUser(input: {
  email: string;
  name: string;
  password: string;
  role?: Role;
}): Promise<User> {
  const email = input.email.trim().toLowerCase();
  const role: Role = input.role === 'SELLER' ? 'SELLER' : 'BUYER';

  const prisma = await getPrismaClient();
  if (prisma) {
    try {
      const created = await prisma.user.create({
        data: {
          email,
          name: input.name,
          role,
          passwordHash: hashSync(input.password, BCRYPT_ROUNDS),
        },
      });
      return normalizeUser(created);
    } catch {
      /* fall through to in-memory */
    }
  }

  const user: User = {
    id: id('u'),
    email,
    name: input.name,
    role,
    passwordHash: hashSync(input.password, BCRYPT_ROUNDS),
    createdAt: new Date(),
  };
  store().users.push(user);
  persist();
  return user;
}

function normalizeUser(u: any): User {
  return {
    id: u.id,
    email: u.email,
    name: u.name ?? '',
    role: (u.role as Role) ?? 'BUYER',
    image: u.image ?? null,
    passwordHash: u.passwordHash ?? null,
    createdAt: u.createdAt ?? new Date(),
  };
}

/* ------------------------------------------------------------------ */
/* Listings                                                            */
/* ------------------------------------------------------------------ */

export interface ListingFilters {
  category?: string;
  search?: string;
}

export async function getListings(filters: ListingFilters = {}): Promise<Listing[]> {
  const prisma = await getPrismaClient();
  if (prisma) {
    try {
      const rows = await prisma.listing.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        include: { seller: true },
      });
      if (rows?.length) {
        const mapped = rows.map((r: any) => normalizeListing(r));
        return applyFilters(mapped, filters);
      }
    } catch {
      /* fall through to in-memory */
    }
  }
  const active = store().listings.filter((l) => l.status === 'ACTIVE');
  return applyFilters(active, filters);
}

function applyFilters(listings: Listing[], filters: ListingFilters): Listing[] {
  let result = listings;
  if (filters.category && filters.category !== 'All') {
    result = result.filter((l) => l.category === filters.category);
  }
  if (filters.search && filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    result = result.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q) ||
        l.techStack.some((t) => t.toLowerCase().includes(q)),
    );
  }
  return [...result].sort((a, b) => b.sales - a.sales);
}

export async function getFeaturedListings(limit = 3): Promise<Listing[]> {
  const all = await getListings();
  const featured = all.filter((l) => l.featured);
  return (featured.length ? featured : all).slice(0, limit);
}

/**
 * Public lookup — only returns listings that are currently on sale.
 * Use this for checkout and marketplace browsing.
 */
export async function getListing(listingId: string): Promise<Listing | null> {
  const all = await getListings();
  return all.find((l) => l.id === listingId) ?? null;
}

/**
 * Lookup that ignores status.
 *
 * A buyer keeps access to a website after the seller pauses or delists it, so
 * dashboards must be able to resolve those listings — `getListing` filters to
 * ACTIVE and would drop them.
 */
export async function getListingAnyStatus(listingId: string): Promise<Listing | null> {
  const prisma = await getPrismaClient();
  if (prisma) {
    try {
      const row = await prisma.listing.findUnique({
        where: { id: listingId },
        include: { seller: true },
      });
      if (row) return normalizeListing(row);
    } catch (err) {
      console.error('[data] Listing lookup failed, using in-memory store:', err);
    }
  }
  return store().listings.find((l) => l.id === listingId) ?? null;
}

/** Batch variant of `getListingAnyStatus`, for dashboard lists. */
export async function getListingsByIds(ids: string[]): Promise<Map<string, Listing>> {
  const unique = Array.from(new Set(ids));
  const entries = await Promise.all(
    unique.map(async (listingId) => [listingId, await getListingAnyStatus(listingId)] as const),
  );
  const map = new Map<string, Listing>();
  for (const [listingId, listing] of entries) if (listing) map.set(listingId, listing);
  return map;
}

function normalizeListing(r: any): Listing {
  return {
    id: r.id,
    title: r.title,
    tagline: r.description?.slice(0, 60) ?? '',
    description: r.description ?? '',
    price: r.price,
    category: r.category,
    techStack: r.techStack ?? [],
    palette: computePalette(r.category || r.title),
    demoUrl: r.demoUrl ?? null,
    status: r.status,
    sellerId: r.sellerId,
    sellerName: r.seller?.name ?? 'Seller',
    rating: 4.8,
    sales: 0,
    featured: false,
    createdAt: r.createdAt ?? new Date(),
  };
}

/* ------------------------------------------------------------------ */
/* Categories & stats                                                  */
/* ------------------------------------------------------------------ */

export async function getCategories(): Promise<Category[]> {
  const listings = await getListings();
  const counts = new Map<string, number>();
  for (const l of listings) counts.set(l.category, (counts.get(l.category) ?? 0) + 1);
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Landing page metrics.
 *
 * These are computed from real store data. They used to add invented constants
 * (+340 sales, "10,000+" users, "$2M+" earned), which misrepresents the
 * marketplace to visitors.
 */
export async function getLandingStats() {
  const listings = await getListings();
  const s = store();

  const totalSales = listings.reduce((sum, l) => sum + l.sales, 0);
  const rated = listings.filter((l) => l.rating > 0);
  const avgRating = rated.length
    ? rated.reduce((sum, l) => sum + l.rating, 0) / rated.length
    : 0;

  const sellerEarnings =
    s.orders
      .filter((o) => o.status !== 'REFUNDED')
      .reduce((sum, o) => sum + o.amount, 0) * (1 - PLATFORM_FEE_RATE);

  const compact = (n: number) =>
    n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000 ? `$${(n / 1_000).toFixed(1)}K`
    : `$${Math.round(n)}`;

  return [
    { label: 'Websites Listed', value: `${listings.length}` },
    { label: 'Websites Sold', value: `${totalSales}` },
    { label: 'Earned by Sellers', value: compact(sellerEarnings) },
    { label: 'Average Rating', value: avgRating ? `${avgRating.toFixed(1)}★` : '—' },
  ];
}

/* ------------------------------------------------------------------ */
/* Reviews                                                             */
/* ------------------------------------------------------------------ */

export async function getReviews(listingId: string): Promise<Review[]> {
  return store()
    .reviews.filter((r) => r.listingId === listingId)
    .sort((a, b) => +b.createdAt - +a.createdAt);
}

/* ------------------------------------------------------------------ */
/* Orders / checkout                                                   */
/* ------------------------------------------------------------------ */

/** Orders that represent a live entitlement to a listing. */
const OWNING_STATUSES: OrderStatus[] = ['PENDING', 'PAID', 'COMPLETED', 'DISPUTED'];

/** True when the buyer already holds this listing (blocks double purchases). */
export async function hasPurchased(buyerId: string, listingId: string): Promise<boolean> {
  return store().orders.some(
    (o) => o.buyerId === buyerId && o.listingId === listingId && OWNING_STATUSES.includes(o.status),
  );
}

export async function createOrder(input: {
  buyerId: string;
  listingId: string;
  amount: number;
  layoutChoice?: string;
  codeUnlocked?: boolean;
}): Promise<Order> {
  const listing = await getListing(input.listingId);
  const order: Order = {
    id: id('o'),
    buyerId: input.buyerId,
    sellerId: listing?.sellerId ?? '',
    listingId: input.listingId,
    listingTitle: listing?.title ?? 'Website',
    amount: Math.round(input.amount * 100) / 100,
    status: 'PAID',
    layoutChoice: input.layoutChoice || 'Hero-Centered',
    codeUnlocked: !!input.codeUnlocked,
    createdAt: new Date(),
  };

  const prisma = await getPrismaClient();
  if (prisma) {
    try {
      const created = await prisma.order.create({
        data: {
          buyerId: order.buyerId,
          listingId: order.listingId,
          amount: order.amount,
          status: 'PAID',
          layoutChoice: order.layoutChoice,
          codeUnlocked: order.codeUnlocked,
        },
      });
      // Keep the same identifier on both sides so lookups agree.
      if (created?.id) order.id = created.id;
    } catch (err) {
      console.error('[data] Order write to database failed, keeping in-memory copy:', err);
    }
  }

  store().orders.push(order);
  if (listing) listing.sales += 1;
  persist();
  return order;
}

export async function getOrder(orderId: string): Promise<Order | null> {
  return store().orders.find((o) => o.id === orderId) ?? null;
}

export async function getBuyerOrders(buyerId: string): Promise<Order[]> {
  return store()
    .orders.filter((o) => o.buyerId === buyerId)
    .sort((a, b) => +b.createdAt - +a.createdAt);
}

/* ------------------------------------------------------------------ */
/* Wishlist                                                            */
/* ------------------------------------------------------------------ */

export async function isWishlisted(userId: string, listingId: string): Promise<boolean> {
  return store().wishlist.some((w) => w.userId === userId && w.listingId === listingId);
}

export async function toggleWishlist(
  userId: string,
  listingId: string,
): Promise<{ wishlisted: boolean }> {
  const s = store();
  const existing = s.wishlist.find((w) => w.userId === userId && w.listingId === listingId);
  if (existing) {
    s.wishlist = s.wishlist.filter((w) => w.id !== existing.id);
    persist();
    return { wishlisted: false };
  }
  s.wishlist.push({ id: id('w'), userId, listingId, createdAt: new Date() });
  persist();
  return { wishlisted: true };
}

export async function getWishlist(userId: string): Promise<Listing[]> {
  const s = store();
  const ids = s.wishlist.filter((w) => w.userId === userId).map((w) => w.listingId);
  return s.listings.filter((l) => ids.includes(l.id));
}

export async function getWishlistCount(userId: string): Promise<number> {
  return store().wishlist.filter((w) => w.userId === userId).length;
}

/* ------------------------------------------------------------------ */
/* Seller / admin                                                      */
/* ------------------------------------------------------------------ */

export async function getSellerListings(sellerId: string): Promise<Listing[]> {
  return store()
    .listings.filter((l) => l.sellerId === sellerId)
    .sort((a, b) => +b.createdAt - +a.createdAt);
}

/** Every order placed against a given seller's listings. */
export async function getSellerOrders(sellerId: string): Promise<Order[]> {
  const listingIds = new Set(
    store().listings.filter((l) => l.sellerId === sellerId).map((l) => l.id),
  );
  return store()
    .orders.filter((o) => o.sellerId === sellerId || listingIds.has(o.listingId))
    .sort((a, b) => +b.createdAt - +a.createdAt);
}

export interface SellerStats {
  active: number;
  drafts: number;
  revenue: number;
  /** Revenue booked in the last 30 days. */
  revenue30d: number;
  netRevenue: number;
  refunded: number;
  unitsSold: number;
  avgOrderValue: number;
  avgRating: number;
  reviewCount: number;
  conversionBase: number;
  listings: Listing[];
  orders: Order[];
  topListing: Listing | null;
}

/** Platform commission withheld from seller payouts. */
export const PLATFORM_FEE_RATE = 0.1;

export async function getSellerStats(sellerId: string): Promise<SellerStats> {
  const listings = await getSellerListings(sellerId);
  const orders = await getSellerOrders(sellerId);
  const listingIds = new Set(listings.map((l) => l.id));

  const paidOrders = orders.filter((o) => o.status !== 'REFUNDED');
  const refundedOrders = orders.filter((o) => o.status === 'REFUNDED');

  const revenue = paidOrders.reduce((sum, o) => sum + o.amount, 0);
  const refunded = refundedOrders.reduce((sum, o) => sum + o.amount, 0);

  const cutoff = Date.now() - 30 * 86_400_000;
  const revenue30d = paidOrders
    .filter((o) => +o.createdAt >= cutoff)
    .reduce((sum, o) => sum + o.amount, 0);

  const reviews = store().reviews.filter((r) => listingIds.has(r.listingId));
  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const topListing =
    [...listings].sort((a, b) => b.sales - a.sales).find((l) => l.sales > 0) ?? null;

  return {
    active: listings.filter((l) => l.status === 'ACTIVE').length,
    drafts: listings.filter((l) => l.status === 'DRAFT' || l.status === 'PAUSED').length,
    revenue: Math.round(revenue * 100) / 100,
    revenue30d: Math.round(revenue30d * 100) / 100,
    netRevenue: Math.round(revenue * (1 - PLATFORM_FEE_RATE) * 100) / 100,
    refunded: Math.round(refunded * 100) / 100,
    unitsSold: paidOrders.length,
    avgOrderValue: paidOrders.length ? Math.round((revenue / paidOrders.length) * 100) / 100 : 0,
    avgRating: Math.round(avgRating * 10) / 10,
    reviewCount: reviews.length,
    conversionBase: listings.reduce((sum, l) => sum + l.sales, 0),
    listings,
    orders,
    topListing,
  };
}

/** Per-listing performance breakdown for the seller table. */
export async function getSellerListingPerformance(sellerId: string) {
  const listings = await getSellerListings(sellerId);
  const orders = await getSellerOrders(sellerId);
  const reviews = store().reviews;

  return listings.map((listing) => {
    const listingOrders = orders.filter(
      (o) => o.listingId === listing.id && o.status !== 'REFUNDED',
    );
    const listingReviews = reviews.filter((r) => r.listingId === listing.id);
    const rating = listingReviews.length
      ? listingReviews.reduce((sum, r) => sum + r.rating, 0) / listingReviews.length
      : listing.rating;

    return {
      listing,
      revenue: Math.round(listingOrders.reduce((sum, o) => sum + o.amount, 0) * 100) / 100,
      unitsSold: listingOrders.length,
      rating: Math.round(rating * 10) / 10,
      reviewCount: listingReviews.length,
    };
  });
}

export interface BuyerStats {
  ownedCount: number;
  wishlistCount: number;
  totalSpent: number;
  codeUnlocks: number;
  activeEscrow: number;
  refunded: number;
}

export async function getBuyerStats(buyerId: string): Promise<BuyerStats> {
  const orders = await getBuyerOrders(buyerId);
  const settled = orders.filter((o) => o.status !== 'REFUNDED');

  return {
    ownedCount: settled.length,
    wishlistCount: await getWishlistCount(buyerId),
    totalSpent: Math.round(settled.reduce((sum, o) => sum + o.amount, 0) * 100) / 100,
    codeUnlocks: settled.filter((o) => o.codeUnlocked).length,
    activeEscrow: orders.filter((o) => o.status === 'PAID').length,
    refunded: orders.filter((o) => o.status === 'REFUNDED').length,
  };
}

/**
 * Escrow window helper — orders sit in escrow for 72 hours after payment.
 */
export const ESCROW_WINDOW_MS = 72 * 60 * 60 * 1000;

export function escrowStatus(order: Order): {
  inEscrow: boolean;
  hoursRemaining: number;
  releasesAt: Date;
} {
  const releasesAt = new Date(+order.createdAt + ESCROW_WINDOW_MS);
  const remainingMs = +releasesAt - Date.now();
  const inEscrow = order.status === 'PAID' && remainingMs > 0;
  return {
    inEscrow,
    hoursRemaining: inEscrow ? Math.ceil(remainingMs / 3_600_000) : 0,
    releasesAt,
  };
}

export async function getRecentOrders(limit = 5): Promise<Order[]> {
  return [...store().orders].sort((a, b) => +b.createdAt - +a.createdAt).slice(0, limit);
}

export async function getAdminStats() {
  const s = store();
  const gmv = s.orders
    .filter((o) => o.status !== 'REFUNDED')
    .reduce((sum, o) => sum + o.amount, 0);
  const refunded = s.orders
    .filter((o) => o.status === 'REFUNDED')
    .reduce((sum, o) => sum + o.amount, 0);

  return {
    totalUsers: s.users.length,
    sellers: s.users.filter((u) => u.role === 'SELLER').length,
    buyers: s.users.filter((u) => u.role === 'BUYER').length,
    gmv: Math.round(gmv * 100) / 100,
    refunded: Math.round(refunded * 100) / 100,
    platformFees: Math.round(gmv * PLATFORM_FEE_RATE * 100) / 100,
    orderCount: s.orders.length,
    listingCount: s.listings.length,
    activeListings: s.listings.filter((l) => l.status === 'ACTIVE').length,
    queue: s.listings.filter((l) => l.status === 'DRAFT').length,
    newsletterCount: s.newsletter.length,
  };
}

export async function getRecentUsers(limit = 5): Promise<User[]> {
  return [...store().users]
    .sort((a, b) => +b.createdAt - +a.createdAt)
    .slice(0, limit);
}

/* ------------------------------------------------------------------ */
/* Newsletter                                                          */
/* ------------------------------------------------------------------ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export async function subscribeNewsletter(
  email: string,
): Promise<{ ok: boolean; error?: string; alreadySubscribed?: boolean }> {
  const value = email.trim().toLowerCase();
  if (!isValidEmail(value)) return { ok: false, error: 'Please enter a valid email address.' };
  const s = store();
  if (s.newsletter.includes(value)) return { ok: true, alreadySubscribed: true };
  s.newsletter.push(value);
  persist();
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Password reset (OTP)                                                */
/* ------------------------------------------------------------------ */

/** Maximum wrong OTP guesses before the code is destroyed. */
const MAX_OTP_ATTEMPTS = 5;

function hashOtp(otp: string): string {
  return createHash('sha256').update(otp).digest('hex');
}

/** Constant-time string comparison to avoid leaking the code via timing. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function requestPasswordReset(email: string): Promise<{ ok: boolean; otp?: string; error?: string }> {
  const normalized = email.trim().toLowerCase();
  const user = await getUserByEmail(normalized);
  if (!user) {
    // Don't reveal whether account exists
    return { ok: true };
  }

  const s = store();
  // crypto-grade randomness — Math.random() is predictable and unsuitable here.
  const otp = String(randomInt(0, 1_000_000)).padStart(6, '0');
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Remove previous for this email
  s.passwordResets = s.passwordResets.filter((r) => r.email !== normalized);
  // Only the hash is retained, so a snapshot leak cannot reveal live codes.
  s.passwordResets.push({ email: normalized, otpHash: hashOtp(otp), expiresAt, attempts: 0 });
  persist();

  return { ok: true, otp };
}

export async function verifyAndResetPassword(
  email: string,
  otp: string,
  newPassword: string
): Promise<{ ok: boolean; error?: string }> {
  const normalized = email.trim().toLowerCase();
  const s = store();

  const reset = s.passwordResets.find((r) => r.email === normalized);

  if (!reset || reset.expiresAt <= Date.now()) {
    if (reset) {
      s.passwordResets = s.passwordResets.filter((r) => r.email !== normalized);
      persist();
    }
    return { ok: false, error: 'Invalid or expired code.' };
  }

  if (!safeEqual(reset.otpHash, hashOtp(otp))) {
    reset.attempts += 1;
    // Burn the code after too many guesses so it cannot be brute-forced.
    if (reset.attempts >= MAX_OTP_ATTEMPTS) {
      s.passwordResets = s.passwordResets.filter((r) => r.email !== normalized);
      persist();
      return { ok: false, error: 'Too many incorrect attempts. Please request a new code.' };
    }
    persist();
    return { ok: false, error: 'Invalid or expired code.' };
  }

  const user = await getUserByEmail(normalized);
  if (!user) {
    return { ok: false, error: 'Invalid or expired code.' };
  }

  const prisma = await getPrismaClient();
  const newHash = hashSync(newPassword, BCRYPT_ROUNDS);

  if (prisma) {
    try {
      await prisma.user.update({
        where: { email: normalized },
        data: { passwordHash: newHash },
      });
    } catch (err) {
      console.error('[data] Password update in database failed:', err);
    }
  }

  // Update in-memory
  const memUser = s.users.find((u) => u.email.toLowerCase() === normalized);
  if (memUser) {
    memUser.passwordHash = newHash;
    // Invalidate sessions issued before the reset.
    memUser.sessionVersion = (memUser.sessionVersion ?? 0) + 1;
  }

  // Consume the reset token
  s.passwordResets = s.passwordResets.filter((r) => r.email !== normalized);
  persist();

  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Visual editor state                                                 */
/* ------------------------------------------------------------------ */

export const DEFAULT_EDITOR_STATE: Omit<EditorState, 'orderId' | 'updatedAt'> = {
  theme: 'Night',
  accent: '#ffffff',
  font: 'Inter',
  sections: { Hero: true, Stats: true, Featured: true, Footer: true },
  content: {},
  published: false,
};

export async function getEditorState(orderId: string): Promise<EditorState | null> {
  return store().editorStates[orderId] ?? null;
}

export async function saveEditorState(
  orderId: string,
  patch: Partial<Omit<EditorState, 'orderId' | 'updatedAt'>>,
): Promise<EditorState> {
  const s = store();
  const existing = s.editorStates[orderId];

  const next: EditorState = {
    orderId,
    theme: patch.theme ?? existing?.theme ?? DEFAULT_EDITOR_STATE.theme,
    accent: patch.accent ?? existing?.accent ?? DEFAULT_EDITOR_STATE.accent,
    font: patch.font ?? existing?.font ?? DEFAULT_EDITOR_STATE.font,
    sections: { ...DEFAULT_EDITOR_STATE.sections, ...existing?.sections, ...patch.sections },
    content: { ...existing?.content, ...patch.content },
    published: patch.published ?? existing?.published ?? false,
    updatedAt: new Date(),
  };

  s.editorStates[orderId] = next;
  persist();
  return next;
}
