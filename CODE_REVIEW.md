# Webmers — Bugs, Design Flaws & Gaps

Comprehensive review of the `webmers` repo. Severity: **🔴 critical (broken / won't work)** · **🟠 bug (wrong behavior)** · **🟡 smell (fragile / messy)** · **⚪ missing**.

---

## 1. Security & auth

### 🔴 1.1 Hard-coded admin escalation by email
`lib/data.ts` `getUserByEmail()` and `createUser()` force `pavitsingh1611@gmail.com` to `ADMIN` *on every read* and also `authOptions.ts` does the same in the Credentials and Google `signIn` callbacks. This is a deliberate, hard-coded backdoor shipped to production. It overrides the role stored in Prisma/DB and the role the user actually signed up with. Remove all of these and gate admin in the DB / env.

### 🔴 1.2 `AUTH_SECRET` has a hard-coded dev fallback
`lib/auth/secret.ts` returns `'dev-secret-change-in-production'` if `NEXTAUTH_SECRET` is missing. With this fallback, anyone can forge JWTs. The README even calls this out, but the code happily issues real sessions with the dev secret. Production should refuse to start (throw on import) when the secret is missing in `NODE_ENV=production`.

### 🔴 1.3 `GoogleProvider` uses `allowDangerousEmailAccountLinking: true`
`lib/auth/authOptions.ts` enables silent account takeover: a Google sign-in that matches an existing email will be linked without verification, and combined with 1.1 it auto-promotes that account to admin.

### 🔴 1.4 Sandbox "Google" path is a credentials provider that lets clients pick any email + role
`app/auth/signin/page.tsx` and `app/auth/signup/page.tsx` both expose a modal that calls `signIn('credentials', { isGoogleSandbox: 'true', googleEmail, googleName, googleRole: 'BUYER' | 'SELLER' })`. The `CredentialsProvider.authorize` in `authOptions.ts` then creates the user with whatever role the *client* chose and auto-signs them in. This is an authentication bypass — anyone can become any user (including `pavitsingh1611@gmail.com` → admin) without knowing a password. It must never be reachable in production builds. At minimum, gate it on `NODE_ENV !== 'production'`.

### 🔴 1.5 Admin route protection relies on in-memory state
`middleware.ts` and `DashboardLayout` use `token.role` to gate dashboards, but the JWT refresh callback only re-reads the role every 5 minutes, and that path bypasses the Prisma update for the special admin email (it mutates the in-memory store only — see 1.1). On a real DB with multiple processes, the "force-admin" branch silently does nothing. Either remove the branch or implement a real `prisma.user.update`.

### 🟠 1.6 Rate limiter is in-process
`lib/security.ts` keeps a `Map` in the server process. Behind any multi-instance deployment (Vercel, ECS, anything with >1 worker) limits are ineffective and clients can bypass them by hitting different regions. Use Upstash / Cloudflare KV / a real shared limiter.

### 🟠 1.7 `isTrustedMutation` trusts `Origin` against `Host`
`lib/security.ts` reads `x-forwarded-host` from the request without verification. Anyone able to inject headers (e.g. behind a misconfigured proxy) can spoof origin checks. At least require the env-configured public host or use a known allow-list.

### 🟠 1.8 Webhook + Razorpay shared secret depends on env
`lib/razorpay.ts` `verifyWebhookSignature()` returns `false` (silently 400) when `RAZORPAY_WEBHOOK_SECRET` is missing. It should fail loud / refuse to acknowledge webhooks so a misconfigured prod doesn't drop them all.

### 🟡 1.9 Listings, reviews, and orders fall back to an in-memory store under all failure modes
`lib/data.ts` catches *every* Prisma error and falls back to the in-memory `globalThis.__webmersStore`. That means a real prod DB outage will silently lose writes (and reads will return stale demo data) instead of surfacing the problem. The same pattern is repeated ~25 times across the file.

### 🟡 1.10 No CSRF protection on custom APIs beyond the cheap origin check
`/api/messages`, `/api/reviews`, `/api/seller/listings`, `/api/admin/...` etc. only check the origin. Some of them don't even do that. With SameSite=Lax cookies (NextAuth's default) you're mostly safe, but combined with the sandbox bypass above this matters.

### 🟡 1.11 `applyFilters` does not bound `minPrice`/`maxPrice`
`lib/data.ts` `applyFilters` accepts any number. A request with `?min=-999999999` matches everything. Cap / validate inputs.

---

## 2. Data layer (`lib/data.ts`)

### 🔴 2.1 Wrong revenue math for sellers
`getSellerStats` says: "Seller proceeds are always the seller-set base price." But the code computes it by *adding up* the **order amounts** (which include the 20% markup) and *then* mapping them back to `listing.price`. So when a buyer paid the 20%-marked-up price, the seller's dashboard still adds up `listing.price × salesCount` from a separate array, while `order.amount` is the customer price. Two different totals for the same orders — and the order list is the one in `store().orders` (the in-memory array), so any order created via Prisma won't be counted at all.

### 🔴 2.2 `getLandingStats` currency mismatch
Stats show `Earned by Sellers` in `$` (USD), the marketplace is priced in **INR** (`₹` everywhere else), and `totalSales`/`avgRating` are unitless. Also, `totalEarned` sums `order.amount` which is the *customer* total including markup, while the label is "Earned by Sellers". Pick one currency, one model.

### 🟠 2.3 `getApprovalRequests` returns pending orders but `markOrderPaid` will bump `listing.sales` a second time
`createPendingOrder` does **not** increment `listing.sales`. `markOrderPaid` does. So once the admin approves, sales are correctly counted once. But `createOrder` (the legacy path) also bumps `listing.sales` at create time — anything that ever routed through that path is double-counted. Consolidate.

### 🟠 2.4 `getBuyerOrders` only reads the in-memory store
Same fallback problem as 1.9 — orders stored in Prisma never appear in the buyer dashboard.

### 🟠 2.5 `shareWishlistLink` returns a path that has no route
`lib/data.ts` builds `${baseUrl}/wishlist/share/${userId}` but there is no `app/wishlist/share/[id]/page.tsx`. The link is dead.

### 🟠 2.6 `getPriceDrops` is a stub
It returns wishlisted listings with `price < 300` — a hard-coded threshold. There is no historical price store and no actual "drop" detection. The buyer dashboard advertises price-drop notifications.

### 🟠 2.7 `createReview` lets the same buyer review the same listing many times
There is no uniqueness check on `(listingId, buyerId)`. A buyer with 3 completed orders for the same listing can post 3 reviews.

### 🟠 2.8 Reviews never feed back into the listing's `rating`
`listing.rating` is hard-coded in the seed. New reviews update nothing, so the average is always 4.6–5.0 from the seed file.

### 🟠 2.9 `getRecentOrders` / `getRecentUsers` and `getAdminStats` all read only the in-memory store
Admin dashboard numbers are fake when Prisma is configured.

### 🟠 2.10 `isValidUpiId` regex accepts nonsense
The regex `/^[a-z0-9][a-z0-9._-]{1,63}@[a-z][a-z0-9.-]{1,63}$/i` requires 2-char handles, but a normal UPI ID can be one character (`x@upi`). Also `.` is allowed in the local part which UPI does not allow.

### 🟠 2.11 `hash` function name collision
`hash` is defined as a local function inside `lib/data.ts` *and* as another local function inside `components/Thumbnail.tsx` — minor, but the editor also has its own third copy. Pick a util.

### 🟠 2.12 `getFeaturedListings` falls back to "all listings" if none are featured
That's fine, but it then slices without filtering out non-`ACTIVE` (the upstream `getListings` already filters). OK in practice — just worth a comment.

---

## 3. API routes

### 🔴 3.1 `/api/admin/orders/[id]/approve` lets any admin mark a non-existent payment as paid
There is no check that a real Razorpay payment actually exists — the admin just clicks "Approve" and the order is moved to PAID with `manual_admin_<timestamp>`. This is documented in the README ("manual payout"), but the UI gives no way to actually verify the UTR, and the success path does not write a `paymentId` of a real Razorpay charge. In production this is an open hole for chargebacks.

### 🟠 3.2 `/api/admin/reviews/remove` is a fake endpoint
`DELETE` just returns a hard-coded `"Review {reviewId} removed (demo)"` and never deletes anything. The admin UI doesn't even call it.

### 🟠 3.3 `/api/admin/users` is a fake endpoint
`GET` returns a static string. There's no list, no suspend, no role change.

### 🟠 3.4 `/api/messages` is a non-persistent in-memory store per process
A `let messagesStore: any[] = []` at module scope is fine for a demo but in prod (and even in dev with HMR) it can be lost on reload. Also, no seller↔buyer pairing, no read/unread, no real DB.

### 🟠 3.5 `/api/checkout` requires Razorpay to be configured — there's no fallback
If `RAZORPAY_KEY_ID` is missing, every buyer gets `503 "UPI payments are not configured yet"`. There's no "demo purchase" or "test mode" that goes through `createOrder` (the legacy path), so the app is unusable without the env vars.

### 🟠 3.6 `/api/checkout/confirm` (buyer "Confirm satisfaction" button) trusts the order id
`markOrderPaid` then immediately `completeOrder`s. No escrow hold timer, no admin check, no real Razorpay payment id required. Combined with 3.1, this lets any buyer (or the admin) walk a fake order straight to COMPLETED with no payment at all.

### 🟠 3.7 `/api/seller/listings` GET & POST have no rate limit, no CSRF check
`/api/seller/listings/[id]` PATCH has no rate limit or origin check either. `isTrustedMutation` is not used here. Inconsistent with the rest.

### 🟠 3.8 `/api/listings` GET supports `minPrice` / `maxPrice` in code but the public page never sends them
Works correctly; the values come from the form. Fine.

### 🟠 3.9 `/api/payments/razorpay/webhook` ignores event id replay protection
Standard Razorpay webhooks retry. There is no idempotency check via `payment.id` — `markOrderPaid` will be called multiple times. `markOrderPaid` short-circuits when status is already `PAID`, so it's safe by accident, but it returns the same 200 for `payment.failed` / `refund.processed` without acting on them.

### 🟠 3.10 `/api/auth/signup` race
There's no DB-level uniqueness. The check `existing` is in-app; two simultaneous signups for the same email can both pass it and the second `prisma.user.create` then throws and the in-memory fallback happily creates a duplicate.

### 🟠 3.11 `/api/checkout` server price trusts `codeUnlocked` but re-derives the listing price
Server-priced ✅, but the *layoutChoice* is whatever the client sends and the server only validates against the whitelist. Fine. However, the same `orderId` can be marked paid by *any* signed-in user — see 1.4.

---

## 4. Frontend — app routes

### 🔴 4.1 `app/dashboard/buyer/page.tsx` is a `'use client'` file that calls server-only APIs
```ts
'use client';
...
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { redirect } from 'next/navigation';
...
const session = await getServerSession(authOptions);
if (!session?.user) redirect('/auth/signin');
```
`getServerSession` is server-only and `redirect` from `next/navigation` in a client component will not actually redirect (it throws a special object that only the server framework handles). The same is true for `app/dashboard/seller/page.tsx`. **Both dashboards will break at build/run time** with the current code. The pattern of `'use client'` at the top of a page that uses server primitives is the root cause; either drop the `'use client'` or refactor to a server wrapper.

### 🟠 4.2 `app/dashboard/seller/page.tsx` calls `handleAction` inside a server component
The function does `window.location.reload()` which doesn't exist in a server component. The whole listings CRUD is inlined incorrectly.

### 🟠 4.3 `app/dashboard/admin/page.tsx` is a server component that uses `getAdminStats`, etc. — but the buyer & seller side do not get role-checked the same way
Buyer/seller check via `redirect('/auth/signin')` from a *client* file. The admin one is correct (server component). Inconsistent and broken.

### 🟠 4.4 `/dashboard/admin` exposes the `?tab=approvals` link in the sidebar but the page ignores `searchParams.tab`
`app/dashboard/admin/page.tsx` only renders the overview. None of the `?tab=users` / `?tab=approvals` / `?tab=settings` exist.

### 🟠 4.5 `DashboardLayout` and `DashboardNav` duplicate the entire link list
`components/DashboardLayout.tsx` and `components/DashboardNav.tsx` have a copy-pasted `baseLinks` and `adminShortcuts` array. The two will drift.

### 🟠 4.6 `Header` mobile menu never closes after sign-in/sign-up
`components/Header.tsx` calls `signOut` inside the menu but the nav items only close via `onClick={close}` for the link items. After signing out, the menu overlay stays visible until the user taps the close button (because `useEffect` only restores `body.style.overflow` on the next render, not when `signOut` triggers a navigation).

### 🟠 4.7 Notification badge is hard-coded to `3`
`components/Header.tsx` renders `<span>3</span>` regardless of the real notification count. Also: `useCallback`/`useEffect` for `body.style.overflow` is OK but the dependency array is empty in one branch.

### 🟠 4.8 `app/profile/page.tsx`, `app/messages/page.tsx`, `app/notifications/page.tsx` are pure client components with hard-coded demo data
- "Save Profile" / "Update Password" / "Send reply" / "Mark all read" all `alert()`.
- The "messages" page mixes session data with fake seed messages.
- The notifications page is a static array of 5 fake items.

### 🟠 4.9 `app/checkout/page.tsx` accepts the listing id from the URL
`searchParams.listing` is a free-text string passed into `getListing`, which is fine, but combined with 1.4 the buyer can in theory buy any listing. That's intended. Just note: the `?listing` is unsanitized display-wise, although only used to fetch a DB row.

### 🟠 4.10 `app/listing/[id]/page.tsx` — `isWishlisted` is fetched even though the parent already has the wishlist
N+1 smell. The buyer dashboard does the batched lookup, the marketplace does the batched lookup, the listing page still calls `isWishlisted` for the current user.

### 🟠 4.11 `app/marketplace/page.tsx` — `buildHref` mishandles explicit `undefined`
`Object.entries(over).forEach(([k, v]) => { if (v) p.set(k, v); else p.delete(k); });` — `if (v)` rejects numeric zero prices. The `min`/`max` form values default to empty strings, so when the user clears them, `p.delete('min')` works; OK. But for `cat: undefined` from "All" the call sets `p.set('cat', undefined)` and the `if (v)` block skips it without deleting — the existing `cat` is not removed. (Actually the existing `cat` was set above; the `if (v)` else branch *does* delete. Fine, but confusing.)

### 🟠 4.12 `app/sitemap.ts` includes all listing `lastModified` from the in-memory `createdAt`
Fine for now, but `lastModified: listing.createdAt` doesn't reflect Prisma records if you switch to the DB. The Prisma path is also fetching the same data without pagination.

### 🟠 4.13 The marketplace's "results" counter ignores the active price filter
Header: `X results in Category for "q"` — it doesn't surface the min/max, which can be confusing.

### 🟠 4.14 `app/checkout/confirmation/page.tsx` says "Paid (in escrow)" when status is `PAID`, and the layout assumes order.layoutChoice is always set
If the order is missing, the page renders the empty state but the URL param `order` is not validated — anyone can pass any id.

### 🟠 4.15 `app/editor/page.tsx` is a 2700-line client component that:
- Stores the entire design in `localStorage` only — no server persistence, no auth check, no per-user separation. Two users on the same browser share the design.
- "Save" and "Publish" are fakes. There is no API call to persist anything. The "Checkout" modal is a fake timer that does nothing — see 4.16.
- The pricing math uses hard-coded USD → INR rate (`82`) which is never updated.
- Inline `contentEditable` text fields are saved on `onBlur`. There's no autosave on hover-out of the canvas, so if the user clicks "Pay" while focused inside an editable region without blurring first, the change is lost.
- The `process` step shows 9 hard-coded logs. There is no real "compiling" happening.
- The "Download" produces a single HTML file with inline Tailwind via CDN — it's a 1-file output, not a multi-page SPA. The `<script>` at the bottom assumes `pages[0]` exists even if the user deleted the "Home" page (the code prevents deletion of "home" but creates a new page on `prompt` with an empty `id` if the user enters a name that becomes empty after the slugifier).
- `addPage` uses `prompt()` and `confirm()` — they don't render correctly inside a styled modal. Also `prompt()` is sync and blocks the React tree.
- `isPremiumDesign` is computed against the *default* values, not against actually-customized values. The first time you load the editor, the price is `$19` + the premium surcharge `$7` even though you didn't change anything. That's because the defaults are `'Night'`, `'#8b5cf6'`, `'Inter'` and the `!==` operator detects the same defaults as "premium". Wait — re-read: the check is `accent !== '#8b5cf6' || font !== 'Inter' || themeKey !== 'Night'`. All default, so `isPremiumDesign` is **false** at load. Good. But the moment the user toggles a switch and then toggles it back, the price stays "premium" because the state was set, not recomputed from a baseline. Minor.
- The keyboard shortcut `Ctrl+Shift+A` is hijacked globally on every page for admins — see `components/AdminShortcut.tsx`. That's hostile to users and may collide with browser shortcuts (Select All is `Ctrl+A`; this is `Ctrl+Shift+A` so less bad).
- The editor mounts with `pages = []` and `activePageId = 'home'`. Then the `useEffect` reads localStorage and `setPages(...)` after a frame. The right-rail "Pricing" widget computes from `pageCount = pages.length` and will render `0` pages / `$19` for one paint cycle.
- The `Helveticaneue Roman` font is referenced but only the WOFF2/WOFF is declared; the local file is not actually present in `public/fonts/` (the dir is excluded from the repo search). So the font fallback silently renders in default sans.
- The editor's `Newsletter` and other sections take a `buttonText` but only one of the section renderers uses it. Several are `disabled` for the contact form.
- The generated HTML has the same `pagesHTML` rendered with `class="hidden"` for all but the first page. The CSS doesn't actually hide `display: none` — `class="hidden"` in Tailwind = `display: none`, fine. But the mobile menu code uses `class="hidden"` then toggles `classList.remove('hidden')` on a fixed overlay, no transitions.
- There is no router/SEO for the generated site.

### 🟠 4.16 Editor's `triggerSimulatedPayment` doesn't call any API
It just runs a `setInterval` and 700ms later flips to "success" and shows a "Download" button. **It never actually verifies the user, never charges a card, never creates an order.** Combined with 1.4 you can essentially "unlock" code for free.

### 🟠 4.17 `app/auth/signup/page.tsx` lets a new user pick `SELLER` but provides no way for an *existing* user to become a seller
No "upgrade" flow. A buyer can't later sell.

### 🟠 4.18 `app/sitemap.ts` doesn't include `/blog`, `/sell`, `/support`, `/faq`, `/messages`, `/editor`, etc.
It only lists `''`, `/marketplace`, `/editor`, `/privacy`, `/terms`, `/cookies`, `/support`. The README claims a "measured SEO foundation" but the sitemap is incomplete.

### 🟠 4.19 `app/page.tsx` has no `<head>` metadata
The page uses `<Image fill>` with `loading="lazy"` but it doesn't pass `priority` to the LCP image, and the layout file already preloads the Inter/Instrument Serif fonts — good. But there's no `priority` on the hero so the LCP is the giant gradient + text.

### 🟠 4.20 `components/MeasuredHero.tsx` uses a sticky wrapper with `pointer-events-none` and re-enables on the header
The CTA's "Begin Journey" link is `pointer-events-auto` because it lives inside the auto-allowed column. But scroll events DO fall through to the parent sticky div, which is fine. However the `HeroScrollVideo` inside is also a `<video>` element with no `aria-hidden` on the wrapper — minor a11y issue.

### 🟠 4.21 The "Reserve Yours" button on `Header` links to `/marketplace` even for admins
Fine, but the green pulsing dot in the header is misleading — it doesn't reflect any real "live" state.

### 🟠 4.22 `app/newsletter/thanks/page.tsx` is the success page
But the `Newsletter.tsx` component shows a success message inline — it never navigates to `/newsletter/thanks`. Dead page.

---

## 5. Components

### 🟠 5.1 `components/CustomCursor.tsx` injects a global fixed element on every page
- It applies on mobile too (touch events don't fire, but the cursor is appended, and `body.style` mutations persist if the effect cleanup doesn't run). On touch devices you get a stuck 16px circle in the top-left.
- `mix-blend-mode: screen` over arbitrary text/imagery can break legibility.
- It blocks text selection in some browsers (the cursor div is below the pointer but interferes with hit-testing on iPad with mouse).

### 🟠 5.2 `components/AdminShortcut.tsx` is a client component that registers a global keyboard listener AND renders a floating button — for all roles
- For non-admins it's a no-op (`if (!session?.user || session.user.role !== 'ADMIN') return null;`), so it just runs uselessly. That's not a security issue (the listener returns early) but it's wasted JS.
- The shortcut `Ctrl+Shift+A` is not actually a system shortcut, but on Windows it's "All apps in taskbar" in some shells, and on Mac it's "Services". Easy collision.

### 🟠 5.3 `components/Newsletter.tsx` is fine
But `app/page.tsx` imports it twice on the same page in different sections (the homepage and the "ownership" section) — only one instance is actually rendered (the pricing section). The import is dead.

### 🟠 5.4 `components/Header.tsx` does a `useEffect` to restore `body.style.overflow` on the wrong key
The dep array is `[isOpen]`, which is correct, but the cleanup function returns the previous value of `document.body.style.overflow` *as captured at the moment the effect ran*. If the user opens the menu while the body is already `overflow:hidden` (because another component locked it), the menu unlock will set it back to `hidden` permanently.

### 🟠 5.5 `components/ListingCard.tsx` uses `fontFamily: "'Instrument Serif', serif"` as an inline style
- The `className="line-clamp-1 text-[22px] font-[500] leading-tight tracking-tight"` is good, but the inline `style` overrides the Tailwind `font-display` from `globals.css`. Mixing `font-instrument` (CSS class) and `style` is messy.
- `font-[500]` is an arbitrary Tailwind value, but `font-medium` (500) is the standard class.

### 🟠 5.6 `components/WishlistButton.tsx` and `components/CheckoutForm.tsx` both rely on `useSession`
`useSession` returns `null` on the first render while loading. The wishlist button does `if (status === 'loading') return;` but the visual state shows "not wishlisted" (the default `initial`). On a slow network the heart flashes empty for a moment.

### 🟠 5.7 `components/CurrencyDisplay.tsx` is **never used anywhere** in the codebase
Dead component. Also, it hard-codes exchange rates.

### 🟠 5.8 `components/VideoPreview.tsx` is **never used** either
Dead component. It would also be a security hole (iframe with `sandbox="allow-scripts allow-same-origin"` defeats the point of sandboxing).

### 🟠 5.9 `components/SkeletonCard.tsx` is never used
Dead.

### 🟠 5.10 `components/Eyebrow.tsx` always renders purple regardless of context
The hero and seller/buyer pages use this with green-cyan colorschemes. Sticking to purple-300 is jarring.

### 🟠 5.11 `components/DashboardNav.tsx` mobile nav links close the drawer but the body scroll lock doesn't restore
Same `useEffect` issue as 5.4.

### 🟠 5.12 `components/SiteFooter.tsx` has four columns of "Product / Account / Measured" but the "Measured" column is purely decorative
Items are non-clickable `<span>`. Worse, it has only "footer" link anchors like `#pricing` and `#how` that *do* exist on the home page but not on marketplace/listing/etc. — clicking them from the marketplace gives a 404.

### 🟠 5.13 `components/EmptyState.tsx` accepts an `action: ReactNode` but `props` declares it without using it
Wait, it does use it: `{action && <div>{action}</div>}`. Fine. But the seller dashboard defines its own `EmptyState` locally with a different signature (no `action`, takes `cta: { label, href }`) and a different visual. Two `EmptyState` components.

### 🟠 5.14 `components/Toast.tsx` is defined but never used (the editor has its own inline toast).

### 🟠 5.15 `components/Newsletter.tsx` after success becomes a full-width banner; the surrounding form's height jumps
No layout reservation.

### 🟠 5.16 `components/ListingCard.tsx` puts the entire card inside a `<Link>` and then a `<WishlistButton>` inside it
`WishlistButton` calls `e.preventDefault(); e.stopPropagation();` on click — good. But the wishlist button uses `useRouter().push(...)` to redirect unauthenticated users, which is in itself a side-effect inside a `Link` ancestor. If the user is on the marketplace and clicks the heart without being signed in, the *link* doesn't navigate (good) but the *redirect* to `/auth/signin?callbackUrl=<current path>` will navigate *away from the marketplace* — usually intended, but the callbackUrl is `window.location.pathname` which doesn't preserve search params.

### 🟠 5.17 `components/Header.tsx` `navItems` for the non-hero case includes `/messages` and `/editor`, but the dashboard layout already shows these.

---

## 6. Performance & a11y

### 🟠 6.1 `app/page.tsx` has 8+ `<Reveal>` instances on the initial render
Each is its own IntersectionObserver. The pattern works but it adds ~8 IO instances and 8 transitions for first paint. Fine for desktop, jittery on low-end mobile.

### 🟠 6.2 The home page awaits `getCurrentUser()` and `getWishlist()` on every request
Anonymous users still pay this cost. Skip it when `user` is null.

### 🟠 6.3 The hero video is ~474 KB
Decent but no responsive variant (no `<source media>` for slower networks). It is on a global `200vh` sticky so the iOS Safari memory cost is significant.

### 🟠 6.4 `app/editor/page.tsx` ships ~2700 lines of JS to the client
No code-splitting. First-paint of `/editor` is the entire editor logic.

### 🟠 6.5 Many components use `Math.random()` to generate ids for sections
Every render, ids can be different if React re-mounts. The state tracking relies on stable ids, so re-renders are safe, but section ids *can* be regenerated by `addPage`'s `createDefaultSection` on every render, causing React key churn. They are stable only because of `useState` re-running.

### 🟠 6.6 A11y: `motion` is `prefers-reduced-motion: reduce` respected on globals.css but several components set `style={{ transition: ... }}` inline and don't honor it.

### 🟠 6.7 A11y: `Header.tsx` mobile menu's hamburger has no `aria-expanded` and no focus trap. Once open, tab order escapes the panel.

### 🟠 6.8 A11y: `<details>` based FAQ page (no problem), but the `<summary>` uses `list-none` and no `aria-expanded` (the visual `+` rotating to `×` is decorative).

### 🟠 6.9 A11y: `CustomCursor` adds an unlabeled `<div>` to the body. Screen readers may announce it.

---

## 7. Styling / theming

### 🟡 7.1 Two distinct design systems
- Marketplace & listing & blog & profile: dark purple/cyan gradients, `Instrument Serif`, `font-instrument` class, `#0a0a0a` bg.
- Buyer/seller/admin dashboards: dark green nature theme, `leaf-card`, `btn-forest`, emerald palette, `nature-page` class.

The shared `Header` is the dark theme; the dashboard sidebar uses the green theme. **It's visually jarring** to switch between the two. Pick one or define a clear transition.

### 🟡 7.2 `globals.css` defines `--font-body` and `--font-display` but also has the same values hard-coded in `tailwind.config.js`
```js
fontFamily: { sans: ['var(--font-body)', 'ui-sans-serif', 'system-ui'], display: ['var(--font-display)', 'serif'] }
```
The CSS variables are defined in `globals.css` `:root`. If a future maintainer removes them, the entire site loses typography. Consider using `next/font` to set them.

### 🟡 7.3 `tailwind.config.js` `fontFamily.instrument` is the same as `fontFamily.display`
Duplicated.

### 🟡 7.4 `tailwind.config.js` has a `helvetica` family pointing to a non-existent local font
`font-helvetica-neue` in `globals.css` is the only place it's used (the editor).

### 🟡 7.5 Multiple inline `style={{ fontFamily: "'Instrument Serif', serif" }}` and `style={{ fontFamily: 'var(--font-instrument)' }}`
Pick one and use a class.

### 🟡 7.6 `liquid-glass` class has `backdrop-filter: blur(4px)` — very subtle blur that does almost nothing visually. The "glass" look is mostly the pseudo-element border.

### 🟡 7.7 `HeroVideo.tsx` uses an external CloudFront video that costs bandwidth and isn't in CSP allow-list
The CSP has `media-src 'self' https: blob:` — covers it. Good. But the URL is hard-coded; you should allow override via env.

### 🟡 7.8 `next.config.mjs` `images.remotePatterns` only allows `fonts.gstatic.com`
There are no other remote images used, but `seed.ts` and the database seed attempt to use `picsum.photos` URLs in the Prisma seed which **will fail in prod** because `next/image` won't load them and the listings will have broken thumbnails. The marketplace uses the deterministic `Thumbnail` component, not those images, so it's just dead data.

---

## 8. Build / config

### 🟠 8.1 `next.config.mjs` declares `swcMinify: true` but on Next 14 `swcMinify` is the default and the option is **deprecated** — Next will warn or error in minor versions.

### 🟠 8.2 `package.json` `prisma: ^7.9.0` — Prisma 7 doesn't exist yet (latest is 5.x as of 2024-2025; v6 is preview). Installing this version will likely fail.

### 🟠 8.3 `package.json` `@prisma/client: ^7.9.0` — same issue.

### 🟠 8.4 `prisma/schema.prisma` uses `previewFeatures = ["fullTextSearch"]` but doesn't actually use full-text search anywhere. Also the Prisma client is queried with `findMany`, never with `@@index`-less full text.

### 🟠 8.5 `prisma/schema.prisma` is missing `@@index` on high-frequency lookup fields
- `Listing.status` (filtered on every marketplace query)
- `Listing.sellerId` (joined on every seller page)
- `Order.buyerId`, `Order.paymentReference` (the second one is `@unique`, OK)
- `Review.listingId` (every listing page)
- `Wishlist.userId` (every wishlist fetch)

### 🟠 8.6 `prisma/schema.prisma` has no `@@index` on `User.email` (it is `@unique`, so a btree exists automatically, OK) but no index on `User.role` for the admin "all admins" lookup.

### 🟠 8.7 `prisma/schema.prisma` has no `PriceHistory` model needed for the price-drop feature promised by 2.6.

### 🟠 8.8 `prisma/schema.prisma` has no `Notification` model — notifications are a hard-coded array.

### 🟠 8.9 `prisma/schema.prisma` has no `Wishlist` entry on `Listing` (the relation is defined one-way from `Wishlist.listing` → `Listing`). Listing detail queries that want to count wishlists have to go through the join table.

### 🟠 8.10 `prisma/schema.prisma` `Listing.images String[]` is not normalized and the runtime code never reads it. Dead field.

### 🟠 8.11 `prisma/schema.prisma` `User.image String?` (avatar URL) and `User.avatarUrl String?` are duplicated.

### 🟠 8.12 `tsconfig.json` `strict: true` is good, but `noImplicitAny` and `strictNullChecks` are inherited. Several files still use `any` extensively (every `function Component({...}: any)` in components, and a `let messagesStore: any[]`).

### 🟠 8.13 `tsconfig.json` `include` is `**/*.ts` and `**/*.tsx` — picks up `node_modules` if it's ever extracted. Standard, but worth noting.

### 🟠 8.14 `.gitignore` only ignores `node_modules/`, `.next/`, `.env.local`, `.env`, `*.log` — but `next-env.d.ts` (autogenerated) and the `public/fonts/` files are missing from the rules; `.env.example` *is* tracked, which is correct, but other build outputs (e.g. `coverage/`, `dist/`, `playwright-report/`) are not.

### 🟠 8.15 No CI config
No GitHub Actions, no test runner, no linter enforcement. README claims "automated tests" are on the roadmap — the project has zero tests.

### 🟠 8.16 `HeroVideo.tsx` external CloudFront URL is hard-coded
If the bucket ever moves, every hero needs a redeploy. Move to env.

### 🟠 8.17 The `service-worker.js` and `manifest.json` in `public/` are never configured for PWA install behavior and the layout registers the service worker unconditionally. With `Cache-Control: no-store` on most routes this is harmless but is also doing nothing.

### 🟠 8.18 `app/layout.tsx` inline scripts inject `gtag` and a `/api/messages` polling timer, but the `gtag` measurement id is the placeholder string `'GA_MEASUREMENT_ID'`. The polling timer runs `fetch('/api/messages')` every 30s for every visitor — anonymous users included — wasting bandwidth and hitting the in-memory messages store with empty 401s. Unauthenticated users shouldn't poll.

---

## 9. Inconsistencies & missing things

### ⚪ 9.1 No tests
`scripts/seed.ts` exists but there's no test directory. README lists tests on the roadmap, but the project is shipping with "production-grade" marketing copy and no safety net.

### ⚪ 9.2 README claims several things that don't exist
- "Real-time messaging (WebSockets)" — on the roadmap, not built. The messages page is a 2-message seed.
- "Image/file uploads (S3/R2)" — on the roadmap. The Prisma schema has `Listing.images` but no upload endpoint.
- "Stripe Checkout + signed webhooks" — replaced with Razorpay but Razorpay is also incomplete (no order.create signature confirmation, no failed-payment handling).
- "2FA and email verification" — on the roadmap. The `User` schema has `twoFAEnabled` but no UI or API for it. `emailVerified` exists in the schema but is never set.

### ⚪ 9.3 `SignInForm` and `SignUpForm` both display "Continue with Google" but the sandbox modal only shows for unauthenticated users
The button on the signin page works either way; on signup it's the same. Just inconsistent.

### ⚪ 9.4 The home page has no `<form>` for newsletter — `Newsletter` is a self-contained component. That's fine, but the surrounding section says "Get curated sites in your inbox" and a11y-wise the input has no `<label>` (only an `aria-label`).

### ⚪ 9.5 `webmers_master_prompt.md` (26KB at root) is a development artifact, not source
Probably should be in `/docs` or removed from the repo root.

### ⚪ 9.6 `GOOGLE_SEARCH_CONSOLE.md` and `google23877074e6e68a54.html` are deployment verification artifacts
Keeping `google23877074e6e68a54.html` in the repo is fine (it has to be served at the root). The `.md` is a private dev note.

### ⚪ 9.7 Several env vars are documented in `.env.example` but never read
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLIC_KEY`, `STRIPE_WEBHOOK_SECRET`, `AWS_*` — dead config in env example.
- `PAYMENTS_DEMO_MODE` — no code path checks it.

### ⚪ 9.8 The `.env.example` has `SMTP_SECURE` referenced in `lib/email.ts` but **not** documented in `.env.example`.

### ⚪ 9.9 `lib/data.ts` has a `CODE_UNLOCK_PRICE` constant duplicated in `components/CheckoutForm.tsx` (mirrored as a hard-coded `49`). The `data.ts` value is the source of truth but the client recomputes anyway.

### ⚪ 9.10 `app/sitemap.ts` and `app/robots.ts` use `process.env.NEXT_PUBLIC_APP_URL` for the base URL but the layout uses the same — good. But `app/sitemap.ts` builds URLs with `baseUrl` that may include a trailing slash from the env var; it does `.replace(/\/$/, '')` correctly.

### ⚪ 9.11 `next.config.mjs` doesn't include `poweredByHeader: false` — by default Next adds `X-Powered-By: Next.js` which is a security smell (information disclosure). The README claims "tight CSP and security headers" but doesn't remove this.

### ⚪ 9.12 `package.json` is missing `engines` field
No Node version pinned. Different CI/dev versions will produce different builds.

### ⚪ 9.13 No `.nvmrc`, no `Dockerfile`, no `docker-compose.yml`. There's a `prisma/schema.prisma` for the optional DB, but no way to bootstrap Postgres for new contributors.

### ⚪ 9.14 `lib/auth/secret.ts` doesn't import `process` in a way that fails closed when `NODE_ENV=production` and the secret is missing. A typo in production would silently use the dev secret.

### ⚪ 9.15 `globals.css` has `@font-face` for `'Helvetica Neue Roman'` pointing to `/fonts/HelveticaNeue-Roman.woff2` and `.woff`, but there are no font files in `public/fonts/` (the repo doesn't include them). This will throw a 404 on every page load. The CSS will still work, falling back to `Helvetica, Arial`, but you'll see network 404s.

---

## 10. Quick-win list (the things most likely to break today)

1. Remove `'use client'` from `app/dashboard/buyer/page.tsx` and `app/dashboard/seller/page.tsx`, or split into a server shell + client tabs. **This breaks prod today.**
2. Lock down the `isGoogleSandbox` branch in `authOptions.ts` behind `NODE_ENV !== 'production'`. **Auth bypass today.**
3. Remove the `pavitsingh1611@gmail.com` auto-admin branch from `lib/data.ts` and `authOptions.ts`. **Backdoor today.**
4. Fail closed in `lib/auth/secret.ts` when `NODE_ENV=production` and `NEXTAUTH_SECRET` is missing. **JWT forgery today.**
5. Delete (or make real) the `fake` admin endpoints (`/api/admin/users`, `/api/admin/reviews/remove`) and the editor's fake payment modal. **Chargeback + fraud today.**
6. Pin `prisma` and `@prisma/client` to a real released version.
7. Add `getApproveOrder` server-side check that requires a real `paymentId` from Razorpay.
8. Make `getSellerStats` reconcile seller payouts with the actual `order.amount` (and the actual order store).
9. Add unique constraint on `(listingId, buyerId)` to `Review` in the Prisma schema and the in-memory store.
10. Add an `images` upload endpoint and a `Notification` model — the existing UI promises these.
