import { Link } from 'react-router';
import { Minus, Plus, X } from 'lucide-react';
import { useCart } from '../context/cart-context';
import { Button } from '../components/ui/button';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function CartPage() {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center py-20">
          <h1 
            className="text-4xl mb-4 tracking-wide"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Your Cart is Empty
          </h1>
          <p className="text-muted-foreground mb-8">
            Start shopping to add items to your cart
          </p>
          <Link to="/shop">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 tracking-wider">
              CONTINUE SHOPPING
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const shippingCost = totalPrice > 200 ? 0 : 15;
  const tax = totalPrice * 0.08;
  const total = totalPrice + shippingCost + tax;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 
        className="text-5xl mb-12 tracking-wide"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-6 pb-6 border-b border-border">
              {/* Product Image */}
              <div className="w-32 h-40 bg-muted overflow-hidden flex-shrink-0">
                <ImageWithFallback
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Product Details */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="mb-1">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.color && `${item.color}`}
                        {item.color && item.size && ' • '}
                        {item.size && `Size ${item.size}`}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(`${item.id}-${item.size}-${item.color}`)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p 
                    className="text-lg"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    ${item.price}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(`${item.id}-${item.size}-${item.color}`, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(`${item.id}-${item.size}-${item.color}`, item.quantity + 1)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Item Total */}
              <div className="text-right">
                <p 
                  className="text-lg"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
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
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm">
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

            <Link to="/checkout">
              <Button 
                size="lg" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground tracking-wider mb-4"
              >
                PROCEED TO CHECKOUT
              </Button>
            </Link>

            <Link to="/shop">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full tracking-wider"
              >
                CONTINUE SHOPPING
              </Button>
            </Link>

            {totalPrice < 200 && (
              <p className="text-xs text-muted-foreground text-center mt-4">
                Add ${(200 - totalPrice).toFixed(2)} more for free shipping
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
