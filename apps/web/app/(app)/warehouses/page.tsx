'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2 } from 'lucide-react';
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

interface Named {
  id: string;
  name: string;
}
interface Warehouse {
  id: string;
  code: string;
  name: string;
  storeId: string;
  description: string | null;
  isDefault: boolean;
  status: string;
}

export default function WarehousesPage() {
  const t = useT();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Warehouse | null>(null);

  const warehouses = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => api.get<Warehouse[]>('/warehouses'),
  });
  const stores = useQuery({
    queryKey: ['stores'],
    queryFn: () => api.get<Named[]>('/stores'),
  });

  const storeName = (id: string) =>
    stores.data?.find((s) => s.id === id)?.name ?? '—';

  const removeMut = useMutation({
    mutationFn: (id: string) => api.del(`/warehouses/${id}`),
    onSuccess: () => {
      toast.success(t('warehouses.deleted'));
      void qc.invalidateQueries({ queryKey: ['warehouses'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t('warehouses.title')}</h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            {t('warehouses.count', { count: warehouses.data?.length ?? 0 })}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" />
          {t('warehouses.new')}
        </Button>
      </div>

      <div className="mt-6 rounded-xl border bg-[var(--color-card)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('common.code')}</TableHead>
              <TableHead>{t('common.name')}</TableHead>
              <TableHead>{t('warehouses.store')}</TableHead>
              <TableHead>{t('common.status')}</TableHead>
              <TableHead className="w-24 text-right">
                {t('common.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {warehouses.isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            )}
            {warehouses.isError && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-[var(--color-destructive)]"
                >
                  {(warehouses.error as Error).message}
                </TableCell>
              </TableRow>
            )}
            {warehouses.data?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-[var(--color-muted-foreground)]"
                >
                  {t('warehouses.empty')}
                </TableCell>
              </TableRow>
            )}
            {warehouses.data?.map((w) => (
              <TableRow key={w.id}>
                <TableCell className="font-mono text-xs">{w.code}</TableCell>
                <TableCell className="font-medium">
                  {w.name}
                  {w.isDefault && (
                    <span className="ml-2 rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-xs text-[var(--color-primary-foreground)]">
                      {t('warehouses.default')}
                    </span>
                  )}
                </TableCell>
                <TableCell>{storeName(w.storeId)}</TableCell>
                <TableCell>
                  <span className="rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-xs">
                    {t(`status.${w.status}`)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditing(w);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm(t('common.confirmDelete', { name: w.name })))
                          removeMut.mutate(w.id);
                      }}
                    >
                      <Trash2 className="size-4 text-[var(--color-destructive)]" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {dialogOpen && (
        <WarehouseDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          editing={editing}
          stores={stores.data ?? []}
          onSaved={() => void qc.invalidateQueries({ queryKey: ['warehouses'] })}
        />
      )}
    </div>
  );
}

function WarehouseDialog({
  open,
  onOpenChange,
  editing,
  stores,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Warehouse | null;
  stores: Named[];
  onSaved: () => void;
}) {
  const t = useT();
  const [form, setForm] = React.useState({
    code: editing?.code ?? '',
    name: editing?.name ?? '',
    storeId: editing?.storeId ?? stores[0]?.id ?? '',
    description: editing?.description ?? '',
    isDefault: editing?.isDefault ?? false,
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const mut = useMutation({
    mutationFn: () => {
      const payload = {
        ...form,
        description: form.description || undefined,
      };
      if (editing) return api.patch(`/warehouses/${editing.id}`, payload);
      return api.post('/warehouses', payload);
    },
    onSuccess: () => {
      toast.success(t(editing ? 'warehouses.updated' : 'warehouses.created'));
      onSaved();
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t(editing ? 'warehouses.editTitle' : 'warehouses.newTitle')}
          </DialogTitle>
        </DialogHeader>
        <form
          className="grid grid-cols-2 gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            mut.mutate();
          }}
        >
          <Field label={t('common.code')}>
            <Input
              value={form.code}
              onChange={(e) => set('code', e.target.value)}
              required
            />
          </Field>
          <Field label={t('common.name')}>
            <Input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              required
            />
          </Field>
          <Field label={t('warehouses.store')} full>
            <Select
              value={form.storeId}
              onChange={(e) => set('storeId', e.target.value)}
              required
            >
              <option value="">{t('common.select')}</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t('common.description')} full>
            <Input
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </Field>
          <label className="col-span-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-[var(--color-primary)]"
              checked={form.isDefault}
              onChange={(e) => set('isDefault', e.target.checked)}
            />
            {t('warehouses.isDefault')}
          </label>
          <DialogFooter className="col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={mut.isPending}>
              {mut.isPending ? t('common.saving') : t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${full ? 'col-span-2' : ''}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
