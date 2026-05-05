# Luxurio Home

Luxury furniture e-commerce starter — **React + TypeScript** frontend, **Express + Prisma + PostgreSQL** backend, JWT-based admin panel.

```
Luxurio_home/
├── backend/      Node + Express + Prisma API
└── frontend/     Vite + React + TypeScript
```

## Prerequisites
- Node.js 18+
- PostgreSQL 14+ running locally (or Docker)

Quick Postgres via Docker:
```powershell
docker run --name luxurio-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=luxurio -p 5432:5432 -d postgres:16
```

## 1. Backend setup
```powershell
cd backend
npm install
# adjust DATABASE_URL in .env if needed
npm run prisma:migrate -- --name init
npm run seed
npm run dev
```
API runs at **http://localhost:4000**.
Default admin: `admin@luxurio.local` / `admin123`.

### Endpoints
| Method | Route | Auth |
|-|-|-|
| POST | `/api/auth/login` | – |
| GET  | `/api/auth/me` | ✅ |
| GET  | `/api/products` (filters: `category`, `featured`, `q`, `page`, `limit`) | – |
| GET  | `/api/products/:slug` | – |
| GET  | `/api/products/admin/all` | ✅ |
| POST/PUT/DELETE | `/api/products[/:id]` | ✅ |
| GET  | `/api/categories` | – |
| POST/PUT/DELETE | `/api/categories[/:id]` | ✅ |

## 2. Frontend setup
```powershell
cd frontend
npm install
npm run dev
```
App runs at **http://localhost:5173**.

- Public site: `/`, `/shop`, `/product/:slug`
- Admin login: `/admin/login`
- Admin panel: `/admin` (dashboard, products, categories)

## 3. Adding your Claude HTML design
Drop the markup into `frontend/src/pages/Home.tsx` (replace the JSX inside the component). Move CSS into `frontend/src/styles.css` or import a separate stylesheet. Convert `class=` → `className=` and inline `style="..."` → `style={{ ... }}`.

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
    └── routes/{auth,categories,products}.routes.js

frontend/src/
├── App.tsx
├── main.tsx
├── styles.css
├── lib/{api.ts, auth.tsx}
├── layouts/{PublicLayout, AdminLayout}.tsx
└── pages/
    ├── Home.tsx
    ├── Shop.tsx
    ├── ProductDetail.tsx
    └── admin/{AdminLogin, AdminDashboard, AdminProducts, AdminCategories}.tsx
```

## Next ideas
- Image upload (multer is already installed; wire `/api/uploads`)
- Order/cart system
- Product variants & gallery
- Stripe checkout
