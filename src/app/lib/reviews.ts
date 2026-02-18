import { supabase } from './supabase';
import type { Review } from '../types/database';

export async function fetchReviewsByProductId(productId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data as Review[]) ?? [];
}

export async function fetchAverageRating(productId: string): Promise<{ avg: number; count: number }> {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', productId);
  if (error || !data?.length) return { avg: 0, count: 0 };
  const sum = (data as { rating: number }[]).reduce((s, r) => s + r.rating, 0);
  return { avg: sum / data.length, count: data.length };
}

/** Check if user has completed an order that includes this product */
export async function userCanReviewProduct(userId: string, productId: string): Promise<boolean> {
  const { data: orders } = await supabase
    .from('orders')
    .select('id')
    .eq('user_id', userId)
    .in('status', ['completed', 'shipped', 'confirmed', 'payment_submitted']);
  if (!orders?.length) return false;
  const { data: items } = await supabase
    .from('order_items')
    .select('order_id')
    .eq('product_id', productId)
    .in('order_id', orders.map((o) => o.id));
  return (items?.length ?? 0) > 0;
}

export async function submitReview(
  productId: string,
  userId: string,
  rating: number,
  comment: string | null
): Promise<{ error: Error | null }> {
  const { error } = await supabase.from('reviews').upsert(
    { product_id: productId, user_id: userId, rating, comment },
    { onConflict: 'product_id,user_id' }
  );
  return { error: error as Error | null };
}
