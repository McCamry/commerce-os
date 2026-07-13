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

interface Product {
  id: string;
  code: string;
  name: string;
  slug: string;
  sku: string | null;
  status: string;
  categoryId: string;
  unitId: string;
  description: string | null;
}
interface Named {
  id: string;
  name: string;
}

const STATUSES = ['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function ProductsPage() {
  const t = useT();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Product | null>(null);

  const products = useQuery({
    queryKey: ['products'],
    queryFn: () => api.get<Product[]>('/products'),
  });
  const categories = useQuery({
    queryKey: ['product-categories'],
    queryFn: () => api.get<Named[]>('/product-categories'),
  });
  const units = useQuery({
    queryKey: ['units'],
    queryFn: () => api.get<Named[]>('/units'),
  });

  const categoryName = (id: string) =>
    categories.data?.find((c) => c.id === id)?.name ?? '—';

  const removeMut = useMutation({
    mutationFn: (id: string) => api.del(`/products/${id}`),
    onSuccess: () => {
      toast.success(t('products.deleted'));
      void qc.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t('products.title')}</h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            {t('products.count', { count: products.data?.length ?? 0 })}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" />
          {t('products.new')}
        </Button>
      </div>

      <div className="mt-6 rounded-xl border bg-[var(--color-card)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('products.code')}</TableHead>
              <TableHead>{t('products.name')}</TableHead>
              <TableHead>{t('products.category')}</TableHead>
              <TableHead>{t('products.status')}</TableHead>
              <TableHead className="w-24 text-right">
                {t('common.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            )}
            {products.isError && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-[var(--color-destructive)]"
                >
                  {(products.error as Error).message}
                </TableCell>
              </TableRow>
            )}
            {products.data?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-[var(--color-muted-foreground)]"
                >
                  {t('products.empty')}
                </TableCell>
              </TableRow>
            )}
            {products.data?.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs">{p.code}</TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>{categoryName(p.categoryId)}</TableCell>
                <TableCell>
                  <span className="rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-xs">
                    {t(`status.${p.status}`)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditing(p);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm(t('common.confirmDelete', { name: p.name })))
                          removeMut.mutate(p.id);
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
        <ProductDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          editing={editing}
          categories={categories.data ?? []}
          units={units.data ?? []}
          onSaved={() => void qc.invalidateQueries({ queryKey: ['products'] })}
        />
      )}
    </div>
  );
}

function ProductDialog({
  open,
  onOpenChange,
  editing,
  categories,
  units,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Product | null;
  categories: Named[];
  units: Named[];
  onSaved: () => void;
}) {
  const t = useT();
  const [form, setForm] = React.useState({
    code: editing?.code ?? '',
    name: editing?.name ?? '',
    slug: editing?.slug ?? '',
    sku: editing?.sku ?? '',
    description: editing?.description ?? '',
    categoryId: editing?.categoryId ?? categories[0]?.id ?? '',
    unitId: editing?.unitId ?? units[0]?.id ?? '',
    status: editing?.status ?? 'DRAFT',
  });

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const mut = useMutation({
    mutationFn: () => {
      const payload = {
        ...form,
        slug: form.slug || slugify(form.name),
        sku: form.sku || undefined,
        description: form.description || undefined,
      };
      if (editing) return api.patch(`/products/${editing.id}`, payload);
      return api.post('/products', payload);
    },
    onSuccess: () => {
      toast.success(t(editing ? 'products.updated' : 'products.created'));
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
            {t(editing ? 'products.editTitle' : 'products.newTitle')}
          </DialogTitle>
        </DialogHeader>
        <form
          className="grid grid-cols-2 gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            mut.mutate();
          }}
        >
          <Field label={t('products.code')}>
            <Input
              value={form.code}
              onChange={(e) => set('code', e.target.value)}
              required
            />
          </Field>
          <Field label={t('products.sku')}>
            <Input
              value={form.sku}
              onChange={(e) => set('sku', e.target.value)}
            />
          </Field>
          <Field label={t('products.name')} full>
            <Input
              value={form.name}
              onChange={(e) => {
                set('name', e.target.value);
                if (!editing && !form.slug) set('slug', slugify(e.target.value));
              }}
              required
            />
          </Field>
          <Field label={t('products.slug')} full>
            <Input
              value={form.slug}
              onChange={(e) => set('slug', e.target.value)}
              placeholder={t('products.slugAuto')}
            />
          </Field>
          <Field label={t('products.category')}>
            <Select
              value={form.categoryId}
              onChange={(e) => set('categoryId', e.target.value)}
              required
            >
              <option value="">{t('common.select')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t('products.unit')}>
            <Select
              value={form.unitId}
              onChange={(e) => set('unitId', e.target.value)}
              required
            >
              <option value="">{t('common.select')}</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t('products.status')} full>
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
