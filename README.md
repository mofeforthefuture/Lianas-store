# LUXE — Luxury E-commerce

A premium, minimal e-commerce web app with Supabase auth, roles, and payments.

## Stack

- **Frontend:** React, Vite, React Router, Tailwind CSS, Radix UI, Sonner
- **Backend:** Supabase (Auth, Postgres, Storage, RLS)

## Run locally

```bash
pnpm install
pnpm run dev
```

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run the migrations in order:
   - `supabase/migrations/001_initial_schema.sql`
   - Create two storage buckets in **Storage**: `product-images` (Public), `payment-receipts` (Private).
   - Run `supabase/migrations/002_storage_policies.sql`
3. In **Authentication > URL Configuration**, add your app URL (e.g. `http://localhost:5173`).
4. Copy **Project URL** and **anon key** from **Settings > API**.
5. Create a `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

6. **Create an admin user:** sign up in the app, then in Supabase **SQL Editor** run:

```sql
UPDATE public.profiles SET role = 'admin' WHERE id = 'your-user-uuid';
```

(Find your user UUID in **Authentication > Users**.)

## Features

- **Store:** Home, Shop, Product detail (with reviews), Cart, Checkout (bank transfer + receipt upload).
- **Auth:** Email/password sign up and sign in; roles: `customer`, `admin`.
- **Orders:** Place order → bank details shown → upload receipt → admin approves/rejects payment.
- **Reviews:** Only customers who completed an order for a product can leave a review.
- **Admin dashboard:** Overview stats, Products (CRUD), Orders (list, status, approve/reject payments, view receipts).

## Build

```bash
pnpm run build
```

---

Original design: [Figma — Elegant E-commerce Website Layout](https://www.figma.com/design/zI1bKPtDmmRIH6Z7m1eVZW/Elegant-E-commerce-Website-Layout).
