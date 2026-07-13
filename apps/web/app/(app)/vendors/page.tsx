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

interface Vendor {
  id: string;
  code: string;
  name: string;
  email: string | null;
  phone1: string | null;
  taxId: string | null;
  status: string;
}

const STATUSES = ['ACTIVE', 'INACTIVE'];

export default function VendorsPage() {
  const t = useT();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Vendor | null>(null);

  const vendors = useQuery({
    queryKey: ['vendors'],
    queryFn: () => api.get<Vendor[]>('/vendors'),
  });

  const removeMut = useMutation({
    mutationFn: (id: string) => api.del(`/vendors/${id}`),
    onSuccess: () => {
      toast.success(t('vendors.deleted'));
      void qc.invalidateQueries({ queryKey: ['vendors'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t('vendors.title')}</h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            {t('vendors.count', { count: vendors.data?.length ?? 0 })}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" />
          {t('vendors.new')}
        </Button>
      </div>

      <div className="mt-6 rounded-xl border bg-[var(--color-card)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('common.code')}</TableHead>
              <TableHead>{t('common.name')}</TableHead>
              <TableHead>{t('vendors.email')}</TableHead>
              <TableHead>{t('vendors.phone')}</TableHead>
              <TableHead>{t('common.status')}</TableHead>
              <TableHead className="w-24 text-right">
                {t('common.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            )}
            {vendors.isError && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-[var(--color-destructive)]"
                >
                  {(vendors.error as Error).message}
                </TableCell>
              </TableRow>
            )}
            {vendors.data?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-[var(--color-muted-foreground)]"
                >
                  {t('vendors.empty')}
                </TableCell>
              </TableRow>
            )}
            {vendors.data?.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-mono text-xs">{v.code}</TableCell>
                <TableCell className="font-medium">{v.name}</TableCell>
                <TableCell>{v.email ?? '—'}</TableCell>
                <TableCell>{v.phone1 ?? '—'}</TableCell>
                <TableCell>
                  <span className="rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-xs">
                    {t(`status.${v.status}`)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditing(v);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm(t('common.confirmDelete', { name: v.name })))
                          removeMut.mutate(v.id);
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
        <VendorDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          editing={editing}
          onSaved={() => void qc.invalidateQueries({ queryKey: ['vendors'] })}
        />
      )}
    </div>
  );
}

function VendorDialog({
  open,
  onOpenChange,
  editing,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Vendor | null;
  onSaved: () => void;
}) {
  const t = useT();
  const [form, setForm] = React.useState({
    code: editing?.code ?? '',
    name: editing?.name ?? '',
    email: editing?.email ?? '',
    phone1: editing?.phone1 ?? '',
    taxId: editing?.taxId ?? '',
    status: editing?.status ?? 'ACTIVE',
  });

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const mut = useMutation({
    mutationFn: () => {
      const payload = {
        ...form,
        email: form.email || undefined,
        phone1: form.phone1 || undefined,
        taxId: form.taxId || undefined,
      };
      if (editing) return api.patch(`/vendors/${editing.id}`, payload);
      return api.post('/vendors', payload);
    },
    onSuccess: () => {
      toast.success(t(editing ? 'vendors.updated' : 'vendors.created'));
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
            {t(editing ? 'vendors.editTitle' : 'vendors.newTitle')}
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
          <Field label={t('vendors.email')}>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
            />
          </Field>
          <Field label={t('vendors.phone')}>
            <Input
              value={form.phone1}
              onChange={(e) => set('phone1', e.target.value)}
            />
          </Field>
          <Field label={t('vendors.taxId')}>
            <Input
              value={form.taxId}
              onChange={(e) => set('taxId', e.target.value)}
            />
          </Field>
          <Field label={t('common.status')}>
            <Select
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`status.${s}`)}
                </option>
              ))}
            </Select>
          </Field>
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
