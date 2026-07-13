'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Trash2, CheckCircle2, PackageCheck } from 'lucide-react';
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
interface PurchaseOrder {
  id: string;
  purchaseNo: string;
  status: string;
  grandTotal: string | number;
  warehouseId: string | null;
  vendor: { name: string } | null;
  items: unknown[];
}
interface POItem {
  id: string;
  variantId: string;
  unitId: string;
  quantity: number;
  receivedQty: number;
  variant: { name: string; sku: string | null } | null;
  unit: { name: string } | null;
}
interface PODetail {
  id: string;
  warehouseId: string | null;
  items: POItem[];
}
interface ProductWithVariants {
  id: string;
  name: string;
  variants: { id: string; name: string }[];
}
interface WLocation {
  id: string;
  code: string;
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)]',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  PARTIALLY_RECEIVED: 'bg-amber-100 text-amber-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const money = (v: string | number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'THB',
  }).format(Number(v));

export default function PurchaseOrdersPage() {
  const t = useT();
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [receivePo, setReceivePo] = React.useState<PurchaseOrder | null>(null);

  const orders = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: () => api.get<PurchaseOrder[]>('/purchase-orders'),
  });

  const approveMut = useMutation({
    mutationFn: (id: string) => api.post(`/purchase-orders/${id}/approve`, {}),
    onSuccess: () => {
      toast.success(t('purchaseOrders.approved'));
      void qc.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const canReceive = (s: string) =>
    s === 'APPROVED' || s === 'PARTIALLY_RECEIVED';

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t('purchaseOrders.title')}</h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            {t('purchaseOrders.count', { count: orders.data?.length ?? 0 })}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          {t('purchaseOrders.new')}
        </Button>
      </div>

      <div className="mt-6 rounded-xl border bg-[var(--color-card)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('purchaseOrders.purchaseNo')}</TableHead>
              <TableHead>{t('purchaseOrders.vendor')}</TableHead>
              <TableHead className="text-right">
                {t('purchaseOrders.lines')}
              </TableHead>
              <TableHead className="text-right">
                {t('purchaseOrders.total')}
              </TableHead>
              <TableHead>{t('common.status')}</TableHead>
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
            {orders.data?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-[var(--color-muted-foreground)]"
                >
                  {t('purchaseOrders.empty')}
                </TableCell>
              </TableRow>
            )}
            {orders.data?.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-mono text-xs">
                  {o.purchaseNo}
                </TableCell>
                <TableCell className="font-medium">
                  {o.vendor?.name ?? '—'}
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
                      disabled={approveMut.isPending}
                      onClick={() => approveMut.mutate(o.id)}
                    >
                      <CheckCircle2 className="size-4" />
                      {t('purchaseOrders.approve')}
                    </Button>
                  )}
                  {canReceive(o.status) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReceivePo(o)}
                    >
                      <PackageCheck className="size-4" />
                      {t('purchaseOrders.receive')}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {createOpen && (
        <OrderDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSaved={() =>
            void qc.invalidateQueries({ queryKey: ['purchase-orders'] })
          }
        />
      )}
      {receivePo && (
        <ReceiveDialog
          po={receivePo}
          onClose={() => setReceivePo(null)}
          onDone={() => {
            void qc.invalidateQueries({ queryKey: ['purchase-orders'] });
            void qc.invalidateQueries({ queryKey: ['inventory'] });
          }}
        />
      )}
    </div>
  );
}

/* ---------------------------- create dialog ---------------------------- */

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
  const vendors = useQuery({
    queryKey: ['vendors'],
    queryFn: () => api.get<Named[]>('/vendors'),
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
    purchaseNo: '',
    vendorId: '',
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
      api.post('/purchase-orders', {
        purchaseNo: form.purchaseNo,
        vendorId: form.vendorId,
        storeId: form.storeId,
        warehouseId: form.warehouseId,
        items: lines.map((l) => ({
          variantId: l.variantId,
          unitId: l.unitId,
          quantity: Number(l.quantity),
          unitPrice: Number(l.unitPrice),
        })),
      }),
    onSuccess: () => {
      toast.success(t('purchaseOrders.created'));
      onSaved();
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const canSave =
    form.purchaseNo &&
    form.vendorId &&
    form.storeId &&
    form.warehouseId &&
    lines.every((l) => l.variantId && l.unitId && Number(l.quantity) > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('purchaseOrders.newTitle')}</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSave) mut.mutate();
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <Field label={t('purchaseOrders.purchaseNo')}>
              <Input
                value={form.purchaseNo}
                onChange={(e) => set('purchaseNo', e.target.value)}
                required
              />
            </Field>
            <Field label={t('purchaseOrders.vendor')}>
              <Select
                value={form.vendorId}
                onChange={(e) => set('vendorId', e.target.value)}
              >
                <option value="">{t('common.select')}</option>
                {vendors.data?.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t('purchaseOrders.store')}>
              <Select
                value={form.storeId}
                onChange={(e) => set('storeId', e.target.value)}
              >
                <option value="">{t('common.select')}</option>
                {stores.data?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t('purchaseOrders.warehouse')}>
              <Select
                value={form.warehouseId}
                onChange={(e) => set('warehouseId', e.target.value)}
              >
                <option value="">{t('common.select')}</option>
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
              <Label>{t('purchaseOrders.lineItems')}</Label>
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
                {t('purchaseOrders.addLine')}
              </Button>
            </div>
            <div className="space-y-2">
              {lines.map((l, i) => (
                <div key={i} className="flex items-end gap-2">
                  <div className="flex-1">
                    <Select
                      value={l.variantId}
                      onChange={(e) => setLine(i, 'variantId', e.target.value)}
                    >
                      <option value="">{t('purchaseOrders.variant')}</option>
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
                    >
                      <option value="">{t('purchaseOrders.unit')}</option>
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
                      aria-label={t('purchaseOrders.quantity')}
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={l.unitPrice}
                      onChange={(e) => setLine(i, 'unitPrice', e.target.value)}
                      aria-label={t('purchaseOrders.unitPrice')}
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
              {t('purchaseOrders.total')}:{' '}
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
              {mut.isPending
                ? t('common.saving')
                : t('purchaseOrders.createOrder')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------- receive dialog --------------------------- */

function ReceiveDialog({
  po,
  onClose,
  onDone,
}: {
  po: PurchaseOrder;
  onClose: () => void;
  onDone: () => void;
}) {
  const t = useT();

  const detail = useQuery({
    queryKey: ['purchase-order', po.id],
    queryFn: () => api.get<PODetail>(`/purchase-orders/${po.id}`),
  });
  const warehouseId = detail.data?.warehouseId ?? po.warehouseId ?? '';
  const locations = useQuery({
    queryKey: ['locations', warehouseId],
    enabled: !!warehouseId,
    queryFn: () => api.get<WLocation[]>(`/locations?warehouseId=${warehouseId}`),
  });

  const [receiveNo, setReceiveNo] = React.useState('');
  const [rows, setRows] = React.useState<Record<string, string>>({});
  const [locs, setLocs] = React.useState<Record<string, string>>({});

  // Seed each line's default qty (remaining) and location once data arrives.
  React.useEffect(() => {
    if (!detail.data) return;
    const firstLoc = locations.data?.[0]?.id ?? '';
    setRows((prev) =>
      Object.keys(prev).length
        ? prev
        : Object.fromEntries(
            detail.data!.items.map((it) => [
              it.id,
              String(Math.max(0, it.quantity - it.receivedQty)),
            ]),
          ),
    );
    setLocs((prev) =>
      Object.keys(prev).length
        ? prev
        : Object.fromEntries(detail.data!.items.map((it) => [it.id, firstLoc])),
    );
  }, [detail.data, locations.data]);

  const mut = useMutation({
    mutationFn: () => {
      const items = (detail.data?.items ?? [])
        .filter((it) => Number(rows[it.id] || 0) > 0)
        .map((it) => ({
          purchaseOrderItemId: it.id,
          variantId: it.variantId,
          unitId: it.unitId,
          locationId: locs[it.id],
          quantity: Number(rows[it.id]),
        }));
      return api.post('/goods-receives', {
        purchaseOrderId: po.id,
        warehouseId,
        receiveNo,
        items,
      });
    },
    onSuccess: () => {
      toast.success(t('goodsReceive.done'));
      onDone();
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const noLocations = locations.isSuccess && (locations.data?.length ?? 0) === 0;
  const anyQty = Object.values(rows).some((v) => Number(v) > 0);
  const canSubmit =
    !!receiveNo && !noLocations && anyQty && !!warehouseId && !mut.isPending;

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t('goodsReceive.title')} · {po.purchaseNo}
          </DialogTitle>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit) mut.mutate();
          }}
        >
          <div className="w-1/2">
            <Label className="mb-1.5 block">{t('goodsReceive.receiveNo')}</Label>
            <Input
              value={receiveNo}
              onChange={(e) => setReceiveNo(e.target.value)}
              required
            />
          </div>

          {noLocations && (
            <p className="text-sm text-[var(--color-destructive)]">
              {t('goodsReceive.noLocations')}
            </p>
          )}

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('purchaseOrders.variant')}</TableHead>
                  <TableHead className="text-right">
                    {t('goodsReceive.ordered')}
                  </TableHead>
                  <TableHead className="text-right">
                    {t('goodsReceive.received')}
                  </TableHead>
                  <TableHead className="w-24">
                    {t('goodsReceive.receiveQty')}
                  </TableHead>
                  <TableHead className="w-40">
                    {t('goodsReceive.location')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detail.isLoading && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-6 text-center">
                      {t('common.loading')}
                    </TableCell>
                  </TableRow>
                )}
                {detail.data?.items.map((it) => (
                  <TableRow key={it.id}>
                    <TableCell className="font-medium">
                      {it.variant?.name ?? '—'}
                      {it.variant?.sku && (
                        <span className="ml-2 font-mono text-xs text-[var(--color-muted-foreground)]">
                          {it.variant.sku}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {it.quantity}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-[var(--color-muted-foreground)]">
                      {it.receivedQty}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max={it.quantity - it.receivedQty}
                        value={rows[it.id] ?? ''}
                        onChange={(e) =>
                          setRows((r) => ({ ...r, [it.id]: e.target.value }))
                        }
                        aria-label={t('goodsReceive.receiveQty')}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={locs[it.id] ?? ''}
                        onChange={(e) =>
                          setLocs((l) => ({ ...l, [it.id]: e.target.value }))
                        }
                      >
                        <option value="">{t('common.select')}</option>
                        {locations.data?.map((loc) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.code}
                          </option>
                        ))}
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {mut.isPending ? t('common.saving') : t('goodsReceive.submit')}
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
