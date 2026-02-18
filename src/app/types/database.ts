/**
 * Database types matching Supabase schema.
 * Use these for type-safe queries and inserts.
 */

export type UserRole = 'admin' | 'customer';

export type OrderStatus =
  | 'pending_payment'
  | 'payment_submitted'
  | 'confirmed'
  | 'shipped'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  id: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  sizes?: string[];
  colors?: string[];
  featured?: boolean;
}

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
}

export interface Payment {
  id: string;
  order_id: string;
  user_id: string;
  bank_name: string;
  amount: number;
  receipt_url: string | null;
  status: PaymentStatus;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

/** Product with optional relations for display */
export interface ProductWithDetails extends Product {
  reviews?: Review[];
  average_rating?: number;
  review_count?: number;
}

/** Order with items and payment for admin/customer views */
export interface OrderWithDetails extends Order {
  order_items?: (OrderItem & { product?: Product })[];
  payments?: Payment[];
}
