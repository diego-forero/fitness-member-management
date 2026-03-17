# Fitness Member Management

Full-stack solution for the SweatWorks technical challenge. The application manages gym members, memberships, plans, check-ins, and member summaries using a Node/Express API, a React/Vite frontend, and PostgreSQL.

## Live URLs

- Web app: `https://fitness-member-management-web.vercel.app/`
- API: `https://fitness-member-management-api.onrender.com`
- Health check: `https://fitness-member-management-api.onrender.com/api/health`
- Postman docs: `https://documenter.getpostman.com/view/18266187/2sBXihoXYf`

## Challenge Scope Implemented

- Create a member
- Search and list members by name or email
- View member summary
- Assign a membership to a member
- Cancel an active membership
- Record member check-ins
- Show active plan, last check-in, and 30-day check-in count in the summary
- Enforce the business rule of only one active membership per member

## Extra Feature

In addition to the requested scope, the app includes simple plan management from the UI:

- Create plans
- Edit plans
- Activate or deactivate plans
- Delete plans that have never been used

## Tech Stack

- Frontend: React, TypeScript, Vite
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL
- ORM / SQL tooling: Drizzle ORM, drizzle-kit
- Validation: Zod
- Local DB runtime: Docker Compose
- Production hosting:
  - Frontend on Vercel
  - API on Render
  - Managed PostgreSQL on Supabase

## Monorepo Structure

- `apps/web`: React + Vite frontend
- `apps/api`: Express + TypeScript backend
- `docs/solution-diagram.drawio`: editable solution diagram for the challenge deliverable

## Main Business Rules

- A member can only have one active membership at a time.
- Only members with an active membership can check in.
- Inactive plans cannot be assigned to new memberships.
- Plans with historical memberships cannot be deleted.

## API Overview

### Members

- `POST /api/members`
- `GET /api/members?query=...`
- `GET /api/members/:memberId/summary`

### Memberships

- `POST /api/members/:memberId/memberships`
- `PATCH /api/members/:memberId/memberships/:membershipId/cancel`

### Check-ins

- `POST /api/members/:memberId/check-ins`

### Plans

- `GET /api/plans`
- `GET /api/plans/admin`
- `POST /api/plans`
- `PATCH /api/plans/:planId`
- `DELETE /api/plans/:planId`

### Health

- `GET /api/health`

## Local Setup

### Prerequisites

- Node.js 20+
- pnpm 10
- Docker / Docker Compose

### Install pnpm

If `pnpm` is not installed, enable it with Corepack:

```bash
corepack enable
corepack prepare pnpm@10.0.0 --activate
pnpm --version
```

Alternative:

```bash
npm install -g pnpm@10.0.0
```

### Environment files

Create the local env files from the examples:

```bash
cp .env.example .env
cp apps/web/.env.example apps/web/.env
```

### Run locally

```bash
pnpm install
pnpm init:local
pnpm dev
```

What these commands do:

- `pnpm install`: installs workspace dependencies
- `pnpm init:local`: starts PostgreSQL, runs DB migrations, and seeds the default plan
- `pnpm dev`: runs the API and frontend together

Local URLs:

- Web: `http://localhost:5173`
- API: `http://localhost:3001`

## Useful Scripts

- `pnpm dev`: run frontend and backend together
- `pnpm dev:web`: run only the frontend
- `pnpm dev:api`: run only the backend
- `pnpm init:local`: boot DB, migrate, and seed
- `pnpm reset:local`: recreate the local DB from scratch
- `pnpm db:migrate`: run API migrations
- `pnpm db:seed`: seed the default plan
- `pnpm build:api`: compile the API for production
- `pnpm start:api`: run the compiled API
- `pnpm --filter ./apps/api test:run`: run API tests

## Seed Data

The seed creates a default active plan:

- `MONTHLY_BASIC` - `Monthly Basic`
- `MONTHLY_PLUS` - `Monthly Plus`

## Deployment Notes

### Render API

- Build command: `pnpm install --frozen-lockfile --prod=false && pnpm build:api`
- Start command: `pnpm start:api`


### Vercel Web

The frontend is deployed separately on Vercel and points to the Render API using:

```bash
VITE_API_BASE_URL=https://fitness-member-management-api.onrender.com
```
