import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { ChevronLeft, Minus, Plus, Star } from 'lucide-react';
import { fetchProductById, fetchProducts } from '../lib/products';
import { products as staticProducts } from '../data/products';
import {
  fetchReviewsByProductId,
  fetchAverageRating,
  userCanReviewProduct,
  submitReview,
} from '../lib/reviews';
import { Button } from '../components/ui/button';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { useCart } from '../context/cart-context';
import { useAuth } from '../context/auth-context';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { toast } from 'sonner';
import { ProductCard } from '../components/product-card';
import type { Product, Review } from '../types/database';
import { format } from 'date-fns';

const defaultImage = 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&h=800&fit=crop';

export function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState({ avg: 0, count: 0 });
  const [canReview, setCanReview] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    Promise.all([
      fetchProductById(id),
      fetchReviewsByProductId(id),
      fetchAverageRating(id),
    ]).then(([p, revs, avg]) => {
      if (p) {
        setProduct(p);
        setSelectedSize((p.sizes ?? [])[0] ?? '');
        setSelectedColor((p.colors ?? [])[0] ?? '');
        fetchProducts().then((all) =>
          setRelatedProducts(all.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 3))
        );
      } else {
        const fallback = staticProducts.find((x) => x.id === id) as Product | undefined;
        if (fallback) {
          setProduct(fallback);
          setSelectedSize((fallback.sizes ?? [])[0] ?? '');
          setSelectedColor((fallback.colors ?? [])[0] ?? '');
          setRelatedProducts(
            staticProducts.filter((x) => x.category === fallback.category && x.id !== id) as Product[]
          );
        }
      }
      setReviews(revs);
      setAverageRating(avg);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (user && product) {
      userCanReviewProduct(user.id, product.id).then(setCanReview);
    } else {
      setCanReview(false);
    }
  }, [user, product]);

  const handleAddToCart = () => {
    if (!product) return;
    const sizes = product.sizes ?? [];
    const colors = product.colors ?? [];
    if (sizes.length > 1 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    if (colors.length > 1 && !selectedColor) {
      toast.error('Please select a color');
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.images?.[0] || defaultImage,
      size: selectedSize || sizes[0],
      color: selectedColor || colors[0],
    });
    toast.success('Added to cart');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product || reviewRating < 1) return;
    setSubmittingReview(true);
    const { error } = await submitReview(product.id, user.id, reviewRating, reviewComment || null);
    setSubmittingReview(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Review submitted');
    setReviewRating(0);
    setReviewComment('');
    const [revs, avg] = await Promise.all([
      fetchReviewsByProductId(product.id),
      fetchAverageRating(product.id),
    ]);
    setReviews(revs);
    setAverageRating(avg);
  };

  if (loading && !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-8 w-32 bg-muted animate-pulse rounded mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-[3/4] bg-muted animate-pulse rounded" />
          <div className="space-y-4">
            <div className="h-10 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-8 bg-muted animate-pulse rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-muted-foreground">Product not found</p>
        <Link to="/shop" className="text-accent hover:underline mt-2 inline-block">
          Return to shop
        </Link>
      </div>
    );
  }

  const productImages =
    product.images?.length > 0
      ? product.images
      : [defaultImage, 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=1000&fit=crop', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=1000&fit=crop'];
  const sizes = product.sizes ?? [];
  const colors = product.colors ?? [];

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/shop"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-accent transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Shop
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-[3/4] bg-muted overflow-hidden">
              <ImageWithFallback
                src={productImages[selectedImage] ?? defaultImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {productImages.map((img, index) => (
                <button
                  key={index}
                  type="button"
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

          <div className="space-y-8">
            <div>
              <p className="text-sm text-muted-foreground tracking-wide mb-2">{product.category}</p>
              <h1 className="text-4xl mb-4 tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>
                {product.name}
              </h1>
              <p className="text-3xl mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
                ${Number(product.price).toFixed(2)}
              </p>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            {colors.length > 1 && (
              <div>
                <Label className="text-sm tracking-wider mb-3 block">
                  COLOR: {selectedColor && <span className="text-muted-foreground">{selectedColor}</span>}
                </Label>
                <RadioGroup value={selectedColor} onValueChange={setSelectedColor}>
                  <div className="flex gap-3">
                    {colors.map((color) => (
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

            {sizes.length > 1 && (
              <div>
                <Label className="text-sm tracking-wider mb-3 block">
                  SIZE: {selectedSize && <span className="text-muted-foreground">{selectedSize}</span>}
                </Label>
                <RadioGroup value={selectedSize} onValueChange={setSelectedSize}>
                  <div className="flex gap-3 flex-wrap">
                    {sizes.map((size) => (
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
                <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground tracking-wider"
              onClick={handleAddToCart}
            >
              ADD TO CART
            </Button>

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

      {/* Reviews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-border">
        <h2 className="text-2xl tracking-wide mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
          Reviews
        </h2>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(averageRating.avg)
                    ? 'fill-accent text-accent'
                    : 'text-muted-foreground'
                }`}
              />
            ))}
          </div>
          <span className="text-muted-foreground text-sm">
            {averageRating.avg > 0 ? `${averageRating.avg.toFixed(1)} (${averageRating.count} reviews)` : 'No reviews yet'}
          </span>
        </div>
        {reviews.length > 0 && (
          <ul className="space-y-4 mb-8">
            {reviews.map((r) => (
              <li key={r.id} className="border-b border-border pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${s <= r.rating ? 'fill-accent text-accent' : 'text-muted-foreground'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(r.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
                {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
              </li>
            ))}
          </ul>
        )}
        {user && canReview && (
          <form onSubmit={handleSubmitReview} className="space-y-4 max-w-md">
            <div>
              <Label>Your rating</Label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= reviewRating ? 'fill-accent text-accent' : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="review-comment">Comment (optional)</Label>
              <Textarea
                id="review-comment"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
                className="mt-2 bg-input-background"
              />
            </div>
            <Button type="submit" disabled={submittingReview || reviewRating < 1}>
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </Button>
          </form>
        )}
        {user && !canReview && reviews.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Complete a purchase of this product to leave a review.
          </p>
        )}
      </section>

      {relatedProducts.length > 0 && (
        <section className="bg-muted py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl mb-12 tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
