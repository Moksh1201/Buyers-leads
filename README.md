# 📝 Mini Buyer Lead Intake App

A full-stack web app to **capture, list, and manage real estate buyer leads**, built using **Next.js (App Router)** and **TypeScript**, with **MongoDB (via Prisma)** for storage.  
It includes **validation with Zod**, **authentication via NextAuth**, **CSV import/export**, and **real-time history tracking** of lead changes.

---

## 🚀 Features

- Create, view, edit, and delete buyer leads
- Real-time validations (client + server) using Zod
- Search, sort, filter (SSR) with pagination
- CSV Import (with validation & transactional inserts) and Export
- Buyer change history tracking
- Ownership & auth rules (users can only edit/delete their own)
- Basic rate-limiting to prevent abuse
- Accessibility: keyboard navigation, form error announcements
- Unit tests for critical logic (budget validator)
- Error boundaries & empty states

---

## 💾 Why MongoDB?

The assignment allowed Postgres/Supabase/SQLite, but I chose **MongoDB** for these reasons:

- Easy setup with **MongoDB Atlas (cloud-hosted)** — no local database server needed
- Built-in **JSON document storage** fits flexible data like `buyer_history.diff`
- Excellent support via **Prisma ORM**, which still allows **migrations and type-safe queries**
- Fast iteration during development for this small app

---

## ⚠️ Deployment Note

🔒 This project is **not deployed on Vercel**.  
Because it uses **MongoDB Atlas + NextAuth (Email/Magic Link)**, it requires **private SMTP and database credentials**.  
To avoid exposing secrets in a public repo, the project is designed to be **run locally only** for demonstration and review purposes.

---

## 🛠️ Tech Stack

| Layer        | Tech                     |
|--------------|----------------------------|
| Frontend      | Next.js (App Router) + TypeScript |
| Styling       | Tailwind CSS + shadcn/ui |
| Validation    | Zod |
| Forms         | React Hook Form |
| Database      | MongoDB (Atlas) |
| ORM            | Prisma |
| Auth           | NextAuth (Email / Magic Link) |
| CSV Parsing    | PapaParse |
| Rate limiting  | @upstash/ratelimit |
| Testing        | Vitest + Testing Library |

---

## 🗄️ Data Model

**buyers**  
- `id` (uuid)
- `fullName` (string, 2–80)
- `email` (string, optional, email format)
- `phone` (string, 10–15 digits, required)
- `city` (enum: `Chandigarh|Mohali|Zirakpur|Panchkula|Other`)
- `propertyType` (enum: `Apartment|Villa|Plot|Office|Retail`)
- `bhk` (enum: `1|2|3|4|Studio`, optional if non-residential)
- `purpose` (enum: `Buy|Rent`)
- `budgetMin` / `budgetMax` (int, optional, budgetMax ≥ budgetMin)
- `timeline` (enum: `0-3m|3-6m|>6m|Exploring`)
- `source` (enum: `Website|Referral|Walk-in|Call|Other`)
- `status` (enum: `New|Qualified|Contacted|Visited|Negotiation|Converted|Dropped`)
- `notes` (text ≤ 1000 chars)
- `tags` (string[], optional)
- `ownerId` (user id)
- `updatedAt` (Date)

**buyer_history**  
- `id`, `buyerId`, `changedBy`, `changedAt`, `diff` (JSON of changed fields)

---

## 📁 Project Structure

app/
├── buyers/
│ ├── page.tsx # List & Search
│ ├── new/page.tsx # Create
│ └── [id]/page.tsx # View/Edit
├── api/
│ ├── buyers/
│ │ ├── route.ts # POST/GET buyers
│ │ └── [id]/route.ts # PUT/DELETE buyer
│ ├── import/route.ts
│ └── export/route.ts
components/ # UI components
lib/ # utils (auth, zod schemas, helpers)
db/
├── schema.prisma # Prisma schema for MongoDB
└── seed.ts

yaml
Copy code

---

## ⚙️ Setup Instructions

### 1️⃣ Clone & Install

```bash
git clone https://github.com/<your-username>/buyer-leads.git
cd buyer-leads
npm install
2️⃣ Configure Environment
Create a .env.local:

ini
Copy code
DATABASE_URL="mongodb+srv://<username>:<password>@cluster0.mongodb.net/buyer-leads"
NEXTAUTH_SECRET="any-random-string"
NEXTAUTH_URL="http://localhost:3000"
EMAIL_SERVER="smtp://..."          
EMAIL_FROM="noreply@yourapp.com"
3️⃣ Run Migrations
bash
Copy code
npx prisma db push
npx prisma db seed  # optional
4️⃣ Run Locally
bash
Copy code
npm run dev
Visit: http://localhost:3000

🧪 Testing
bash
Copy code
npm run test
🧩 Design Notes
Validation: Zod schemas live in lib/validation/ and are used both on client and API routes

SSR + Pagination: /buyers list uses server-side pagination, sorting, and filters synced to URL

Ownership enforcement: API routes check session.user.id === buyer.ownerId before allowing edits/deletes

Concurrency control: updatedAt is sent as a hidden field, and updates are rejected if stale

History: buyer_history entries are written automatically on every edit

Rate limit: write operations are rate-limited per IP using @upstash/ratelimit

✅ Completed vs Skipped
Completed:

CRUD flows

SSR list with filters/search/sort/pagination

Zod validation both sides

Auth & ownership enforcement

CSV import/export

Unit test, rate limit, a11y basics, error boundaries

Skipped:

Admin role (all users are regular)

File upload (attachmentUrl)

Public deployment (kept local for security of secrets)

