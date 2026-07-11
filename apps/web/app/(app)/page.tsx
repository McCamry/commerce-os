'use client';

import { useQuery } from '@tanstack/react-query';
import { Package, Users, Warehouse, ReceiptText } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';

function useCount(resource: string, orgId: string | null) {
  return useQuery({
    queryKey: [resource, 'count', orgId],
    enabled: !!orgId,
    queryFn: () =>
      api.get<unknown[]>(`/${resource}?organizationId=${orgId}`).then(
        (rows) => rows.length,
      ),
  });
}

const tiles = [
  { key: 'products', label: 'Products', icon: Package },
  { key: 'customers', label: 'Customers', icon: Users },
  { key: 'warehouses', label: 'Warehouses', icon: Warehouse },
  { key: 'quotations', label: 'Quotations', icon: ReceiptText },
];

export default function DashboardPage() {
  const { orgId, username } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
        Welcome back, {username}. Live counts from the API.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <Tile key={tile.key} tile={tile} orgId={orgId} />
        ))}
      </div>
    </div>
  );
}

function Tile({
  tile,
  orgId,
}: {
  tile: { key: string; label: string; icon: typeof Package };
  orgId: string | null;
}) {
  const { data, isLoading, isError } = useCount(tile.key, orgId);
  const Icon = tile.icon;
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex size-11 items-center justify-center rounded-lg bg-[var(--color-accent)]">
          <Icon className="size-5" />
        </div>
        <div>
          <div className="text-sm text-[var(--color-muted-foreground)]">
            {tile.label}
          </div>
          <div className="text-2xl font-semibold">
            {isLoading ? '…' : isError ? '—' : data}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
