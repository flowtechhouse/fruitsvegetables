# القمسيونجي — Comssiongy

Wholesale produce agency management app (سوق الجملة). Built with Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, and Supabase (Auth + Postgres + Edge Functions).

## Features

- **Admin:** Dashboard, Cars (عربيات), Sell from car (بيع من العربية), Customers (العملاء), Collection (التحصيل), Treasury (الخزينة), Suppliers (الموردين), Sellers (البائعين)
- **Portal:** Placeholder pages for الوجبات، المدفوعات، طلب سماح
- **Auth:** Supabase Email auth; admin routes protected; login/logout with redirect
- **Backend:** All data operations via Supabase Edge Functions (Deno)
- **RTL:** Arabic UI with Cairo font; primary green theme

## Setup

1. **Environment**
   - Copy `.env.example` to `.env.local`
   - Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to your Supabase project (FruitsVegetables: `https://sbndqkesntscmdssybvu.supabase.co`)

2. **Supabase**
   - Database schema is already applied (customers, suppliers, sellers, cars, car_lines, sale_lines, ledger_entries, treasury_entries)
   - Edge Functions are deployed: list-cars, create-car, get-car, list-customers, create-customer, get-customer-ledger, list-sale-lines, create-sale-line, delete-sale-line, create-ledger-entry, list-ledger-entries, create-treasury-entry, list-treasury-entries, list-suppliers, create-supplier, list-sellers, create-seller
   - In Supabase Dashboard → **Authentication → Providers**: turn **Email** ON (enable "Email" provider).
   - (Optional) Under Email: turn **"Confirm email"** OFF so you can log in right after sign-up without checking email.
   - Create your first admin user: either go to **`/admin/signup`** in the app and register, or in Supabase **Authentication → Users → Add user** (email + password).

3. **Run**
   - `npm install`
   - `npm run dev` — dev server with Turbopack
   - Open `/` → "لوحة التحكم (الإدارة)" → `/admin/login`. No account? Use **"إنشاء حساب"** to go to `/admin/signup`, then log in.

**Can't log in?**
- **Invalid login credentials** → No user with that email, or wrong password. Create one at `/admin/signup` or in Supabase → Authentication → Users.
- **Email not confirmed** → In Supabase → Authentication → Providers → Email, disable "Confirm email", or confirm via the link sent to your inbox.
- **Signup disabled** → In Supabase → Authentication → Providers, enable the **Email** provider.

## Deploy (Vercel)

- Connect repo to Vercel; set env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- In Supabase Auth: set Site URL and Redirect URLs to your Vercel domain
- Edge Functions remain on Supabase (already deployed)

## Sale line total

- **Base:** weight × price (sellingMode `weight`) or count × price (`piece`/`package`)
- **Bya3a:** per_unit → count × bya3aValue; fixed → bya3aValue
- **Total = base + bya3a** (validated in `lib/validations/sale-line.ts`)
