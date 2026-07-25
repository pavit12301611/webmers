# Webmers

A premium, production-grade **website marketplace** — *Buy. Edit. Own.* Browse fully-built websites, purchase with escrow-protected checkout, edit them in a no-code visual editor, and optionally unlock the full source code.

> **Runs with zero setup in development.** The app ships with a self-contained, seeded data layer, so every feature works out of the box — no database, no API keys, no external services required. Data is snapshotted to `.data/store.json`, so it survives restarts.
>
> ⚠️ **Before deploying, read [Production checklist](#-production-checklist).** `NEXTAUTH_SECRET` is mandatory, and checkout does **not** take real payments yet.

---

## ✨ Features (all working)

- **Marketplace** — browse, search, and filter websites by category
- **Listing detail pages** — gallery, tech stack, reviews, related listings, live demo link
- **Auth** — email/password sign-up & sign-in (role: Buyer or Seller), optional Google OAuth, session with `id` + `role`
- **Checkout** — order creation, layout selection, code-unlock add-on, server-computed totals, duplicate-purchase and self-purchase protection, 72-hour escrow tracking *(simulated — no payment processor is wired up yet)*
- **Wishlist** — toggle hearts on any listing, synced to your account
- **Newsletter** — validated signup
- **Dashboards** — Buyer (owned sites, escrow countdown, wishlist), Seller (gross/net revenue, per-listing performance, recent sales), Admin (users, GMV, fees, moderation queue, system status) — all role-protected, all computed from real data
- **Visual Editor** — gated behind an owned order; device preview, themes, accent colors, typography, section toggles, inline text editing, **real persistence**, undo/redo and ⌘S / ⌘Z shortcuts
- **Cinematic landing page** — animated night sky (stars, moon, fireflies) → daytime footer, fully self-contained (no external images)

## 🧰 Stack

- **Frontend:** Next.js 14 (App Router) + React 18 + Tailwind CSS + lucide-react
- **Auth:** NextAuth (JWT sessions) — Credentials + optional Google
- **Data:** Resilient data layer — in-memory (default) with a transparent Prisma/PostgreSQL bridge
- **Security:** CSP (no `unsafe-eval` in production), HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, role-based route protection, per-IP/per-account rate limiting, bcrypt(12) password hashing, hashed + attempt-limited OTPs

---

## 🚀 Getting started

```bash
npm install
npm run dev
```

Visit **http://localhost:3000**. That's it — no `.env` needed for local development.

### Demo accounts (development only)

| Role   | Email               | Password     |
|--------|---------------------|--------------|
| Buyer  | `buyer@webmers.io`  | `Buyer@123`  |
| Seller | `seller@webmers.io` | `Seller@123` |
| Admin  | `admin@webmers.io`  | `Admin@123`  |

One click away on the sign-in page. **These accounts and the shortcut buttons do not exist in a production build** (`NODE_ENV=production`) — the passwords are public, so seeding them into a live deployment would be an open door.

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
    auth/forgot-password/     # Request an OTP
    auth/reset-password/      # Verify OTP + set new password
    checkout/                 # Order creation (server-priced)
    editor/                   # Save/load editor state (ownership-checked)
    wishlist/                 # Wishlist toggle + list
    newsletter/               # Newsletter signup
  legal/[slug]/               # Privacy, Terms, Cookies
components/                   # Reusable UI (thumbnails, cards, header, footer…)
  editor/EditorWorkspace.tsx  # Visual editor client
lib/
  data.ts                     # Data layer (in-memory + snapshot + Prisma bridge)
  types.ts / palette.ts       # Client-safe shared types & palettes
  persistence.ts              # Atomic JSON snapshot of the store
  rateLimit.ts                # Fixed-window rate limiter
  validation.ts               # Shared input validation & limits
  auth/                       # NextAuth options, shared secret, helpers
prisma/schema.prisma          # Production DB schema
scripts/seed.ts               # Prisma seed (for real DBs)
middleware.ts                 # Auth + role-based route protection
```

---

## 🔒 Security notes

- **No fallback session secret.** `NEXTAUTH_SECRET` is required in production. It is
  validated lazily (on first use, not at import) so `next build` still works on hosts
  that inject env vars only at runtime — but a missing, placeholder or too-short secret
  means no session can be issued or verified. Public pages keep rendering as signed-out;
  protected routes redirect; `/api/auth/*` errors loudly and the admin dashboard reports
  the misconfiguration.
- Order amounts are computed **server-side** — the client cannot influence pricing.
- **Ownership is enforced on every private resource**: order confirmations, editor state and dashboards all verify the signed-in user owns the record (admins excepted).
- **Rate limiting** on signup, login, password reset, checkout, newsletter and editor saves (per IP and per account).
- Password reset codes are stored **hashed**, compared in constant time, expire after 10 minutes and self-destruct after 5 wrong guesses. A reset invalidates existing sessions.
- Passwords: bcrypt cost 12, length + complexity + common-password denylist.
- Tight CSP (no `unsafe-eval` in production) and HSTS on every response.
- Demo accounts are excluded from production builds.
- `.env` and the local `.data/` snapshot are git-ignored.

---

## ✅ Production checklist

**Required before going live:**

1. **Set `NEXTAUTH_SECRET`** — `openssl rand -base64 32`, minimum 16 characters.
   The build succeeds without it (so CI and preview builds don't break), but at
   **runtime** in production every auth operation fails and nobody can sign in.
   Known placeholder values and too-short secrets are rejected outright.
2. **Set `NEXTAUTH_URL`** to your public origin.
3. **Provision PostgreSQL** and set `DATABASE_URL`, then run `npm run db:generate && npm run db:push && npm run db:seed`. The file snapshot is single-instance only and is disabled automatically when `DATABASE_URL` is set.
4. **Configure SMTP** (`SMTP_HOST`/`SMTP_USER`/`SMTP_PASS`/`SMTP_FROM`). Without it, password reset falls back to Ethereal and will fail closed with a 503 rather than pretending to send.
5. **Wire a payment processor.** Checkout currently records an order and marks it `PAID` without charging anything. Integrate Stripe PaymentIntents, create orders as `PENDING`, and promote to `PAID` only from a verified webhook.

**Recommended:**

- Move rate limiting to a shared store (Redis/Upstash) if you run more than one instance — `lib/rateLimit.ts` is per-process.
- Complete the Prisma bridge: reads for orders, wishlist, reviews and editor state still use the in-memory store (see *Known limitations*).
- Set `GOOGLE_ALLOW_ACCOUNT_LINKING=true` only if you accept that a matching Google email can attach to an existing password account.

---

## ⚠️ Known limitations

- **Payments are simulated.** No processor is connected; escrow is tracked in application state only.
- **Partial Prisma coverage.** `getUserByEmail`, `createUser`, `getListings`, `getListing*` and `createOrder` hit the database; orders, wishlist, reviews and editor state are still served from the in-memory store. Finish these before relying on a multi-instance deployment.
- **Single-instance persistence.** The default JSON snapshot cannot be shared across instances — use PostgreSQL for anything beyond one server.
- **The editor edits a demo document**, not the buyer's actual purchased source.

---

## 🗺️ Roadmap

- Stripe integration (payment intents + webhooks)
- Complete the Prisma repository layer
- Real-time messaging (WebSockets)
- Image/file uploads (S3/R2)
- 2FA, email verification
- PWA + tests (Jest/Playwright)