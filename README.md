# SwiftMatch UK

**Find the right professional, available now.**

SwiftMatch is a production-grade instant service-matching marketplace for the United Kingdom. Customers describe what they need; the platform intelligently matches them with verified, available professionals in minutes — without requiring customers to browse hundreds of profiles.

## Core Differentiator

Traditional marketplaces force customers to search and wait. SwiftMatch does the searching:

1. Customer describes the job in natural language  
2. Internal Intelligent Matching Engine classifies the service  
3. Hard filters + soft ranking identify eligible, available professionals  
4. Controlled real-time notifications go to the best matches  
5. Customer receives suitable matches / quotes quickly  

**No paid AI API dependency** for core matching. Classification and ranking use a deterministic engine built on service taxonomy, keywords, synonyms, geospatial data, availability, ratings and performance metrics.

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Cloud Functions, Storage, App Check)
- **Payments**: Stripe (UK-compatible)
- **Images**: Cloudinary (preferred) or Firebase Storage + CDN
- **Email**: Abstraction layer (Resend / SendGrid / etc.)
- **Hosting**: Vercel (frontend) + Firebase

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/             # Reusable UI components + design system
├── features/               # Feature modules (customer, provider, admin, matching)
├── lib/                    # Firebase, utilities, constants
├── services/               # Business logic services
├── matching/               # Intelligent Matching Engine
├── types/                  # TypeScript types
├── hooks/                  # React hooks
├── validation/             # Zod schemas
└── styles/                 # Global styles

functions/                  # Firebase Cloud Functions
firestore.rules             # Security rules
firestore.indexes.json      # Composite indexes
```

## Getting Started

### Prerequisites

- Node.js 20+
- Firebase project
- Stripe account (for payments)
- Cloudinary account (recommended)

### Setup

1. Clone the repository
2. Copy `.env.example` → `.env.local` and fill values
3. `npm install`
4. Configure Firebase (`firebase login`, set project)
5. Deploy security rules & indexes
6. Seed development data (`npm run seed`)
7. `npm run dev`

See [SETUP.md](./SETUP.md) for detailed instructions.

## Key Features

- Instant job request flow with natural language description
- Deterministic Intelligent Matching Engine (no external LLM required)
- Real-time provider availability & cascading matching
- Provider response timers for urgent jobs
- Quotes, bookings, payments (Stripe)
- Real-time messaging
- Reviews with fraud protection
- Full admin operations centre
- UK postcode / geolocation support
- Service taxonomy + keyword/synonym engine
- Strict Firestore security rules & RBAC
- Mobile-first, accessible UI

## Matching Engine Principles

1. **Correct professional > fast professional > cheap professional**
2. Availability must be real — never show “Available now” when busy
3. Hard filters first, then soft ranking
4. Urgency dynamically adjusts scoring weights
5. Controlled exposure for new verified providers (fair matching)
6. Never match completely unrelated services

## Development Phases

- Phase 1: Architecture, auth, design system, schema, security
- Phase 2: Customer flow, taxonomy, matching engine
- Phase 3: Provider onboarding & dashboard
- Phase 4: Bookings, messaging, notifications, reviews
- Phase 5: Payments, admin, analytics, disputes
- Phase 6: SEO, performance, hardening, testing, deployment

## Brand

Placeholder brand: **SwiftMatch**. Easy to rebrand later.

## Licence

Proprietary — All rights reserved.
