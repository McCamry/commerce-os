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

interface Category {
  id: string;
  code: string;
  name: string;
  parentId: string | null;
  description: string | null;
  status: string;
}

const STATUSES = ['ACTIVE', 'INACTIVE'];

export default function CategoriesPage() {
  const t = useT();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Category | null>(null);

  const categories = useQuery({
    queryKey: ['product-categories'],
    queryFn: () => api.get<Category[]>('/product-categories'),
  });

  const parentName = (id: string | null) =>
    id ? (categories.data?.find((c) => c.id === id)?.name ?? '—') : '—';

  const removeMut = useMutation({
    mutationFn: (id: string) => api.del(`/product-categories/${id}`),
    onSuccess: () => {
      toast.success(t('categories.deleted'));
      void qc.invalidateQueries({ queryKey: ['product-categories'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t('categories.title')}</h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            {t('categories.count', { count: categories.data?.length ?? 0 })}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" />
          {t('categories.new')}
        </Button>
      </div>

      <div className="mt-6 rounded-xl border bg-[var(--color-card)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('common.code')}</TableHead>
              <TableHead>{t('common.name')}</TableHead>
              <TableHead>{t('categories.parent')}</TableHead>
              <TableHead>{t('common.status')}</TableHead>
              <TableHead className="w-24 text-right">
                {t('common.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            )}
            {categories.isError && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-[var(--color-destructive)]"
                >
                  {(categories.error as Error).message}
                </TableCell>
              </TableRow>
            )}
            {categories.data?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-[var(--color-muted-foreground)]"
                >
                  {t('categories.empty')}
                </TableCell>
              </TableRow>
            )}
            {categories.data?.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono text-xs">{c.code}</TableCell>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{parentName(c.parentId)}</TableCell>
                <TableCell>
                  <span className="rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-xs">
                    {t(`status.${c.status}`)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditing(c);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm(t('common.confirmDelete', { name: c.name })))
                          removeMut.mutate(c.id);
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
        <CategoryDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          editing={editing}
          categories={categories.data ?? []}
          onSaved={() =>
            void qc.invalidateQueries({ queryKey: ['product-categories'] })
          }
        />
      )}
    </div>
  );
}

function CategoryDialog({
  open,
  onOpenChange,
  editing,
  categories,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Category | null;
  categories: Category[];
  onSaved: () => void;
}) {
  const t = useT();
  const [form, setForm] = React.useState({
    code: editing?.code ?? '',
    name: editing?.name ?? '',
    parentId: editing?.parentId ?? '',
    description: editing?.description ?? '',
    status: editing?.status ?? 'ACTIVE',
  });

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  // A category cannot be its own parent.
  const parentOptions = categories.filter((c) => c.id !== editing?.id);

  const mut = useMutation({
    mutationFn: () => {
      const payload = {
        ...form,
        parentId: form.parentId || undefined,
        description: form.description || undefined,
      };
      if (editing)
        return api.patch(`/product-categories/${editing.id}`, payload);
      return api.post('/product-categories', payload);
    },
    onSuccess: () => {
      toast.success(t(editing ? 'categories.updated' : 'categories.created'));
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
            {t(editing ? 'categories.editTitle' : 'categories.newTitle')}
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
          <Field label={t('categories.parent')} full>
            <Select
              value={form.parentId}
              onChange={(e) => set('parentId', e.target.value)}
            >
              <option value="">{t('categories.noParent')}</option>
              {parentOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
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
