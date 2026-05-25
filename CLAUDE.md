# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack taxi booking web application. `part2/` is the active codebase; `part1/` is a legacy PHP prototype.

## Development Commands

### Frontend (`part2/frontend/`)
```
npm run dev       # Start Vite dev server
npm run build     # tsc -b && vite build
npm run lint      # ESLint
npm run preview   # Preview production build
```

### Backend (`part2/backend/`)
```
npm run dev   # nodemon main.js (hot reload)
npm start     # node main.js
```

Both servers must run simultaneously during development. The frontend proxies API calls to `http://localhost:5000/api`.

## Architecture

### Frontend (`part2/frontend/src/`)
React 19 + TypeScript SPA with two pages rendered via tab state in `App.tsx`:
- **BookingPage** — customer-facing booking form with Leaflet map for pickup location selection
- **AdminPage** — driver assignment dashboard showing unassigned bookings

API calls are centralized in `src/api/` (`bookingAPI.ts`, `adminAPI.ts`). TypeScript interfaces live in `src/types/booking.ts`. Form validation logic (phone format, future datetime enforcement) lives in `src/utils/validation.ts`.

The Leaflet map (`src/components/map/BookingMap.tsx`) centers on Auckland NZ (-36.8485, 174.7633) and uses Nominatim reverse geocoding to convert clicked coordinates into a human-readable address.

### Backend (`part2/backend/`)
Express 5 REST API connecting to MongoDB Atlas (database: `TaxiCabOnline`).

| File | Responsibility |
|------|---------------|
| `main.js` | Server entry — connects to MongoDB, then starts listening on port 5000 |
| `db/mongo.js` | MongoDB Atlas connection using `.env` credentials |
| `routes/bookings.js` | All `/api/bookings` endpoints |
| `services/bookingService.js` | Sequential `booking_ref` generation (BRN00001, BRN00002…) via a `counters` collection |

### API Endpoints
- `POST /api/bookings` — create booking (auto-generates `booking_ref`)
- `GET /api/bookings?ref=...` — search bookings; supports exact, partial, and range matching
- `PATCH /api/bookings/:id/assign` — assign a booking to a driver

### Key Business Rules
- Admin view filters to bookings **within 2 hours of pickup time on the current day only**
- Booking status is either `"unassigned"` or `"assigned"`
- Phone validation: 10–12 digits; pickup datetime must be in the future

## Environment Setup

Backend requires `part2/backend/.env`:
```
dbuser=<mongo_username>
dbpassword=<mongo_password>
appname=Cluster0
```
