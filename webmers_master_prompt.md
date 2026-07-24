# 🌐 Webmers — Master Prompt (Enhanced)

> A premium, production-grade website marketplace where users can browse, buy, visually edit, and fully own websites — wrapped in a cinematic scroll-driven day-to-night experience.

---

## Project Overview

Build a full-stack, production-ready platform called **Webmers** — a premium marketplace for buying and selling fully-built websites. The platform must handle both frontend and backend, with a visually stunning scroll-driven day-to-night 3D cinematic experience, a secure ecosystem for buyers and sellers, and every feature expected of a world-class digital marketplace.

---

## 🎨 Visual Design System

### Color Strategy — 60-30-10 Rule
| Ratio | Purpose | Details |
|-------|---------|---------|
| **60%** | Black & White | The main site UI uses a monochromatic black-and-white gradient palette. No accent colors on the platform shell — buttons, cards, nav, text are strictly grayscale. |
| **30%** | Day-Night Cycle | The scroll-driven day/night transition (sky, stars, moon, clouds, sun, birds, grass, flowers, fireflies) provides atmospheric depth and visual richness. Reversed palette — night at top, day at bottom. |
| **10%** | Sold Website Colors | The *only* place full color is allowed — thumbnails, previews, and showcases of websites being sold. These vibrant cards pop against the monochrome shell. |

### Scroll-Driven 3D Day-Night Cycle (Cinematic)
- **Top of page (Night):** Deep dark gradient sky with twinkling animated stars, a glowing 3D moon with subtle crater detail, floating fireflies/particles, and wispy clouds drifting across.
- **Upper-mid (Late Night → Dawn):** Stars gradually fade. The horizon begins to glow with warm amber/purple tones. Fireflies transition into early morning mist particles.
- **Mid-page (Sunrise):** The sun peeks above the horizon with a volumetric glow effect. Birds fly across in formation. Sky transitions through warm oranges, pinks, and soft blues.
- **Lower-mid (Morning):** Full sunrise palette. Clouds are lit from below. Dew drops glisten on surfaces.
- **Bottom of page (Day):** Bright blue sky with a shining sun, white fluffy clouds, and butterflies or pollen particles floating. The footer features animated grass blades and flowers swaying gently in the wind.
- **Performance:** All animations must be GPU-accelerated using CSS `transform`, `will-change`, and `requestAnimationFrame`. Canvas/WebGL for particle systems. Must maintain 60fps on mid-range mobile devices. Use scroll-linked animations (CSS `animation-timeline: scroll()` or JS Intersection Observer + rAF). Reduce motion for users with `prefers-reduced-motion` enabled.
- **Parallax Depth:** Multiple layers at different scroll speeds — background sky (slowest), mid-ground elements (moon/sun/clouds), foreground elements (grass/flowers/fastest). Creates true 3D depth.

### Micro-Interactions & Premium Polish
- **Custom cursor** — subtle glow or trail effect on desktop (disable on mobile).
- **Page transitions** — smooth crossfade or slide between routes (no hard cuts).
- **Scroll-triggered reveals** — text and sections fade/slide in as they enter viewport (staggered, not all at once).
- **Hover effects** — cards lift with shadow depth, buttons have subtle scale + glow, links underline with animation.
- **Loading states** — skeleton screens for all data-fetching areas. Never show blank white screens.
- **Toast notifications** — slide-in notifications for actions (added to wishlist, purchased, etc.).
- **Button press feedback** — subtle scale-down on click, haptic on mobile if supported.
- **Smooth scroll** — native smooth scrolling with anchor links.
- **Number counters** — animated counting for stats (websites sold, users, etc.).

### Overall Aesthetic
- Premium, minimal, cinematic feel — Apple meets Awwwards-winning portfolio.
- The site must feel **big and immersive** — multiple full-viewport-height sections with rich descriptions, feature breakdowns, and detailed content.
- Typography: Clean, modern, variable fonts (e.g., Inter, Space Grotesk, or Satoshi). Large display headings, comfortable reading body text.
- Whitespace is generous — let elements breathe.
- Subtle grain/noise texture overlay for premium analog feel.

---

## 🏗️ Core Features

### 1. Website Marketplace
- Sellers can list fully-built websites for sale with:
  - Rich descriptions, feature lists, tech stack info
  - Multiple screenshots and video previews
  - Pricing (one-time purchase or subscription)
  - Category tags (e-commerce, portfolio, SaaS, blog, landing page, dashboard, etc.)
  - Multiple layout variants/themes the buyer can choose from
  - Live preview (sandboxed iframe) and demo URLs
- Buyers can:
  - Browse with **advanced search** (keyword, category, price range, tech stack, popularity, newest)
  - **Filter & sort** (by price, rating, category, most sold, recently added)
  - Preview websites in full-screen sandboxed iframe mode
  - Add to **wishlist / bookmarks** for later
  - Purchase with secure checkout
- Each listing has a dedicated detail page with tabs: Overview, Features, Layout Options, Preview, Reviews, Seller Info.

### 2. No-Code Visual Editor (Buyer Side)
- After purchasing, buyers get access to an **in-browser visual editor** to modify their purchased website.
- Editor capabilities:
  - Edit text inline (click-to-edit)
  - Swap images (upload or pick from library)
  - Rearrange, add, remove layout sections/blocks
  - Change colors and fonts (within predefined theme options)
  - Toggle components on/off (headers, footers, sections, CTAs)
  - Responsive preview (desktop/tablet/mobile toggle)
  - **Version history** — rollback to any previous save point
  - **Auto-save** — changes saved automatically
  - **Undo/Redo** — full history stack
  - **Publish** — push changes live to their hosted version
- **Zero code exposure** — the editor operates on an abstract component tree, never showing HTML/CSS/JS to the user.

### 3. Code Unlock & Delivery
- Buyers can pay an additional premium fee to unlock the raw source code.
- Upon payment:
  - Complete source code packaged as a zip file
  - Delivered to the buyer's **verified signed-in Gmail** as a secure download link (time-limited, single-use)
  - Also available in the buyer's dashboard for re-download
  - Optional: direct GitHub/GitLab private repo access

### 4. Layout Options for Sold Websites
- Each listing offers multiple layout variants:
  - Different homepage styles (hero-centered, split-screen, video-hero, minimal, etc.)
  - Navigation layouts (top bar, sidebar, hamburger, mega-menu)
  - Section arrangements
  - Color theme presets
- Buyers select their preferred layout during checkout or change it later in the editor.

### 5. User Authentication & Security
- **Sign-in options:**
  - Google OAuth 2.0 (with profile import)
  - Email/Password with email verification link
  - Optional: GitHub OAuth, Apple Sign-In
- **Security measures:**
  - JWT with refresh token rotation (httpOnly, secure, sameSite cookies)
  - Bcrypt password hashing (cost factor 12+)
  - Rate limiting on auth endpoints (5 attempts / 15 min lockout)
  - CSRF tokens on all state-changing requests
  - Account lockout after repeated failures
  - Two-factor authentication (2FA) optional for sellers
  - Session invalidation on password change
- **No code or data leakage:**
  - Zero sensitive data in client-side bundles
  - No API keys, DB credentials, or secrets in frontend code
  - No sensitive info in DOM, localStorage, sessionStorage, or network responses
  - API responses sanitized — no internal IDs, stack traces, or debug info exposed
  - Content Security Policy (CSP) headers strict
  - Subresource Integrity (SRI) for all external scripts

### 6. User Dashboards
- **Buyer Dashboard:**
  - Purchased websites list with status
  - Access visual editor for each purchase
  - Code unlock status & download history
  - Wishlist / bookmarked sites
  - Order history & invoices
  - Account settings
- **Seller Dashboard:**
  - Listing management (create, edit, delete, pause)
  - Analytics: views, clicks, sales, revenue (charts & graphs)
  - Earnings overview with payout history
  - Buyer messages
  - Performance metrics per listing
- **Admin Dashboard:**
  - User management (ban, verify, role assignment)
  - Listing approval/rejection queue
  - Transaction monitoring
  - Platform analytics (GMV, active users, conversion rates)
  - Content moderation
  - System health & logs

### 7. Reviews & Ratings
- Buyers can rate purchased websites (1-5 stars) and leave written reviews.
- Sellers are rated based on aggregate buyer feedback.
- Reviews visible on listing pages.
- Admin can moderate/remove inappropriate reviews.
- Verified purchase badge on reviews.

### 8. Messaging System (Buyer ↔ Seller)
- In-platform messaging for pre-purchase questions.
- Real-time chat (WebSocket-based).
- Notifications for new messages (email + in-app).
- Message history preserved.
- Admin can monitor messages for dispute resolution.

### 9. Wishlist & Bookmarks
- Save websites for later (heart/bookmark icon).
- Dedicated wishlist page.
- Price drop notifications for bookmarked items.
- Share wishlist via link.

### 10. Notifications System
- **In-app notifications** (bell icon with badge count):
  - New message
  - Purchase confirmed
  - Code delivered
  - Listing approved/rejected
  - Review received
  - Price drop on wishlisted item
- **Email notifications:**
  - Welcome & verification
  - Purchase confirmation & receipt
  - Code delivery
  - Weekly seller earnings summary
  - Security alerts (new login, password change)
- **Push notifications** (if PWA installed).

### 11. Payment & Pricing
- **Payment gateway:** Stripe (primary) with Razorpay as fallback (for Indian market).
- **Pricing models:**
  - One-time purchase
  - Subscription (monthly/yearly for SaaS templates)
  - Code unlock as add-on purchase
- **Escrow system:** Funds held until buyer confirms satisfaction (72-hour window).
- **Refund policy:**
  - Full refund within 48 hours if website doesn't match description
  - Dispute resolution system with admin mediation
  - Partial refund option
- **Seller payouts:**
  - Platform commission (configurable, e.g., 15-20%)
  - Minimum payout threshold
  - Weekly/biweekly payout schedule
  - Multiple payout methods (bank transfer, UPI, PayPal)
- **Multi-currency support:**
  - USD, INR, EUR, GBP at minimum
  - Auto-detect from user location
  - Manual currency switch in header

### 12. Hosting & Domain Management
- Purchased websites are hosted on Webmers infrastructure (subdomain: `sitename.webmers.io`).
- **Custom domain support:**
  - Buyers can connect their own domain
  - Free SSL certificate (Let's Encrypt) auto-provisioned
  - DNS setup guide in dashboard
- One-click deploy from editor to live site.
- CDN-backed asset delivery (Cloudflare or equivalent).

---

## 🔧 Technical Requirements

### Frontend
- **Framework:** Next.js 14+ (App Router) with React 18+
- **Styling:** Tailwind CSS + custom CSS for animations (or Styled Components)
- **Animations:**
  - GSAP + ScrollTrigger for scroll-driven sequences
  - Framer Motion for page transitions and micro-interactions
  - Three.js / React Three Fiber for 3D elements (moon, sun)
  - Canvas API for particle systems (stars, fireflies, butterflies)
- **State Management:** Zustand or Redux Toolkit
- **Editor:** GrapesJS or Craft.js (customized to hide all code)
- **Responsive:** Mobile-first, tested on 320px to 2560px+
- **Performance targets:**
  - Lighthouse score: 90+ on all metrics
  - First Contentful Paint < 1.5s
  - Largest Contentful Paint < 2.5s
  - Cumulative Layout Shift < 0.1
  - Total Blocking Time < 200ms
- **Accessibility (WCAG 2.1 AA):**
  - Full keyboard navigation
  - Screen reader support (ARIA labels, roles, live regions)
  - Color contrast ratios meet 4.5:1 minimum
  - Focus indicators visible
  - Alt text on all images
  - Reduced motion support
- **SEO:**
  - Meta tags, Open Graph, Twitter Cards on every page
  - Structured data (JSON-LD) for products, reviews, breadcrumbs
  - Dynamic sitemap.xml generation
  - robots.txt configured
  - Canonical URLs
  - Semantic HTML throughout

### Backend
- **Framework:** Node.js + Express / Next.js API Routes / NestJS
- **Database:** PostgreSQL (primary) + Redis (caching, sessions, rate limiting)
- **ORM:** Prisma or Drizzle
- **API:** REST with OpenAPI/Swagger documentation
- **Real-time:** WebSocket (Socket.io) for messaging and live notifications
- **File Storage:** AWS S3 / Cloudflare R2 for uploads, code packages, images
- **Email:** SendGrid / AWS SES / Resend for transactional emails
- **Search:** PostgreSQL full-text search or Meilisearch for marketplace search
- **Queue/Jobs:** BullMQ for background tasks (email sending, code packaging, image processing)
- **Image Processing:** Sharp for on-the-fly optimization, WebP conversion, responsive sizes
- **CDN:** Cloudflare for static assets and caching

### Security Architecture
- [ ] Zero secrets in client-side code (verified via bundle analysis)
- [ ] All API endpoints authenticated and role-authorized (RBAC)
- [ ] Code delivery only after verified payment confirmation
- [ ] No data exposure via DevTools (inspected DOM, localStorage, network tab)
- [ ] HTTPS everywhere (HSTS enabled)
- [ ] Secure session management (httpOnly, secure, sameSite=strict cookies)
- [ ] SQL injection protection (parameterized queries / ORM)
- [ ] XSS protection (input sanitization, CSP headers, output encoding)
- [ ] CSRF protection (double-submit cookie pattern or CSRF tokens)
- [ ] Rate limiting (per-IP and per-user on sensitive endpoints)
- [ ] DDoS protection (Cloudflare or equivalent)
- [ ] Dependency vulnerability scanning (automated in CI)
- [ ] Content Security Policy (strict, no unsafe-inline)
- [ ] Subresource Integrity for all external resources
- [ ] Security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- [ ] Regular automated penetration testing
- [ ] Audit logging for all admin actions and sensitive operations

### Compliance
- **GDPR:** Cookie consent banner, data export, right to deletion, privacy policy
- **Terms of Service & Refund Policy:** Clearly documented
- **Cookie Policy:** Granular consent (analytics, marketing, functional)

---

## 📐 Site Structure (Long-Form Layout)

### Public Pages
1. **Hero Section** — Night sky with stars, glowing moon, floating fireflies. Bold headline: *"Buy. Edit. Own."* Subtext: *"The premium marketplace for websites."* Dual CTA: [Explore Websites] [Start Selling]. Scroll indicator at bottom.
2. **Stats Bar** — Animated counters: "500+ Websites Sold", "10,000+ Users", "$2M+ Earned by Sellers", "4.9★ Average Rating".
3. **How It Works** — 3-step process: Browse → Purchase → Edit/Own. Each step with animated icon and description. Cards reveal on scroll.
4. **Featured Websites** — Horizontal scroll carousel of website cards (colorful thumbnails against dark/monochrome background). Each card: preview image, name, price, rating, category tag, wishlist heart icon.
5. **Editor Showcase** — Split-screen section: left side shows the visual editor UI, right side shows live preview updating in real-time. Animated demo.
6. **Categories** — Grid of category cards (E-commerce, Portfolio, SaaS, Blog, Landing Page, Dashboard, Agency, Restaurant). Each with icon and count.
7. **Layout Options Preview** — Show 3-4 layout variants of the same website side-by-side to demonstrate customization.
8. **Why Webmers** — Feature grid with icons: No-Code Editor, Secure Payments, Code Ownership, Custom Domains, 24/7 Support, Money-Back Guarantee.
9. **Seller Spotlight** — Top sellers with earnings, top listings, and testimonials.
10. **Testimonials** — Carousel of buyer reviews with star ratings, avatars, and purchase details.
11. **Pricing / Code Unlock** — Clear explanation of the code unlock premium. Comparison table: Visual Edit (included) vs. Full Code Access (paid add-on).
12. **Blog / Resources** — Latest articles: "How to Choose the Right Website", "Selling Your Website on Webmers", etc.
13. **FAQ** — Accordion-style: 10-15 common questions with smooth expand/collapse animation.
14. **Newsletter CTA** — Email signup with "Get weekly curated websites in your inbox."
15. **Footer** — Daytime sky, shining sun, animated grass and flowers with swaying butterflies. Multi-column: Product links, Company, Legal, Social icons, Payment method badges.

### Authenticated Pages
16. **Sign In / Sign Up** — Google OAuth button + email form. Clean modal or dedicated page. Background transitions based on scroll position.
17. **Marketplace / Browse** — Grid layout with sidebar filters (category, price range, rating, tech stack, sort options). Infinite scroll or pagination.
18. **Listing Detail Page** — Full-width hero preview, tabbed content (Overview, Features, Layout Options, Reviews), seller info card, purchase CTA sticky bar.
19. **Buyer Dashboard** — Sidebar nav with: My Websites, Editor, Code Downloads, Wishlist, Orders, Settings.
20. **Seller Dashboard** — Sidebar nav with: My Listings, Create Listing, Analytics, Messages, Earnings, Payouts, Settings.
21. **Admin Dashboard** — Overview stats, user management, listing queue, transactions, system health.
22. **Visual Editor** — Full-screen editor interface with toolbar, component panel, properties panel, preview toggle, save/publish buttons.
23. **Checkout Flow** — Multi-step: Cart Review → Layout Selection → Code Unlock Option → Payment → Confirmation.
24. **Profile / Settings** — Account info, security (password change, 2FA), notification preferences, connected accounts, payment methods.

### Utility Pages
25. **404 Page** — Custom animated 404 (floating astronaut in space / lost in the void — matches night theme).
26. **500 Error Page** — Friendly error with "Go Home" CTA.
27. **Privacy Policy / Terms of Service / Cookie Policy / Refund Policy**

---

## 🔔 Onboarding & UX Flow

- **First-time visitor:** Subtle guided tour highlighting key sections (optional, dismissible).
- **New sign-up:** Welcome modal → pick buyer or seller role → guided first action (browse listings or create first listing).
- **First purchase:** Confirmation animation → redirect to editor with tooltip tour of editor controls.
- **First listing creation:** Step-by-step wizard with progress bar.
- **Empty states:** Illustrations and CTAs for all empty states (no purchases yet, no listings, empty wishlist).

---

## 🌐 Progressive Web App (PWA)
- Installable on mobile and desktop.
- Service worker for offline browsing of cached listings.
- App-like experience with splash screen.
- Push notification support for important updates.
- Manifest.json with icons and theme colors matching the monochrome palette.

---

## 📊 Analytics & Monitoring
- **User analytics:** Track page views, conversions, search queries, popular categories (via PostHog or Mixpanel).
- **Seller analytics:** Dashboard with views, clicks, conversion rate, revenue charts.
- **Admin analytics:** GMV, active users, churn rate, top sellers, category performance.
- **Error tracking:** Sentry for frontend and backend error monitoring.
- **Performance monitoring:** Lighthouse CI in pipeline + real-user monitoring (RUM).
- **Uptime monitoring:** Pingdom or UptimeRobot for critical endpoints.
- **Logging:** Structured JSON logs (Winston/Pino) with centralized log management.

---

## 🧪 Testing Strategy
- **Unit tests:** Jest for backend logic, React Testing Library for components.
- **Integration tests:** API endpoint tests with test database.
- **E2E tests:** Playwright or Cypress for critical user flows (sign-up, purchase, editor, code unlock).
- **Visual regression tests:** Percy or Chromatic for animation/UI consistency.
- **Load testing:** k6 or Artillery for marketplace and checkout under load.
- **Security testing:** OWASP ZAP automated scans in CI.

---

## 🚀 DevOps & Deployment
- **CI/CD Pipeline:** GitHub Actions:
  - Lint → Type check → Test → Build → Deploy
  - Automated on push to `main` and PR previews (Vercel/Netlify)
- **Hosting:** Vercel (frontend) + Railway/Fly.io/ AWS (backend)
- **Database:** Managed PostgreSQL (Supabase / Neon / RDS)
- **CDN:** Cloudflare for global asset delivery
- **Environment management:** Separate dev, staging, production environments
- **Database backups:** Daily automated backups with 30-day retention
- **Zero-downtime deployments:** Rolling updates with health checks
- **Infrastructure as Code:** Docker Compose for local dev, Terraform/Pulumi for cloud (optional)

---

## 📦 Deliverables

1. **Full source code** — frontend + backend, organized in monorepo structure.
2. **Database schema** — Prisma/Drizzle schema with migrations and seed data.
3. **API documentation** — OpenAPI/Swagger spec with interactive docs.
4. **Environment config** — `.env.example` with all required variables documented.
5. **Deployment guide** — Step-by-step instructions for deploying to Vercel + Railway (or equivalent).
6. **GitHub pull request** — Clean, well-documented PR with feature breakdown.
7. **README.md** — Project overview, setup, architecture diagram, contributing guide.
8. **Admin seed data** — Pre-populated sample listings, categories, and demo users for quick testing.

---

## ⚠️ Key Constraints

- **Animations must be buttery smooth** — 60fps on mid-range mobile. No frame drops. Use GPU-accelerated properties only. Bundle size for animation libraries < 50KB gzipped.
- **Monochromatic shell, colorful content** — The platform is strictly black/white/grayscale. Color exists only in website previews, thumbnails, and seller-uploaded content.
- **Production-ready from day one** — Not a prototype. Deployable, scalable, secure, tested.
- **Security is non-negotiable** — Zero tolerance for data leaks, code exposure, or auth bypasses. Pen-test before launch.
- **Accessibility is mandatory** — WCAG 2.1 AA minimum. Not an afterthought.
- **Mobile-first** — 60%+ of traffic will be mobile. Every feature must work perfectly on phones.
- **Respect `prefers-reduced-motion`** — All animations must have a calm, static fallback for users who prefer reduced motion.
- **No vendor lock-in** — Use open-source tools where possible. Data should be portable.

---

## 🗺️ Architecture Diagram (Conceptual)

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT (Next.js)                  │
│  ┌───────────┐ ┌──────────┐ ┌───────────────────┐  │
│  │ Marketplace│ │ Editor   │ │ Dashboards        │  │
│  │ & Listings │ │ (GrapesJS│ │ (Buyer/Seller/    │  │
│  │            │ │  custom) │ │  Admin)           │  │
│  └─────┬─────┘ └────┬─────┘ └────────┬──────────┘  │
│        │             │                │              │
│  ┌─────┴─────────────┴────────────────┴──────────┐  │
│  │         Auth Layer (NextAuth / Custom JWT)     │  │
│  └─────────────────────┬─────────────────────────┘  │
└────────────────────────┼────────────────────────────┘
                         │ HTTPS / WebSocket
┌────────────────────────┼────────────────────────────┐
│                API GATEWAY / BFF                      │
│  ┌─────────────────────┴─────────────────────────┐  │
│  │   Rate Limiter │ Auth Middleware │ RBAC        │  │
│  └─────────────────────┬─────────────────────────┘  │
├────────────────────────┼────────────────────────────┤
│              BACKEND SERVICES                        │
│  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌────────┐  │
│  │ Listings │ │ Payments │ │ Editor │ │ Chat   │  │
│  │ Service  │ │ Service  │ │ Service│ │ Service│  │
│  └────┬─────┘ └────┬─────┘ └───┬────┘ └───┬────┘  │
│       │             │           │           │        │
│  ┌────┴─────────────┴───────────┴───────────┴────┐  │
│  │              PostgreSQL + Redis                 │  │
│  └────────────────────────────────────────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌────────────────────┐  │
│  │ S3 / R2  │ │ Email    │ │ Queue (BullMQ)     │  │
│  │ (Files)  │ │ (Resend) │ │ (Background Jobs)  │  │
│  └──────────┘ └──────────┘ └────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

*This prompt is designed to produce a world-class, production-ready marketplace. Every detail matters — from the first star that twinkles in the hero section to the last grass blade that sways in the footer.*
