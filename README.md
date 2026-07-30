# Webmers

A premium, production-grade **website marketplace** — *Buy. Edit. Own.* Browse fully-built websites, purchase with escrow-protected checkout, edit them in a no-code visual editor, and optionally unlock the full source code.

> **Runs with zero setup.** The app ships with a self-contained, seeded in-memory data layer, so every feature works out of the box — no database, no API keys, no external services required. When you're ready for production, point it at PostgreSQL via Prisma (see below).

---

## ✨ Features (all working)

- **Marketplace** — browse, search, and filter websites by category
- **Listing detail pages** — gallery, tech stack, reviews, related listings, live demo link
- **Auth** — email/password sign-up & sign-in (role: Buyer or Seller), optional Google OAuth, session with `id` + `role`
- **Checkout** — real order creation, layout selection, code-unlock add-on, server-computed totals, escrow messaging
- **Wishlist** — toggle hearts on any listing, synced to your account
- **Newsletter** — validated signup
- **Dashboards** — Buyer (orders + wishlist), Seller (listings + revenue), Admin (users, transactions, health) — all role-protected
- **Visual Editor** — interactive: device preview (desktop/tablet/mobile), themes, accent colors, typography, section toggles, inline text editing, save/publish feedback
- **Cinematic landing page** — animated night sky (stars, moon, fireflies) → daytime footer, fully self-contained (no external images)

## 🧰 Stack

- **Frontend:** Next.js 14 (App Router) + React 18 + Tailwind CSS + lucide-react
- **Auth:** NextAuth (JWT sessions) — Credentials + optional Google
- **Data:** Resilient data layer — in-memory (default) with a transparent Prisma/PostgreSQL bridge
- **Security:** CSP, HSTS-ready headers, X-Frame-Options, Referrer-Policy, Permissions-Policy, role-based route protection

---

## 🚀 Getting started

```bash
npm install
npm run dev
```

Visit **http://localhost:3000**. That's it — no `.env` needed.

### Demo accounts

| Role   | Email               | Password     |
|--------|---------------------|--------------|
| Buyer  | `buyer@webmers.io`  | `Buyer@123`  |
| Seller | `seller@webmers.io` | `Seller@123` |
| Admin  | `admin@webmers.io`  | `Admin@123`  |

These are also one click away on the sign-in page.

---

## 🗄️ Using a real database (optional)

The app defaults to an in-memory store. To use PostgreSQL:

1. Set `DATABASE_URL` in `.env` (see `.env.example`).
2. Generate the client, push the schema, and seed demo data:

   ```bash
   npm run db:generate   # generate the Prisma client
   npm run db:push       # create tables in your database
   npm run db:seed       # seed demo users & listings
   ```

3. Restart the dev server. The data layer automatically uses Prisma and
   gracefully falls back to in-memory if the DB is unreachable.

> The build never depends on a generated Prisma client, so `npm run build`
> works whether or not a database is configured.

---

## 📁 Structure

```
app/
  page.tsx                    # Cinematic landing page (server component)
  marketplace/                # Browse + search + category filters
  listing/[id]/               # Listing detail (gallery, reviews, buy)
  checkout/                   # Checkout + confirmation
  editor/                     # Interactive no-code visual editor
  dashboard/{buyer,seller,admin}/
  auth/{signin,signup}/
  api/
    auth/[...nextauth]/       # NextAuth handler
    auth/signup/              # Account creation
    listings/                 # Public marketplace API
    checkout/                 # Order creation (server-priced)
    wishlist/                 # Wishlist toggle + list
    newsletter/               # Newsletter signup
components/                   # Reusable UI (thumbnails, cards, header, footer…)
lib/
  data.ts                     # Resilient data layer (in-memory + Prisma bridge)
  auth/                       # NextAuth options, shared secret, helpers
prisma/schema.prisma          # Production DB schema
scripts/seed.ts               # Prisma seed (for real DBs)
middleware.ts                 # Auth + role-based route protection
```

---

## 🔒 Security notes

- Tight Content-Security-Policy and security headers on every response.
- Order amounts are computed **server-side** (never trust the client).
- No secrets shipped to the client bundle; `.env` is git-ignored.
- Dashboards are protected at the edge (middleware) and again on the server.

---

## 🚢 Production deployment checklist

The seeded store is intentional for local previews, but it is not durable storage. Before accepting real customers:

1. Set `NODE_ENV=production`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`, and a unique `NEXTAUTH_SECRET` (for example `openssl rand -base64 32`). Never use the development fallback secret.
2. Configure PostgreSQL, run `npm run db:generate && npm run db:push && npm run db:seed`, and verify the database has backups and connection pooling. Do not rely on the in-memory fallback for production data.
3. Configure a verified SMTP sender (`SMTP_*`). Ethereal is development-only and does not deliver real customer email.
4. Integrate and test a PCI-compliant payment provider with signed webhooks before enabling checkout. The app deliberately blocks the demo order flow in production unless `PAYMENTS_DEMO_MODE=true`; do not enable that flag on a live site.
5. Configure your platform's shared rate limiter/WAF, object storage for uploads, error monitoring, analytics consent, and an uptime monitor for `GET /api/health`.
6. Review the legal pages, support address, privacy obligations, taxes, seller agreements, and refund process with your counsel for the countries where you operate.
7. Run `npm run build`, deploy over HTTPS, and validate the security headers, sitemap, robots file, sign-in, reset email, checkout, and role authorization in the deployed environment.

## 🗺️ Roadmap

- Stripe Checkout + signed webhooks and durable order state
- Real-time messaging (WebSockets)
- Image/file uploads (S3/R2)
- 2FA and email verification
- Automated unit, integration, and end-to-end tests
