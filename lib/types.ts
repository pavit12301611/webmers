/**
 * Shared domain types.
 *
 * Kept separate from `lib/data.ts` so client components can import the shapes
 * without pulling the server-only data layer into the browser bundle.
 */

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
  /** Incremented on password reset to invalidate older sessions. */
  sessionVersion?: number;
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
  /** Denormalised so seller dashboards can attribute revenue without a join. */
  sellerId: string;
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

/** Persisted state of the visual editor for one purchased website. */
export interface EditorState {
  orderId: string;
  theme: string;
  accent: string;
  font: string;
  sections: Record<string, boolean>;
  content: Record<string, string>;
  published: boolean;
  updatedAt: Date;
}
