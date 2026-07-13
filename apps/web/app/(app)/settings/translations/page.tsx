'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { RotateCcw } from 'lucide-react';
import { api } from '@/lib/api';
import { useI18n, useT } from '@/lib/i18n';
import {
  BASE_MESSAGES,
  LOCALES,
  LOCALE_LABELS,
  type Locale,
  type MessageKey,
} from '@/lib/i18n/messages';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const ALL_KEYS = Object.keys(BASE_MESSAGES.en) as MessageKey[];

export default function TranslationsSettingsPage() {
  const t = useT();
  const { overrides } = useI18n();
  const [query, setQuery] = React.useState('');

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_KEYS;
    return ALL_KEYS.filter((key) => {
      if (key.toLowerCase().includes(q)) return true;
      return LOCALES.some((l) =>
        (overrides[l]?.[key] ?? BASE_MESSAGES[l][key])
          .toLowerCase()
          .includes(q),
      );
    });
  }, [query, overrides]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">{t('translations.title')}</h1>
      <p className="mt-1 max-w-2xl text-sm text-[var(--color-muted-foreground)]">
        {t('translations.subtitle')}
      </p>

      <div className="mt-4 max-w-sm">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('translations.searchPlaceholder')}
        />
      </div>

      <div className="mt-4 rounded-xl border bg-[var(--color-card)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-72">{t('translations.key')}</TableHead>
              {LOCALES.map((l) => (
                <TableHead key={l}>{LOCALE_LABELS[l]}</TableHead>
              ))}
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={LOCALES.length + 2}
                  className="py-8 text-center text-[var(--color-muted-foreground)]"
                >
                  {t('translations.empty')}
                </TableCell>
              </TableRow>
            )}
            {filtered.map((key) => (
              <Row key={key} translationKey={key} overrides={overrides} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function Row({
  translationKey,
  overrides,
}: {
  translationKey: MessageKey;
  overrides: Partial<Record<Locale, Record<string, string>>>;
}) {
  const t = useT();
  const qc = useQueryClient();

  const upsert = useMutation({
    mutationFn: (vars: { locale: Locale; value: string }) =>
      api.put('/translations', {
        locale: vars.locale,
        key: translationKey,
        value: vars.value,
      }),
    onSuccess: () => {
      toast.success(t('translations.saved'));
      void qc.invalidateQueries({ queryKey: ['translations'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const revert = useMutation({
    mutationFn: (locale: Locale) =>
      api.del(
        `/translations?locale=${locale}&key=${encodeURIComponent(translationKey)}`,
      ),
    onSuccess: () => {
      toast.success(t('translations.reverted'));
      void qc.invalidateQueries({ queryKey: ['translations'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const hasOverride = LOCALES.some((l) => overrides[l]?.[translationKey]);

  const commit = (locale: Locale, value: string) => {
    const base = BASE_MESSAGES[locale][translationKey];
    const current = overrides[locale]?.[translationKey] ?? base;
    if (value === current) return; // nothing changed
    if (value === base) {
      // back to default → drop the override if one exists
      if (overrides[locale]?.[translationKey]) revert.mutate(locale);
      return;
    }
    upsert.mutate({ locale, value });
  };

  return (
    <TableRow>
      <TableCell className="align-top font-mono text-xs text-[var(--color-muted-foreground)]">
        {translationKey}
      </TableCell>
      {LOCALES.map((l) => (
        <TableCell key={l} className="align-top">
          <LocaleCell
            defaultValue={
              overrides[l]?.[translationKey] ?? BASE_MESSAGES[l][translationKey]
            }
            overridden={!!overrides[l]?.[translationKey]}
            onCommit={(v) => commit(l, v)}
          />
        </TableCell>
      ))}
      <TableCell className="align-top">
        {hasOverride && (
          <Button
            variant="ghost"
            size="icon"
            title={t('common.reset')}
            onClick={() => LOCALES.forEach((l) => revert.mutate(l))}
          >
            <RotateCcw className="size-4" />
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}

function LocaleCell({
  defaultValue,
  overridden,
  onCommit,
}: {
  defaultValue: string;
  overridden: boolean;
  onCommit: (value: string) => void;
}) {
  const [value, setValue] = React.useState(defaultValue);

  // Keep the input in sync when the effective value changes (e.g. after revert).
  React.useEffect(() => setValue(defaultValue), [defaultValue]);

  return (
    <div className="flex items-center gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => onCommit(value)}
        className={overridden ? 'border-[var(--color-primary)]' : undefined}
      />
    </div>
  );
}
