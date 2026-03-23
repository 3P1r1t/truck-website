# truck-merged-project

Merged project based on:
- `truck-website-main` for public frontend layout
- `truck-websit-codex-rebulid` for implemented backend features

## Final Architecture
- Single Next.js monolith (`App Router`)
- Prisma + PostgreSQL
- Admin auth via JWT (`/api/admin/auth/login`)
- Public site is open access (no login)
- Full EN/ZH content support (model fields + settings)

## Feature Scope
- Product / Brand / Category CRUD
- Product image upload + URL image management
- Public inquiry submit + admin inquiry status/intent management
- Article CRUD (EN/ZH)
- Full-site content settings (EN/ZH)
- Admin user management (create/disable/reset password/delete)
- Order module removed (inquiry-only flow)

## Setup
1. Install dependencies
```bash
npm install
```

2. Configure environment
```bash
cp .env.example .env
```

3. Generate Prisma client and migrate
```bash
npm run db:generate
npm run db:migrate
```

4. Seed initial data
```bash
npm run db:seed
```

5. Start app
```bash
npm run dev
```

## Default Admin
- Username: `admin`
- Password: `admin123`

Change password after first login.

## Key API Groups
- Public: `/api/products`, `/api/brands`, `/api/categories`, `/api/articles`, `/api/settings`, `/api/inquiries`
- Admin auth/users/settings: `/api/admin/*`
