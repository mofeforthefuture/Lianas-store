import { Link } from 'react-router';
import { motion } from 'motion/react';
import { useState } from 'react';
import type { Product } from '../types/database';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Link to={`/product/${product.id}`}>
      <motion.div
        className="group cursor-pointer"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
      >
        {/* Image Container */}
        <div className="relative aspect-[3/4] mb-4 overflow-hidden bg-muted">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
          <ImageWithFallback
            src={product.images[0] || `https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&h=800&fit=crop`}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          
          {/* Quick View Button */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="bg-white text-primary px-6 py-2 text-sm tracking-wide">
              VIEW DETAILS
            </span>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <h3 className="text-sm tracking-wide group-hover:text-accent transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground">{product.category}</p>
          <p className="text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
            ${Number(product.price).toFixed(2)}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}