import { useState } from 'react';
import { useCart } from '../context/cart-context';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';

export function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('card');

  const shippingCost = totalPrice > 200 ? 0 : 15;
  const tax = totalPrice * 0.08;
  const total = totalPrice + shippingCost + tax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate order processing
    toast.success('Order placed successfully!');
    clearCart();
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 
        className="text-5xl mb-12 tracking-wide"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        Checkout
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact Information */}
            <div className="bg-card border border-border p-8">
              <h2 className="text-xl mb-6 tracking-wider">CONTACT INFORMATION</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    required 
                    placeholder="you@example.com"
                    className="bg-input-background"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    required 
                    placeholder="+1 (555) 000-0000"
                    className="bg-input-background"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-card border border-border p-8">
              <h2 className="text-xl mb-6 tracking-wider">SHIPPING ADDRESS</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      required 
                      className="bg-input-background"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      required 
                      className="bg-input-background"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Street Address</Label>
                  <Input 
                    id="address" 
                    required 
                    className="bg-input-background"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city" 
                      required 
                      className="bg-input-background"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input 
                      id="state" 
                      required 
                      className="bg-input-background"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input 
                      id="zip" 
                      required 
                      className="bg-input-background"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input 
                      id="country" 
                      required 
                      defaultValue="United States"
                      className="bg-input-background"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-card border border-border p-8">
              <h2 className="text-xl mb-6 tracking-wider">PAYMENT METHOD</h2>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 border border-border p-4 rounded">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex-1 cursor-pointer">
                      Credit / Debit Card
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 border border-border p-4 rounded">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                      PayPal
                    </Label>
                  </div>
                </div>
              </RadioGroup>

              {paymentMethod === 'card' && (
                <div className="mt-6 space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input 
                      id="cardNumber" 
                      required 
                      placeholder="1234 5678 9012 3456"
                      className="bg-input-background"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input 
                        id="expiry" 
                        required 
                        placeholder="MM/YY"
                        className="bg-input-background"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input 
                        id="cvv" 
                        required 
                        placeholder="123"
                        className="bg-input-background"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
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
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex justify-between text-sm">
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
                <span 
                  className="text-2xl"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  ${total.toFixed(2)}
                </span>
              </div>

              <Button 
                type="submit"
                size="lg" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground tracking-wider"
              >
                PLACE ORDER
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                By placing your order, you agree to our Terms & Conditions and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
