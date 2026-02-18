import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useCart } from '../context/cart-context';
import { useAuth } from '../context/auth-context';
import { createOrder, BANK_DISPLAY, createPaymentRecord, updateOrderStatus } from '../lib/orders';
import { uploadReceipt } from '../lib/storage';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Link } from 'react-router';

export function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'payment'>('form');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bankName, setBankName] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const shippingCost = totalPrice > 200 ? 0 : 15;
  const tax = totalPrice * 0.08;
  const total = totalPrice + shippingCost + tax;

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          Sign in to checkout
        </h1>
        <p className="text-muted-foreground mb-6">
          Create an account or sign in to place your order.
        </p>
        <Link to="/login">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  if (items.length === 0 && step === 'form') {
    navigate('/cart');
    return null;
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const orderItems = items.map((item) => ({
      product_id: item.id,
      quantity: item.quantity,
      price_at_purchase: item.price,
    }));
    const { orderId: id, error } = await createOrder(user.id, orderItems, total);
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setOrderId(id!);
    setStep('payment');
  };

  const handleUploadReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !orderId || !receiptFile) {
      toast.error('Please select a receipt image');
      return;
    }
    setUploading(true);
    const { path, error: uploadError } = await uploadReceipt(user.id, orderId, receiptFile);
    if (uploadError) {
      toast.error(uploadError.message);
      setUploading(false);
      return;
    }
    const { error: paymentError } = await createPaymentRecord(
      orderId,
      user.id,
      total,
      bankName || 'Bank Transfer',
      path
    );
    if (paymentError) {
      toast.error(paymentError.message);
      setUploading(false);
      return;
    }
    await updateOrderStatus(orderId, 'payment_submitted');
    toast.success('Receipt uploaded. We will confirm your payment shortly.');
    clearCart();
    setUploading(false);
    navigate('/');
  };

  if (step === 'payment' && orderId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl mb-2 tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>
          Order placed
        </h1>
        <p className="text-muted-foreground mb-8">
          Order ID: <span className="font-mono">{orderId.slice(0, 8)}…</span>
        </p>
        <div className="bg-card border border-border p-8 mb-8">
          <h2 className="text-lg tracking-wider mb-4">BANK TRANSFER DETAILS</h2>
          <p className="whitespace-pre-wrap text-muted-foreground text-sm mb-4">
            {BANK_DISPLAY.message}
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Amount to pay: </span>
            <span className="font-medium">${total.toFixed(2)}</span>
          </p>
        </div>
        <form onSubmit={handleUploadReceipt} className="space-y-6">
          <div>
            <Label htmlFor="bankName">Bank name (optional)</Label>
            <Input
              id="bankName"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g. Chase, Wells Fargo"
              className="mt-2 bg-input-background"
            />
          </div>
          <div>
            <Label>Upload payment receipt</Label>
            <Input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
              className="mt-2"
            />
          </div>
          <Button type="submit" disabled={!receiptFile || uploading}>
            {uploading ? 'Uploading...' : 'Submit receipt'}
          </Button>
        </form>
        <p className="mt-6 text-sm text-muted-foreground">
          You can also upload your receipt later from your account.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1
        className="text-5xl mb-12 tracking-wide"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        Checkout
      </h1>

      <form onSubmit={handlePlaceOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card border border-border p-8">
              <h2 className="text-xl mb-6 tracking-wider">CONTACT</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    defaultValue={user.email}
                    className="mt-2 bg-input-background"
                    readOnly
                  />
                </div>
              </div>
            </div>
            <div className="bg-card border border-border p-8">
              <h2 className="text-xl mb-6 tracking-wider">SHIPPING ADDRESS</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Street Address</Label>
                  <Input id="address" required className="mt-2 bg-input-background" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" required className="mt-2 bg-input-background" />
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input id="zip" required className="mt-2 bg-input-background" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card border border-border p-8 sticky top-24">
              <h2
                className="text-2xl mb-6 tracking-wide"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Order Summary
              </h2>
              <div className="space-y-4 mb-6 pb-6 border-b border-border">
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.size}-${item.color}`}
                    className="flex justify-between text-sm"
                  >
                    <div className="flex-1">
                      <p>{item.name}</p>
                      <p className="text-muted-foreground text-xs">
                        Qty: {item.quantity}
                        {item.size && ` • ${item.size}`}
                        {item.color && ` • ${item.color}`}
                      </p>
                    </div>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3 mb-6 pb-6 border-b border-border text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between mb-8">
                <span className="tracking-wider">TOTAL</span>
                <span className="text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>
                  ${total.toFixed(2)}
                </span>
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground tracking-wider"
                disabled={loading}
              >
                {loading ? 'Placing order...' : 'Place order (bank transfer)'}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-4">
                You will be shown bank details after placing your order.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
