# SwiftMatch UK — Setup Guide

## Prerequisites

- Node.js 20+
- npm 10+
- Firebase CLI (`npm i -g firebase-tools`)
- Firebase project (Auth, Firestore)
- Optional: Stripe (UK)

## 1. Install

```bash
git clone https://github.com/Levy254885/swiftmatch-uk.git
cd swiftmatch-uk
npm install
cp .env.example .env.local
```

Fill `NEXT_PUBLIC_FIREBASE_*`. Never put Admin secrets in `NEXT_PUBLIC_` vars.

## 2. Run app (demo matching works without Firebase)

```bash
npm run dev
```

Open http://localhost:3000 — try `/request` with an emergency plumbing description and postcode `M1 1AE`.

## 3. Firebase rules & indexes

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

## 4. Cloud Functions

```bash
cd functions && npm install && npm run build && cd ..
firebase deploy --only functions
```

## 5. Emulators & seed

```bash
firebase emulators:start
# other terminal:
npm i -D firebase-admin
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 npx tsx scripts/seed.ts
```

Seed refuses non-emulator projects unless `ALLOW_PRODUCTION_SEED=true`.

## Key routes

| Route | Purpose |
|-------|---------|
| `/` | Landing |
| `/request` | Instant matching |
| `/jobs/[id]` | Quote, book, track |
| `/jobs/[id]/chat` | Messages |
| `/jobs/[id]/review` | Star review |
| `/provider/requests` | Provider inbox |
| `/provider/onboarding` | Provider setup |
| `/admin` | Ops |
| `/admin/providers` | Verification |
| `/admin/disputes` | Disputes |
| `/support` | Help form |

## Architecture

- Matching: `src/matching/engine.ts` + `src/lib/matching-orchestration.ts`
- Job states: `src/lib/job-state-machine.ts`
- Security: `firestore.rules`
- Roles: only via Cloud Functions / Admin SDK
