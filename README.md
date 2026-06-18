# Oxford Cars — Luxury Car Rental Website

> **"Drive Distinction."** — British Heritage • Timeless Prestige

A complete premium luxury car rental platform built for Oxford Cars, Algeria.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 · TypeScript · Tailwind CSS · Framer Motion |
| Backend | Node.js · Express · TypeScript |
| Database | PostgreSQL |
| Auth | JWT (JSON Web Tokens) |
| State | Zustand |

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

---

### 1. Database Setup

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE oxford_cars;"

# Copy environment file
cp backend/.env.example backend/.env
# Edit backend/.env with your PostgreSQL credentials
```

### 2. Backend Setup

```bash
cd backend
npm install

# Run database migrations (creates tables + seed data)
npm run db:setup

# Start development server
npm run dev
```

Backend runs at: **http://localhost:5000**

### 3. Frontend Setup

```bash
cd frontend
npm install

# Start development server
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

## Admin Access

Default admin credentials (change immediately in production):

```
Email:    admin@oxfordcars.dz
Password: Admin@Oxford2024
```

Admin panel: **http://localhost:3000/admin**

---

## Project Structure

```
oxford-cars/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.sql       # Database schema + seed data
│   │   │   ├── setup.ts         # Migration runner
│   │   │   └── index.ts         # DB connection pool
│   │   ├── middleware/
│   │   │   └── auth.ts          # JWT middleware
│   │   ├── routes/
│   │   │   ├── auth.ts          # Register / Login / Profile
│   │   │   ├── vehicles.ts      # Fleet CRUD
│   │   │   ├── reservations.ts  # Booking system
│   │   │   ├── admin.ts         # Admin analytics & management
│   │   │   ├── contact.ts       # Contact form
│   │   │   └── reviews.ts       # Vehicle reviews
│   │   └── server.ts            # Express app entry point
│   ├── uploads/                 # Vehicle photos (auto-created)
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx              # Home page
    │   │   ├── fleet/
    │   │   │   ├── page.tsx          # Fleet listing with filters
    │   │   │   └── [id]/page.tsx     # Vehicle detail
    │   │   ├── booking/page.tsx      # Online reservation
    │   │   ├── about/page.tsx        # About Oxford Cars
    │   │   ├── contact/page.tsx      # Contact page + map
    │   │   ├── auth/
    │   │   │   ├── login/page.tsx
    │   │   │   └── register/page.tsx
    │   │   ├── dashboard/page.tsx    # Customer account
    │   │   └── admin/
    │   │       ├── page.tsx          # Admin panel
    │   │       └── vehicles/new/page.tsx
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Navbar.tsx
    │   │   │   └── Footer.tsx
    │   │   └── ui/
    │   │       ├── OxfordLogo.tsx    # SVG logo crest
    │   │       ├── VehicleCard.tsx
    │   │       └── SectionHeader.tsx
    │   ├── lib/
    │   │   ├── api.ts               # Axios API client
    │   │   └── store.ts             # Zustand auth store
    │   └── types/index.ts           # TypeScript types
    ├── tailwind.config.ts
    ├── next.config.ts
    └── .env.local
```

---

## Features

### Customer-Facing
- **Home Page** — Hero, stats, featured fleet, testimonials, contact, map
- **Fleet** — Full vehicle listing with filters (category, transmission, availability, search)
- **Vehicle Detail** — Gallery, specs, pricing, features, reviews, booking CTA
- **Online Booking** — Multi-step: vehicle → dates → contact info → confirmation
- **User Dashboard** — Reservation history, status tracking, profile management
- **Authentication** — Register, Login, JWT-based sessions

### Admin Panel
- **Analytics Dashboard** — Revenue, bookings, fleet utilisation, top vehicles
- **Fleet Management** — Add/edit/delete vehicles, toggle availability, upload photos
- **Reservation Management** — Confirm/reject/cancel bookings, status workflow
- **Customer Management** — View clients, rental history, spend
- **Messages** — Contact form inbox with read/unread tracking

---

## Design System

| Variable | Value |
|----------|-------|
| Primary Black | `#0A0A0A` |
| Charcoal | `#1C1C1C` |
| Gold | `#C9A96E` |
| Ivory | `#F5F0E8` |
| Display Font | Cormorant Garamond |
| Serif Font | Playfair Display |
| Body Font | Inter |

---

## API Endpoints

### Public
```
GET  /api/vehicles              # All vehicles (filter by category, transmission, etc.)
GET  /api/vehicles/:id          # Single vehicle + reviews
GET  /api/vehicles/:id/availability  # Availability calendar
POST /api/reservations/check-availability
POST /api/reservations          # Create reservation (guest or logged-in)
POST /api/contact               # Contact form
POST /api/auth/register
POST /api/auth/login
```

### Authenticated (Customer)
```
GET  /api/auth/me
PUT  /api/auth/me
PUT  /api/auth/change-password
GET  /api/reservations/my
GET  /api/reservations/:id
PUT  /api/reservations/:id/cancel
POST /api/reviews
```

### Admin Only
```
POST   /api/vehicles
PUT    /api/vehicles/:id
DELETE /api/vehicles/:id
GET    /api/reservations
PUT    /api/reservations/:id/status
GET    /api/admin/analytics
GET    /api/admin/customers
GET    /api/admin/messages
PUT    /api/admin/reviews/:id
```

---

## Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/oxford_cars
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
UPLOAD_PATH=uploads/
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_key
```

---

## Production Notes

1. Set `NODE_ENV=production` in backend
2. Use a strong `JWT_SECRET` (32+ random characters)
3. Configure SSL/HTTPS
4. Set up file storage (AWS S3 recommended for vehicle photos)
5. Add a Google Maps API key for accurate maps
6. Change the default admin password immediately

---

*Oxford Cars © 2024 — British Heritage · Timeless Prestige*
