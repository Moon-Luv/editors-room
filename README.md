<div align="center">

# Editors Room

**Premium IT services for modern startups — Software Development, AI, Cloud & more.**

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat&logo=supabase)

</div>

---

## Overview

Editors Room is a full-stack agency web application featuring a public-facing marketing site and a protected admin dashboard. Admins can manage all site content — projects, services, team, testimonials, bookings, and contacts — through a full CRUD interface backed by Supabase.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| Animations | Motion (Framer Motion v12) |
| Routing | React Router DOM v7 |
| Backend / Auth | Supabase (PostgreSQL + Auth + Storage) |
| Server | Express.js |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| AI | Google Gemini |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Google Gemini](https://aistudio.google.com) API key

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Your Google Gemini API key |
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous (public) key |

### 3. Set up the database

Run the contents of `supabase-schema.sql` in your Supabase project's SQL editor. This creates all tables, RLS policies, indexes, and storage buckets.

### 4. Run the app

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run TypeScript type checking |
| `npm run clean` | Remove the `dist/` folder |

---

## Project Structure

```
src/
├── components/
│   ├── admin/          # Admin layout shell
│   ├── animations/     # BlurText, SplitText, ScrollReveal, CountUp
│   ├── layout/         # Public page sections (Hero, Services, About, etc.)
│   └── ui/             # Custom UI components
├── context/            # ThemeContext (dark/light/system)
├── lib/                # Supabase client, storage helpers, utils
├── pages/
│   ├── admin/          # Dashboard, UsersManagement, ProjectsManagement, etc.
│   ├── LoginPage.tsx
│   └── ProjectsPage.tsx
├── services/           # Data access layer
├── types.ts            # Global TypeScript interfaces
└── App.tsx             # Root component + route definitions
```

---

## Admin Dashboard

Access the admin panel at `/login` using your Supabase admin credentials.

| Route | Description |
|---|---|
| `/admin` | Overview — stats, charts, recent bookings |
| `/admin/projects` | Manage portfolio projects |
| `/admin/services` | Manage offered services |
| `/admin/team` | Manage team member profiles |
| `/admin/testimonials` | Approve and manage testimonials |
| `/admin/bookings` | View and update booking statuses |
| `/admin/contacts` | Read contact form submissions |
| `/admin/about` | Edit the About section |
| `/admin/users` | Manage registered users |
| `/admin/settings` | Application settings |

---

## Deployment

1. Set all environment variables on your hosting platform.
2. Build the app: `npm run build`
3. The Express server in `server.ts` serves the static `dist/` folder in production and listens on `0.0.0.0:3000`.

---

## Documentation

For full technical documentation including the database schema, RLS policies, storage helpers, and API reference, see [DOCUMENTATION.md](./DOCUMENTATION.md).

---

<div align="center">
  <p>Built with ❤️ by the Editors Room team</p>
</div>
