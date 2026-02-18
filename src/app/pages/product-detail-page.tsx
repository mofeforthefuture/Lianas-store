import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { ChevronLeft, Minus, Plus } from 'lucide-react';
import { products } from '../data/products';
import { Button } from '../components/ui/button';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { useCart } from '../context/cart-context';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { toast } from 'sonner';
import { ProductCard } from '../components/product-card';

export function ProductDetailPage() {
  const { id } = useParams();
  const product = products.find(p => p.id === id);
  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p>Product not found</p>
        <Link to="/shop" className="text-accent hover:underline">
          Return to shop
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product.sizes.length > 1 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    if (product.colors.length > 1 && !selectedColor) {
      toast.error('Please select a color');
      return;
    }

    const defaultImage = `https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&h=800&fit=crop`;
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || defaultImage,
      size: selectedSize || product.sizes[0],
      color: selectedColor || product.colors[0],
    });

    toast.success('Added to cart');
  };

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  // Generate placeholder images
  const productImages = [
    `https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=1000&fit=crop`,
    `https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=1000&fit=crop`,
    `https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=1000&fit=crop`,
  ];

  return (
    <div className="w-full">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link 
          to="/shop" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-accent transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Shop
        </Link>
      </div>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-[3/4] bg-muted overflow-hidden">
              <ImageWithFallback
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-3 gap-4">
              {productImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-[3/4] bg-muted overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <ImageWithFallback
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div>
              <p className="text-sm text-muted-foreground tracking-wide mb-2">
                {product.category}
              </p>
              <h1 
                className="text-4xl mb-4 tracking-wide"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {product.name}
              </h1>
              <p 
                className="text-3xl mb-6"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                ${product.price}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Color Selection */}
            {product.colors.length > 1 && (
              <div>
                <Label className="text-sm tracking-wider mb-3 block">
                  COLOR: {selectedColor && <span className="text-muted-foreground">{selectedColor}</span>}
                </Label>
                <RadioGroup value={selectedColor} onValueChange={setSelectedColor}>
                  <div className="flex gap-3">
                    {product.colors.map(color => (
                      <div key={color} className="flex items-center">
                        <RadioGroupItem value={color} id={`color-${color}`} className="peer sr-only" />
                        <Label
                          htmlFor={`color-${color}`}
                          className="px-6 py-2 border border-border cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-white transition-colors"
                        >
                          {color}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes.length > 1 && (
              <div>
                <Label className="text-sm tracking-wider mb-3 block">
                  SIZE: {selectedSize && <span className="text-muted-foreground">{selectedSize}</span>}
                </Label>
                <RadioGroup value={selectedSize} onValueChange={setSelectedSize}>
                  <div className="flex gap-3 flex-wrap">
                    {product.sizes.map(size => (
                      <div key={size} className="flex items-center">
                        <RadioGroupItem value={size} id={`size-${size}`} className="peer sr-only" />
                        <Label
                          htmlFor={`size-${size}`}
                          className="px-6 py-2 border border-border cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-white transition-colors"
                        >
                          {size}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Quantity */}
            <div>
              <Label className="text-sm tracking-wider mb-3 block">QUANTITY</Label>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button 
              size="lg" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground tracking-wider"
              onClick={handleAddToCart}
            >
              ADD TO CART
            </Button>

            {/* Product Details */}
            <div className="border-t border-border pt-8 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Free Shipping</span>
                <span>On orders over $200</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Returns</span>
                <span>30-day return policy</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span>3-5 business days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="bg-muted py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 
              className="text-3xl mb-12 tracking-wide"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {relatedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
