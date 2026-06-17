# PharmaGO

Medicine home-delivery marketplace for francophone Africa, connecting clients, partner
pharmacies, and delivery couriers, with mobile money payment support (Orange Money, Moov
Money, Wave). This is the Phase 1 MVP: an admin back-office, pharmacy dashboard, courier
app, and client storefront, backed by a single REST API, plus a native mobile app
(iOS/Android via Expo) for clients, pharmacies, and couriers to use on a phone.

## Stack

- **Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, JWT auth
- **Frontend (web)**: Next.js (App Router), React, TypeScript, Tailwind CSS
- **Mobile**: React Native, Expo + Expo Router, TypeScript — see `mobile/README.md` for
  running it on a phone via Expo Go and building for the App Store / Play Store.

## Project layout

```
backend/   Express REST API (port 4000)
frontend/  Next.js app (port 3000)
mobile/    Expo / React Native app (iOS, Android, web)
```

## Setup

### Prerequisites

- Node.js 20+
- PostgreSQL running locally (or reachable via `DATABASE_URL`)

### Backend

```bash
cd backend
npm install
cp .env.example .env   # adjust DATABASE_URL / JWT_SECRET if needed
npx prisma migrate deploy
npm run seed            # creates demo users, a pharmacy, and a product catalog
npm run dev              # starts the API on http://localhost:4000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL defaults to http://localhost:4000/api
npm run dev                    # starts the app on http://localhost:3000
```

## Demo accounts

All seeded accounts use the password `password123`:

| Role     | Email                                    |
| -------- | ----------------------------------------- |
| Admin    | admin@pharmago.africa                     |
| Pharmacy | pharmacie.centrale@pharmago.africa        |
| Courier  | livreur.koffi@pharmago.africa             |
| Client   | client.demo@pharmago.africa               |

## Order lifecycle

`PENDING → ACCEPTED → PREPARING → READY_FOR_PICKUP → ASSIGNED → IN_DELIVERY → DELIVERED`
(or `CANCELLED` from `PENDING`/`ACCEPTED`/`PREPARING`/`READY_FOR_PICKUP`). Transitions are
enforced server-side per role:

- **Pharmacy**: accepts, prepares, and marks orders ready for pickup
- **Admin**: assigns an available courier once an order is ready
- **Courier**: starts and confirms delivery
- **Client**: can cancel a pending order, and pays via mobile money (cash is settled on
  delivery)

Mobile money payments are simulated in Phase 1 (instant confirmation with a generated
transaction reference) — live Orange Money / Moov Money / Wave integration is planned for
Phase 2.
