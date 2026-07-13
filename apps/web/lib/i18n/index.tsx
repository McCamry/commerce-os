'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import {
  BASE_MESSAGES,
  DEFAULT_LOCALE,
  LOCALES,
  type Locale,
  type MessageKey,
} from './messages';

const LOCALE_KEY = 'commerce_locale';

type Overrides = Partial<Record<Locale, Record<string, string>>>;

interface I18nState {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: MessageKey | string, vars?: Record<string, string | number>) => string;
  overrides: Overrides;
}

const I18nContext = React.createContext<I18nState | null>(null);

function interpolate(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k: string) =>
    k in vars ? String(vars[k]) : `{${k}}`,
  );
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { claims } = useAuth();
  const [locale, setLocaleState] = React.useState<Locale>(DEFAULT_LOCALE);

  React.useEffect(() => {
    const saved =
      typeof window !== 'undefined'
        ? (localStorage.getItem(LOCALE_KEY) as Locale | null)
        : null;
    if (saved && LOCALES.includes(saved)) setLocaleState(saved);
  }, []);

  const setLocale = React.useCallback((l: Locale) => {
    setLocaleState(l);
    if (typeof window !== 'undefined') localStorage.setItem(LOCALE_KEY, l);
  }, []);

  // Organization-specific overrides, only once authenticated.
  const overridesQuery = useQuery({
    queryKey: ['translations'],
    enabled: !!claims,
    queryFn: () => api.get<Overrides>('/translations'),
  });
  const overrides = React.useMemo(
    () => overridesQuery.data ?? {},
    [overridesQuery.data],
  );

  const t = React.useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const base = BASE_MESSAGES[locale] as Record<string, string>;
      const value =
        overrides[locale]?.[key] ??
        base[key] ??
        (BASE_MESSAGES[DEFAULT_LOCALE] as Record<string, string>)[key] ??
        key;
      return interpolate(value, vars);
    },
    [locale, overrides],
  );

  const value: I18nState = { locale, setLocale, t, overrides };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

/** Convenience hook returning just the translate function. */
export function useT() {
  return useI18n().t;
}
