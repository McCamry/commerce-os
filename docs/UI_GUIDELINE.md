# UI Guideline — Theme & i18n

Every admin page **must** be theme-aware and fully translatable. Follow this
checklist for new pages so we never retrofit again.

## 1. Never hardcode user-facing text

Use the translation hook for **all** labels, headings, buttons, table headers,
placeholders, toasts, and — importantly — **every `<option>` in a combo box**.

```tsx
import { useT } from '@/lib/i18n';

const t = useT();
<h1>{t('customers.title')}</h1>
<Button>{t('common.save')}</Button>
```

- Keys are flat and dot-namespaced (`customers.title`, `common.save`).
- Add each new key to **both** `th` and `en` in
  [`apps/web/lib/i18n/messages.ts`](../apps/web/lib/i18n/messages.ts). Thai is the
  default locale; the key set is derived from the `en` map, so a missing `th`
  entry is a type error.
- Interpolate variables with `{name}`: `t('products.count', { count: 5 })`.

### Enum / status values

Store the raw value, render the label through `t()`:

```tsx
const STATUSES = ['ACTIVE', 'INACTIVE'];      // values sent to the API
<option value={s}>{t(`status.${s}`)}</option> // translated label
<span>{t(`status.${row.status}`)}</span>       // translated badge
```

Add a `status.<VALUE>` key for every enum value the API can return.

## 2. Organization overrides & the management page

`GET /translations` returns the org's overrides (per locale); the
`I18nProvider` merges them over the base dictionaries at runtime. Admins edit
them at **Settings → Translations** (`/settings/translations`), which persists
via `PUT`/`DELETE /translations`. You get this for free — just use `t()` with a
key that exists in `messages.ts`.

Resolution order in `t(key)`: **org override (current locale) → base (current
locale) → base (Thai) → the key itself**.

## 3. Theme

Colors come from CSS variables that flip with a `.dark` class on `<html>`
(see [`globals.css`](../apps/web/app/globals.css)). The `ThemeProvider`
(light/dark/system, persisted, no-flash) and the sidebar switcher are already
wired.

- **Only** style with the semantic tokens: `bg-[var(--color-card)]`,
  `text-[var(--color-muted-foreground)]`, `border`, `bg-[var(--color-primary)]`,
  `text-[var(--color-destructive)]`, etc.
- **Never** hardcode raw colors (`bg-white`, `text-black`, `#fff`). If a shade
  is missing, add a token to `globals.css` for both `:root` and `.dark`.
- Tailwind `dark:` variants are available if you truly need a per-element
  override, but tokens are preferred.

## 4. Data fetching

Organization scope comes from the JWT server-side — **do not** send
`?organizationId=` or put `organizationId` in create bodies. Just
`api.get('/customers')`.

## New-page checklist

- [ ] `const t = useT()`; every visible string via `t()`
- [ ] keys added to `th` **and** `en` in `messages.ts`
- [ ] `status.*` keys for any enum values
- [ ] combo-box `<option>` labels via `t()`
- [ ] colors via `var(--color-*)` tokens only
- [ ] no `organizationId` in requests
- [ ] `tsc`, `eslint --max-warnings 0`, and `next build` clean
