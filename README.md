# StoreRater — Full-Stack Store Rating Platform

A role-based store rating application built with **Express.js**, **TypeScript**, **Prisma**, **PostgreSQL**, and **React**.

---

## Tech Stack

| Layer      | Technology                               |
|------------|------------------------------------------|
| Backend    | Express.js + TypeScript                  |
| ORM        | Prisma                                   |
| Database   | PostgreSQL                               |
| Auth       | JWT (jsonwebtoken) + bcryptjs            |
| Frontend   | React + TypeScript + React Router        |
| HTTP       | Axios                                    |
| Styling    | Custom CSS (design system)               |

---

## Database Schema

```
User
  id, name, email, address, password, role (ADMIN|USER|STORE_OWNER), createdAt, updatedAt

Store
  id, name, email, address, ownerId (→ User), createdAt, updatedAt

Rating
  id, userId (→ User), storeId (→ Store), rating (1–5), createdAt, updatedAt
  UNIQUE(userId, storeId)  ← one rating per user per store
```

---

## User Roles & Access

| Role        | Can Do                                                                 |
|-------------|------------------------------------------------------------------------|
| ADMIN       | View stats, create users/stores, view/filter all users & stores        |
| USER        | Browse stores, search, submit/update ratings, change password          |
| STORE_OWNER | View their store's average rating & list of raters, change password    |

---

## Project Structure

```
store-rating-app/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # DB schema
│   └── src/
│       ├── app.ts                 # Express entry point
│       ├── controllers/           # Business logic
│       │   ├── auth.controller.ts
│       │   ├── admin.controller.ts
│       │   ├── store.controller.ts
│       │   ├── rating.controller.ts
│       │   ├── owner.controller.ts
│       │   └── user.controller.ts
│       ├── routes/                # Route definitions
│       ├── middleware/
│       │   └── auth.ts            # JWT auth + role guard
│       ├── utils/
│       │   ├── jwt.ts
│       │   └── validators.ts
│       └── prisma/
│           ├── client.ts          # Prisma singleton
│           └── seed.ts            # Admin seeder
└── frontend/
    └── src/
        ├── App.tsx                # Router
        ├── styles.css             # Global design system
        ├── context/AuthContext.tsx
        ├── services/api.ts        # Axios service layer
        ├── types/index.ts
        ├── utils/validators.ts
        ├── components/
        │   ├── common/
        │   │   ├── ProtectedRoute.tsx
        │   │   └── StarRating.tsx
        │   └── layout/Layout.tsx  # Sidebar layout
        └── pages/
            ├── Login/
            ├── Signup/
            ├── AdminDashboard/    # Overview, Users, Stores
            ├── UserDashboard/
            ├── OwnerDashboard/
            └── ChangePassword/
```

---

## API Endpoints

```
POST   /api/auth/signup              Public signup (USER role)
POST   /api/auth/login               All roles

GET    /api/user/me                  Get own profile
PUT    /api/user/change-password     Change password (all roles)
GET    /api/user/store-owners        List available store owners (admin use)

GET    /api/admin/dashboard          Stats: users, stores, ratings
GET    /api/admin/users              List users (filter + sort)
GET    /api/admin/users/:id          User detail (with store rating if owner)
POST   /api/admin/users              Create user (any role)
GET    /api/admin/stores             List stores (filter + sort)
POST   /api/admin/stores             Create store

GET    /api/stores                   Browse stores with user's rating (USER)

POST   /api/ratings                  Submit rating (USER)
PUT    /api/ratings/:id              Update rating (USER)

GET    /api/owner/dashboard          Store stats + raters list (STORE_OWNER)
```

---

## Environment Variables

### Backend — `backend/.env`

```env
DATABASE_URL="postgresql://postgres:password@localhost:5433/store_rating_db"
JWT_SECRET="your_super_secret_jwt_key_change_in_production"
PORT=5000
FRONTEND_URL="http://localhost:5173"
```

### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Setup & Run

### Prerequisites

- Node.js v18+
- Docker & Docker Compose (for the local PostgreSQL container)
- npm

---

### 1. Clone & Install

```bash
git clone https://github.com/gopalmehtre/store-rating-site.git
cd store-rating-site
```

```bash
# Backend
cd backend
npm install

# Frontend (in a new terminal)
cd frontend
npm install
```

---

### 2. Configure Environment

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env → set DATABASE_URL with your PostgreSQL credentials
```

---

### 3. Set Up Database

```bash
# Start PostgreSQL via Docker Compose (from the project root)
docker-compose up -d

cd backend

# Generate Prisma client
npx prisma generate

# Run migrations (creates all tables)
npx prisma migrate dev --name init

# Seed default admin account
npm run prisma:seed
```

This creates the admin account:
- **Email:** `admin@storerating.com`
- **Password:** `Admin@123`

---

### 4. Start the App

```bash
# Terminal 1 — Backend (http://localhost:5000)
cd backend
npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend
npm run dev
```

Open **http://localhost:5173** and log in as admin.

---

## Form Validation Rules

| Field    | Rule                                                              |
|----------|-------------------------------------------------------------------|
| Name     | Min 20 chars, Max 60 chars                                        |
| Email    | Standard email format                                             |
| Password | 8–16 chars, ≥1 uppercase letter, ≥1 special character            |
| Address  | Max 400 chars                                                     |
| Rating   | Integer 1–5                                                       |

---

## Features

- Single login for all roles (ADMIN / USER / STORE_OWNER)
- Normal user public signup
- JWT authentication with auto-redirect based on role
- Admin dashboard with stats (users, stores, ratings)
- Admin: create users of any role; create stores assigned to owners
- Admin: view user details (store owners show their store's avg rating)
- Admin: filter users by name/email/address/role; filter stores by name/email/address
- All tables sortable ASC/DESC
- Users: browse stores with overall avg rating + their own rating shown
- Users: search stores by name or address
- Users: submit new rating (1-5 stars) or update existing rating
- Store owners: see average rating and full list of raters
- Change password for all roles (validates current password)
- One rating per user per store enforced at DB level (unique constraint)
- Role-based route protection on both frontend and backend

---

## Deployment Notes

- For production, set `JWT_SECRET` to a long random string
- Use a managed PostgreSQL (Railway, Supabase, Neon, RDS)
- Run `npm run build` in frontend and serve `build/` via nginx or a static host (Vercel, Netlify)
- Run `npm run build && npm start` in backend, or deploy to Railway/Render
