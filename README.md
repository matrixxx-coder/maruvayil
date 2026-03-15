# Maruvayil Sree ShivaParvathy Temple

A full-featured, bilingual (English/Malayalam) React web application for **Maruvayil Sree ShivaParvathy Kudumba Kshetra Charitable Trust** — a 300+ year-old temple in Calicut District, Kerala.

---

## Tech Stack

- **Vite** + **React 18** + **TypeScript**
- **Tailwind CSS** — custom teal/maroon/gold temple color scheme
- **Supabase** — authentication (email/password) + PostgreSQL database
- **react-i18next** — English/Malayalam bilingual support
- **react-router-dom v6** — client-side routing
- **lucide-react** — icons
- **react-hot-toast** — notifications
- **Noto Sans Malayalam** — Google Font for Malayalam text

---

## Project Structure

```
src/
├── main.tsx             # App entry point
├── App.tsx              # Routes & layout wrappers
├── index.css            # Tailwind + global styles
├── lib/
│   ├── supabase.ts      # Supabase client
│   └── i18n.ts          # i18next configuration
├── locales/
│   ├── en.json          # English translations
│   └── ml.json          # Malayalam translations
├── types/
│   └── index.ts         # TypeScript types, nakshatras, rashis, relationships
├── contexts/
│   └── AuthContext.tsx  # Auth state management
├── components/
│   ├── Layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   └── ProtectedRoute.tsx
└── pages/
    ├── Home.tsx          # Hero, about, deities, quick links
    ├── TempleDetails.tsx # History, reconstruction, committee, timeline
    ├── Pooja.tsx         # Monthly pooja details & registration
    ├── Gallery.tsx       # Photo grid + YouTube video embeds + lightbox
    ├── Contact.tsx       # Contact form + address + map
    ├── AuthPage.tsx      # Login & Register (shared component)
    ├── Dashboard.tsx     # Member dashboard overview
    └── FamilyMembers.tsx # Full CRUD for family members
```

---

## Setup Instructions

### 1. Clone & Install

```bash
cd /path/to/maruvayil
npm install
```

### 2. Configure Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy your **Project URL** and **anon/public key**
3. Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Set Up Database

In your Supabase project, go to **SQL Editor** and run the contents of `schema.sql`. This creates:

- `profiles` table (linked to `auth.users`)
- `family_members` table
- Row Level Security (RLS) policies
- Triggers to auto-create profile on signup and update `updated_at`

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 5. Build for Production

```bash
npm run build
npm run preview
```

---

## Features

### Public Pages

| Route | Description |
|-------|-------------|
| `/` | Home — hero with temple logo, about, deities, monthly pooja banner |
| `/temple` | Temple history, reconstruction story, committee members, timeline |
| `/pooja` | Monthly pooja details (₹1,000), inclusions, deities, registration steps |
| `/gallery` | Photo grid (60+ images) with lightbox, 4 YouTube video embeds |
| `/contact` | Contact form, address, embedded Google Map |

### Auth Pages

| Route | Description |
|-------|-------------|
| `/auth/login` | Email/password login |
| `/auth/register` | New account creation with name and phone |

### Protected Dashboard Pages

| Route | Description |
|-------|-------------|
| `/dashboard` | Welcome, membership status, family summary, quick stats |
| `/dashboard/family` | Full CRUD for family members |

---

## Database Schema

See `schema.sql` for the full schema. Key tables:

### `profiles`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | References auth.users |
| `full_name` | text | |
| `full_name_ml` | text | Malayalam name |
| `phone` | text | |
| `address` | text | |
| `member_since` | timestamptz | Auto-set on creation |
| `is_active_member` | boolean | Managed by admin |

### `family_members`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Auto-generated |
| `user_id` | uuid | References auth.users |
| `name` | text | Required |
| `name_malayalam` | text | Optional |
| `relationship` | text | self/spouse/child/parent/sibling/other |
| `birth_date` | date | Optional |
| `birth_star` | text | One of 27 nakshatras |
| `rashi` | text | One of 12 rashis |
| `notes` | text | Optional |
| `include_in_pooja` | boolean | Default true |

---

## Bilingual Support

- Language toggle in Navbar (EN ↔ ML)
- Language preference stored in `localStorage` as `maruvayil_lang`
- All 27 nakshatras and 12 rashis include both English and Malayalam names
- Noto Sans Malayalam font from Google Fonts

---

## Temple Information

- **Name**: Maruvayil Sree ShivaParvathy Kudumba Kshetra Charitable Trust
- **Malayalam**: മറുവയൽ ശ്രീ ശിവ പാർവതി കുടുംബ ക്ഷേത്രം
- **Location**: Maruveyil House, Post Kunhumakara, Via Chombala, Vadagara Taluq, Calicut District, Kerala
- **Email**: maruvayiltemple@gmail.com
- **Age**: 300+ years (reconstructed February 2020)
- **Monthly Pooja**: ₹1,000 (includes Nivedhyam, Neelanjanam, Maala, Deeparadhana)
- **Monthly Expenses**: ₹40,000 minimum

---

## Deployment

The app can be deployed to any static hosting provider:

- **Vercel**: `vercel deploy`
- **Netlify**: Drag & drop the `dist/` folder
- **GitHub Pages**: Use `gh-pages` package

Make sure to set the environment variables in your deployment platform.
