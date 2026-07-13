'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Boxes,
  Languages,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useI18n, useT } from '@/lib/i18n';
import { LOCALES, LOCALE_LABELS, type Locale } from '@/lib/i18n/messages';
import { useTheme, type Theme } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

const nav = [
  { href: '/', key: 'nav.dashboard', icon: LayoutDashboard },
  { href: '/products', key: 'nav.products', icon: Package },
  { href: '/customers', key: 'nav.customers', icon: Users },
  { href: '/sales-orders', key: 'nav.salesOrders', icon: ShoppingCart },
  { href: '/inventory', key: 'nav.inventory', icon: Boxes },
  { href: '/settings/translations', key: 'nav.translations', icon: Languages },
] as const;

const THEMES: Theme[] = ['light', 'dark', 'system'];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { username, logout } = useAuth();
  const { locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  const t = useT();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 flex-col border-r bg-[var(--color-sidebar)] text-[var(--color-sidebar-foreground)]">
        <div className="flex h-14 items-center border-b px-5 font-semibold">
          {t('app.title')}
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {nav.map((item) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                    : 'hover:bg-[var(--color-accent)]',
                )}
              >
                <item.icon className="size-4" />
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3 border-t p-3">
          <label className="block">
            <span className="mb-1 block px-1 text-xs text-[var(--color-muted-foreground)]">
              {t('lang.label')}
            </span>
            <Select
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
            >
              {LOCALES.map((l) => (
                <option key={l} value={l}>
                  {LOCALE_LABELS[l]}
                </option>
              ))}
            </Select>
          </label>
          <label className="block">
            <span className="mb-1 block px-1 text-xs text-[var(--color-muted-foreground)]">
              {t('theme.label')}
            </span>
            <Select
              value={theme}
              onChange={(e) => setTheme(e.target.value as Theme)}
            >
              {THEMES.map((th) => (
                <option key={th} value={th}>
                  {t(`theme.${th}`)}
                </option>
              ))}
            </Select>
          </label>
        </div>

        <div className="border-t p-3">
          <div className="mb-2 px-3 text-xs text-[var(--color-muted-foreground)]">
            {t('nav.signedInAs')}{' '}
            <span className="font-medium">{username}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={logout}
          >
            <LogOut className="size-4" />
            {t('nav.signOut')}
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-x-auto">{children}</main>
    </div>
  );
}
