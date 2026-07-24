# Webmers

A premium, production-grade website marketplace — built from the ground up using the master prompt specification.

## Stack

- **Frontend:** Next.js 14 (App Router) + React 18 + Tailwind CSS
- **Animations:** Framer Motion, GSAP-ready (installed)
- **Backend:** Next.js API Routes + Node.js (extendable to Express/NestJS)
- **Database:** PostgreSQL (Prisma ORM)
- **Auth:** JWT + OAuth-ready architecture (NextAuth ready to integrate)
- **Real-time:** Socket.io-ready
- **Storage:** S3 / R2 configured
- **Security:** CSP, HSTS, CSRF-ready middleware, rate limiting architecture

## Structure

```
├── app/
│   ├── layout.tsx          # Root layout with meta, CSP headers
│   ├── page.tsx            # Cinematic landing page (night hero → day footer)
│   └── api/
│       └── listings/
│           └── route.ts     # Sample marketplace API
├── components/              # (ready for reuse)
├── lib/
│   └── fonts.ts             # Inter + Space Grotesk
├── prisma/
│   └── schema.prisma        # Full DB schema
├── middleware.ts            # Security headers
├── styles/
│   └── globals.css          # Grain overlay, custom animations
└── public/
```

## Key Features Built

- ✅ Cinematic scroll-driven day-night transition on landing page
- ✅ Animated stars, moon, fireflies, sun, grass
- ✅ Featured marketplace cards with colorful thumbnails
- ✅ Visual editor showcase section
- ✅ Stats bar, categories, how-it-works, testimonials
- ✅ Pricing / code-unlock comparison
- ✅ Newsletter signup
- ✅ Footer with daytime sky, sun, and swaying grass
- ✅ Security middleware (CSP, X-Frame-Options, etc.)
- ✅ Prisma schema with User, Listing, Order, Review, Wishlist, Message
- ✅ Responsive design (mobile-first)
- ✅ Reduced-motion-friendly animations (CSS keyframes)

## Running the Project

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Next Steps (per master prompt)

- [ ] Full user authentication (Google OAuth, email/password, 2FA)
- [ ] Buyer / Seller / Admin dashboards
- [ ] No-code visual editor (GrapesJS / Craft.js)
- [ ] Stripe checkout + escrow + payouts
- [ ] Messaging / WebSocket chat
- [ ] Wishlist & notifications system
- [ ] Admin moderation tools
- [ ] PWA service worker
- [ ] Unit / integration / E2E tests (Jest, Playwright)
- [ ] Deployment pipeline (Vercel + Railway / AWS)

## Security Notes

- Zero secrets in client-side bundles (`.env` excluded)
- CSP and security headers applied globally
- Rate limiting and RBAC architecture defined
- No internal IDs or stack traces exposed in sample API

---

Built on branch `arena/019f94c0-webmers`.
