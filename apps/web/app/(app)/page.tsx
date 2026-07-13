'use client';

import { useQuery } from '@tanstack/react-query';
import { Package, Users, ShoppingCart, Boxes } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useT } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';

function useCount(resource: string) {
  return useQuery({
    queryKey: [resource, 'count'],
    queryFn: () => api.get<unknown[]>(`/${resource}`).then((rows) => rows.length),
  });
}

const tiles = [
  { key: 'products', labelKey: 'nav.products', icon: Package },
  { key: 'customers', labelKey: 'nav.customers', icon: Users },
  { key: 'sales-orders', labelKey: 'nav.salesOrders', icon: ShoppingCart },
  { key: 'inventory', labelKey: 'nav.inventory', icon: Boxes },
] as const;

export default function DashboardPage() {
  const { username } = useAuth();
  const t = useT();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">{t('dashboard.title')}</h1>
      <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
        {t('dashboard.welcome', { name: username ?? '' })}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <Tile key={tile.key} tile={tile} />
        ))}
      </div>
    </div>
  );
}

function Tile({
  tile,
}: {
  tile: { key: string; labelKey: string; icon: typeof Package };
}) {
  const t = useT();
  const { data, isLoading, isError } = useCount(tile.key);
  const Icon = tile.icon;
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex size-11 items-center justify-center rounded-lg bg-[var(--color-accent)]">
          <Icon className="size-5" />
        </div>
        <div>
          <div className="text-sm text-[var(--color-muted-foreground)]">
            {t(tile.labelKey)}
          </div>
          <div className="text-2xl font-semibold">
            {isLoading ? '…' : isError ? '—' : data}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
