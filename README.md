# SwiftMatch UK

**Find the right professional, available now.**

Production-oriented instant service-matching marketplace for the United Kingdom. Customers describe what they need; the platform matches them with verified, **available** professionals in minutes — without browsing hundreds of profiles.

## Differentiator

1. Customer describes the job  
2. Deterministic **Intelligent Matching Engine** classifies the service  
3. Hard filters + soft ranking select eligible, available professionals  
4. Providers are notified with urgency-based response windows  
5. Customer gets suitable matches / quotes quickly  

**No paid AI API** for core matching. Taxonomy, keywords, synonyms, geo, availability, ratings, and performance drive ranking.

## Tech stack

| Layer | Choice |
|-------|--------|
| Frontend | Next.js (App Router) + TypeScript + Tailwind |
| Backend | Firebase Auth, Firestore, Cloud Functions |
| Payments | Stripe (UK) |
| Hosting | Vercel + Firebase |

## Quick start

```bash
git clone https://github.com/Levy254885/swiftmatch-uk.git
cd swiftmatch-uk
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000

**Demo matching works without Firebase.** Try `/request` with:

> My kitchen pipe has burst and water is everywhere.  
> Postcode: `M1 1AE` · Urgency: Emergency

Full setup: **[SETUP.md](./SETUP.md)**.

## Main routes

| Route | Role |
|-------|------|
| `/` | Landing |
| `/request` | Customer: describe → classify → match |
| `/jobs/[id]` | Quote → book → track |
| `/jobs/[id]/chat` | Messaging |
| `/jobs/[id]/review` | Star review |
| `/login` · `/register` | Auth |
| `/provider/onboarding` | Provider setup |
| `/provider/dashboard` | Provider overview |
| `/provider/requests` | Incoming matches |
| `/provider/availability` | Availability controls |
| `/admin` | Operations |
| `/admin/providers` | Verification |
| `/admin/disputes` | Disputes |
| `/support` | Help form |
| `/for-professionals` | Provider marketing |

## Architecture

- Matching: `src/matching/engine.ts` + `src/lib/matching-orchestration.ts`
- Job lifecycle: `src/lib/job-state-machine.ts`
- Security: `firestore.rules` — roles never client-writable
- Functions: `acceptJob`, registration, verification, expiry, payment intent stub
- Realtime: `src/hooks/useProviderMatches.ts`

## Principles

1. Functional correctness and security first  
2. Correct professional > fast > cheap  
3. Real availability only (busy/offline excluded)  
4. Trust: verification and money moves are server-side  
5. UK-first (postcodes, GBP, miles, 999 safety notes)
