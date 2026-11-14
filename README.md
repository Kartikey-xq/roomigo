# Roomify — Graphic Era Student Co-Living & Roommate Finder

> **Target Scope:** Graphic Era Hill University (GEHU Bell Road) & Graphic Era University (GEU Main Campus), Dehradun, Uttarakhand.

Roomify is a minimal, modern responsive full-stack platform designed specifically for Graphic Era students in Dehradun. It features verified PG/hostel discovery with live bed configurations and WhatsApp booking inquiry redirection, plus a deterministic roommate compatibility matching engine with duplex real-time chat.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 20+
- Docker (for PostgreSQL 16)

### 2. Database Setup
```bash
# Start PostgreSQL (or run docker container)
docker start pg-dev

# Push Prisma schema and seed initial data
npx prisma db push
npx prisma db seed
```

### 3. Run Automated E2E Verification
Verify the deterministic roommate matching algorithm, constraint gates, and request-to-conversation flow:
```bash
npx tsx scripts/verify-e2e.ts
```

### 4. Start the Application
Run both the Next.js frontend/API and the companion WebSocket daemon:

```bash
# Terminal 1: Real-Time WebSocket Daemon (Port 3001)
npm run dev:ws

# Terminal 2: Next.js App Router (Port 3000)
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📚 Documentation & Technical Guides

- **[Backend Architecture & Engineering Guide](server/README.md):** Complete documentation on database models, stateful cookie sessions, REST APIs, WebSocket protocol, and matching formulas.
- **[Stage 1 System Design Blueprint](file:///home/kartikey-xq/.gemini/antigravity-cli/brain/443cb59d-4032-4753-820f-0001adbfc0de/roomify_backend_architecture_blueprint.md):** In-depth technical specification, ER diagram, storage analysis, and architectural trade-offs.

---

## 🔑 Pre-Seeded Student Personas (Default Password: `Password@123`)

Use the **Switch** button in the top navigation bar to 1-click test between these accounts:

| Student Name | Email | Campus & Course | Lifestyle Traits |
| :--- | :--- | :--- | :--- |
| **Kartikey Joshi** (Student A) | `kartikey@gehu.ac.in` | GEHU • B.Tech CSE (2nd Yr) | Early Bird • Pure Veg • Daily High • Same Gender Only |
| **Aarav Sharma** (Student B) | `aarav@gehu.ac.in` | GEHU • B.Tech CSE (2nd Yr) | Early Bird • Pure Veg • Daily High • Same Gender Only (**98% Match with A**) |
| **Rohan Verma** (Student C) | `rohan@geu.ac.in` | GEU Main • BCA (1st Yr) | Night Owl • Non-Veg • Gamer |
| **Priya Nautiyal** (Student D) | `priya@gehu.ac.in` | GEHU • B.Tech ECE (3rd Yr) | Flexible • Vegetarian • Turner Road |
| **Admin** | `admin@roomify.in` | Directorate Staff | Admin Role (Password: `Admin@123`) |

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 16.4.6 (App Router, Turbopack, React 19), Tailwind CSS 4, Lucide React, GSAP animations.
- **Backend:** Node.js, Next.js Route Handlers, PostgreSQL 16, Prisma ORM 6.19.
- **Real-Time:** Standalone Node.js `ws` WebSocket server (port 3001) sharing Prisma client.
- **Authentication:** Cookie-backed stateful sessions (SHA-256 tokens in DB, `HttpOnly`, `SameSite=lax`), `bcryptjs`.
- **Validation:** Zod schemas on all API boundaries.
