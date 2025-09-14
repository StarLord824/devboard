
Finmate.dev is a **finance-focused browser extension and platform** that transforms your new tab into a **personalized financial dashboard**.  
It brings together **wallet tracking, market insights, financial news, and recommendations** — all in one elegant interface.  

Built with **Turborepo** for scalability, shared packages, and multi-language support (JS/TS, Go, Python).

---

## 🚀 Tech Stack

- **Monorepo:** [Turborepo](https://turbo.build/repo)  
- **Frontend:** Next.js (Extension UI + Marketing site)  
- **Backend:** Fastify (Node.js, TypeScript) + Prisma + PostgreSQL  
- **ORM:** Prisma  
- **Auth:** JWT / Auth.js / Clerk (planned)  
- **Styling:** Tailwind CSS + shadcn/ui  
- **Infra (planned):** Redis (caching), Go (services), Python (analytics/ML)

---

## 📂 Monorepo Structure

finmate-dev/
apps/
extension/ # Chrome/Edge extension (finance dashboard)
web/ # Marketing & landing site
api/ # Backend service (Fastify + Prisma)
packages/
ui/ # Shared UI components
utils/ # Shared helper functions
config/ # ESLint, Prettier, tsconfig
types/ # Shared TypeScript types

yaml
Copy code

---

## 🛠️ Development

### 1. Clone the repo
```bash
git clone https://github.com/<your-username>/finmate-dev.git
cd finmate-dev
```

### 2. Install dependencies
```bash
pnpm install
# or npm install / yarn install
```

### 3. Setup environment
Create a .env file in apps/api/ with:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/finmate"
JWT_SECRET="supersecret"
```

### 4. Run Prisma migrations
```bash
cd apps/api
pnpm prisma migrate dev
```

### 5. Start dev server
```bash
# From root
pnpm dev
```
apps/api → runs Fastify backend at http://localhost:4000

apps/extension → runs Next.js extension UI

apps/web → runs marketing site

📦 Scripts
From root:

```bash
Copy code
pnpm dev       # Start all apps in parallel (extension, api, web)
pnpm build     # Build all apps/packages
pnpm lint      # Run lint checks
pnpm format    # Format code with Prettier
```

## 📌 Roadmap
 User authentication (JWT/Auth.js/Clerk)

 Wallet management (crypto + fiat)

 Transaction tracking

 Asset monitoring (stocks, crypto, ETFs)

 Market news aggregation

 AI-powered recommendations

 Polished extension UI with Tailwind + shadcn

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!
Feel free to open a PR or start a discussion.

📜 License
MIT © 2025 Finmate.dev
