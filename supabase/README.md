# Supabase & Resend Production Setup Guide

This guide walks you through setting up secure server-side email delivery for portfolio inquiries using Supabase Edge Functions and the Resend API.

---

## Architecture Flow

```
React (ContactModal)
   │
   ▼ POST /functions/v1/send-project-inquiry
Supabase Edge Function (Validates input, checks honeypot, attaches server secrets)
   │
   ▼ POST https://api.resend.com/emails (Authenticated with RESEND_API_KEY)
Resend API
   │
   ▼ SMTP Dispatch
Your Destination Inbox (CONTACT_DESTINATION_EMAIL)
```

---

## Step 1: Resend Setup

1. Create a free account at [resend.com](https://resend.com).
2. Go to **API Keys** and generate a new key with `Full access` or `Sending access`.
3. Copy your API key (starts with `re_...`).
4. *(Optional for production domain)*: Go to **Domains** in Resend to verify your custom domain (e.g. `mail.yourdomain.com`). If not verified yet, Resend allows sending test emails from `onboarding@resend.dev` to your registered account email.

---

## Step 2: Supabase Project Setup & CLI

1. Create a project on [supabase.com](https://supabase.com).
2. Install the Supabase CLI on your machine if you haven't already:
   ```bash
   npm install -g supabase
   ```
3. Log in to your Supabase account:
   ```bash
   supabase login
   ```
4. Link your local repository to your Supabase project:
   ```bash
   supabase link --project-ref <your-project-ref>
   ```
   *(You can find your Project Reference ID in your Supabase Dashboard URL or Project Settings)*

---

## Step 3: Run Rate Limiting Database Migration & Set Secrets

### 1. Apply Rate Limiting Migration:
Run the migration in your Supabase SQL Editor or via CLI:
```bash
supabase db push
```
*(Or execute `supabase/migrations/20261006000000_contact_rate_limits.sql` directly in Supabase Dashboard SQL Editor).*

### 2. Set Server-Side Secrets:
Set your private environment secrets in Supabase (these are stored securely on the server and never leaked to the frontend bundle):

```bash
supabase secrets set RESEND_API_KEY="re_your_resend_api_key_here"
supabase secrets set CONTACT_DESTINATION_EMAIL="your_inbox_email@example.com"
supabase secrets set TURNSTILE_SECRET_KEY="0x4AAAAAA..."
```

*(Optional CORS origin lock for production)*:
```bash
supabase secrets set ALLOWED_ORIGIN="https://your-production-domain.com"
```

*(Optional custom sender email)*:
```bash
supabase secrets set RESEND_FROM_EMAIL="Inquiries <hello@yourdomain.com>"
```

Alternatively, configure them in the **Supabase Dashboard** under:
**Project Settings → Edge Functions → Secrets**.

---

## Step 4: Deploy the Edge Function

Deploy the function to Supabase:

```bash
supabase functions deploy send-project-inquiry --no-verify-jwt
```

> **Note on `--no-verify-jwt`**: Since the portfolio contact form is accessible to public website visitors (who are not logged in with Supabase Auth), `--no-verify-jwt` allows public POST requests guarded by standard validation, input sanitization, and the invisible honeypot check.

---

## Step 5: Configure Frontend Environment Variables

1. Copy `.env.example` to `.env` in the project root:
   ```bash
   cp .env.example .env
   ```
2. Set your Supabase public project values:
   ```env
   VITE_SUPABASE_URL="https://<your-project-ref>.supabase.co"
   VITE_SUPABASE_ANON_KEY="eyJhbGciOi..."
   ```
   *(Find these in Supabase Dashboard → Project Settings → API)*

---

## Step 6: Testing

### Local Testing:
1. Run Supabase Edge Functions locally:
   ```bash
   supabase functions serve send-project-inquiry --env-file ./supabase/.env.local --no-verify-jwt
   ```
2. Test submitting the form in your local dev server (`npm run dev`).

### Production Verification:
1. Deploy frontend to Vercel/Netlify with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` configured in the hosting environment variables.
2. Open the Contact Modal, submit a test inquiry, and verify that:
   - The UI shows `SENDING...` and transitions to `PROJECT RECEIVED`.
   - The formatted email arrives in your inbox with timestamp, project scope, budget, and contact info.
