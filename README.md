# Luxurio Home

Luxury furniture e-commerce — **React + TypeScript** frontend, **Express + Prisma + SQLite** backend, JWT-based admin panel.

```
Luxurio_home/
├── backend/      Node + Express + Prisma API
└── frontend/     Vite + React + TypeScript
```

## Prerequisites
- Node.js 18+

## 1. Backend setup

Copy the example env file and fill in your own values:
```powershell
cd backend
cp .env.example .env
# Edit .env — set JWT_SECRET to a long random string
```

Then install and run:
```powershell
npm install
npm run prisma:migrate -- --name init
npm run seed
npm run dev
```

API runs at **http://localhost:4000**.

> Admin credentials are configured via the seed script using values from your `.env` file. See `backend/.env.example` for the available variables.

### API Overview
| Method | Route | Auth |
|-|-|-|
| POST | `/api/auth/login` | – |
| POST | `/api/auth/admin/login` | – |
| GET  | `/api/auth/me` | user |
| GET  | `/api/products` (filters: `category`, `featured`, `q`, `page`, `limit`) | – |
| GET  | `/api/products/:slug` | – |
| GET  | `/api/products/admin/all` | admin |
| POST/PUT/DELETE | `/api/products[/:id]` | admin |
| GET  | `/api/categories` | – |
| POST/PUT/DELETE | `/api/categories[/:id]` | admin |
| GET/POST/DELETE | `/api/favorites[/:productId]` | user |

## 2. Frontend setup

Copy and configure the frontend env:
```powershell
cd frontend
cp .env.example .env
# Set VITE_API_URL if your backend runs on a different port/host
npm install
npm run dev
```

App runs at **http://localhost:5173**.

- Public site: `/`, `/shop`, `/product/:slug`, `/our-story`
- Favorites: `/favorites` (requires user login)
- Admin login: `/admin/login`
- Admin panel: `/admin` (dashboard, products, categories, admins)

## Project layout

```
backend/
├── prisma/
│   ├── schema.prisma
│   └── seed.js
└── src/
    ├── server.js
    ├── lib/prisma.js
    ├── middleware/{auth,error}.js
    └── routes/{auth,admins,categories,products,favorites}.routes.js

frontend/src/
├── App.tsx
├── main.tsx
├── styles.css
├── i18n/           (en / lt / ru translations)
├── lib/{api.ts, userAuth.tsx, adminAuth.tsx}
├── layouts/{PublicLayout, AdminLayout}.tsx
├── components/
└── pages/
    ├── Home.tsx
    ├── Shop.tsx
    ├── ProductDetail.tsx  (supports 3D .glb model viewer)
    ├── Favorites.tsx
    ├── OurStory.tsx
    └── admin/{AdminLogin, AdminDashboard, AdminProducts, AdminCategories, AdminAdmins}.tsx
```

## Environment variables

See `backend/.env.example` and `frontend/.env.example` for all required variables. Never commit `.env` files — they are gitignored.

## Features
- Multi-language UI (English / Lithuanian / Russian)
- 3D product viewer via `@google/model-viewer` (`.glb` files)
- Favorites system (per-user, JWT-authenticated)
- Admin panel: product & category management, inline status toggles, dashboard stats
- Rate-limited auth endpoints
