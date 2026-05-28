# TAXICAB ONLINE — PROJECT DOCUMENTATION

Student:        George Collier
Course:         Web Development
Date:           26 May 2026

# Part 1





# Part 2

## 1. PUBLIC URL OF THE DEPLOYED APPLICATION

Frontend (Vercel):
  https://web-dev-chi-coral.vercel.app

Backend API (Render / hosted service):
  https://webdev-backend-latest.onrender.com

The frontend is configured to communicate with the backend via the
VITE_API_URL environment variable, which is set to the production API base
URL during deployment. Both services must be running simultaneously for the
application to function.

Note: The Render free tier may spin down after inactivity. If the first
request is slow (up to 30 seconds), allow the backend to wake before retrying.


## 2. TECHNOLOGY STACK USED


FRONTEND
--------
  Runtime / Build Tool
    - Vite 8.x               Fast dev server and production bundler
    - TypeScript ~6.0.2      Static typing throughout the frontend codebase

  UI Framework & Styling
    - React 19.2.6           Component-based UI framework (latest stable)
    - react-dom 19.2.6       React DOM renderer
    - Tailwind CSS 3.4.x     Utility-first CSS framework for styling

  Mapping
    - Leaflet 1.9.4          Open-source interactive map library (JavaScript)
    - react-leaflet 5.0.0    React wrapper around Leaflet
    - OpenStreetMap          Free tile provider (map background imagery)
    - Nominatim              OpenStreetMap's geocoding API, used for:
                               • Reverse geocoding (click-to-address on map)
                               • Forward geocoding (address text to coordinates)
    Map centre: Auckland, New Zealand (-36.8485, 174.7633)

  Code Quality
    - ESLint 10.x            Linting (react-hooks + react-refresh plugins)
    - eslint-plugin-react-hooks   Enforces Rules of Hooks

BACKEND
-------
  Runtime & Framework
    - Node.js                JavaScript runtime
    - Express 5.2.x          HTTP server and REST API framework

  Database
    - MongoDB 7.2.x (driver) Official Node.js MongoDB driver
    - MongoDB Atlas           Managed cloud database (cluster: TaxiCabOnline)

  Authentication & Security
    - jsonwebtoken 9.0.3     JWT creation and verification (8-hour expiry)
    - bcryptjs 3.0.3         Password hashing (10 salt rounds)
    - cors 2.8.x             Cross-Origin Resource Sharing middleware

  Configuration
    - dotenv 17.x            Loads environment variables from .env file
    - nodemon                Hot-reload dev utility (dev only)


### 3. HOW TO RUN AND BUILD THE PROJECT LOCALLY


PREREQUISITES
-------------
  - Node.js v18 or later
  - npm v9 or later
  - A MongoDB Atlas cluster (or use the shared credentials below for testing)

STEP 1: Clone or extract the project
-------------------------------------
  The active codebase lives entirely inside the part2/ directory.
  All commands below are run from within part2/backend/ or part2/frontend/.

STEP 2: Configure the backend environment
------------------------------------------
  Create the file  part2/backend/.env  with the following content:

    dbuser=<mongo_atlas_username>
    dbpassword=<mongo_atlas_password>
    appname=Cluster0
    cluster=cluster0.ygc2gib.mongodb.net
    JWT_SECRET=<any_long_random_string>
    SERVER_URL=http://localhost:

  Replace the angle-bracket placeholders with real values. The JWT_SECRET can
  be any arbitrary string; it is used to sign and verify authentication tokens.

STEP 3: Configure the frontend environment
-------------------------------------------
  Create the file  part2/frontend/.env  with the following content:

    VITE_API_URL=http://localhost:5000/api

  This points the frontend at the local backend during development.

STEP 4: Install dependencies
------------------------------
  Backend:
    cd part2/backend
    npm install

  Frontend:
    cd part2/frontend
    npm install

STEP 5: Start the development servers
---------------------------------------
  Both servers must run concurrently (use two terminal windows or tabs).

  Backend (port 5000):
    cd part2/backend
    npm run dev

  Frontend (port 5173):
    cd part2/frontend
    npm run dev

  Open http://localhost:5173 in a browser.

STEP 6: Build the frontend for production
-------------------------------------------
    cd part2/frontend
    npm run build

  Output is placed in  part2/frontend/dist/  and can be served statically
  (e.g., via Vercel, Nginx, or  npm run preview  for a local preview).

  Backend production start:
    cd part2/backend
    npm start


### 4. MICROSERVICE API ENDPOINTS


Base URL (local):   http://localhost:5000/api
Base URL (remote):  https://webdev-backend-latest.onrender.com/api

All endpoints except /auth/login and /auth/register require an
Authorization: Bearer <JWT_TOKEN> header.
Admin-only endpoints additionally require the authenticated user to have
role = "admin".

────────────────────────────────────────────────────────────────────────────────
AUTHENTICATION  (/api/auth)
────────────────────────────────────────────────────────────────────────────────

  POST   /api/auth/login
    Body:    { username, password }
    Returns: { success, token, username, role, name, phone, email }
    Notes:   Authenticates an existing user. Returns a JWT valid for 8 hours.

  POST   /api/auth/register
    Body:    { username, password, name, phone, email }
    Returns: { success, token, username, role, name, phone, email }
    Notes:   Registers a new account with role "testuser". Phone must be
             10–12 digits; email must be a valid format.

  PUT    /api/auth/profile          [auth required]
    Body:    { name, phone, email }
    Returns: { success, name, phone, email }
    Notes:   Updates the display name, phone, and email of the logged-in user.

────────────────────────────────────────────────────────────────────────────────
BOOKINGS  (/api/bookings)
────────────────────────────────────────────────────────────────────────────────

  POST   /api/bookings              [auth required]
    Body:    { cname, phone, pickup_address, pickup_lat, pickup_lng,
               dest_address, dest_lat, dest_lng, pickup_date, pickup_time }
    Returns: { success, message, data: <booking object> }
    Notes:   Creates a new booking. Auto-generates a booking_ref (BRNxxxxx).
             Status defaults to "unassigned".

  GET    /api/bookings              [auth required, admin only]
    Query:   ?ref=<string>          Search bookings by reference
               Exact match:   ref=BRN00003
               Partial match: ref=BRN00 (prefix, length < 8)
               Range match:   ref=BRN00001-BRN00010
             ?scope=history         Return all past bookings
             ?scope=future          Return bookings more than 2 hours ahead
             (no scope/ref)         Return bookings in the next 2 hours only
    Returns: { success, data: [<booking>] }

  GET    /api/bookings/my           [auth required]
    Returns: { success, data: [<booking>] }
    Notes:   Returns all bookings belonging to the authenticated user,
             sorted by pickup date descending.

  GET    /api/bookings/driver       [auth required]
    Returns: { success, data: [<booking>] }
    Notes:   Returns all bookings assigned to the authenticated driver user.

  PATCH  /api/bookings/:id/assign   [auth required, admin only]
    Params:  id = MongoDB ObjectId of the booking
    Body:    { driverId }           MongoDB ObjectId of the driver user
    Returns: { success, message }
    Notes:   Assigns a driver to an unassigned, future booking. Updates
             status to "assigned" and stores driver name, phone, username,
             and GPS location on the booking document.

  PATCH  /api/bookings/:id          [auth required, owner only]
    Params:  id = MongoDB ObjectId of the booking
    Body:    Any subset of booking fields (cname, phone, addresses, etc.)
    Returns: { success, message, data: <updated booking> }
    Notes:   Edits an existing booking. Only the booking's owner may edit it,
             and only while it remains "unassigned".

  DELETE /api/bookings/:id          [auth required, owner only]
    Params:  id = MongoDB ObjectId of the booking
    Returns: { success, message }
    Notes:   Cancels (permanently deletes) a booking. Only the owner may
             cancel, and only while it remains "unassigned".

────────────────────────────────────────────────────────────────────────────────
DRIVERS  (/api/drivers)
────────────────────────────────────────────────────────────────────────────────

  GET    /api/drivers               [auth required, admin only]
    Returns: { success, data: [<driver user objects>] }
    Notes:   Returns all registered users with role = "driver".
             Password field is excluded from all responses.

────────────────────────────────────────────────────────────────────────────────
USERS  (/api/users)
────────────────────────────────────────────────────────────────────────────────

  GET    /api/users                 [auth required, admin only]
    Query:   ?role=<role>           Optional filter (testuser, driver, admin)
    Returns: { success, data: [<user objects>] }
    Notes:   Returns all users, sorted by creation date descending.
             Password fields are excluded.


### 5. FEATURE DESCRIPTIONS


5.1  AUTHENTICATION SYSTEM
--------------------------
Users must be logged in to access any part of the application. The login and
registration pages are shown before the main application. On successful
authentication, a JWT is stored in localStorage and automatically attached to
all subsequent API requests via an Authorization Bearer header. Sessions
persist across page refreshes until the user signs out or the 8-hour token
expires.

Three roles control access:
  • testuser  — Standard customer; can book, view, edit, and cancel their
                own bookings.
  • driver    — Can view their assigned bookings and see pickup/destination
                locations on a map.
  • admin     — Full access: can view all bookings, assign drivers, and
                manage users.

5.2  BOOKING CREATION (BookingPage)
-------------------------------------
Customers fill out a form with:
  - Customer name and phone number (10–12 digits, validated client-side)
  - Pickup address (text entry with auto geocoding via Nominatim)
  - Destination address (text entry OR click-to-select on the Leaflet map)
  - Pickup date and time (must be in the future)

On submission, the form data is sent to POST /api/bookings. The backend
generates a unique sequential reference number (BRN00001, BRN00002, …) using
an atomic counter stored in MongoDB's "counters" collection. The created
booking reference is displayed on a confirmation screen. From there the user
can edit the booking, make another booking, or navigate to My Bookings.

5.3  MAP INTEGRATION
---------------------
An interactive Leaflet map is embedded in the booking form. It is centred on
Auckland, New Zealand. Users can click anywhere on the map
to set the destination; Nominatim reverse geocoding converts the clicked
coordinates into a human-readable address that populates the destination field.

Colour-coded pins distinguish pickup (green), destination (red), and driver
(blue) locations. When both pickup and destination are set, a dashed polyline
is drawn between them to indicate the route. The map auto-fits its viewport to
show all placed markers when viewing an existing booking.

5.4  MY BOOKINGS (MyBookingsPage)
-----------------------------------
Authenticated customers can view all their past and current bookings in a
list. Each entry shows the booking reference, status badge (Unassigned /
Assigned), pickup details, and, if assigned, the driver's name and phone.
Unassigned bookings can be edited (pre-populates the booking form) or
cancelled from this view.

5.5  ADMIN DASHBOARD (AdminPage)
----------------------------------
The admin dashboard is split into three tabs:

  Current Bookings:
    Displays two sections: "Next 2 Hours" (bookings whose pickup time falls
    within the next two hours) and "Further Ahead" (all future bookings beyond
    the 2-hour window). Unassigned future bookings show an "Assign" button.
    Clicking it opens a driver picker modal listing all registered drivers with
    their names, phone numbers, and current GPS locations. Selecting a driver
    sets the booking to "assigned" and stores driver details on the booking.

  History:
    Shows all bookings whose pickup time has already passed, sorted by most
    recent first. Provides an administrative audit trail.

  Users:
    Displays all registered accounts with their username, role, name, phone,
    and email. Useful for checking driver and customer registrations.

5.6  DRIVER ASSIGNMENTS (DriverBookingsPage)
---------------------------------------------
Users with the "driver" role see a dedicated "My Assignments" page listing all
bookings assigned to them. Each card shows pickup and destination addresses,
the time, and a map view that pins the pickup location, destination, and the
driver's own registered GPS location, with auto-fit bounds.

5.7  PROFILE MANAGEMENT (ProfilePage)
---------------------------------------
All authenticated users can update their display name, phone number, and
email address through the Profile page. Changes are persisted to MongoDB and
the updated values are reflected in localStorage immediately, without requiring
a re-login.

5.8  DARK MODE
---------------
A dark/light theme toggle is available in the navigation bar. The preference
is persisted in localStorage via a custom useDarkMode hook so it survives
page refreshes.

================================================================================
### 6. TESTING INSTRUCTIONS
================================================================================

6.1  ACCESSING THE APPLICATION
--------------------------------
Navigate to the deployed frontend URL (Section 1) or start the local dev
servers (Section 3) and open http://localhost:5173.

6.2  SAMPLE USER ACCOUNTS (pre-seeded in MongoDB Atlas)
---------------------------------------------------------
The following accounts are available for testing. All passwords are given in
plain text for assessment purposes only.

  Customer (testuser role):
    Username: testuser1
    Password: password123

  Admin:
    Username: admin
    Password: admin123

  Driver accounts:
    Username: driver1     Password: password123
    Username: driver2     Password: password123

  Self-registration is also available; click "Register" on the login screen
  and complete the form. All self-registered accounts receive the "testuser"
  role.

6.3  EXAMPLE BOOKING REFERENCES
---------------------------------
The booking reference counter starts from BRN00001 and increments
sequentially. Depending on how many test bookings exist in the database when
you test, you may encounter references such as:

    BRN00001
    BRN00002
    BRN00003
    BRN00010
    BRN00015

Useful search patterns in the Admin Dashboard:
  Exact match:   Enter  BRN00003  in the search box
  Partial match: Enter  BRN000    to list references starting with that prefix
  Range match:   Enter  BRN00001-BRN00010  to list the first ten bookings

6.4  SAMPLE DRIVER IDs
-----------------------
Driver IDs are MongoDB ObjectIds assigned when driver accounts are created.
To find a valid driver ID for testing the PATCH /api/bookings/:id/assign
endpoint directly (e.g., via Postman):

  1. Log in as admin and call GET /api/drivers to obtain the list of drivers.
  2. Copy the _id value of any returned driver object.
  3. Use that value as driverId in the PATCH request body.

Example (values will differ in your database):
    Driver _id:  683a4f2c1b9e4d0012abc001
    Driver _id:  683a4f2c1b9e4d0012abc002

6.5  TESTING GOLDEN PATH
--------------------------
  1. Register a new account (or log in as testuser1 / password123).
  2. On the Home page, fill in the booking form:
       - Enter a name and a 10-digit phone number (e.g. 0211234567).
       - Type a pickup address (e.g. "Auckland City") and tab out —
         the map will geocode and show a green pin.
       - Click anywhere on the map to set a destination (red pin).
       - Choose a pickup date in the future and a time.
       - Click "Book Taxi".
  3. Confirm the booking reference is displayed (e.g. BRN00005).
  4. Navigate to "My Bookings" — the new booking appears as "Unassigned".
  5. Log out and log back in as admin / admin123.
  6. Open "Admin Dashboard" → "Current Bookings".
  7. If your booking is within 2 hours, it appears under "Next 2 Hours".
     Otherwise it appears under "Further Ahead".
  8. Click "Assign" on the booking, select Sarah Mitchell (driver1) from the modal.
  9. Confirm the booking status changes to "Assigned".
  10. Log out and log in as driver1 / password123.
  11. The assigned booking appears under "My Assignments".
  12. Log out and in again as the created user.
  13. Check my bookings, the status should now say confirmed.

6.6  EDGE CASES TO TEST
------------------------
  - Attempting to submit the booking form with a past date/time → validation
    error "Pickup time cannot be in the past".
  - Entering a phone number with fewer than 10 digits → "Phone must be 10–12
    digits".
  - Attempting to cancel a booking that has already been assigned → error
    "Cannot cancel an assigned booking".
  - Attempting to assign a driver to a booking whose pickup time has already
    passed → error "Cannot assign a driver to a past booking".

================================================================================
### 7. LIMITATIONS AND KNOWN ISSUES
================================================================================

  8. No real-time updates
     The admin dashboard and My Bookings page do not poll for changes
     automatically. If a booking is assigned in one browser session, other
     open sessions will not reflect the change until they manually refresh or
     navigate away and back.

  9. Geocoding reliability
     Forward geocoding (address text to coordinates) is handled by the free
     Nominatim service operated by OpenStreetMap. Nominatim's results are
     NZ-biased (countrycodes=nz), but uncommon or ambiguous addresses may fail
     to resolve. If geocoding returns no result, pickup or destination
     coordinates are stored as undefined, which means the map will not display
     pins for that address on subsequent views.

  10. Nominatim rate limiting
     Nominatim imposes a usage policy of no more than one request per second.
     Rapid sequential geocode requests (e.g., automated testing scripts) may
     be throttled or blocked temporarily.

  11. Backend cold-start on Render free tier
     The backend is hosted on Render's free tier, which spins down idle
     instances after 15 minutes of inactivity. The first API call after a
     period of inactivity can take up to 30 seconds as the service restarts.
     This is a hosting constraint, not an application bug.

  12. No booking time-window enforcement at creation
     The application enforces that a pickup time must be in the future but
     does not enforce a minimum advance notice period (e.g., at least 30
     minutes from now). A booking could theoretically be placed 1 minute
     before the requested pickup time.

  13. Admin-only driver creation
     New driver accounts cannot self-register; they must be inserted into the
     database manually (e.g., via MongoDB Atlas or a seed script). Only the
     "testuser" role is granted on self-registration.

  14. Sequential booking reference counter
     The counter document must be pre-initialised in the MongoDB "counters"
     collection (with _id: "booking_ref" and seq: 0). If this document is
     missing, booking creation will throw a "Counter not initialized properly"
     error.

  15. No pagination
     The admin All Bookings endpoints return every matching document in a
     single response. For large datasets, this could become slow or exceed
     memory limits. Pagination has not been implemented.

================================================================================
### 8. REFLECTION ON AI-SUPPORTED DEVELOPMENT PROCESS
================================================================================

This project was developed with the assistance of Claude Code (Anthropic's AI
coding assistant), used throughout the second half of the development lifecycle. The initial
refactor to Vite + React was done using codex in vscode, although this ran into many issues,

8.1  CONTRIBUTION TO THE PROCESS
----------------------------------
AI assistance was most valuable in three areas:

  Scaffolding and boilerplate elimination
    Setting up a React 19 + TypeScript + Vite project with Tailwind CSS,
    configuring ESLint, and wiring together an Express 5 backend with JWT
    authentication would have consumed significant time with minimal learning
    value. The AI generated correct, idiomatic boilerplate quickly, freeing
    time to focus on application-specific logic.

  API design iteration
    Early API designs were discussed conversationally with the AI before any
    code was written. It helped identify edge cases — for example, that the
    booking assignment endpoint needed to validate whether the booking was in
    the future before allowing assignment, and that cancellation should be
    blocked on already-assigned bookings. These invariants were then encoded
    in the backend before they could become bugs.

  Debugging and targeted fixes
    When the booking reference counter produced incorrect values due to a
    returnDocument option mismatch in MongoDB's findOneAndUpdate call, the AI
    diagnosed the issue from the error output and proposed a targeted fix
    without requiring a complete rewrite of the service layer. This kind of
    rapid diagnosis was consistently faster than manual documentation searches.

8.2  LIMITATIONS OBSERVED
---------------------------
  Hallucinated API surface
    On several occasions the AI suggested MongoDB driver methods or Express 5
    API options that did not exist in the installed versions, or that had
    changed between library versions. Every suggestion required verification
    against the official documentation before being accepted.

  Over-engineering tendency
    Left unchecked, AI suggestions sometimes introduced unnecessary
    abstractions — generic service layers, repository patterns — for a project
    of this scope. Active pushback was required to keep the codebase simple and
    proportionate to the requirements.

  Context limits in long sessions
    In extended coding sessions, the AI would occasionally contradict earlier
    decisions or re-introduce patterns that had been explicitly removed. This
    required maintaining a clear mental model of the intended architecture
    independently, rather than deferring entirely to the AI's memory.

8.3  OVERALL ASSESSMENT
------------------------
AI-assisted development is most effective as a force multiplier for a
developer who already understands the problem domain and can critically
evaluate suggestions. It accelerates the production of correct, readable code
and helps surface edge cases early, but it does not replace the need for
understanding. Code generated or suggested by AI must be read, understood, and
tested before being trusted, especially at integration points (authentication,
database access, external APIs).

In this project, the AI acted as an always-available pair programmer: useful
for talking through design decisions, generating initial implementations, and
diagnosing specific errors, but requiring ongoing judgement and direction from
the developer. The end result is code I understand and can maintain, not code
I accepted blindly.

