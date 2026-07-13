'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useT } from '@/lib/i18n';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface InventoryRow {
  id: string;
  quantity: number;
  reservedQty: number;
  availableQty: number;
  variant: { sku: string | null; name: string } | null;
  location: {
    code: string;
    warehouse: { name: string } | null;
  } | null;
  lot: { lotNumber: string } | null;
  serial: { serialNumber: string } | null;
}

export default function InventoryPage() {
  const t = useT();
  const levels = useQuery({
    queryKey: ['inventory'],
    queryFn: () => api.get<InventoryRow[]>('/inventory'),
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">{t('inventory.title')}</h1>
      <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
        {t('inventory.subtitle', { count: levels.data?.length ?? 0 })}
      </p>

      <div className="mt-6 rounded-xl border bg-[var(--color-card)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('inventory.variant')}</TableHead>
              <TableHead>{t('inventory.warehouse')}</TableHead>
              <TableHead>{t('inventory.location')}</TableHead>
              <TableHead>{t('inventory.lotSerial')}</TableHead>
              <TableHead className="text-right">{t('inventory.onHand')}</TableHead>
              <TableHead className="text-right">
                {t('inventory.reserved')}
              </TableHead>
              <TableHead className="text-right">
                {t('inventory.available')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {levels.isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            )}
            {levels.isError && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-[var(--color-destructive)]"
                >
                  {(levels.error as Error).message}
                </TableCell>
              </TableRow>
            )}
            {levels.data?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-[var(--color-muted-foreground)]"
                >
                  {t('inventory.empty')}
                </TableCell>
              </TableRow>
            )}
            {levels.data?.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <div className="font-medium">{row.variant?.name ?? '—'}</div>
                  {row.variant?.sku && (
                    <div className="font-mono text-xs text-[var(--color-muted-foreground)]">
                      {row.variant.sku}
                    </div>
                  )}
                </TableCell>
                <TableCell>{row.location?.warehouse?.name ?? '—'}</TableCell>
                <TableCell className="font-mono text-xs">
                  {row.location?.code ?? '—'}
                </TableCell>
                <TableCell className="text-xs">
                  {row.lot?.lotNumber ?? row.serial?.serialNumber ?? '—'}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.quantity}
                </TableCell>
                <TableCell className="text-right tabular-nums text-[var(--color-muted-foreground)]">
                  {row.reservedQty}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {row.availableQty}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
