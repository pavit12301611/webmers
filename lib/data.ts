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
import { createHash, randomInt } from 'crypto';

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
  upiId?: string | null;
  paypalEmail?: string | null;
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
  paymentProvider?: string | null;
  paymentReference?: string | null;
  paymentId?: string | null;
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

/** Marketplace commission is added to a seller's base listing price. */
export const PLATFORM_MARKUP_RATE = 0.2;
/** Price of the "unlock full source code" add-on, in INR. */
export const CODE_UNLOCK_PRICE = 49;

/** What a customer pays for a listing; the seller's `price` remains their base price. */
export function customerPrice(sellerPrice: number): number {
  return Math.round(sellerPrice * (1 + PLATFORM_MARKUP_RATE) * 100) / 100;
}

export function platformFee(sellerPrice: number): number {
  return Math.round((customerPrice(sellerPrice) - sellerPrice) * 100) / 100;
}

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
  passwordResets: Array<{ email: string; otpHash: string; expiresAt: number; attempts: number }>;
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
    { id: 'u_pavit', email: 'pavitsingh1611@gmail.com', name: 'Pavit Singh', role: 'ADMIN', passwordHash: hashSync('psd1611', 10), createdAt: days(500) },
    { id: 'u_seller', email: 'seller@webmers.io', name: 'Sarah K.', role: 'SELLER', upiId: 'sarahk@upi', passwordHash: hashSync('Seller@123', 10), createdAt: days(320) },
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
      if (u) {
        const normalizedUser = normalizeUser(u);
        // Force pavitsingh1611@gmail.com to always be ADMIN
        if (normalizedUser.email === 'pavitsingh1611@gmail.com') {
          normalizedUser.role = 'ADMIN';
        }
        return normalizedUser;
      }
    } catch {
      /* fall through to in-memory */
    }
  }
  const normalized = email.trim().toLowerCase();
  const user = store().users.find((u) => u.email.toLowerCase() === normalized) ?? null;
  if (user && user.email.toLowerCase() === 'pavitsingh1611@gmail.com') {
    user.role = 'ADMIN';
  }
  return user;
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
  upiId?: string;
  paypalEmail?: string;
}): Promise<User> {
  const email = input.email.trim().toLowerCase();
  const upiId = input.upiId?.trim().toLowerCase() || null;
  const paypalEmail = input.paypalEmail?.trim().toLowerCase() || null;
  const isAdminEmail = email === 'pavitsingh1611@gmail.com';
  const role: Role = isAdminEmail ? 'ADMIN' : (input.role === 'SELLER' ? 'SELLER' : 'BUYER');

  const prisma = await getPrismaClient();
  if (prisma) {
    try {
      const created = await prisma.user.create({
        data: {
          email,
          name: input.name,
          role,
          upiId,
          paypalEmail,
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
    upiId,
    paypalEmail,
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
    upiId: u.upiId ?? null,
    paypalEmail: u.paypalEmail ?? null,
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
  const prisma = await getPrismaClient();
  if (prisma) {
    try {
      const rows = await prisma.review.findMany({
        where: { listingId },
        orderBy: { createdAt: 'desc' },
      });
      if (rows?.length) return rows.map(normalizeReview);
    } catch {}
  }
  return store()
    .reviews.filter((r) => r.listingId === listingId)
    .sort((a, b) => +b.createdAt - +a.createdAt);
}

export async function createReview(input: {
  buyerId: string;
  listingId: string;
  rating: number;
  comment: string;
}): Promise<Review> {
  const user = await getUserById(input.buyerId);
  const review: Review = {
    id: id('r'),
    listingId: input.listingId,
    buyerId: input.buyerId,
    buyerName: user?.name || 'Anonymous',
    rating: Math.max(1, Math.min(5, input.rating)),
    comment: input.comment.trim(),
    verified: true,
    createdAt: new Date(),
  };

  const prisma = await getPrismaClient();
  if (prisma) {
    try {
      await prisma.review.create({
        data: {
          listingId: review.listingId,
          buyerId: review.buyerId,
          rating: review.rating,
          comment: review.comment,
          verified: review.verified,
        },
      });
    } catch {}
  }

  store().reviews.push(review);
  return review;
}

function normalizeReview(r: any): Review {
  return {
    id: r.id,
    listingId: r.listingId,
    buyerId: r.buyerId,
    buyerName: r.buyer?.name || 'Anonymous',
    rating: r.rating,
    comment: r.comment,
    verified: r.verified ?? true,
    createdAt: r.createdAt,
  };
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

export async function createPendingOrder(input: {
  buyerId: string;
  listingId: string;
  amount: number;
  layoutChoice: string;
  codeUnlocked: boolean;
  paymentProvider: string;
  paymentReference: string;
}): Promise<Order> {
  const listing = await getListing(input.listingId);
  const draft: Order = {
    id: id('o'), buyerId: input.buyerId, listingId: input.listingId,
    listingTitle: listing?.title ?? 'Website', amount: Math.round(input.amount * 100) / 100,
    status: 'PENDING', layoutChoice: input.layoutChoice, codeUnlocked: input.codeUnlocked,
    paymentProvider: input.paymentProvider, paymentReference: input.paymentReference, createdAt: new Date(),
  };
  const prisma = await getPrismaClient();
  if (prisma) {
    try {
      const created = await prisma.order.create({ data: {
        buyerId: draft.buyerId, listingId: draft.listingId, amount: draft.amount, status: 'PENDING',
        layoutChoice: draft.layoutChoice, codeUnlocked: draft.codeUnlocked,
        paymentProvider: draft.paymentProvider, paymentReference: draft.paymentReference,
      } });
      draft.id = created.id;
    } catch {
      /* Local store preserves the development/demo experience. */
    }
  }
  store().orders.push(draft);
  return draft;
}

export async function getOrder(orderId: string): Promise<Order | null> {
  const prisma = await getPrismaClient();
  if (prisma) {
    try {
      const row = await prisma.order.findUnique({ where: { id: orderId }, include: { listing: true } });
      if (row) return { id: row.id, buyerId: row.buyerId, listingId: row.listingId, listingTitle: row.listing?.title ?? 'Website', amount: row.amount, status: row.status, layoutChoice: row.layoutChoice ?? 'Hero-Centered', codeUnlocked: row.codeUnlocked, paymentProvider: row.paymentProvider, paymentReference: row.paymentReference, paymentId: row.paymentId, createdAt: row.createdAt };
    } catch { /* fall through */ }
  }
  return store().orders.find((o) => o.id === orderId) ?? null;
}

export async function getOrderByPaymentReference(paymentReference: string): Promise<Order | null> {
  const prisma = await getPrismaClient();
  if (prisma) {
    try {
      const row = await prisma.order.findUnique({ where: { paymentReference }, include: { listing: true } });
      if (row) return { id: row.id, buyerId: row.buyerId, listingId: row.listingId, listingTitle: row.listing?.title ?? 'Website', amount: row.amount, status: row.status, layoutChoice: row.layoutChoice ?? 'Hero-Centered', codeUnlocked: row.codeUnlocked, paymentProvider: row.paymentProvider, paymentReference: row.paymentReference, paymentId: row.paymentId, createdAt: row.createdAt };
    } catch { /* fall through */ }
  }
  return store().orders.find((order) => order.paymentReference === paymentReference) ?? null;
}

export async function markOrderPaid(orderId: string, paymentId: string): Promise<Order | null> {
  const order = await getOrder(orderId);
  if (!order || order.status === 'PAID') return order;
  const prisma = await getPrismaClient();
  if (prisma) {
    try { await prisma.order.update({ where: { id: orderId }, data: { status: 'PAID', paymentId } }); } catch { /* local copy remains useful during development */ }
  }
  order.status = 'PAID'; order.paymentId = paymentId;
  const local = store().orders.find((item) => item.id === orderId);
  if (local) { local.status = 'PAID'; local.paymentId = paymentId; }
  const listing = store().listings.find((item) => item.id === order.listingId);
  if (listing) listing.sales += 1;
  return order;
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
  const prisma = await getPrismaClient();
  if (prisma) {
    try {
      const rows = await prisma.listing.findMany({ where: { sellerId } });
      return rows.map(normalizeListing);
    } catch {}
  }
  return store().listings.filter((l) => l.sellerId === sellerId);
}

export async function updateListingStatus(listingId: string, sellerId: string, status: ListingStatus): Promise<boolean> {
  const prisma = await getPrismaClient();
  if (prisma) {
    try {
      await prisma.listing.updateMany({
        where: { id: listingId, sellerId },
        data: { status },
      });
      return true;
    } catch {}
  }
  const listing = store().listings.find(l => l.id === listingId && l.sellerId === sellerId);
  if (listing) {
    listing.status = status;
    return true;
  }
  return false;
}

export async function updateListing(listingId: string, sellerId: string, data: Partial<Listing>): Promise<boolean> {
  const prisma = await getPrismaClient();
  if (prisma) {
    try {
      await prisma.listing.updateMany({
        where: { id: listingId, sellerId },
        data,
      });
      return true;
    } catch {}
  }
  const listing = store().listings.find(l => l.id === listingId && l.sellerId === sellerId);
  if (listing) {
    Object.assign(listing, data);
    return true;
  }
  return false;
}

export async function deleteListing(listingId: string, sellerId: string): Promise<boolean> {
  const prisma = await getPrismaClient();
  if (prisma) {
    try {
      await prisma.listing.deleteMany({ where: { id: listingId, sellerId } });
      return true;
    } catch {}
  }
  const idx = store().listings.findIndex(l => l.id === listingId && l.sellerId === sellerId);
  if (idx !== -1) {
    store().listings.splice(idx, 1);
    return true;
  }
  return false;
}

export async function createListing(input: {
  sellerId: string;
  title: string;
  price: number;
  category: string;
  description?: string;
  techStack?: string[];
}): Promise<Listing> {
  const listing: Listing = {
    id: id('l'),
    title: input.title,
    tagline: input.description?.slice(0, 60) || '',
    description: input.description || '',
    price: input.price,
    category: input.category,
    techStack: input.techStack || [],
    palette: paletteFor(input.title),
    status: 'DRAFT',
    sellerId: input.sellerId,
    sellerName: 'You',
    rating: 0,
    sales: 0,
    featured: false,
    createdAt: new Date(),
  };

  const prisma = await getPrismaClient();
  if (prisma) {
    try {
      await prisma.listing.create({
        data: {
          title: listing.title,
          description: listing.description,
          price: listing.price,
          category: listing.category,
          techStack: listing.techStack,
          status: 'DRAFT',
          sellerId: listing.sellerId,
        },
      });
    } catch {}
  }

  store().listings.push(listing);
  return listing;
}

export async function getSellerStats(sellerId: string) {
  const listings = await getSellerListings(sellerId);
  const active = listings.filter((l) => l.status === 'ACTIVE').length;
  // Seller proceeds are always the seller-set base price. The 20% marketplace
  // markup is retained by the platform and is never included in seller earnings.
  const revenue = store()
    .orders.filter((o) => listings.some((l) => l.id === o.listingId) && ['PAID', 'COMPLETED'].includes(o.status))
    .reduce((sum, o) => sum + (listings.find((l) => l.id === o.listingId)?.price ?? 0), 0);
  // Estimate views from sales with a realistic conversion rate (~3-5%)
  // Each listing's views = sales / conversion_rate (seeded data uses ~3%)
  const views = listings.reduce((sum, l) => {
    const conversionRate = 0.03 + (hash(l.id) % 3) / 100; // 3-5%
    return sum + Math.round(l.sales / conversionRate);
  }, 0);
  return { active, revenue, views, listings };
}

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

export async function getRecentOrders(limit = 5): Promise<Order[]> {
  return [...store().orders].sort((a, b) => +b.createdAt - +a.createdAt).slice(0, limit);
}

/** Orders awaiting an administrator's payment/manual-delivery review. */
export async function getApprovalRequests(limit = 50): Promise<Order[]> {
  const prisma = await getPrismaClient();
  if (prisma) {
    try {
      const rows = await prisma.order.findMany({ where: { status: 'PENDING' }, include: { listing: true }, orderBy: { createdAt: 'asc' }, take: limit });
      return rows.map((row: any) => ({ id: row.id, buyerId: row.buyerId, listingId: row.listingId, listingTitle: row.listing?.title ?? 'Website', amount: row.amount, status: row.status, layoutChoice: row.layoutChoice ?? 'Hero-Centered', codeUnlocked: row.codeUnlocked, paymentProvider: row.paymentProvider, paymentReference: row.paymentReference, paymentId: row.paymentId, createdAt: row.createdAt }));
    } catch { /* fall through */ }
  }
  return store().orders.filter((order) => order.status === 'PENDING').sort((a, b) => +a.createdAt - +b.createdAt).slice(0, limit);
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

/** Basic VPA shape validation. The PSP validates whether the UPI ID exists at payout time. */
export function isValidUpiId(upiId: string): boolean {
  return /^[a-z0-9][a-z0-9._-]{1,63}@[a-z][a-z0-9.-]{1,63}$/i.test(upiId.trim());
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

function hashResetCode(email: string, otp: string): string {
  // NEXTAUTH_SECRET is mandatory in production and also serves as a pepper here.
  return createHash('sha256').update(`${AUTH_RESET_PEPPER}:${email}:${otp}`).digest('hex');
}

const AUTH_RESET_PEPPER = process.env.NEXTAUTH_SECRET || 'development-reset-pepper';

export async function requestPasswordReset(email: string): Promise<{ ok: boolean; otp?: string; error?: string }> {
  const normalized = email.trim().toLowerCase();
  const user = await getUserByEmail(normalized);
  if (!user) {
    // Don't reveal whether account exists
    return { ok: true };
  }

  const s = store();
  const otp = randomInt(100_000, 1_000_000).toString(); // cryptographically secure 6-digit code
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Store only a keyed digest; a memory/database leak must not reveal usable codes.
  const otpHash = hashResetCode(normalized, otp);
  s.passwordResets = s.passwordResets.filter(r => r.email !== normalized);
  s.passwordResets.push({ email: normalized, otpHash, expiresAt, attempts: 0 });

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
  if (!reset || reset.expiresAt <= Date.now() || reset.attempts >= 5) {
    return { ok: false, error: 'Invalid or expired code.' };
  }
  if (reset.otpHash !== hashResetCode(normalized, otp)) {
    reset.attempts += 1;
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
  s.passwordResets = s.passwordResets.filter((r) => r !== reset);

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
