import { supabase } from './supabase';

const RECEIPTS_BUCKET = 'payment-receipts';

/**
 * Upload payment receipt to Supabase Storage.
 * Path: {userId}/{orderId}/{filename}
 * Returns the storage path to store in payments.receipt_url (or null on error).
 */
export async function uploadReceipt(
  userId: string,
  orderId: string,
  file: File
): Promise<{ path: string | null; error: Error | null }> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${userId}/${orderId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(RECEIPTS_BUCKET).upload(path, file, {
    upsert: false,
  });
  if (error) return { path: null, error: error as Error };
  return { path, error: null };
}

/**
 * Get a signed URL for viewing a receipt (for private bucket).
 * Valid for 1 hour.
 */
export async function getReceiptUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage.from(RECEIPTS_BUCKET).createSignedUrl(path, 3600);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}
