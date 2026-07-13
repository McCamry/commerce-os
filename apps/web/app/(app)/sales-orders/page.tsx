'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useT } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface Named {
  id: string;
  name: string;
}
interface SalesOrder {
  id: string;
  orderNo: string;
  status: string;
  grandTotal: string | number;
  customer: { name: string } | null;
  items: unknown[];
}
interface ProductWithVariants {
  id: string;
  name: string;
  variants: { id: string; name: string; sku: string | null }[];
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)]',
  RESERVED: 'bg-emerald-100 text-emerald-800',
  BACKORDERED: 'bg-amber-100 text-amber-800',
  SHIPPED: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const money = (v: string | number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'THB',
  }).format(Number(v));

export default function SalesOrdersPage() {
  const t = useT();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const orders = useQuery({
    queryKey: ['sales-orders'],
    queryFn: () => api.get<SalesOrder[]>('/sales-orders'),
  });

  const confirmMut = useMutation({
    mutationFn: (id: string) => api.post(`/sales-orders/${id}/confirm`, {}),
    onSuccess: (order) => {
      const status = (order as { status?: string })?.status ?? '';
      toast.success(t('salesOrders.confirmed', { status: t(`status.${status}`) }));
      void qc.invalidateQueries({ queryKey: ['sales-orders'] });
      void qc.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t('salesOrders.title')}</h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            {t('salesOrders.count', { count: orders.data?.length ?? 0 })}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" />
          {t('salesOrders.new')}
        </Button>
      </div>

      <div className="mt-6 rounded-xl border bg-[var(--color-card)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('salesOrders.orderNo')}</TableHead>
              <TableHead>{t('salesOrders.customer')}</TableHead>
              <TableHead className="text-right">
                {t('salesOrders.lines')}
              </TableHead>
              <TableHead className="text-right">
                {t('salesOrders.total')}
              </TableHead>
              <TableHead>{t('salesOrders.status')}</TableHead>
              <TableHead className="w-32 text-right">
                {t('common.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            )}
            {orders.isError && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-[var(--color-destructive)]"
                >
                  {(orders.error as Error).message}
                </TableCell>
              </TableRow>
            )}
            {orders.data?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-[var(--color-muted-foreground)]"
                >
                  {t('salesOrders.empty')}
                </TableCell>
              </TableRow>
            )}
            {orders.data?.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-mono text-xs">{o.orderNo}</TableCell>
                <TableCell className="font-medium">
                  {o.customer?.name ?? '—'}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {o.items?.length ?? 0}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {money(o.grandTotal)}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      STATUS_STYLES[o.status] ?? 'bg-[var(--color-accent)]',
                    )}
                  >
                    {t(`status.${o.status}`)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {o.status === 'DRAFT' && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={confirmMut.isPending}
                      onClick={() => confirmMut.mutate(o.id)}
                    >
                      <CheckCircle2 className="size-4" />
                      {t('salesOrders.confirm')}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {dialogOpen && (
        <OrderDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSaved={() =>
            void qc.invalidateQueries({ queryKey: ['sales-orders'] })
          }
        />
      )}
    </div>
  );
}

interface LineDraft {
  variantId: string;
  unitId: string;
  quantity: string;
  unitPrice: string;
}

function OrderDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
}) {
  const t = useT();
  const customers = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.get<Named[]>('/customers'),
  });
  const stores = useQuery({
    queryKey: ['stores'],
    queryFn: () => api.get<Named[]>('/stores'),
  });
  const warehouses = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => api.get<Named[]>('/warehouses'),
  });
  const units = useQuery({
    queryKey: ['units'],
    queryFn: () => api.get<Named[]>('/units'),
  });
  const products = useQuery({
    queryKey: ['products'],
    queryFn: () => api.get<ProductWithVariants[]>('/products'),
  });

  const variantOptions = React.useMemo(
    () =>
      (products.data ?? []).flatMap((p) =>
        (p.variants ?? []).map((v) => ({
          id: v.id,
          label: `${p.name} — ${v.name}`,
        })),
      ),
    [products.data],
  );

  const [form, setForm] = React.useState({
    orderNo: '',
    customerId: '',
    storeId: '',
    warehouseId: '',
  });
  const [lines, setLines] = React.useState<LineDraft[]>([
    { variantId: '', unitId: '', quantity: '1', unitPrice: '0' },
  ]);

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));
  const setLine = (i: number, k: keyof LineDraft, v: string) =>
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)));

  const total = lines.reduce(
    (sum, l) => sum + Number(l.quantity || 0) * Number(l.unitPrice || 0),
    0,
  );

  const mut = useMutation({
    mutationFn: () =>
      api.post('/sales-orders', {
        orderNo: form.orderNo,
        customerId: form.customerId,
        storeId: form.storeId,
        warehouseId: form.warehouseId || undefined,
        items: lines.map((l) => ({
          variantId: l.variantId,
          unitId: l.unitId,
          quantity: Number(l.quantity),
          unitPrice: Number(l.unitPrice),
        })),
      }),
    onSuccess: () => {
      toast.success(t('salesOrders.created'));
      onSaved();
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const canSave =
    form.orderNo &&
    form.customerId &&
    form.storeId &&
    lines.length > 0 &&
    lines.every((l) => l.variantId && l.unitId && Number(l.quantity) > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('salesOrders.newTitle')}</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSave) mut.mutate();
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <Field label={t('salesOrders.orderNo')}>
              <Input
                value={form.orderNo}
                onChange={(e) => set('orderNo', e.target.value)}
                required
              />
            </Field>
            <Field label={t('salesOrders.customer')}>
              <Select
                value={form.customerId}
                onChange={(e) => set('customerId', e.target.value)}
                required
              >
                <option value="">{t('common.select')}</option>
                {customers.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t('salesOrders.store')}>
              <Select
                value={form.storeId}
                onChange={(e) => set('storeId', e.target.value)}
                required
              >
                <option value="">{t('common.select')}</option>
                {stores.data?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t('salesOrders.warehouse')}>
              <Select
                value={form.warehouseId}
                onChange={(e) => set('warehouseId', e.target.value)}
              >
                <option value="">{t('common.none')}</option>
                {warehouses.data?.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>{t('salesOrders.lineItems')}</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setLines((ls) => [
                    ...ls,
                    { variantId: '', unitId: '', quantity: '1', unitPrice: '0' },
                  ])
                }
              >
                <Plus className="size-4" />
                {t('salesOrders.addLine')}
              </Button>
            </div>
            <div className="space-y-2">
              {lines.map((l, i) => (
                <div key={i} className="flex items-end gap-2">
                  <div className="flex-1">
                    <Select
                      value={l.variantId}
                      onChange={(e) => setLine(i, 'variantId', e.target.value)}
                      required
                    >
                      <option value="">{t('salesOrders.variant')}</option>
                      {variantOptions.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="w-28">
                    <Select
                      value={l.unitId}
                      onChange={(e) => setLine(i, 'unitId', e.target.value)}
                      required
                    >
                      <option value="">{t('salesOrders.unit')}</option>
                      {units.data?.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="w-20">
                    <Input
                      type="number"
                      min="1"
                      value={l.quantity}
                      onChange={(e) => setLine(i, 'quantity', e.target.value)}
                      aria-label={t('salesOrders.quantity')}
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={l.unitPrice}
                      onChange={(e) => setLine(i, 'unitPrice', e.target.value)}
                      aria-label={t('salesOrders.unitPrice')}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={lines.length === 1}
                    onClick={() =>
                      setLines((ls) => ls.filter((_, idx) => idx !== i))
                    }
                  >
                    <Trash2 className="size-4 text-[var(--color-destructive)]" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-3 text-right text-sm">
              {t('salesOrders.total')}:{' '}
              <span className="font-semibold tabular-nums">{money(total)}</span>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={!canSave || mut.isPending}>
              {mut.isPending ? t('common.saving') : t('salesOrders.createOrder')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
