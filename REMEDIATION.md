# Webmers — Remediation Report

Follow-up to [`AUDIT.md`](./AUDIT.md). Every finding was fixed and then **re-tested
against a production build** (`npm run build && next start`), not just reviewed.

**Result:** 18 of 20 findings fully resolved · 2 partially mitigated (documented below).

**Build health:** `tsc --noEmit` clean · `next build` succeeds · no Edge-runtime warnings ·
5 remaining lint warnings (all pre-existing `<img>`/custom-font advisories).

---

## Verification summary

Run against a production build with a real `NEXTAUTH_SECRET`:

```
── SECURITY ─────────────────────────────────
  PASS  [1] forged old-secret token rejected
  PASS  [2] anon order read blocked
  PASS  [8] editor requires auth
  PASS  [19] demo login disabled in prod
  PASS  [19] demo buttons absent
── VALIDATION ───────────────────────────────
  PASS  [15] common password rejected
  PASS  [14] oversized body rejected
  PASS  [12] junk layout rejected
── BUYER JOURNEY ────────────────────────────
  PASS  signup + login
  PASS  checkout amount (149+49 = 198, server-computed)
  PASS  [9] duplicate purchase blocked (409)
  PASS  dashboard shows purchase / spend / escrow / code-unlock
  PASS  own order readable
  PASS  listing hides "Buy Now" when owned
  PASS  checkout blocks re-buy
── [4] PERSISTENCE ACROSS RESTART ───────────
  PASS  session survived
  PASS  order survived
  PASS  dashboard intact
── [2] CROSS-USER ISOLATION ─────────────────
  PASS  cannot read another user's order (404)
  PASS  cannot open another user's editor (404)
  PASS  cannot read editor API (404)
  PASS  cannot reach seller dashboard (307)
  PASS  cannot reach admin dashboard (307)
── EDITOR ───────────────────────────────────
  PASS  editor saves and reloads state
  PASS  editor rejects junk theme/accent
── OTP ──────────────────────────────────────
  PASS  6th wrong guess → code destroyed
  PASS  unreachable SMTP → 503, not silent success
```

---

## 🔴 1. Hardcoded fallback JWT secret — **fixed**

`lib/auth/secret.ts` no longer ships a production fallback. It now:
- throws in production when `NEXTAUTH_SECRET` is unset,
- **rejects the two known committed placeholders** outright,
- uses a fixed, clearly-labelled dev value locally so zero-config `npm run dev` still works.

The module is imported by Edge middleware, so it deliberately avoids Node built-ins.

**Before:** forged an ADMIN cookie with the public secret → `200` on `/dashboard/admin`, all user emails leaked.
**After:** same forged cookie → `307` redirect to sign-in.
**Boot test:** production start without a secret → HTTP `500` and
`NEXTAUTH_SECRET is required in production. Sessions cannot be signed securely without it. Generate one with: openssl rand -base64 32`.

## 🔴 2. Order confirmation IDOR — **fixed**

`app/checkout/confirmation/page.tsx` now requires a session and verifies
`order.buyerId === session.user.id` (admins exempt), returning `notFound()` otherwise.
The route was added to the middleware matcher, and order IDs moved from
`Math.random().toString(36)` (~41 bits, predictable) to `crypto.randomUUID()`.

**Before:** `curl "…?order=o_1"` with no cookie returned the full order; `o_1`/`o_2`/`o_3` enumerable.
**After:** anonymous → `307` to sign-in; a *different signed-in user* → `404`; the owner → `200`.

## 🔴 3. Fake payments — **mitigated, still needs a processor**

I did not invent a payment integration. What changed is that the app no longer
*overstates* what happened, and the surrounding integrity holes are closed:

- Escrow is now **actually tracked** — `escrowStatus()` computes a real 72-hour
  window from `createdAt`; the dashboard shows a live countdown and the
  confirmation page reports remaining hours instead of a static promise.
- Response copy changed from "Payment successful" to "Order recorded."
- Self-purchase blocked; duplicate purchase blocked; amounts remain server-computed.
- README now states plainly that **payments are simulated**, with a production
  checklist item describing the Stripe PaymentIntent + webhook flow
  (create `PENDING`, promote to `PAID` only from a verified webhook).

**Remaining work:** wire a real PSP. This is a business/keys decision, not something
to fabricate in a code change.

## 🔴 4. No persistence — **fixed**

New `lib/persistence.ts` snapshots the store to `.data/store.json`:
- debounced writes, **atomic** (temp file + `rename`) so a crash can't corrupt it,
- date revival on load, version-stamped, tolerant of older snapshots,
- flushes on `SIGINT`/`SIGTERM`/`exit`,
- auto-disabled when `DATABASE_URL` is set, on read-only filesystems, or via `WEBMERS_PERSIST=0`,
- every mutation (`createUser`, `createOrder`, `toggleWishlist`, newsletter, OTP, editor) calls `persist()`.

**Before:** created an order, restarted, order gone.
**After:** account, session, order, dashboard and editor state all survive a full restart.

`.data/` is git-ignored. This is single-instance by design — README directs
multi-instance deployments to PostgreSQL.

## 🟠 5. Silent password-reset failure — **fixed**

`forgot-password` now checks the send result and returns **503** with an honest
message when delivery fails, instead of `{ok:true}` + advancing the UI.
`previewUrl` (which leaks the OTP) is now stripped in production.

**Before:** `{"ok":true,"message":"…a reset code has been sent."}` while the log showed a TLS failure.
**After:** `503 {"error":"We could not send the reset email right now. Please try again shortly."}`

## 🟠 6. No rate limiting — **fixed**

New `lib/rateLimit.ts` (fixed-window, per-process, swept, `Retry-After` header).
Applied to: signup (5/10min/IP), login (10/15min/account, cleared on success),
forgot-password (5/15min/IP + 3/15min/address), reset-password (10/15min/IP +
5/15min/address), checkout (10/min/user), wishlist (60/min), editor (60/min),
newsletter (5/10min/IP).

**Verified:** 8 rapid signups → `201 201 429 429 429 429 429 429`.

README flags that this is per-process and should move to Redis for multi-instance.

## 🟠 7. OTP weaknesses — **fixed**

- `crypto.randomInt` instead of `Math.random()`.
- Stored as **SHA-256 hash** — plaintext codes never persisted.
- Compared with `crypto.timingSafeEqual` (constant time).
- `attempts` counter; the code is **destroyed after 5 wrong guesses**.
- Expired codes purged on access.
- Successful reset bumps `sessionVersion`, invalidating existing JWTs.

**Verified:** guesses 1–5 → "Invalid or expired code."; guess 6 → "Too many attempts… request a new code."

## 🟠 8. Public, non-functional editor — **fixed**

`/editor` is now a server component that requires a session **and** an owned,
non-refunded order. It redirects to sign-in when anonymous, shows an
"unlocks with your first website" state when the buyer owns nothing, and offers a
picker when they own several. New `POST/GET /api/editor` persists state with an
ownership check and a strict allowlist (themes, fonts, `#rrggbb` accents, known
section keys, ≤40 content keys × 500 chars).

The client (`components/editor/EditorWorkspace.tsx`) was rebuilt with **real**
undo/redo (document history, disabled when empty), real save with dirty tracking,
⌘S/⌘Z/⌘⇧Z shortcuts, an unsaved-changes guard, and `Editable` regions that
commit on blur and stay in sync with undo.

**Verified:** unauth → `307`; another user's order → `404` (page and API);
save → reload returns `Day / "Amy Site"`; junk theme/accent silently ignored.

## 🟠 9. Duplicate & self purchases — **fixed**

New `hasPurchased()` blocks re-buying anything with a live entitlement
(`PENDING`/`PAID`/`COMPLETED`/`DISPUTED`), and sellers can't buy their own listings.
Both are enforced in the API **and** surfaced in the UI ahead of time: the listing
page swaps "Buy Now" for "You own this — open dashboard" / "This is your listing",
and `/checkout` shows an explanatory panel instead of a payable form.

**Verified:** second identical checkout → `409`; listing page and checkout page both show the owned state.

## 🟠 10. Half-wired Prisma bridge — **partly addressed**

Done: silent `catch {}` blocks now log; `createOrder` reuses the DB-generated id;
new `getListingAnyStatus`/`getListingsByIds` consult Prisma; the schema gained the
fields the app actually needs (`tagline`, `rating`, `sales`, `featured`,
`sessionVersion`, and an `EditorState` model).

**Not done:** orders, wishlist, reviews and editor reads still come from the
in-memory store. Finishing this is a repository-layer refactor; it's now
explicitly listed under *Known limitations* and the production checklist rather
than being an invisible trap.

## 🟠 11. Six undefined CSS classes — **fixed**

Added `display: ['Instrument Serif', …]` to the Tailwind `fontFamily` (this alone
fixes `font-display` across 9 files), and defined `.nature-page`, `.leaf-card`,
`.section-eyebrow`, `.btn-forest` in `globals.css`.

Also changed the global `* { font-family: Inter }` to `body { … }` — the universal
selector was overriding every font utility, including the Instrument Serif branding.

**Verified in the compiled bundle:** all four classes present;
`font-display{font-family:Instrument Serif,Georgia,ui-serif,serif}`.

## 🟡 12. Unvalidated `layoutChoice` — **fixed**

Allowlisted via `isLayoutChoice()`; anything else is a `400`.
**Verified:** `"<script>alert(1)</script>"` → `400 {"error":"Invalid layout selection."}`.

## 🟡 13. Fabricated metrics — **fixed**

Removed every invented constant. `getLandingStats` now reports real listing counts,
real sales and real seller earnings (net of the 10% platform fee). `getAdminStats`
returns true user/GMV/fee/refund/listing counts. `getSellerStats` replaced the
`sales * 78` fake "views" with genuine metrics: gross, net-of-fee, 30-day revenue,
units, AOV, average rating from actual reviews, refunds and best-seller.
Admin "System Health" now reports real configuration state (DB, secret, SMTP)
instead of hardcoded `42ms`.

**Verified:** seeded seller shows $1,195 gross (299+149+399+348, correctly excluding
the refunded $89) → $1,076 net at 10% fee. Arithmetic checks out.

## 🟡 14. No input limits — **fixed**

`lib/validation.ts` centralises limits: name ≤100, email ≤254 (RFC 5321),
password ≤72 (bcrypt's effective ceiling), JSON bodies ≤16 KB rejected before parsing.
**Verified:** 5,000-char name → stored as 100; 50 KB body → `400`.

## 🟡 15. Weak passwords — **fixed**

Length + complexity (letters *and* a number/symbol) + a 30-entry common-password
denylist. bcrypt unified at cost 12 for real users (demo fixtures stay at 10).
**Verified:** `password123` → "too common"; `abcdefghij` → "must contain… number or symbol"; `Str0ng!Pass99` → `201`.

## 🟡 16. External assets & CSP — **fixed**

`'unsafe-eval'` is now **development-only** (it exists for React Refresh);
added HSTS (`max-age=63072000; includeSubDomains; preload`, production-only) and
`interest-cohort=()`. The hero got a self-contained CSS gradient underneath plus
`onError` handlers, so an unreachable third-party asset degrades gracefully instead
of leaving a blank hero.

**Verified in production headers:** HSTS present, no `unsafe-eval`.

## 🟡 17. Google OAuth handling — **fixed**

`allowDangerousEmailAccountLinking` is now opt-in via `GOOGLE_ALLOW_ACCOUNT_LINKING`
(default off) — it previously allowed takeover of a password account by email alone.
The `jwt` callback re-reads the account on every refresh so role changes apply
promptly, and honours `sessionVersion` so a password reset invalidates old tokens.

## 🟡 18. Broken navigation — **fixed**

Fragment-only hrefs (`#stories`, `#pricing`, `#footer`, `#how`) became `/#…`, so they
work from any page instead of silently doing nothing off the landing page.
Privacy/Terms/Cookies — all three previously pointed at `#pricing` — are now real
pages at `/legal/{privacy,terms,cookies}`, statically generated with substantive content.

## 🟡 19. Published demo credentials — **fixed**

Demo users are **omitted from the seed entirely** when `NODE_ENV=production`, and the
one-click demo buttons don't render there either.
**Verified in a production build:** `admin@webmers.io / Admin@123` → `401`; zero occurrences of "Demo accounts" in the sign-in HTML.

## 🔵 20. Correctness & accessibility — **fixed**

- Replaced `session!.user.id` non-null assertions with real guards + redirects.
- `WishlistButton` re-syncs with the server value unless locally toggled.
- Listing pages use `generateMetadata` — each listing has its own title/description/OG tags (all previously shared "Website").
- Gallery previews now use distinct seeds instead of rendering the same thumbnail three times.
- Newsletter: removed `noValidate`, added a distinct 429 message, and duplicate signups now say "You're already on the list!".
- `prefers-reduced-motion` relaxed from `0.01ms` to `1ms` so animation-completion callbacks still fire.
- A11y: `role="textbox"`/`tabIndex`/`aria-label` on editable regions, `aria-pressed` on toggles, labelled selects, `<caption class="sr-only">` on the seller table, sign-out reachable on mobile where the sidebar is hidden.
- Fixed a latent bug found during this pass: `getListing` filters to `ACTIVE`, so a buyer whose purchased site was later paused or delisted lost its thumbnail on the dashboard. Added `getListingAnyStatus`/`getListingsByIds` for owned-content lookups.
- Removed dead code and an unused import; `.gitignore` now covers `.env*.local`, `tsconfig.tsbuildinfo` and `.data/`.

---

## Dashboards — rebuilt

**Buyer** (`app/dashboard/buyer/page.tsx`)
4 real stats (owned, spent, in-escrow, wishlist). Order cards now carry the listing
thumbnail, status pill, layout, purchase date, code-unlock state, a **live escrow
countdown**, and actions (editor / listing / demo). Refunded orders are struck through
and lose their editor link. Wishlist tiles mark items already owned and keep a working
heart toggle. Real empty states throughout.

**Seller** (`app/dashboard/seller/page.tsx`)
Was three tiles (one a fabricated view count) plus a static table. Now: gross revenue
with a 30-day sub-metric, **net payout after the 10% platform fee**, units sold with
average order value, average rating from real reviews, active/draft counts, best-seller,
and refunds. Plus a per-listing performance table (thumbnail, status, price, units,
revenue, rating) and a recent-sales feed.

**Admin** (`app/dashboard/admin/page.tsx`)
Real users/GMV/fees/refunds/listings/moderation-queue/newsletter counts, and a System
panel reporting actual configuration (PostgreSQL vs snapshot, secret configured, SMTP
configured) rather than the old hardcoded `42ms` / `3 pending`.

**Shell** (`components/DashboardLayout.tsx`)
Role-aware sidebar so sellers/admins can move between their dashboards, responsive
(sidebar hides below `lg`, sign-out stays reachable), and `<nav aria-label>` added.

---

## New files

| File | Purpose |
|---|---|
| `lib/rateLimit.ts` | Fixed-window limiter + `Retry-After` helper |
| `lib/validation.ts` | Shared limits, email/password rules, safe JSON body reader |
| `lib/persistence.ts` | Atomic, debounced JSON snapshot of the store |
| `lib/types.ts` | Client-safe domain types |
| `lib/palette.ts` | Client-safe palette helper |
| `components/StatCard.tsx` | Dashboard metric tile |
| `components/EmptyState.tsx` | Shared empty-state panel |
| `components/editor/EditorWorkspace.tsx` | Editor client with real persistence + undo/redo |
| `app/api/editor/route.ts` | Ownership-checked editor state API |
| `app/legal/[slug]/page.tsx` | Privacy / Terms / Cookies |

`lib/types.ts` and `lib/palette.ts` exist for a concrete reason: `Thumbnail` and
`ListingCard` are client components that imported from `lib/data.ts`, which would have
pulled Node's `fs` (via the new persistence layer) into the browser bundle and broken
the build. Splitting the client-safe pieces out keeps the server-only data layer server-only.

---

## Before deploying

1. `NEXTAUTH_SECRET` — required; the app won't start without it.
2. `NEXTAUTH_URL` — your public origin.
3. `DATABASE_URL` + `npm run db:generate && npm run db:push && npm run db:seed`.
4. SMTP credentials — otherwise password reset fails closed.
5. **Integrate a payment processor** — checkout does not charge anything today.

Full detail in the README's *Production checklist* and *Known limitations*.
