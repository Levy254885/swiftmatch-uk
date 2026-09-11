# SwiftMatch UK — Setup Guide

## Prerequisites

- Node.js 20+
- npm 10+
- Firebase project (Auth, Firestore, Storage)
- Stripe account (UK) for payments (Phase 5)
- Optional: Cloudinary for images

## 1. Clone and install

```bash
git clone https://github.com/Levy254885/swiftmatch-uk.git
cd swiftmatch-uk
npm install
```

## 2. Environment

```bash
cp .env.example .env.local
```

Fill in Firebase client keys (`NEXT_PUBLIC_FIREBASE_*`).  
Never put Admin SDK private keys in `NEXT_PUBLIC_` variables.

## 3. Firebase

1. Create a Firebase project
2. Enable **Email/Password** authentication
3. Create a Firestore database
4. Deploy security rules:

```bash
firebase deploy --only firestore:rules
```

## 4. Run locally

```bash
npm run dev
```

### Key routes

| Route | Purpose |
|-------|---------|
| `/` | Landing + request entry |
| `/request` | Full job request → matching flow |
| `/login` | Sign in |
| `/register` | Customer or professional signup |
| `/for-professionals` | Provider marketing page |
| `/provider/onboarding` | Professional onboarding |
| `/provider/dashboard` | Provider dashboard |

## 5. Demo matching (no Firebase required)

The `/request` flow uses in-memory demo providers. Try:

> "My kitchen pipe has burst and water is everywhere."  
> Postcode: `M1 1AE` · Urgency: Emergency

## Architecture notes

- Matching: `src/matching/engine.ts` — no external LLM
- Job states: `src/lib/job-state-machine.ts`
- Security: `firestore.rules`
- Roles never writable from the client
