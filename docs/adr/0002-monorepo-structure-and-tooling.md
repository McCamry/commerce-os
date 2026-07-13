# 2. Monorepo Structure and Tooling

Date: 2026-07-08

## Status
Accepted

## Context
Commerce OS is a complex enterprise ERP system with multiple moving parts (API, Frontend, Docs). Maintaining these separately can lead to versioning conflicts, duplicate code, and inconsistent tooling.

## Decision
We will use a **Monorepo** architecture using **PNPM Workspaces** and **Turborepo**.
- `apps/`: Contains the executable applications (NestJS API, Next.js Web, Docusaurus Docs).
- `packages/`: Contains shared, domain-agnostic libraries (Prisma DB, Logger, Config, Types, Shared Utils).

## Consequences
- **Positive**: Simplified dependency management, atomic commits across frontend/backend, shared TS config and ESLint rules.
- **Positive**: Turborepo allows fast incremental builds.
- **Negative**: Initial setup complexity. Developers need to understand how PNPM workspaces link local packages.
