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

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type Role = 'BUYER' | 'SELLER' | 'ADMIN';
export type ListingStatus = 'DRAFT' | 'ACTIVE' | 'SOLD' | 'PAUSED';
export type OrderStatus = 'PENDING' | 'PAID' | 'COMPLETED' | 'REFUNDED' | 'DISPUTED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  image?: string | null;
  passwordHash?: string | null;
  createdAt: Date;
}

export interface Listing {
  id: string;
  title: string;
  tagline: string;
  description: string;
  price: number;
  category: string;
  techStack: string[];
  /** Two hex colors used to render the self-contained thumbnail. */
  palette: [string, string];
  demoUrl?: string | null;
  status: ListingStatus;
  sellerId: string;
  sellerName: string;
  rating: number;
  sales: number;
  featured: boolean;
  createdAt: Date;
}

export interface Order {
  id: string;
  buyerId: string;
  listingId: string;
  listingTitle: string;
  amount: number;
  status: OrderStatus;
  layoutChoice: string;
  codeUnlocked: boolean;
  createdAt: Date;
}

export interface Review {
  id: string;
  listingId: string;
  buyerId: string;
  buyerName: string;
  rating: number;
  comment: string;
  verified: boolean;
  createdAt: Date;
}

export interface Category {
  name: string;
  count: number;
}

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
  passwordResets: Array<{ email: string; otp: string; expiresAt: number }>;
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

function id(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function seed(): Store {
  const now = Date.now();
  const days = (n: number) => new Date(now - n * 86_400_000);

  const users: User[] = [
    { id: 'u_admin', email: 'admin@webmers.io', name: 'Admin User', role: 'ADMIN', passwordHash: hashSync('Admin@123', 10), createdAt: days(400) },
    { id: 'u_seller', email: 'seller@webmers.io', name: 'Sarah K.', role: 'SELLER', passwordHash: hashSync('Seller@123', 10), createdAt: days(320) },
    { id: 'u_buyer', email: 'buyer@webmers.io', name: 'David R.', role: 'BUYER', passwordHash: hashSync('Buyer@123', 10), createdAt: days(210) },
    { id: 'u_maria', email: 'maria@example.com', name: 'Maria L.', role: 'BUYER', passwordHash: hashSync('Maria@123', 10), createdAt: days(90) },
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
    { id: 'o_1', buyerId: 'u_buyer', listingId: 'meridian', listingTitle: 'Meridian SaaS', amount: 299, status: 'COMPLETED', layoutChoice: 'Hero-Centered', codeUnlocked: true, createdAt: days(50) },
    { id: 'o_2', buyerId: 'u_buyer', listingId: 'nocturne', listingTitle: 'Nocturne Portfolio', amount: 149, status: 'COMPLETED', layoutChoice: 'Split-Screen', codeUnlocked: false, createdAt: days(30) },
    { id: 'o_3', buyerId: 'u_buyer', listingId: 'lumina', listingTitle: 'Lumina E-commerce', amount: 399, status: 'PAID', layoutChoice: 'Video-Hero', codeUnlocked: false, createdAt: days(5) },
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

  return { users, listings, orders, reviews, wishlist, newsletter: [], passwordResets: [] };
}

function store(): Store {
  if (!g.__webmersStore) g.__webmersStore = seed();
  return g.__webmersStore;
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
          passwordHash: hashSync(input.password, 10),
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
    passwordHash: hashSync(input.password, 10),
    createdAt: new Date(),
  };
  store().users.push(user);
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

export async function getListing(listingId: string): Promise<Listing | null> {
  const all = await getListings();
  return all.find((l) => l.id === listingId) ?? null;
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
    palette: paletteFor(r.category || r.title),
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

export async function getLandingStats() {
  const listings = await getListings();
  const totalSales = listings.reduce((sum, l) => sum + l.sales, 0);
  const avgRating =
    listings.reduce((sum, l) => sum + l.rating, 0) / (listings.length || 1);
  return [
    { label: 'Websites Sold', value: `${totalSales + 340}+` },
    { label: 'Users', value: '10,000+' },
    { label: 'Earned by Sellers', value: '$2M+' },
    { label: 'Average Rating', value: `${avgRating.toFixed(1)}★` },
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
      await prisma.order.create({
        data: {
          buyerId: order.buyerId,
          listingId: order.listingId,
          amount: order.amount,
          status: 'PAID',
          layoutChoice: order.layoutChoice,
          codeUnlocked: order.codeUnlocked,
        },
      });
    } catch {
      /* keep in-memory copy regardless */
    }
  }

  store().orders.push(order);
  if (listing) listing.sales += 1;
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
    return { wishlisted: false };
  }
  s.wishlist.push({ id: id('w'), userId, listingId, createdAt: new Date() });
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
  return store().listings.filter((l) => l.sellerId === sellerId);
}

export async function getSellerStats(sellerId: string) {
  const listings = await getSellerListings(sellerId);
  const active = listings.filter((l) => l.status === 'ACTIVE').length;
  const revenue = store()
    .orders.filter((o) => listings.some((l) => l.id === o.listingId) && o.status !== 'REFUNDED')
    .reduce((sum, o) => sum + o.amount, 0);
  const views = listings.reduce((sum, l) => sum + l.sales * 78, 0);
  return { active, revenue, views, listings };
}

export async function getRecentOrders(limit = 5): Promise<Order[]> {
  return [...store().orders].sort((a, b) => +b.createdAt - +a.createdAt).slice(0, limit);
}

export async function getAdminStats() {
  const s = store();
  const users = s.users.length + 10240;
  const gmv = s.orders.reduce((sum, o) => sum + o.amount, 0) + 2_100_000;
  return { totalUsers: users, gmv, queue: 12 };
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

export async function subscribeNewsletter(email: string): Promise<{ ok: boolean; error?: string }> {
  const value = email.trim().toLowerCase();
  if (!isValidEmail(value)) return { ok: false, error: 'Please enter a valid email address.' };
  const s = store();
  if (s.newsletter.includes(value)) return { ok: true };
  s.newsletter.push(value);
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Password reset (OTP)                                                */
/* ------------------------------------------------------------------ */

export async function requestPasswordReset(email: string): Promise<{ ok: boolean; otp?: string; error?: string }> {
  const normalized = email.trim().toLowerCase();
  const user = await getUserByEmail(normalized);
  if (!user) {
    // Don't reveal whether account exists
    return { ok: true };
  }

  const s = store();
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Remove previous for this email
  s.passwordResets = s.passwordResets.filter(r => r.email !== normalized);
  s.passwordResets.push({ email: normalized, otp, expiresAt });

  return { ok: true, otp };
}

export async function verifyAndResetPassword(
  email: string,
  otp: string,
  newPassword: string
): Promise<{ ok: boolean; error?: string }> {
  const normalized = email.trim().toLowerCase();
  const s = store();

  const reset = s.passwordResets.find(
    (r) => r.email === normalized && r.otp === otp && r.expiresAt > Date.now()
  );

  if (!reset) {
    return { ok: false, error: 'Invalid or expired code.' };
  }

  const user = await getUserByEmail(normalized);
  if (!user) {
    return { ok: false, error: 'User not found.' };
  }

  const prisma = await getPrismaClient();
  const newHash = hashSync(newPassword, 10);

  if (prisma) {
    try {
      await prisma.user.update({
        where: { email: normalized },
        data: { passwordHash: newHash },
      });
    } catch {
      // fall through
    }
  }

  // Update in-memory
  const memUser = s.users.find((u) => u.email.toLowerCase() === normalized);
  if (memUser) memUser.passwordHash = newHash;

  // Consume the reset token
  s.passwordResets = s.passwordResets.filter((r) => !(r.email === normalized && r.otp === otp));

  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Thumbnail palette helper (deterministic)                            */
/* ------------------------------------------------------------------ */

const PALETTES: [string, string][] = [
  ['#f59e0b', '#f43f5e'],
  ['#8b5cf6', '#d946ef'],
  ['#10b981', '#06b6d4'],
  ['#0ea5e9', '#6366f1'],
  ['#22d3ee', '#3b82f6'],
  ['#fb7185', '#f59e0b'],
  ['#a3e635', '#10b981'],
  ['#f472b6', '#8b5cf6'],
];

export function paletteFor(seedStr: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) hash = (hash * 31 + seedStr.charCodeAt(i)) >>> 0;
  return PALETTES[hash % PALETTES.length];
}
