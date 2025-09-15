# Buyer Lead Intake App

Small app to capture, list, and manage buyer leads with search/filter and CSV import/export.

## Stack
- Next.js (App Router) + TypeScript
- SQLite + Drizzle ORM (with generated SQL migrations in `drizzle/`)
- Zod for validation
- NextAuth demo login (Credentials)

## Getting Started
1. Install deps
```bash
npm install
```
2. Create database and migrations
```bash
npm run db:generate
npm run db:migrate
```
3. Run dev server
```bash
npm run dev
```
4. Sign in at `/signin` using `agent@example.com` or `admin@example.com`.

## ENV
Copy and adjust as needed:
```
DATABASE_URL=.data/sqlite.db
NEXTAUTH_SECRET=replace-me
NEXTAUTH_URL=http://localhost:3000
```

## Data Model
- `buyers`: id, fullName, email, phone, city, propertyType, bhk, purpose, budgetMin, budgetMax, timeline, source, status, notes, tags, ownerId, updatedAt
- `buyer_history`: id, buyerId, changedBy, changedAt, diff (JSON)

## Validation
- Zod schemas in `lib/validation.ts` used client- and server-side
- Rules: name ≥ 2, phone 10–15 digits, valid email if provided, budgetMax ≥ budgetMin, `bhk` required for Apartment/Villa

## Pages
- `/buyers/new`: create lead form
- `/buyers`: SSR list with pagination (10), filters via URL, debounced search, sort by updatedAt desc, export CSV button
- `/buyers/[id]`: view/edit with concurrency check (hidden `updatedAt`) and last 5 history entries (field diffs)
- `/buyers/import`: paste CSV (max 200) and validate; only valid rows inserted in a transaction
- `/buyers/export`: export current filtered list as CSV

## Auth & Ownership
- Anyone logged in can read all buyers
- Users can edit/delete only their own (`ownerId`); `admin` role can edit all

## Rate Limit
- Simple in-memory token bucket per user+IP on create/update endpoints

## Tests
- Run `npm test` (Vitest). Example test for budget and BHK validators: `tests/validation.test.ts`.

## Design Notes
- SSR list page queries with Drizzle; all filters/search/sort applied on server
- Validation lives in `lib/validation.ts`; imported in API routes and client forms
- Concurrency handled via `updatedAt` compare in update API
- History `diff` stores changed fields with old→new values for display

## What’s Done vs Skipped
- Done: CRUD, filters/search, CSV import/export, ownership, rate limit, history diffs, test, error boundary, basic a11y
- Skipped: full-text search, optimistic updates, attachments; can be added later
