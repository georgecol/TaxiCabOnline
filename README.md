# TaxiCab Online — Project Documentation

**Student:** George Collier  
**Course:** Web Development  
**Date:** 26 May 2026

---

## Table of Contents

1. [Deployed Application](#1-deployed-application)
2. [Technology Stack](#2-technology-stack)
3. [Running the Project Locally](#3-running-the-project-locally)
4. [API Endpoints](#4-api-endpoints)
5. [Feature Descriptions](#5-feature-descriptions)
6. [Testing Instructions](#6-testing-instructions)
7. [Limitations and Known Issues](#7-limitations-and-known-issues)
8. [Reflection on AI-Supported Development](#8-reflection-on-ai-supported-development)

---

## 1. Deployed Application

| Service | URL |
|---------|-----|
| Frontend (Vercel) | https://web-dev-chi-coral.vercel.app |
| Backend API (Render) | https://webdev-backend-latest.onrender.com |

The frontend communicates with the backend via the `VITE_API_URL` environment variable, set to the production API base URL at deploy time. Both services must be running simultaneously.

> **Note:** The Render free tier spins down after inactivity. If the first request is slow (up to 30 seconds), allow the backend to wake before retrying.

---

## 2. Technology Stack

### Frontend

| Category | Technology | Notes |
|----------|-----------|-------|
| Build tool | Vite 8.x | Fast dev server and production bundler |
| Language | TypeScript ~6.0.2 | Static typing throughout |
| UI framework | React 19.2.6 + react-dom 19.2.6 | Component-based UI |
| Styling | Tailwind CSS 3.4.x | Utility-first CSS |
| Maps | Leaflet 1.9.4 + react-leaflet 5.0.0 | Interactive maps |
| Tile provider | OpenStreetMap | Free map background imagery |
| Geocoding | Nominatim | Reverse and forward geocoding |
| Linting | ESLint 10.x | react-hooks + react-refresh plugins |

Map centre: Auckland, New Zealand (`-36.8485, 174.7633`)

### Backend

| Category | Technology | Notes |
|----------|-----------|-------|
| Runtime | Node.js | JavaScript runtime |
| Framework | Express 5.2.x | HTTP server and REST API |
| Database driver | MongoDB 7.2.x | Official Node.js driver |
| Database host | MongoDB Atlas | Managed cloud cluster: TaxiCabOnline |
| Auth | jsonwebtoken 9.0.3 | JWT creation/verification (8h expiry) |
| Password hashing | bcryptjs 3.0.3 | 10 salt rounds |
| CORS | cors 2.8.x | Cross-Origin Resource Sharing middleware |
| Config | dotenv 17.x | Loads `.env` variables |
| Dev utility | nodemon | Hot-reload (dev only) |

---

## 3. Running the Project Locally

### Prerequisites

- Node.js v18 or later
- npm v9 or later
- A MongoDB Atlas cluster (or use the shared test credentials in [Section 6](#6-testing-instructions))

### Step 1 — Clone or extract the project

The active codebase lives entirely inside the `part2/` directory. All commands below are run from within `part2/backend/` or `part2/frontend/`.

### Step 2 — Configure the backend

Create `part2/backend/.env`:

```env
dbuser=<mongo_atlas_username>
dbpassword=<mongo_atlas_password>
appname=Cluster0
cluster=cluster0.ygc2gib.mongodb.net
JWT_SECRET=<any_long_random_string>
SERVER_URL=http://localhost:
```

Replace the angle-bracket placeholders with real values. `JWT_SECRET` can be any arbitrary string.

### Step 3 — Configure the frontend

Create `part2/frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### Step 4 — Install dependencies

```bash
# Backend
cd part2/backend && npm install

# Frontend
cd part2/frontend && npm install
```

### Step 5 — Start the development servers

Run both servers concurrently (two terminal windows).

```bash
# Backend — http://localhost:5000
cd part2/backend && npm run dev

# Frontend — http://localhost:5173
cd part2/frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in a browser.

### Step 6 — Build for production

```bash
# Frontend build (output → part2/frontend/dist/)
cd part2/frontend && npm run build

# Backend production start
cd part2/backend && npm start
```

---

## 4. API Endpoints

| Base URL | Value |
|----------|-------|
| Local | `http://localhost:5000/api` |
| Remote | `https://webdev-backend-latest.onrender.com/api` |

All endpoints except `/auth/login` and `/auth/register` require an `Authorization: Bearer <JWT_TOKEN>` header. Admin-only endpoints additionally require `role = "admin"`.

---

### Authentication — `/api/auth`

#### `POST /api/auth/login`

Authenticates an existing user. Returns a JWT valid for 8 hours.

**Body:** `{ username, password }`  
**Returns:** `{ success, token, username, role, name, phone, email }`

---

#### `POST /api/auth/register`

Registers a new account with role `testuser`. Phone must be 10–12 digits; email must be valid.

**Body:** `{ username, password, name, phone, email }`  
**Returns:** `{ success, token, username, role, name, phone, email }`

---

#### `PUT /api/auth/profile` *(auth required)*

Updates the display name, phone, and email of the logged-in user.

**Body:** `{ name, phone, email }`  
**Returns:** `{ success, name, phone, email }`

---

### Bookings — `/api/bookings`

#### `POST /api/bookings` *(auth required)*

Creates a new booking. Auto-generates a reference (`BRNxxxxx`); status defaults to `unassigned`.

**Body:** `{ cname, phone, pickup_address, pickup_lat, pickup_lng, dest_address, dest_lat, dest_lng, pickup_date, pickup_time }`  
**Returns:** `{ success, message, data: <booking> }`

---

#### `GET /api/bookings` *(auth required, admin only)*

Returns bookings filtered by optional query parameters.

| Query param | Behaviour |
|-------------|-----------|
| `?ref=BRN00003` | Exact match |
| `?ref=BRN00` | Prefix match (length < 8) |
| `?ref=BRN00001-BRN00010` | Range match |
| `?scope=history` | All past bookings |
| `?scope=future` | Bookings more than 2 hours ahead |
| *(none)* | Bookings within the next 2 hours |

**Returns:** `{ success, data: [<booking>] }`

---

#### `GET /api/bookings/my` *(auth required)*

Returns all bookings belonging to the authenticated user, sorted by pickup date descending.

**Returns:** `{ success, data: [<booking>] }`

---

#### `GET /api/bookings/driver` *(auth required)*

Returns all bookings assigned to the authenticated driver.

**Returns:** `{ success, data: [<booking>] }`

---

#### `PATCH /api/bookings/:id/assign` *(auth required, admin only)*

Assigns a driver to an unassigned future booking. Updates status to `assigned` and stores driver details on the booking document.

**Body:** `{ driverId }` (MongoDB ObjectId)  
**Returns:** `{ success, message }`

---

#### `PATCH /api/bookings/:id` *(auth required, owner only)*

Edits an existing booking. Only the owner may edit, and only while status is `unassigned`.

**Body:** Any subset of booking fields  
**Returns:** `{ success, message, data: <updated booking> }`

---

#### `DELETE /api/bookings/:id` *(auth required, owner only)*

Permanently cancels a booking. Only the owner may cancel, and only while status is `unassigned`.

**Returns:** `{ success, message }`

---

### Drivers — `/api/drivers`

#### `GET /api/drivers` *(auth required, admin only)*

Returns all users with `role = "driver"`. Password fields are excluded.

**Returns:** `{ success, data: [<driver>] }`

---

### Users — `/api/users`

#### `GET /api/users` *(auth required, admin only)*

Returns all users sorted by creation date descending. Password fields excluded.

| Query param | Behaviour |
|-------------|-----------|
| `?role=testuser` | Filter by role |
| `?role=driver` | Filter by role |
| `?role=admin` | Filter by role |

**Returns:** `{ success, data: [<user>] }`

---

## 5. Feature Descriptions

### 5.1 Authentication System

Users must be logged in to access any part of the application. On successful authentication, a JWT is stored in `localStorage` and automatically attached to all API requests via an `Authorization: Bearer` header. Sessions persist across page refreshes until the user signs out or the 8-hour token expires.

| Role | Permissions |
|------|------------|
| `testuser` | Book, view, edit, and cancel own bookings |
| `driver` | View assigned bookings and pickup/destination on map |
| `admin` | Full access: view all bookings, assign drivers, manage users |

### 5.2 Booking Creation

Customers fill out a form with:

- Customer name and phone (10–12 digits, validated client-side)
- Pickup address (text entry with auto-geocoding via Nominatim)
- Destination (text entry or click-to-select on the Leaflet map)
- Pickup date and time (must be in the future)

The backend generates a unique sequential reference (`BRN00001`, `BRN00002`, …) using an atomic counter in MongoDB's `counters` collection.

### 5.3 Map Integration

An interactive Leaflet map centred on Auckland lets users click to set a destination. Nominatim reverse geocoding converts coordinates to a readable address.

- 🟢 **Green pin** — pickup location
- 🔴 **Red pin** — destination
- 🔵 **Blue pin** — driver location
- A dashed polyline connects pickup and destination when both are set.

### 5.4 My Bookings

Customers can view all past and current bookings in a list. Each entry shows the booking reference, status badge (Unassigned / Assigned), pickup details, and driver info if assigned. Unassigned bookings can be edited or cancelled.

### 5.5 Admin Dashboard

The dashboard has three tabs:

- **Current Bookings** — "Next 2 Hours" and "Further Ahead" sections. Unassigned future bookings show an Assign button that opens a driver picker modal.
- **History** — All past bookings sorted by most recent first.
- **Users** — All registered accounts with username, role, name, phone, and email.

### 5.6 Driver Assignments

Users with the `driver` role see a "My Assignments" page listing all bookings assigned to them, each with a map view showing pickup, destination, and the driver's own GPS location.

### 5.7 Profile Management

All authenticated users can update their display name, phone number, and email. Changes are persisted to MongoDB and reflected in `localStorage` immediately without requiring a re-login.

### 5.8 Dark Mode

A dark/light theme toggle is available in the navigation bar. The preference is persisted in `localStorage` via a custom `useDarkMode` hook.

---

## 6. Testing Instructions

### 6.1 Accessing the Application

Navigate to the [deployed frontend URL](#1-deployed-application) or start the local dev servers ([Section 3](#3-running-the-project-locally)) and open [http://localhost:5173](http://localhost:5173).

### 6.2 Sample User Accounts

> These credentials are provided for assessment purposes only.

| Role | Username | Password |
|------|----------|----------|
| Customer (`testuser`) | `testuser1` | `password123` |
| Admin | `admin` | `admin123` |
| Driver | `driver1` | `password123` |
| Driver | `driver2` | `password123` |

Self-registration is also available via the Register screen. All self-registered accounts receive the `testuser` role.

### 6.3 Example Booking References

References increment from `BRN00001`. Useful search patterns in the Admin Dashboard:

```
BRN00003              # Exact match
BRN000                # Prefix match
BRN00001-BRN00010     # Range match (first ten bookings)
```

### 6.4 Finding Sample Driver IDs

Driver IDs are MongoDB ObjectIds assigned at account creation. To obtain one for direct API testing (e.g. via Postman):

1. Log in as `admin` and call `GET /api/drivers`.
2. Copy the `_id` value of any returned driver object.
3. Use that value as `driverId` in the `PATCH /api/bookings/:id/assign` request body.

### 6.5 Golden Path

1. Register a new account (or log in as `testuser1` / `password123`).
2. Fill in the booking form:
   - Enter a name and a 10-digit phone (e.g. `0211234567`).
   - Type a pickup address (e.g. `Auckland City`) and tab out — the map geocodes and shows a green pin.
   - Click anywhere on the map to set a destination (red pin).
   - Choose a future pickup date and time.
   - Click **Book Taxi**.
3. Confirm the booking reference is displayed (e.g. `BRN00005`).
4. Navigate to **My Bookings** — the new booking appears as `Unassigned`.
5. Log out and log back in as `admin` / `admin123`.
6. Open **Admin Dashboard → Current Bookings**.
7. Find your booking (under "Next 2 Hours" or "Further Ahead") and click **Assign**.
8. Select `driver1` from the modal; confirm the status changes to `Assigned`.
9. Log out and log in as `driver1` / `password123`.
10. The assigned booking appears under **My Assignments**.
11. Log back in as the original user and confirm **My Bookings** shows the updated status.

### 6.6 Edge Cases

| Scenario | Expected behaviour |
|----------|--------------------|
| Submit with a past date/time | `"Pickup time cannot be in the past"` |
| Phone number fewer than 10 digits | `"Phone must be 10–12 digits"` |
| Cancel an assigned booking | `"Cannot cancel an assigned booking"` |
| Assign a driver to a past booking | `"Cannot assign a driver to a past booking"` |

---

## 7. Limitations and Known Issues

| # | Issue | Notes |
|---|-------|-------|
| 1 | **No real-time updates** | Admin dashboard and My Bookings do not poll for changes. Other sessions must refresh manually. |
| 2 | **Geocoding reliability** | Nominatim results are NZ-biased but may fail for uncommon addresses, leaving coordinates undefined and pins absent. |
| 3 | **Nominatim rate limiting** | Nominatim enforces max 1 request/second. Rapid automated requests may be throttled. |
| 4 | **Backend cold-start** | Render free tier spins down after 15 min inactivity; first request may take up to 30 seconds. |
| 5 | **No minimum advance notice** | A booking can be placed 1 minute before pickup; only future time is enforced. |
| 6 | **Admin-only driver creation** | Driver accounts cannot self-register; they must be inserted via Atlas or a seed script. |
| 7 | **Counter pre-initialisation required** | The `counters` collection must have `{ _id: "booking_ref", seq: 0 }` or booking creation will fail. |
| 8 | **No pagination** | All matching documents are returned in a single response; large datasets may be slow. |

---

## 8. Reflection on AI-Supported Development

This project was developed with assistance from **Claude Code** (Anthropic's AI coding assistant), used throughout the second half of the development lifecycle. The initial refactor to Vite + React was done using Codex in VS Code, which ran into a number of issues.

### 8.1 Where AI Assistance Was Most Valuable

**Scaffolding and boilerplate elimination**  
Setting up React 19 + TypeScript + Vite with Tailwind CSS, configuring ESLint, and wiring together an Express 5 backend with JWT authentication was handled quickly by the AI, freeing time to focus on application-specific logic.

**API design iteration**  
Early API designs were discussed conversationally before any code was written. The AI helped identify edge cases — for example, that the assignment endpoint needed to validate whether a booking was in the future, and that cancellation should be blocked on already-assigned bookings — before they could become bugs.

**Debugging and targeted fixes**  
When the booking reference counter produced incorrect values due to a `returnDocument` option mismatch in MongoDB's `findOneAndUpdate`, the AI diagnosed the issue from the error output and proposed a targeted fix without requiring a complete rewrite. This was consistently faster than manual documentation searches.

### 8.2 Limitations Observed

**Hallucinated API surface**  
On several occasions the AI suggested MongoDB driver methods or Express 5 options that did not exist in the installed versions, or had changed between versions. Every suggestion required verification against official documentation before being accepted.

**Over-engineering tendency**  
Left unchecked, AI suggestions sometimes introduced unnecessary abstractions — generic service layers, repository patterns — disproportionate to the project's scope. Active pushback was needed to keep the codebase simple.

**Context limits in long sessions**  
In extended sessions, the AI would occasionally contradict earlier decisions or re-introduce patterns that had been explicitly removed, requiring a clear independent mental model of the intended architecture.

### 8.3 Overall Assessment

AI-assisted development is most effective as a force multiplier for a developer who already understands the problem domain and can critically evaluate suggestions. It accelerates production of correct, readable code and helps surface edge cases early — but it does not replace the need for understanding. Code generated by AI must be read, understood, and tested before being trusted, especially at integration points (authentication, database access, external APIs).

In this project the AI acted as an always-available pair programmer: useful for talking through design decisions, generating initial implementations, and diagnosing specific errors, but requiring ongoing judgement and direction from the developer. The end result is code I understand and can maintain, not code I accepted blindly.