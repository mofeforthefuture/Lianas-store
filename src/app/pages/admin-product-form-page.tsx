import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { supabase } from '../lib/supabase';
import type { Product } from '../types/database';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';

const defaultProduct: Partial<Product> = {
  name: '',
  description: '',
  price: 0,
  category: 'Clothing',
  images: [],
  stock_quantity: 0,
  is_active: true,
  sizes: [],
  colors: [],
  featured: false,
};

export function AdminProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Product>>(defaultProduct);

  useEffect(() => {
    if (isNew) {
      setForm(defaultProduct);
      setLoading(false);
      return;
    }
    async function load() {
      const { data, error } = await supabase.from('products').select('*').eq('id', id!).single();
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }
      setForm(data as Product);
      setLoading(false);
    }
    load();
  }, [id, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      category: form.category,
      images: form.images ?? [],
      stock_quantity: Number(form.stock_quantity) || 0,
      is_active: form.is_active ?? true,
      sizes: form.sizes ?? [],
      colors: form.colors ?? [],
      featured: form.featured ?? false,
    };

    if (isNew) {
      const { data, error } = await supabase.from('products').insert(payload).select('id').single();
      if (error) {
        toast.error(error.message);
        setSaving(false);
        return;
      }
      toast.success('Product created');
      navigate(`/admin/products/${(data as { id: string }).id}`);
    } else {
      const { error } = await supabase.from('products').update(payload).eq('id', id);
      if (error) {
        toast.error(error.message);
        setSaving(false);
        return;
      }
      toast.success('Product updated');
    }
    setForm((prev) => ({ ...prev, ...payload }));
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="max-w-2xl">
        <div className="h-8 w-48 bg-muted animate-pulse rounded mb-6" />
        <div className="h-96 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        to="/admin/products"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to products
      </Link>
      <h1 className="text-2xl tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>
        {isNew ? 'New Product' : 'Edit Product'}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={form.name ?? ''}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            required
            className="mt-2 bg-input-background"
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={form.description ?? ''}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            required
            rows={4}
            className="mt-2 bg-input-background"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, price: e.target.value as unknown as number }))}
              required
              className="mt-2 bg-input-background"
            />
          </div>
          <div>
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              value={form.stock_quantity ?? ''}
              onChange={(e) =>
                setForm((p) => ({ ...p, stock_quantity: e.target.value as unknown as number }))
              }
              className="mt-2 bg-input-background"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={form.category ?? ''}
            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
            required
            className="mt-2 bg-input-background"
          />
        </div>
        <div>
          <Label>Images (one URL per line)</Label>
          <Textarea
            value={(form.images ?? []).join('\n')}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                images: e.target.value.split('\n').filter(Boolean),
              }))
            }
            rows={3}
            placeholder="https://..."
            className="mt-2 bg-input-background"
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active ?? true}
              onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
              className="rounded border-border"
            />
            <span className="text-sm">Active</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured ?? false}
              onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))}
              className="rounded border-border"
            />
            <span className="text-sm">Featured</span>
          </label>
        </div>
        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : isNew ? 'Create Product' : 'Save Changes'}
          </Button>
          <Link to="/admin/products">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
