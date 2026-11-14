# Roomify — Backend Documentation & Engineering Guide

## 1. System Overview

**Roomify** is a room discovery and roommate-matching platform engineered exclusively for students of **Graphic Era University (GEU Main Campus)** and **Graphic Era Hill University (GEHU Bell Road)** in **Dehradun, Uttarakhand**.

The backend is built as a high-performance **Modular Monolith** integrated with the Next.js App Router, backed by **PostgreSQL 16**, **Prisma ORM**, and a standalone **Node.js WebSocket Daemon** (`server/ws.ts`) providing duplex real-time messaging, typing indicators, and delivery/read receipts.

---

## 2. Directory & Architectural Layout

```
roomigo/
├── app/
│   ├── api/                             # REST API route handlers
│   │   ├── auth/
│   │   │   ├── register/route.ts        # POST: Student registration
│   │   │   ├── login/route.ts           # POST: Student authentication
│   │   │   ├── logout/route.ts          # POST: Session revocation
│   │   │   └── session/route.ts         # GET: Active session validation & badge counts
│   │   ├── students/
│   │   │   ├── me/route.ts              # GET, PATCH: Student profile
│   │   │   └── [id]/public/route.ts     # GET: Sanitized public student profile
│   │   ├── preferences/
│   │   │   └── me/route.ts              # GET, PUT: Living preferences & discovery toggle
│   │   ├── roommate-finder/
│   │   │   ├── matches/route.ts         # POST: Deterministic matching algorithm
│   │   │   └── history/route.ts         # GET: Retrieve latest scan history
│   │   ├── requests/
│   │   │   ├── route.ts                 # GET: Incoming/outgoing invites; POST: Send invite
│   │   │   └── [id]/route.ts            # PATCH: Accept/Decline; DELETE: Cancel
│   │   ├── conversations/
│   │   │   ├── route.ts                 # GET: User conversations with last message preview
│   │   │   └── [id]/
│   │   │       ├── messages/route.ts    # GET: Paginated messages; POST: HTTP fallback
│   │   │       └── actions/route.ts     # POST: Unmatch & Clear chat
│   │   ├── moderation/
│   │   │   └── report-block/route.ts    # POST: Report user with frozen chat snapshot
│   │   ├── listings/
│   │   │   ├── route.ts                 # GET: Paginated accommodation catalog
│   │   │   └── [id]/
│   │   │       ├── route.ts             # GET: Single listing detail
│   │   │       └── save/route.ts        # POST, DELETE: Bookmarks / saved listings
│   │   └── uploads/
│   │       └── presigned-url/route.ts   # POST: Direct media upload presigning
├── lib/                                 # Core Backend Logic & Utilities
│   ├── db/
│   │   └── prisma.ts                    # Global singleton PrismaClient instance
│   ├── auth/
│   │   ├── password.ts                  # bcrypt password hashing (work factor 10)
│   │   └── session.ts                   # Stateful 32-byte SHA-256 session management
│   ├── matching/
│   │   └── engine.ts                    # Deterministic roommate compatibility algorithm
│   └── schemas/                         # Zod request validation schemas
│       ├── auth.schema.ts
│       └── profile.schema.ts
├── prisma/
│   ├── schema.prisma                    # Complete PostgreSQL schema (17 models)
│   └── seed.ts                          # Comprehensive seed script (students & listings)
├── server/
│   ├── ws.ts                            # Standalone WebSocket server (port 3001)
│   └── README.md                        # This backend guide
├── scripts/
│   └── verify-e2e.ts                    # Automated 4-step vertical slice integration test
└── docker-compose.yml                   # PostgreSQL 16 container definition
```

---

## 3. Database Schema (PostgreSQL + Prisma)

The database schema is fully normalized and versioned in [`prisma/schema.prisma`](../prisma/schema.prisma).

### Core Entities & Relationships

| Model | Purpose | Key Constraints & Relations |
| :--- | :--- | :--- |
| **`User`** | Credentials and authentication account | `email` unique, `sessions[]`, `studentProfile`, `role` (`STUDENT`, `ADMIN`) |
| **`Session`** | Stateful session tracking for instant revocation | `tokenHash` unique index, references `User` cascade |
| **`StudentProfile`** | Academic identity & public persona | 1:1 with `User`, stores `campus` (`GEHU`, `GEU_MAIN`), course, term, gender |
| **`RoommatePreference`**| Living lifestyle, budget, and search settings | 1:1 with `StudentProfile`, stores `sleepCycle`, `diet`, `cleanliness`, `isLive` |
| **`RoommateRequest`** | Connection invites between students | `@@unique([senderId, receiverId])`, `status` (`PENDING`, `ACCEPTED`, `DECLINED`) |
| **`Conversation`** | Chat thread between connected users | `participants[]`, `messages[]`, `lastMessageAt` index |
| **`ConversationParticipant`** | User membership in conversation | `@@unique([conversationId, userId])` enforces membership authorization |
| **`Message`** | Individual chat messages | References `Conversation` and `User` (sender), `isDelivered`, `isRead` |
| **`BlockReport`** | Moderation and harassment prevention | References reporter and reported user, stores frozen JSON chat evidence snapshot |
| **`Listing`** | Student PG / hostel accommodation | Slug unique, `totalBedsLeft`, `minPrice`, `maxPrice`, `ownerWhatsappNumber` |
| **`BedConfiguration`** | Room options (Single, Twin, Triple) | References `Listing`, `availableBeds`, `isAvailable` |
| **`ListingImage`** | Multi-photo property carousel | References `Listing`, `orderIndex` |
| **`ListingProximity`** | Walking & scooty distances to Graphic Era | References `Listing`, `landmark` (`GEHU_CAMPUS`, `GEU_MAIN_CAMPUS`) |
| **`ListingAmenity`** | Features (Wi-Fi, Meals, Geyser, Power Backup) | References `Listing`, `icon` enum |
| **`SavedListing`** | Student bookmarks | `@@unique([userId, listingId])` |
| **`MatchScanRecord`** | Roommate finder scan audit trail | Stores criteria JSON, count, and top score |

---

## 4. Authentication & Stateful Sessions

### Cookie-Backed Session Architecture
Rather than using stateless JWTs (which cannot be revoked immediately upon user block or logout without a distributed blacklist), Roomify implements **stateful database sessions**:
1. Upon `POST /api/auth/login` or `register`, a high-entropy 32-byte cryptographic token is generated.
2. The SHA-256 hash of this token is stored in the PostgreSQL `Session` table with an expiration of 30 days.
3. The raw token is sent to the client as an `HttpOnly`, `SameSite=lax`, `Path=/`, `Secure` (production) cookie named `roomify_session`.
4. The WebSocket server and all protected API endpoints validate this session token against PostgreSQL on every handshake and request.
5. Logout instantly updates `revokedAt = now()`, invalidating all active sessions.

### Default Test Accounts (Pre-Seeded)
All seeded test accounts share the default password: **`Password@123`**
* **Student A:** `kartikey@gehu.ac.in` (Male, GEHU B.Tech CSE, 2nd Year, Early Bird, Pure Veg, Daily High)
* **Student B:** `aarav@gehu.ac.in` (Male, GEHU B.Tech CSE, 2nd Year, Early Bird, Pure Veg, Daily High)
* **Student C:** `rohan@geu.ac.in` (Male, GEU Main BCA, 1st Year, Night Owl, Non-Veg, Gamer)
* **Student D:** `priya@gehu.ac.in` (Female, GEHU B.Tech ECE, 3rd Year, Flexible, Vegetarian)
* **Admin:** `admin@roomify.in` (password: `Admin@123`)

---

## 5. Deterministic Roommate Matching Engine

The algorithm ([`lib/matching/engine.ts`](../lib/matching/engine.ts)) computes mathematical compatibility between students without opaque AI or random scores.

### Two-Tier Scoring Model

#### Tier 1: Hard Binary Constraints (Pass or Exclude)
A candidate is assigned **0%** and excluded if any of the following fail:
1. `isLive === false`: Either student has paused public discovery.
2. **Mutual Gender Rule:**
   - If Student A chooses `"Same gender as you"`, Candidate B must match A's gender.
   - If Candidate B chooses `"Same gender as you"`, Student A must match B's gender.
3. **Blocklist Filter:** Neither user has reported or blocked the other.

#### Tier 2: Weighted Multi-Attribute Compatibility (100 Points Total)
Candidates passing Tier 1 are scored according to lifestyle overlap:

$$\text{Total Score} = W_{\text{sleep}} (25) + W_{\text{diet}} (20) + W_{\text{clean}} (20) + W_{\text{campus}} (15) + W_{\text{budget}} (10) + W_{\text{location}} (10)$$

* **Sleep Schedule (25 pts):** Exact match = 25 pts; Either Flexible = 18 pts; Early Bird vs Night Owl conflict = 0 pts.
* **Dietary Habit (20 pts):** Exact match = 20 pts; Eggetarian + Pure Veg/Non-Veg = 14 pts; Pure Veg vs Non-Veg conflict = 5 pts.
* **Cleanliness (20 pts):** Daily High match = 20 pts; Moderate match = 18 pts; Difference = 10 pts.
* **Campus & Department (15 pts):** Same Campus (GEHU/GEU) = 10 pts; Same Course (CSE/IT) = +5 bonus pts.
* **Budget Compatibility (10 pts):** Overlapping range $[A_{\min}, A_{\max}] \cap [B_{\min}, B_{\max}] \neq \emptyset$ = 10 pts; Gap $\le ₹1,500$ = 6 pts; Otherwise = 0 pts.
* **Target Locations (10 pts):** Any shared preferred locality (Bell Road, Subhash Nagar, Clement Town) = 10 pts.

Scores $\ge 90\%$ generate the `zap` highlight badge (*"98% Match • Early Bird & Pure Veg"*).

---

## 6. Real-Time WebSocket Protocol

The standalone WebSocket server listens on port `3001` (`ws://localhost:3001`):

### Handshake & Authentication
```
Client -> WS: ws://localhost:3001?token=<session_token> (or cookie roomify_session)
WS Server: Validates token against PostgreSQL Session table -> Binds socket to userId
```

### Supported Client-to-Server Events

| Type | Payload | Action |
| :--- | :--- | :--- |
| `JOIN_ROOM` | `{ conversationId: string }` | Verifies `ConversationParticipant` membership, subscribes socket to `room:${conversationId}` |
| `SEND_MESSAGE` | `{ conversationId, text, tempId }` | Persists `Message` in PostgreSQL, updates `lastMessageAt`, sends `MESSAGE_ACK` to sender, broadcasts `NEW_MESSAGE` to room |
| `MARK_READ` | `{ conversationId }` | Updates `isRead = true`, `readAt = now()` in database, broadcasts `MESSAGES_READ` to room |
| `TYPING` | `{ conversationId, isTyping: boolean }` | Broadcasts `USER_TYPING` to other participants in the room |

### Supported Server-to-Client Events

| Type | Payload | Description |
| :--- | :--- | :--- |
| `NEW_MESSAGE` | `{ message: { id, conversationId, senderId, text, time, isDelivered, isRead } }` | Delivered live to recipient's socket |
| `MESSAGE_ACK` | `{ tempId, messageId, time }` | Confirms database persistence to sender |
| `MESSAGES_READ` | `{ conversationId, readByUserId }` | Real-time read receipt update |
| `USER_TYPING` | `{ conversationId, userId, isTyping }` | Real-time typing status |

---

## 7. REST API Reference

### Authentication & Profiles
* `POST /api/auth/register` — Create student account & initial lifestyle preferences.
* `POST /api/auth/login` — Authenticate credentials, set HttpOnly session cookie.
* `POST /api/auth/logout` — Revoke active session and clear cookie.
* `GET /api/auth/session` — Get authenticated student identity and unread counts.
* `GET /api/students/me` — Get student profile and living preferences.
* `PATCH /api/students/me` — Update name, gender, program, term, affiliation, bio.
* `GET /api/students/[id]/public` — Sanitized public profile preview (no email/phone).
* `GET /api/preferences/me` — Get lifestyle preferences and discovery toggle.
* `PUT /api/preferences/me` — Update lifestyle preferences, budget, preferred gender rule.

### Roommate Discovery & Requests
* `POST /api/roommate-finder/matches` — Run compatibility scan with optional overrides.
* `GET /api/roommate-finder/history` — Get previous scan results.
* `GET /api/requests` — Fetch pending received invites and sent invites.
* `POST /api/requests` — Send connection request to a candidate (idempotent).
* `PATCH /api/requests/[id]` — Accept or decline invite. Accepting automatically creates a `Conversation` in an atomic transaction.
* `DELETE /api/requests/[id]` — Cancel an outgoing pending request.

### Conversations & Moderation
* `GET /api/conversations` — List active conversations with last message preview.
* `GET /api/conversations/[id]/messages` — Fetch message history (enforces participant check).
* `POST /api/conversations/[id]/messages` — HTTP fallback to send message if WS reconnecting.
* `POST /api/conversations/[id]/actions` — Body `{ action: "UNMATCH" | "CLEAR_CHAT" }`.
* `POST /api/moderation/report-block` — Files `BlockReport`, archives last 50 messages as evidence, and severs conversation.

### Accommodation Listings
* `GET /api/listings` — Query parameters: `page`, `limit`, `filter` (`all`, `available`, `soldout`), `q`, `campus`, `maxPrice`. Returns paginated data and counts.
* `GET /api/listings/[id]` — Single listing metadata, room configurations, and owner contact.
* `POST /api/listings/[id]/save` — Bookmark listing to saved items.
* `DELETE /api/listings/[id]/save` — Remove bookmark.

---

## 8. How to Run & Test Locally

### 1. Start PostgreSQL Database
```bash
docker start pg-dev
# Or run a fresh instance:
docker run -d --name roomify-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=roomify_db -p 5432:5432 postgres:16-alpine
```

### 2. Push Schema & Seed Data
```bash
npx prisma db push
npx prisma db seed
```

### 3. Run Automated 2-Account End-to-End Test
```bash
npx tsx scripts/verify-e2e.ts
```
*Executes all 4 test stages: High Compatibility (98%) $\rightarrow$ Lifestyle Incompatibility drop (58%) $\rightarrow$ Hard Gender Rule Exclusion (`null`) $\rightarrow$ Request Creation, Acceptance, and Atomic Conversation Generation.*

### 4. Start Development Servers
In Terminal 1 (WebSocket Server on port 3001):
```bash
npm run dev:ws
```

In Terminal 2 (Next.js Application on port 3000):
```bash
npm run dev
```

Open `http://localhost:3000` in your browser. Use the **Switch** button in the top header to log in as **Student A (Kartikey)** in Tab 1 and **Student B (Aarav)** in Tab 2 (or an incognito window) to test live matching and real-time messaging!
