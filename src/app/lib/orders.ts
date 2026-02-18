import { supabase } from './supabase';
import type { Order, OrderStatus } from '../types/database';

const BANK_NAME = 'LUXE Commerce Bank';
const BANK_ACCOUNT = 'XXXX XXXX 1234 5678';
const ROUTING = '021000021';
const BANK_DETAILS_MESSAGE = `Please transfer the order total to:\n\nBank: ${BANK_NAME}\nAccount: ${BANK_ACCOUNT}\nRouting: ${ROUTING}\n\nReference: Your order ID (shown after placing order).`;

export const BANK_DISPLAY = {
  name: BANK_NAME,
  account: BANK_ACCOUNT,
  routing: ROUTING,
  message: BANK_DETAILS_MESSAGE,
};

export async function createOrder(
  userId: string,
  items: { product_id: string; quantity: number; price_at_purchase: number }[],
  totalAmount: number
): Promise<{ orderId: string | null; error: Error | null }> {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      status: 'pending_payment',
      total_amount: totalAmount,
    })
    .select('id')
    .single();
  if (orderError || !order) return { orderId: null, error: orderError as Error };

  const orderItems = items.map((item) => ({
    order_id: (order as { id: string }).id,
    product_id: item.product_id,
    quantity: item.quantity,
    price_at_purchase: item.price_at_purchase,
  }));
  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) return { orderId: null, error: itemsError as Error };

  return { orderId: (order as { id: string }).id, error: null };
}

export async function fetchOrdersByUser(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data as Order[]) ?? [];
}

export async function createPaymentRecord(
  orderId: string,
  userId: string,
  amount: number,
  bankName: string,
  receiptUrl: string | null
): Promise<{ error: Error | null }> {
  const { error } = await supabase.from('payments').insert({
    order_id: orderId,
    user_id: userId,
    bank_name: bankName,
    amount,
    receipt_url: receiptUrl,
    status: 'pending',
  });
  return { error: error as Error | null };
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<{ error: Error | null }> {
  const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
  return { error: error as Error | null };
}
