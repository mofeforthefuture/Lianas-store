import { supabase } from './supabase';
import type { Product } from '../types/database';

/**
 * Fetch all active products from Supabase.
 * Returns empty array if Supabase is not configured or query fails.
 */
export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('fetchProducts:', error.message);
    return [];
  }
  return (data as Product[]) ?? [];
}

/**
 * Fetch a single product by id.
 */
export async function fetchProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();
  if (error || !data) return null;
  return data as Product;
}

/**
 * Fetch featured products (for homepage).
 */
export async function fetchFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(6);
  if (error) {
    console.warn('fetchFeaturedProducts:', error.message);
    return [];
  }
  return (data as Product[]) ?? [];
}
