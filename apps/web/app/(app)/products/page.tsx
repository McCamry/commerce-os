'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
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
  const { orgId } = useAuth();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Product | null>(null);

  const products = useQuery({
    queryKey: ['products', orgId],
    enabled: !!orgId,
    queryFn: () => api.get<Product[]>(`/products?organizationId=${orgId}`),
  });
  const categories = useQuery({
    queryKey: ['product-categories', orgId],
    enabled: !!orgId,
    queryFn: () =>
      api.get<Named[]>(`/product-categories?organizationId=${orgId}`),
  });
  const units = useQuery({
    queryKey: ['units', orgId],
    enabled: !!orgId,
    queryFn: () => api.get<Named[]>(`/units?organizationId=${orgId}`),
  });

  const categoryName = (id: string) =>
    categories.data?.find((c) => c.id === id)?.name ?? '—';

  const removeMut = useMutation({
    mutationFn: (id: string) => api.del(`/products/${id}`),
    onSuccess: () => {
      toast.success('Product deleted');
      void qc.invalidateQueries({ queryKey: ['products', orgId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(p: Product) {
    setEditing(p);
    setDialogOpen(true);
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            {products.data?.length ?? 0} product(s)
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          New product
        </Button>
      </div>

      <div className="mt-6 rounded-xl border bg-[var(--color-card)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center">
                  Loading…
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
                  No products yet. Create one.
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
                    {p.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(p)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm(`Delete "${p.name}"?`))
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
          orgId={orgId}
          categories={categories.data ?? []}
          units={units.data ?? []}
          onSaved={() =>
            void qc.invalidateQueries({ queryKey: ['products', orgId] })
          }
        />
      )}
    </div>
  );
}

function ProductDialog({
  open,
  onOpenChange,
  editing,
  orgId,
  categories,
  units,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Product | null;
  orgId: string | null;
  categories: Named[];
  units: Named[];
  onSaved: () => void;
}) {
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
      return api.post('/products', { organizationId: orgId, ...payload });
    },
    onSuccess: () => {
      toast.success(editing ? 'Product updated' : 'Product created');
      onSaved();
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit product' : 'New product'}</DialogTitle>
        </DialogHeader>
        <form
          className="grid grid-cols-2 gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            mut.mutate();
          }}
        >
          <Field label="Code">
            <Input
              value={form.code}
              onChange={(e) => set('code', e.target.value)}
              required
            />
          </Field>
          <Field label="SKU">
            <Input
              value={form.sku}
              onChange={(e) => set('sku', e.target.value)}
            />
          </Field>
          <Field label="Name" full>
            <Input
              value={form.name}
              onChange={(e) => {
                set('name', e.target.value);
                if (!editing && !form.slug) set('slug', slugify(e.target.value));
              }}
              required
            />
          </Field>
          <Field label="Slug" full>
            <Input
              value={form.slug}
              onChange={(e) => set('slug', e.target.value)}
              placeholder="auto from name"
            />
          </Field>
          <Field label="Category">
            <Select
              value={form.categoryId}
              onChange={(e) => set('categoryId', e.target.value)}
              required
            >
              <option value="">Select…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Unit">
            <Select
              value={form.unitId}
              onChange={(e) => set('unitId', e.target.value)}
              required
            >
              <option value="">Select…</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status" full>
            <Select
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
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
              Cancel
            </Button>
            <Button type="submit" disabled={mut.isPending}>
              {mut.isPending ? 'Saving…' : 'Save'}
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
