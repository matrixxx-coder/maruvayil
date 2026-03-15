# Maruvayil Sree ShivaParvathy Temple

A full-featured, bilingual (English/Malayalam) web application for **Maruvayil Sree ShivaParvathy Kudumba Kshetra Charitable Trust** — a 300+ year-old temple in Calicut District, Kerala.

Live features: member portal, family management for monthly poojas, bilingual UI, photo gallery, content admin panel, and Google Forms integration.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start — Docker (Recommended)](#quick-start--docker-recommended)
- [Local Development (Without Docker)](#local-development-without-docker)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Admin Panel](#admin-panel)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Free Hosting Guide](#free-hosting-guide)

---

## Prerequisites

### For Docker setup (recommended)

| Tool | Version | Install |
|------|---------|---------|
| Docker Desktop | 4.x+ | [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/) |
| Docker Compose | v2+ | Included with Docker Desktop |

That's it — no Node.js required.

### For local development (without Docker)

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20.x+ | [nodejs.org](https://nodejs.org) or via `nvm` |
| npm | 9.x+ | Included with Node.js |
| PostgreSQL | 14+ | [postgresql.org](https://www.postgresql.org/download/) or via `brew install postgresql` |

**Verify your versions:**
```bash
node --version    # v20.x.x
npm --version     # 9.x.x or 10.x.x
psql --version    # psql (PostgreSQL) 14.x or higher
docker --version  # Docker version 24.x.x
```

---

## Quick Start — Docker (Recommended)

This spins up all three services (frontend, backend, database) with a single command.

### 1. Clone the repository

```bash
git clone https://github.com/matrixxx-coder/maruvayil.git
cd maruvayil
```

### 2. Create your environment file

```bash
cp .env.example .env
```

The defaults in `.env.example` work out of the box for local development. You only need to change `JWT_SECRET` for production:

```env
DB_PASSWORD=temple2024
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### 3. Build and start all containers

```bash
docker compose up --build
```

This will:
1. Pull `postgres:16-alpine` and `nginx:alpine` images
2. Build the backend (Node.js/Express) image
3. Build the frontend (React/Vite → nginx) image
4. Start the database, wait for it to be healthy
5. Start the backend, wait for it to be healthy
6. Start the frontend

**First run takes 2–4 minutes** (downloading images, installing dependencies, compiling TypeScript).

### 4. Open the app

| Service | URL |
|---------|-----|
| App (frontend) | http://localhost:3000 |
| API (backend) | http://localhost:4000 |
| Database | localhost:5432 |

### Useful Docker commands

```bash
# Run in background (detached)
docker compose up --build -d

# View logs
docker compose logs -f

# View logs for a specific service
docker compose logs -f backend

# Stop all containers (data is preserved)
docker compose down

# Stop and delete all data (fresh start)
docker compose down -v

# Rebuild a single service after code changes
docker compose up --build -d frontend
docker compose up --build -d backend
```

---

## Local Development (Without Docker)

Use this if you want hot-reload during development.

### 1. Clone the repository

```bash
git clone https://github.com/matrixxx-coder/maruvayil.git
cd maruvayil
```

### 2. Set up PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Create the database:**
```bash
psql postgres -c "CREATE DATABASE maruvayil;"
psql postgres -c "CREATE USER postgres WITH PASSWORD 'temple2024';"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE maruvayil TO postgres;"
```

**Run the schema:**
```bash
psql -U postgres -d maruvayil -f database/init.sql
```

### 3. Configure environment variables

**Backend** — create `backend/.env`:
```bash
cp .env.example backend/.env
```

Edit `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=maruvayil
DB_USER=postgres
DB_PASSWORD=temple2024
JWT_SECRET=your-local-dev-secret
PORT=4000
```

**Frontend** — create `.env.local` in the project root:
```bash
echo "VITE_API_URL=http://localhost:4000" > .env.local
```

### 4. Install dependencies

```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend && npm install && cd ..
```

### 5. Start the backend

```bash
cd backend
npm run dev
```

The API will start at `http://localhost:4000`. You should see:
```
Server running on port 4000
```

### 6. Start the frontend (in a new terminal)

```bash
# From the project root
npm run dev
```

The app will start at `http://localhost:5173` with hot module replacement.

> **Note:** When running locally without Docker, the frontend uses `VITE_API_URL` to call the backend directly. When running with Docker, nginx proxies `/api/*` to the backend automatically.

---

## Project Structure

```
maruvayil/
├── Dockerfile                  # Frontend Docker build (nginx)
├── docker-compose.yml          # Orchestrates all 3 services
├── nginx.conf                  # nginx config — serves SPA, proxies /api to backend
├── .env.example                # Environment variable template
├── database/
│   └── init.sql                # Full PostgreSQL schema + seed data
├── backend/                    # Node.js/Express API
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.ts            # Express app entry point
│       ├── db.ts               # PostgreSQL connection pool
│       ├── middleware/
│       │   ├── auth.ts         # JWT verification middleware
│       │   └── admin.ts        # Admin role check middleware
│       └── routes/
│           ├── auth.ts         # POST /auth/register, /auth/login, GET /auth/me
│           ├── profile.ts      # GET/PUT /profile
│           ├── family.ts       # CRUD /family-members
│           ├── admin.ts        # Admin-only routes (content, announcements, committee, members)
│           └── content.ts      # Public content routes (blocks, announcements, committee)
└── src/                        # React frontend
    ├── App.tsx                 # Routes & layout
    ├── index.css               # Tailwind + custom fonts
    ├── lib/
    │   ├── api.ts              # Typed API client (auth, family, content, admin)
    │   └── i18n.ts             # react-i18next configuration
    ├── locales/
    │   ├── en.json             # English translations
    │   └── ml.json             # Malayalam translations
    ├── types/
    │   └── index.ts            # TypeScript types, 27 nakshatras, 12 rashis
    ├── contexts/
    │   └── AuthContext.tsx     # Auth state, JWT management
    ├── components/
    │   ├── Layout/
    │   │   ├── Navbar.tsx      # Sticky nav, language toggle, user menu
    │   │   └── Footer.tsx
    │   └── ProtectedRoute.tsx  # Redirects unauthenticated users
    └── pages/
        ├── Home.tsx            # Hero, announcements, deities, pooja banner
        ├── TempleDetails.tsx   # History, timeline, committee grid
        ├── Pooja.tsx           # Pooja details, Members/Devotees tabbed forms
        ├── Gallery.tsx         # Photo grid with lightbox + YouTube videos
        ├── Contact.tsx         # Contact form + address
        ├── AuthPage.tsx        # Login & Register
        ├── Dashboard.tsx       # Member dashboard
        ├── FamilyMembers.tsx   # Add/edit/delete family members
        └── admin/
            ├── AdminLayout.tsx       # Sidebar layout for admin panel
            ├── ContentEditor.tsx     # Edit page text (EN + ML) per page
            ├── AnnouncementsEditor.tsx
            ├── CommitteeEditor.tsx
            └── MembersManager.tsx    # View members, toggle active status
```

---

## Environment Variables

### Root `.env` (used by Docker Compose)

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_PASSWORD` | `temple2024` | PostgreSQL password |
| `JWT_SECRET` | `change-me-in-production` | Secret for signing JWTs — **change this in production** |

### Backend environment (set in `docker-compose.yml` or `backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `db` | PostgreSQL host (`localhost` for local dev) |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `maruvayil` | Database name |
| `DB_USER` | `postgres` | Database user |
| `DB_PASSWORD` | `temple2024` | Database password |
| `JWT_SECRET` | — | Must be set — used to sign auth tokens |
| `PORT` | `4000` | Express server port |

### Frontend environment

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `/api` | Backend base URL. Leave as `/api` for Docker (nginx proxies). Set to your backend URL for separate deployments. |

---

## Database

The schema lives in `database/init.sql` and is automatically applied when the PostgreSQL container starts fresh.

### Tables

| Table | Description |
|-------|-------------|
| `users` | Auth credentials (email + hashed password) |
| `profiles` | Member profile info, linked to users |
| `family_members` | Family members per user for monthly poojas |
| `content_blocks` | Editable site text blocks (EN + ML) per page |
| `announcements` | Active/inactive notices shown on the home page |
| `committee_members` | Temple committee with bilingual roles |

### Applying schema manually

If the database already exists and you need to apply new migrations:

```bash
# Via Docker
docker compose exec db psql -U postgres -d maruvayil -f /path/to/migration.sql

# Via local psql
psql -U postgres -d maruvayil -f database/init.sql
```

### Granting admin access to a user

After a user registers, run this to make them an admin:

```bash
# Docker
docker compose exec db psql -U postgres -d maruvayil \
  -c "UPDATE profiles SET is_admin = TRUE WHERE id = (SELECT id FROM users WHERE email='admin@example.com');"

# Local psql
psql -U postgres -d maruvayil \
  -c "UPDATE profiles SET is_admin = TRUE WHERE id = (SELECT id FROM users WHERE email='admin@example.com');"
```

---

## Admin Panel

Accessible at `/admin` — only visible to users with `is_admin = true`.

| Section | URL | Description |
|---------|-----|-------------|
| Content Editor | `/admin/content` | Edit all page text in English and Malayalam |
| Announcements | `/admin/announcements` | Create/edit/delete notices shown on the home page |
| Committee | `/admin/committee` | Manage committee members and their bilingual roles |
| Members | `/admin/members` | View registered members, toggle active status |

---

## Features

### Public pages

| Route | Description |
|-------|-------------|
| `/` | Home — hero, live announcements, deities, monthly pooja banner |
| `/temple` | Temple history, reconstruction timeline, committee grid |
| `/pooja` | Monthly pooja details (₹1,000), Members and Other Devotees tabbed registration forms |
| `/gallery` | Photo grid (60+ images) with lightbox, 4 YouTube video embeds |
| `/contact` | Contact form and address |

### Member portal (login required)

| Route | Description |
|-------|-------------|
| `/auth/register` | Create account |
| `/auth/login` | Sign in |
| `/dashboard` | Member home — stats, membership status |
| `/dashboard/family` | Add/edit/delete family members for monthly poojas |

### Family member fields

Each family member stores: name, Malayalam name, relationship (self/spouse/child/parent/sibling/other), birth date, birth star (all 27 nakshatras in EN/ML), rashi (all 12 in EN/ML), notes, and an "include in pooja" toggle.

### Bilingual support

- Language toggle in the navbar (EN ↔ ML)
- Preference saved in `localStorage`
- All UI labels, navigation, and static content translated
- Noto Sans Malayalam font (Google Fonts) for Malayalam text

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS (custom teal/maroon/gold palette) |
| Routing | react-router-dom v6 |
| i18n | react-i18next + i18next-browser-languagedetector |
| Icons | lucide-react |
| Notifications | react-hot-toast |
| Backend | Node.js 20, Express, TypeScript |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Database | PostgreSQL 16 |
| DB client | node-postgres (pg) |
| Container | Docker + Docker Compose |
| Web server | nginx:alpine (serves SPA + proxies API) |

---

## Free Hosting Guide

The app can be deployed for free using:

| Component | Service | Notes |
|-----------|---------|-------|
| Frontend | [Vercel](https://vercel.com) | Always-on, no limits for this use case |
| Backend | [Render](https://render.com) | Free tier sleeps after 15min idle; $7/mo to keep awake |
| Database | [Neon](https://neon.tech) | Free PostgreSQL, 0.5 GB, never expires |

### Steps

1. **Neon** — create a project, run `database/init.sql` in their SQL editor, copy the connection string
2. **Render** — new Web Service, root dir = `backend`, build: `npm ci && npm run build`, start: `node dist/index.js`, add env vars:
   - `DATABASE_URL` = Neon connection string
   - `JWT_SECRET` = your secret
3. **Vercel** — import repo, root dir = `.` (project root), add env var:
   - `VITE_API_URL` = your Render service URL (e.g. `https://maruvayil-api.onrender.com`)

> **Note:** `backend/src/db.ts` currently uses individual `DB_HOST/DB_USER/...` vars. To use Render + Neon, update it to also accept a `DATABASE_URL` connection string.
