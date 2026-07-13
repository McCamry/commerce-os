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

interface Unit {
  id: string;
  code: string;
  name: string;
  symbol: string;
  status: string;
}

const STATUSES = ['ACTIVE', 'INACTIVE'];

export default function UnitsPage() {
  const t = useT();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Unit | null>(null);

  const units = useQuery({
    queryKey: ['units'],
    queryFn: () => api.get<Unit[]>('/units'),
  });

  const removeMut = useMutation({
    mutationFn: (id: string) => api.del(`/units/${id}`),
    onSuccess: () => {
      toast.success(t('units.deleted'));
      void qc.invalidateQueries({ queryKey: ['units'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t('units.title')}</h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            {t('units.count', { count: units.data?.length ?? 0 })}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" />
          {t('units.new')}
        </Button>
      </div>

      <div className="mt-6 rounded-xl border bg-[var(--color-card)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('common.code')}</TableHead>
              <TableHead>{t('common.name')}</TableHead>
              <TableHead>{t('units.symbol')}</TableHead>
              <TableHead>{t('common.status')}</TableHead>
              <TableHead className="w-24 text-right">
                {t('common.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            )}
            {units.isError && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-[var(--color-destructive)]"
                >
                  {(units.error as Error).message}
                </TableCell>
              </TableRow>
            )}
            {units.data?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-[var(--color-muted-foreground)]"
                >
                  {t('units.empty')}
                </TableCell>
              </TableRow>
            )}
            {units.data?.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-mono text-xs">{u.code}</TableCell>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>{u.symbol}</TableCell>
                <TableCell>
                  <span className="rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-xs">
                    {t(`status.${u.status}`)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditing(u);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm(t('common.confirmDelete', { name: u.name })))
                          removeMut.mutate(u.id);
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
        <UnitDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          editing={editing}
          onSaved={() => void qc.invalidateQueries({ queryKey: ['units'] })}
        />
      )}
    </div>
  );
}

function UnitDialog({
  open,
  onOpenChange,
  editing,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Unit | null;
  onSaved: () => void;
}) {
  const t = useT();
  const [form, setForm] = React.useState({
    code: editing?.code ?? '',
    name: editing?.name ?? '',
    symbol: editing?.symbol ?? '',
    status: editing?.status ?? 'ACTIVE',
  });

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const mut = useMutation({
    mutationFn: () => {
      if (editing) return api.patch(`/units/${editing.id}`, form);
      return api.post('/units', form);
    },
    onSuccess: () => {
      toast.success(t(editing ? 'units.updated' : 'units.created'));
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
            {t(editing ? 'units.editTitle' : 'units.newTitle')}
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
          <Field label={t('units.symbol')}>
            <Input
              value={form.symbol}
              onChange={(e) => set('symbol', e.target.value)}
              required
            />
          </Field>
          <Field label={t('common.name')} full>
            <Input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              required
            />
          </Field>
          <Field label={t('common.status')} full>
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
