import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { ProductCard } from '../components/product-card';
import { fetchFeaturedProducts } from '../lib/products';
import { products as staticProducts } from '../data/products';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import type { Product } from '../types/database';

export function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts().then((data) => {
      setFeaturedProducts(data.length > 0 ? data : staticProducts.filter((p) => p.featured) as Product[]);
      setLoading(false);
    });
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1762423656649-24aaf046402e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBmYXNoaW9uJTIwbWluaW1hbGlzdCUyMGludGVyaW9yfGVufDF8fHx8MTc3MTQ0MzQzN3ww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <motion.div 
          className="relative z-10 text-center text-white px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 
            className="text-5xl md:text-7xl mb-6 tracking-wide"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Timeless Elegance
          </h1>
          <p className="text-lg md:text-xl mb-8 tracking-wide max-w-2xl mx-auto">
            Discover our curated collection of premium lifestyle essentials
          </p>
          <Link to="/shop">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 px-12 tracking-wider"
            >
              SHOP NOW
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 
              className="text-4xl mb-4 tracking-wide"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Featured Collection
            </h2>
            <p className="text-muted-foreground tracking-wide">
              Handpicked pieces for the discerning individual
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/shop">
              <Button 
                variant="outline" 
                size="lg"
                className="border-primary text-primary hover:bg-primary hover:text-white px-12 tracking-wider"
              >
                VIEW ALL PRODUCTS
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Categories Section */}
      <section className="bg-muted py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link to="/shop?category=Clothing" className="group">
              <div className="relative aspect-[4/5] overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1687275155477-b19c176ce9d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwY2FzaG1lcmUlMjBzd2VhdGVyJTIwbmV1dHJhbHxlbnwxfHx8fDE3NzE0NDM0Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Clothing"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 
                    className="text-white text-3xl tracking-wider"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    CLOTHING
                  </h3>
                </div>
              </div>
            </Link>

            <Link to="/shop?category=Accessories" className="group">
              <div className="relative aspect-[4/5] overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1598099947145-e85739e7ca28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwbGVhdGhlciUyMGhhbmRiYWd8ZW58MXx8fHwxNzcxNDQzNDQwfDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Accessories"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 
                    className="text-white text-3xl tracking-wider"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    ACCESSORIES
                  </h3>
                </div>
              </div>
            </Link>

            <Link to="/shop?category=Footwear" className="group">
              <div className="relative aspect-[4/5] overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1764265148862-7ee72a4fb367?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaWxrJTIwZHJlc3MlMjBlbGVnYW50fGVufDF8fHx8MTc3MTQwMjYyNnww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Footwear"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 
                    className="text-white text-3xl tracking-wider"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    FOOTWEAR
                  </h3>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 
            className="text-4xl mb-6 tracking-wide"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Our Philosophy
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            We believe in the power of timeless design and exceptional craftsmanship. Each piece in our collection is carefully selected to embody elegance, quality, and sustainability.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            From the finest materials to meticulous attention to detail, we are committed to offering you products that stand the test of time.
          </p>
        </motion.div>
      </section>
    </div>
  );
}
