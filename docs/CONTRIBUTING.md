# Contributing to Commerce OS

This document outlines the workflow and standards for contributing to the Commerce OS project.

## 1. Branch Naming Convention

- **`main`**: Production-ready code.
- **`develop`**: Integration branch for the next release.
- **`feature/*`**: New features (e.g., `feature/inventory-management`).
- **`fix/*`**: Bug fixes (e.g., `fix/stock-adjustment-calc`).
- **`hotfix/*`**: Urgent fixes for production (e.g., `hotfix/login-crash`).

## 2. Commit Message Standards

We use Conventional Commits. Every commit message must start with one of the following prefixes:

- `feat:` A new feature.
- `fix:` A bug fix.
- `refactor:` Code change that neither fixes a bug nor adds a feature.
- `docs:` Documentation only changes.
- `test:` Adding missing tests or correcting existing tests.
- `chore:` Changes to the build process or auxiliary tools and libraries.

**Example**:
`feat: implement stock transfer validation`

## 3. Pull Requests (PRs)

1. Ensure your branch is up to date with `develop`.
2. Ensure all tests pass and code is formatted (`pnpm lint`, `pnpm build`, `pnpm test`).
3. Create the PR against `develop`.
4. Include a summary of the changes and link to the relevant Jira/Trello ticket if applicable.
5. Require at least one code review approval before merging.

## 4. CI/CD Pipeline

The GitHub Actions pipeline will automatically run the following steps on every PR:
1. `pnpm install`
2. `pnpm lint`
3. `pnpm test`
4. `pnpm build`
5. `prisma migrate status` (Migration Check)
6. Deploy (only on `main` or `develop` branch merges).
