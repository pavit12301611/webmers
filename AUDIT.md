# Webmers — Function-by-Function Audit

> **STATUS: 18 of 20 fully resolved; 2 partially mitigated (#3 payments, #10 Prisma coverage).** See [`REMEDIATION.md`](./REMEDIATION.md) for
> what changed, the verification evidence for each fix, and what remains before
> taking real payments. This document is retained as the original audit record.

**Date:** 2026-07-25 · **Commit:** `a7ffaf3` · **Scope:** every route, API handler, data-layer function and component (~5k LOC)

**Method:** static review of all 48 source files + a live audit against a production build (`npm run build && next start`). Every claim below was reproduced against the running app; commands are included.

**Baseline health:** `tsc --noEmit` clean · `next build` succeeds (2 lint warnings) · all 22 routes render.

The app *looks* finished and the happy paths work. The problems are concentrated in **authorization, payment integrity, and persistence** — the things a marketplace can't get wrong.

---

## Severity summary

| # | Finding | Severity | Area | Status |
|---|---|---|---|---|
| 1 | Hardcoded fallback JWT secret → forge any session, full admin takeover | 🔴 Critical | Auth | ✅ Fixed |
| 2 | Order confirmation page has no authz → anyone reads any order (IDOR) | 🔴 Critical | Checkout | ✅ Fixed |
| 3 | "Payment" is fake — no processor, no escrow, order marked PAID unconditionally | 🔴 Critical | Payments | ⚠️ Mitigated — needs PSP |
| 4 | All data is in-memory — every account, order and wishlist lost on restart | 🔴 Critical | Data | ✅ Fixed |
| 5 | Password reset silently fails; UI says the code was sent | 🟠 High | Auth | ✅ Fixed |
| 6 | No rate limiting anywhere (OTP brute-force, signup flood, login) | 🟠 High | Auth | ✅ Fixed |
| 7 | OTP compared non-constant-time, not attempt-limited, not single-use on failure | 🟠 High | Auth | ✅ Fixed |
| 8 | `/editor` is completely public and saves nothing | 🟠 High | Product | ✅ Fixed |
| 9 | Duplicate purchases allowed; no ownership check | 🟠 High | Checkout | ✅ Fixed |
| 10 | Prisma path half-implemented — DB config silently corrupts behaviour | 🟠 High | Data | ⚠️ Partly — reads still in-memory |
| 11 | 6 CSS classes referenced but never defined → unstyled checkout & dashboards | 🟠 High | UI | ✅ Fixed |
| 12 | `layoutChoice` unvalidated, arbitrary string persisted | 🟡 Medium | Checkout | ✅ Fixed |
| 13 | Landing/admin stats are fabricated (`+340`, `$2.1M`, `10,000+`) | 🟡 Medium | Trust | ✅ Fixed |
| 14 | No input length limits — 5 KB names accepted | 🟡 Medium | Validation | ✅ Fixed |
| 15 | Weak password policy (`password123` passes) | 🟡 Medium | Auth | ✅ Fixed |
| 16 | Hero depends on 3 unreachable external assets; CSP allows `unsafe-eval` | 🟡 Medium | Perf/Sec | ✅ Fixed |
| 17 | Google sign-in always creates BUYER; role never re-synced | 🟡 Medium | Auth | ✅ Fixed |
| 18 | Nav/footer links point at non-existent anchors and pages | 🟡 Medium | UX | ✅ Fixed |
| 19 | Demo credentials published on the sign-in page + README | 🟡 Medium | Auth | ✅ Fixed |
| 20 | Accessibility + correctness nits (see §20) | 🔵 Low | A11y |

---

## 🔴 1. Hardcoded fallback JWT secret → total account takeover

`lib/auth/secret.ts:6`
```ts
export const AUTH_SECRET =
  process.env.NEXTAUTH_SECRET || 'dev-secret-change-in-production';
```

This value is committed to a public repo and used by **both** `authOptions` and `middleware.ts`. If `NEXTAUTH_SECRET` is ever unset in production — which the README actively encourages ("Visit http://localhost:3000. That's it — no `.env` needed") — anyone can mint a valid session cookie for any user and role.

**Reproduced.** I forged an ADMIN token with the public secret and loaded the admin dashboard as an anonymous attacker:

```js
const { encode } = require('next-auth/jwt');
await encode({ token: { id:'u_admin', role:'ADMIN', email:'evil@x.com' },
               secret: 'dev-secret-change-in-production' });
```
```
curl -H "Cookie: next-auth.session-token=$TOK" localhost:3000/dashboard/admin
→ 200 · "Total Users" · "Platform GMV" · "Recent Users"
  leaked: admin@webmers.io, buyer@webmers.io, seller@webmers.io, maria@example.com
```

Middleware **and** the server-side `DashboardLayout` check both accept it, because both trust the same forgeable token. Defence-in-depth doesn't help when both layers share the compromised secret.

**Fix:** fail fast instead of falling back.
```ts
const secret = process.env.NEXTAUTH_SECRET;
if (!secret && process.env.NODE_ENV === 'production') {
  throw new Error('NEXTAUTH_SECRET is required in production');
}
export const AUTH_SECRET = secret ?? 'dev-only-insecure-secret';
```

---

## 🔴 2. Order confirmation leaks any order to anyone (IDOR)

`app/checkout/confirmation/page.tsx:14`
```ts
const order = searchParams.order ? await getOrder(searchParams.order) : null;
```

No session check, no ownership check. `getOrder` (`lib/data.ts:536`) looks up by ID and returns it to whoever asks.

**Reproduced — no cookie at all:**
```
curl "localhost:3000/checkout/confirmation?order=o_1"
→ 200 · "Meridian SaaS" · "Hero-Centered" · full Order Summary
curl ".../confirmation?order=o_2" → Nocturne Portfolio
curl ".../confirmation?order=o_3" → Lumina E-commerce
```

Seeded IDs are `o_1`, `o_2`, `o_3` — trivially enumerable. Generated IDs use `Math.random().toString(36).slice(2,10)` (`lib/data.ts:132`), which is **not** cryptographically secure and only ~41 bits.

**Fix:**
```ts
const session = await getServerSession(authOptions);
if (!session?.user?.id) redirect('/auth/signin');
const order = searchParams.order ? await getOrder(searchParams.order) : null;
if (!order || order.buyerId !== session.user.id) notFound();
```
Also switch `id()` to `crypto.randomUUID()`.

---

## 🔴 3. "Payment" is entirely fake

`app/api/checkout/route.ts` takes no card details, contacts no processor, and `createOrder` (`lib/data.ts:512`) hardcodes `status: 'PAID'`. The UI states *"Payment successful. Funds held in escrow for 72 hours"*, the listing page promises *"Escrow protected · 72-hour satisfaction window"*, and `CheckoutForm` renders a **Pay $348** button with a credit-card icon.

There is no escrow, no 72-hour hold, no refund mechanism, and no `stripe` dependency in `package.json` — only empty `STRIPE_*` placeholders in `.env.example`. `sales` is incremented and revenue booked for a payment that never happened.

Server-side price computation (line 28) is correctly done — that part is right. But representing an unpaid order as PAID with escrow guarantees is a legal/consumer-protection exposure, not just a bug.

**Fix:** integrate a real PSP (Stripe PaymentIntent + webhook), create the order as `PENDING`, and only transition to `PAID` on a verified webhook. Until then, label the flow "Demo — no payment taken" in the UI.

---

## 🔴 4. Nothing persists — all state is in RAM

`lib/data.ts:290`
```ts
function store(): Store {
  if (!g.__webmersStore) g.__webmersStore = seed();
  return g.__webmersStore;
}
```

Every user, order, wishlist entry, review and newsletter signup lives on `globalThis` and is re-seeded on boot.

**Reproduced:** created order `o_ljyxyndn`, confirmed it rendered, restarted the server, requested the same URL → falls back to the generic "Your website is being delivered" (order gone), while seeded `o_1` reappears.

Consequences: customers lose purchases on every deploy; accounts vanish; this breaks outright on serverless/multi-instance hosting, where each lambda gets its own store — a user could sign up on one instance and be unknown on the next.

**Fix:** make Prisma/Postgres the real backing store (see §10) rather than an optional bridge.

---

## 🟠 5. Password reset silently fails while reporting success

`lib/email.ts:40` calls `nodemailer.createTestAccount()`, which needs outbound network to Ethereal. When that fails, `sendPasswordResetEmail` returns `{ ok:false }` — but `app/api/auth/forgot-password/route.ts:18-28` **ignores the result** and always responds `ok: true`, and the UI advances to the "enter your code" step.

**Reproduced:**
```
POST /api/auth/forgot-password {"email":"admin@webmers.io"}
→ 200 {"ok":true,"message":"...a reset code has been sent."}
server log: Email send error: Client network socket disconnected before secure TLS...
```
The user waits for a code that will never arrive, with no way to recover the account.

Related: Ethereal is a **public test inbox**. If it does work in a deployed environment, `previewUrl` is returned in the API response to *whoever requested the reset* — so an attacker can request a reset for any account and open the resulting email. That is a full account-takeover path.

**Fix:** propagate the send failure (`503` + honest message); never return `previewUrl` unless `NODE_ENV !== 'production'`; require real SMTP in production.

---

## 🟠 6. No rate limiting anywhere

**Reproduced:**
- 8 consecutive wrong-OTP resets → all `400`, no lockout, no delay.
- 10 signups in ~1s → `201 201 201 201 201 201 201 201 201 201`.
- Credentials login has no throttle either.

A 6-digit OTP with a 10-minute window and unlimited guesses is brute-forceable (10⁶ space, no backoff). Signup flood fills the in-memory store until OOM. Each bcrypt call (cost 10) is also a CPU-amplification lever for DoS.

**Fix:** per-IP + per-account limiter (Upstash Redis / `@upstash/ratelimit`) on `signup`, `forgot-password`, `reset-password` and the credentials callback; cap OTP attempts at 5 then invalidate.

---

## 🟠 7. OTP verification weaknesses

`lib/data.ts:660-700`
```ts
const reset = s.passwordResets.find(
  (r) => r.email === normalized && r.otp === otp && r.expiresAt > Date.now()
);
```
- `===` on the secret is **not constant-time** (timing side-channel).
- No attempt counter — failures are free (§6).
- The token is only consumed on **success**; a wrong guess leaves it live for the full 10 minutes.
- Generated with `Math.random()` (line 654) — predictable PRNG, not `crypto`.
- On success, existing sessions are **not** invalidated, so a hijacked session survives a password reset.

**Fix:** `crypto.randomInt(100000, 1000000)`, store a hash of the OTP, compare with `crypto.timingSafeEqual`, add `attempts`, and bump a `sessionVersion` claim on reset.

---

## 🟠 8. `/editor` is public and saves nothing

**Reproduced:** `curl -o /dev/null -w "%{http_code}" localhost:3000/editor` → **200** with no session. It isn't in the middleware matcher (`middleware.ts:51` covers only `/dashboard/*` and `/auth/*`), so the product's headline feature is free to everyone — no purchase, no login.

It also doesn't persist: **Save** just sets local state and toasts "Changes saved" (`app/editor/page.tsx:98-105`); **Publish** toasts "🎉 Site published successfully" with no network call; **Undo/Redo** are hardcoded to "Nothing to undo"/"Nothing to redo" (lines 91-96); **Quick Add** toasts "Text block added" without adding anything. `contentEditable` edits are lost on any re-render. There is no listing/order context — the editor never knows *which* site you're editing, so "Open Editor" from three different orders lands on the identical static page.

**Fix:** gate behind auth + verified order (`/editor/[orderId]`), persist an editor-state model, wire real undo/redo — or clearly badge the page as a non-functional preview.

---

## 🟠 9. Duplicate purchases, no ownership check

**Reproduced:** posted the identical checkout twice → two orders (`o_ljyxyndn`, `o_7hf3o0f5`), $348 each, no warning. A buyer can be double-charged by a double-click, and can re-buy something they already own. There is no idempotency key and no "you already own this" guard.

Also: `createOrder` mutates `listing.sales += 1` (`lib/data.ts:534`) with no concurrency control, and a seller can buy their own listing to inflate `sales` and `rating` visibility.

**Fix:** idempotency key per checkout attempt; reject if an active order for `(buyerId, listingId)` exists; block self-purchase.

---

## 🟠 10. The Prisma bridge is half-wired — enabling a DB makes things *worse*

Only 4 functions consult Prisma (`getUserByEmail`, `createUser`, `getListings`, `createOrder`, plus the update in `verifyAndResetPassword`). **Every other function reads the in-memory store unconditionally** — verified: `getOrder`, `getBuyerOrders`, `getWishlist`, `toggleWishlist`, `getReviews`, `getSellerListings`, `getSellerStats`, `getAdminStats`, `getRecentUsers`, `getRecentOrders`, `getUserById` contain zero `getPrismaClient()` calls.

So with `DATABASE_URL` set: users and listings come from Postgres, but their orders/wishlists are looked up in an empty RAM store → **a real buyer sees zero orders**. Worse, `createOrder` writes to Postgres *and* pushes to memory (line 530), and `getListing` filters to `ACTIVE` only, so checkout 404s any DRAFT/PAUSED listing.

`normalizeListing` (`lib/data.ts:425`) also fabricates data: `rating: 4.8`, `sales: 0`, `featured: false` hardcoded for every DB row, and `tagline` is a 60-char truncation of the description.

Every Prisma error is swallowed by a bare `catch {}` and silently falls back to memory — a production DB outage becomes invisible data divergence rather than a loud failure.

**Fix:** route all reads/writes through one repository interface with both implementations complete; log fallbacks loudly; add the missing `rating`/`sales`/`featured`/`tagline` columns to the schema.

---

## 🟠 11. Six CSS classes are used but never defined

Verified absent from both `styles/globals.css` and `tailwind.config.js`, and absent from the compiled bundle (`.next/static/css/*.css`):

| Class | Used in | Compiled? |
|---|---|---|
| `nature-page` | `app/checkout/page.tsx`, `DashboardLayout.tsx` | ❌ 0 matches |
| `leaf-card` | `checkout/page.tsx`, `CheckoutForm.tsx` (×5) | ❌ 0 |
| `section-eyebrow` | `checkout/page.tsx`, `DashboardLayout.tsx` | ❌ 0 |
| `btn-forest` | `checkout/page.tsx` | ❌ 0 |
| `font-display` | 9 files (dashboards, editor, 404, checkout) | ❌ 0 |
| `font-serif` | `app/editor/page.tsx` | ⚠️ Tailwind default only |

`font-display` is the big one: `tailwind.config.js` defines `sans`, `instrument` and `helvetica` but **no `display` key**, so every `font-display font-bold` heading across all three dashboards, the editor, the 404 and checkout silently falls back to Inter. The `leaf-card`/`nature-page` classes mean the **entire checkout page and dashboard shell render with no card backgrounds, borders or page background** — dark text on a white body, since `globals.css:31` sets `body { background: white }` while these pages assume a dark theme.

Note `styles/globals.css:6` also applies `* { font-family: 'Inter', sans-serif; }` with a universal selector, which overrides `font-serif`/`font-instrument` on any element that doesn't re-declare it — so the Instrument Serif branding is inconsistently applied.

**Fix:** add `display: ['Space Grotesk', ...]` to the Tailwind `fontFamily`, define the four `.leaf-card`/`.nature-page`/`.section-eyebrow`/`.btn-forest` component classes, and scope the universal font rule to `body`.

---

## 🟡 12. `layoutChoice` accepts arbitrary strings

`app/api/checkout/route.ts:15` takes any string. The client offers exactly 3 options, the server enforces none.

**Reproduced:** posted `"<script>alert(1)</script> FREE HACK"` → `201`, persisted, and rendered back on the confirmation page and buyer dashboard. React escapes it so this is **not** stored XSS, but it corrupts order records and the admin transaction feed.

**Fix:** `const LAYOUTS = ['Hero-Centered','Split-Screen','Video-Hero']; if (!LAYOUTS.includes(layoutChoice)) return 400;`

---

## 🟡 13. Fabricated metrics presented as real

- `getLandingStats` (`lib/data.ts:462`): `Websites Sold = totalSales + 340`, `Users = '10,000+'`, `Earned by Sellers = '$2M+'` — all invented constants.
- `getAdminStats` (line 600): `totalUsers = users.length + 10240`, `gmv = orders + 2_100_000`, `queue = 12` hardcoded.
- `getSellerStats` (line 590): `views = sales * 78` — a made-up multiplier presented as "Total Views".
- Admin "System Health" (`dashboard/admin/page.tsx:74-76`): `API Response 42ms` and `Queue Jobs 3 pending` are literals.

Inflating GMV and user counts on a live marketplace is a misrepresentation risk, not just cosmetic.

---

## 🟡 14. No input length limits

**Reproduced:** signup with a 5,000-character name → `201`. No `maxLength` on name, email, password, or newsletter address. Unbounded strings inflate the in-memory store and any future DB column; combined with §6 this is a cheap memory-exhaustion vector.

**Fix:** cap name ≤ 100, email ≤ 254 (RFC 5321), password ≤ 128, and reject oversize JSON bodies.

---

## 🟡 15. Weak password policy

`length >= 8` is the only rule (`signup/route.ts:18`, `reset-password/route.ts:17`). **Reproduced:** `password123` accepted. No complexity check, no breach-list check, no client-side strength meter. `bcrypt` cost is 10 in the app (`lib/data.ts`) but 12 in `scripts/seed.ts` — inconsistent.

---

## 🟡 16. External asset + CSP issues

`components/MeasuredHero.tsx` hardcodes three third-party URLs (an `images.higgs.ai` proxy, a CloudFront `.mp4`, and a `figma.site` PNG), and `app/layout.tsx:38` preloads the first as the LCP image.

**Reproduced:** `curl` to the higgs.ai URL → **connection failure (000)**. The landing hero depends on assets on domains the project doesn't control, with no local fallback — directly contradicting the README's "fully self-contained (no external images)" claim.

CSP (`next.config.mjs:24`) allows `'unsafe-inline'` **and** `'unsafe-eval'` in `script-src`, which defeats most of the XSS protection the header is there to provide. `img-src` / `media-src` allow `https:` wholesale. There's also no `Strict-Transport-Security` header despite the README advertising "HSTS-ready".

Two `<img>` lint warnings in `MeasuredHero.tsx` (lines 134, 162) bypass `next/image` optimisation on the LCP element.

---

## 🟡 17. Google OAuth role handling

`authOptions.ts:60-65` creates every Google user as `BUYER` with a `Math.random()` password — they can never sign in with credentials and there's no upgrade path to SELLER. `allowDangerousEmailAccountLinking: true` (line 28) auto-links a Google login to an existing credentials account **by email alone**; if an attacker registers a Google account with a victim's email at a provider that doesn't verify ownership, they inherit the account.

The `jwt` callback re-fetches the role only when `user` is absent (line 75), so a role change mid-session isn't picked up until the token refreshes — and a stale ADMIN token stays valid for its full 30-day life.

---

## 🟡 18. Broken navigation

`components/Header.tsx` `NAV_ITEMS` uses bare-fragment hrefs — `#stories`, `#pricing`, `#footer`. Those IDs exist **only on the landing page** (`app/page.tsx:252, 288`; `SiteFooter.tsx:6`). Clicking "Real Stories" or "Plans" from `/marketplace`, `/listing/[id]`, `/checkout` or `/editor` does nothing (no navigation, no scroll).

`SiteFooter.tsx:64-66` points **Privacy, Terms and Cookies** all at `#pricing` — an e-commerce site with no legal pages. Line 37 links "How it works" to `#how`, also landing-page-only.

**Fix:** use `/#stories` style hrefs and create real `/privacy`, `/terms`, `/cookies` routes.

---

## 🟡 19. Demo credentials shipped in the UI

`app/auth/signin/page.tsx:8-12` hardcodes buyer/seller/**admin** emails and passwords as one-click buttons, and the README table repeats them. Combined with §4 (seeded users always exist) and §1, `admin@webmers.io / Admin@123` is a live administrative login on any deployment.

**Fix:** render the demo block only when `NODE_ENV !== 'production'`, and never seed the admin account outside dev.

---

## 🔵 20. Correctness & accessibility nits

- **Non-null assertions on session.** `dashboard/buyer/page.tsx:22` and `seller/page.tsx:20` use `session!.user.id`. Safe only because middleware runs first — if the matcher ever changes, this is a runtime crash. Use the same guard `DashboardLayout` already does.
- **Duplicate session fetches.** Each dashboard calls `getServerSession` and then renders `DashboardLayout`, which calls it *again* — two JWT verifications per request.
- **`WishlistButton` ignores `initial` prop changes.** `useState(initial)` (line 25) never re-syncs, so after client-side navigation the heart can show a stale state.
- **Listing gallery is fake.** `listing/[id]/page.tsx:27` builds `[title, "title alt", "title preview"]` and renders the *same* `Thumbnail` three times — the "gallery" is one image repeated, and `Thumbnail`'s `variant` is derived from the title so two of the three are visually identical.
- **`metadata` is static on listing pages.** `export const metadata = { title: 'Website' }` — every listing shares the title "Website · Webmers" instead of using `generateMetadata`. Bad for SEO and sharing.
- **`Newsletter` has `noValidate` + `required`.** Line 47 disables native validation, so the only guard is the server regex; the field also isn't cleared on error.
- **Newsletter always reports success for duplicates** (`lib/data.ts:637`) — indistinguishable from a new signup.
- **`prefers-reduced-motion` is too aggressive.** `globals.css:109` forces `animation-duration: 0.01ms !important` on `*`, which can break animations that rely on completion callbacks.
- **A11y:** `contentEditable` regions in the editor have no `role`/`aria-label`; `Thumbnail` uses `role="img"` on a `div` containing decorative children; the mobile menu (`Header.tsx`) traps body scroll but has no focus trap or `Escape` handler; colour contrast on `text-white/25`–`/30` body copy (used widely) fails WCAG AA.
- **`getWishlistCount`** (`lib/data.ts:574`) is exported but never called — dead code.
- **`.gitignore` omits** `tsconfig.tsbuildinfo` (generated by `tsc --noEmit`) and `.env*.local`.

---

## Recommended order of work

1. **Ship-blockers:** §1 secret, §2 IDOR, §3 fake payments, §4 persistence.
2. **Before any real users:** §5 reset failure, §6 rate limits, §7 OTP hardening, §8 editor gating, §9 duplicate orders.
3. **Before launch polish:** §10 Prisma completeness, §11 missing CSS, §12–§16.
4. **Cleanup:** §17–§20.

§1, §2 and §11 are each a handful of lines and deliver the largest risk reduction per unit of effort.
