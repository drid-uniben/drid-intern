## DRID Intern

Monorepo for the DRID internship platform.

- `frontend/`: Next.js 16 app (React 19, React Query, Zustand)
- `backend/`: Express + TypeScript API (Prisma + PostgreSQL)

## Requirements

- Node.js 20+
- pnpm 10+
- PostgreSQL 16 (local or container)

## Local development

### 1) Install dependencies

```bash
cd backend && pnpm install
cd ../frontend && pnpm install
```

### 2) Configure environment

- Backend env: `backend/.env` (must include `DATABASE_URL`, JWT secrets, and app URLs)
- Frontend env: `frontend/.env.local` (set `NEXT_PUBLIC_API_URL`)

### 3) Run apps

```bash
cd backend && pnpm dev
cd ../frontend && pnpm dev
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000/api/v1`

## Quality checks

```bash
cd backend && pnpm lint && pnpm build
cd ../frontend && pnpm lint && pnpm build
```

## Docker

- Backend-only compose: `backend/docker-compose.yml`
- Frontend-only compose: `frontend/docker-compose.yml`
- Full stack compose: `docker-compose.yml`

## Git pre-commit hooks (frontend + backend)

This repo includes a tracked pre-commit hook under `.githooks/pre-commit` that runs lint checks for both apps.

Enable once per clone:

```bash
./scripts/setup-hooks.sh
```

or manually:

```bash
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit
```

## CI

GitHub Actions CI runs lint + build for `frontend/` and `backend/` on push/PR to `main`.
