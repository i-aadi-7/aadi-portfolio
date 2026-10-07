# Aadi — Web Designer & Developer

Interactive personal portfolio focused on modern web design, frontend development, motion, and immersive digital experiences.

**Live Site:** [https://aadi-portfolio-tau.vercel.app](https://aadi-portfolio-tau.vercel.app)

---

## Overview

A high-performance, single-page portfolio crafted with modern web technologies, fluid motion systems, responsive layouts, 3D-inspired visual compositions, smooth scrolling, and an edge-native secure contact pipeline.

---

## Highlights

- **Interactive Magnetic Avatar**: Spring-physics cursor tracking on the hero portrait.
- **Custom Particle Systems**: 2D HTML5 canvas starfield and ambient dust simulations.
- **Smooth Scrolling**: Lenis momentum scrolling integrated across all sections.
- **Fluid Motion**: Framer Motion layout transitions, page wipes, and scroll cues.
- **Responsive Composition**: Calibrated typography and layout scaling across mobile and desktop.
- **Project Showcase**: Interactive UI cards highlighting active builds and architectural breakdowns.
- **Accessible Modal System**: Focus-trapped, keyboard-navigable contact and privacy policy modals.
- **Protected Contact Pipeline**: Honeypot detection, Cloudflare Turnstile anti-bot verification, and atomic rate limiting.
- **Privacy-First Telemetry**: Google Analytics 4 integration with anonymized tracking.
- **SEO & Social Optimization**: OpenGraph metadata, Twitter cards, and structured JSON-LD schema.

---

## Tech Stack

### Frontend
- **Framework & Language**: React 19, TypeScript
- **Build Tool & Bundler**: Vite
- **Styling**: Tailwind CSS v4
- **Animation & Scrolling**: Framer Motion, Lenis
- **Icons**: Lucide React

### Backend & Services
- **Serverless Compute**: Supabase Edge Functions (Deno runtime)
- **Database & RPC**: Supabase PostgreSQL (atomic rate limiting via advisory locks)
- **Bot Detection**: Cloudflare Turnstile
- **Transactional Email**: Resend API

### Deployment & Telemetry
- **Hosting**: Vercel Edge Network
- **Analytics**: Google Analytics 4 (`G-L3F0FVWG1P`)
- **Search Verification**: Google Search Console

---

## Project Structure

```text
aadi-portfolio/
├── public/                 # Static public assets (favicons, sitemap, robots, SEO tokens)
├── src/
│   ├── assets/             # Optimized images, 3D transparent renders, avatars
│   ├── components/         # Modular UI sections, modals, particle canvases, UI helpers
│   ├── lib/                # Shared utilities (class merger cn())
│   ├── App.tsx             # Main application layout, routing fallback, section orchestration
│   ├── index.css           # Tailwind CSS v4 entry and custom utility classes
│   └── main.tsx            # DOM root entry
├── supabase/
│   └── functions/          # Deno Edge Functions (send-project-inquiry)
├── vercel.json             # Edge security headers and SPA rewrite rules
├── vite.config.ts          # Vite bundler configuration
└── package.json            # Dependencies and build scripts
```

---

## Local Development

### 1. Clone the repository
```bash
git clone https://github.com/i-aadi-7/aadi-portfolio.git
cd aadi-portfolio
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env.local` file based on `.env.example`:

```env
# Frontend Environment Variables (Public by design)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_TURNSTILE_SITE_KEY=your_turnstile_site_key
```

### 4. Run the development server
```bash
npm run dev
```

### 5. Build for production
```bash
npm run build
```

---

## Contact Form Architecture

```text
[Client Contact Form]
       │
       ▼
[Cloudflare Turnstile] (Client token verification)
       │
       ▼
[Supabase Edge Function] (send-project-inquiry)
       │
       ├─ Fail-Closed CORS Allowlist
       ├─ Payload Size Guard (≤50 KB)
       ├─ Honeypot (_hp) Check
       ├─ Server-side Input Validation
       ├─ Turnstile Token Verification
       ├─ PostgreSQL Atomic Rate Limiting (3 attempts / 10 min window)
       │
       ▼
[Resend API] (Transactional email delivery to inbox)
```

> **Security Note:** Sensitive credentials (`RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, `CONTACT_DESTINATION_EMAIL`, `SUPABASE_SERVICE_ROLE_KEY`) are managed exclusively in the Supabase Edge Function environment vault and are never exposed to the client bundle.

---

## Deployment

- **Frontend**: Hosted on [Vercel](https://vercel.com) with automated continuous deployment on `main`.
- **Backend**: Hosted on [Supabase Edge Functions](https://supabase.com).
- **Production URL**: [https://aadi-portfolio-tau.vercel.app](https://aadi-portfolio-tau.vercel.app)

---

## Author

**Aadi** — Web Designer & Developer

- **GitHub**: [https://github.com/i-aadi-7](https://github.com/i-aadi-7)
- **LinkedIn**: [https://www.linkedin.com/in/aadi7/](https://www.linkedin.com/in/aadi7/)
- **Instagram**: [https://www.instagram.com/i.aadi.7/](https://www.instagram.com/i.aadi.7/)
