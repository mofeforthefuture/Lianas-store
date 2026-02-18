import { Link } from 'react-router';
import { Instagram, Facebook, Twitter } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-xl tracking-wider mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              LUXE
            </h3>
            <p className="text-sm text-muted-foreground">
              Curated collection of premium lifestyle products for the discerning individual.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm tracking-wider mb-4">SHOP</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link to="/shop?category=Clothing" className="hover:text-accent transition-colors">
                  Clothing
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Accessories" className="hover:text-accent transition-colors">
                  Accessories
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Footwear" className="hover:text-accent transition-colors">
                  Footwear
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Outerwear" className="hover:text-accent transition-colors">
                  Outerwear
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-sm tracking-wider mb-4">CUSTOMER CARE</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Shipping & Returns
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Size Guide
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm tracking-wider mb-4">NEWSLETTER</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe for exclusive offers and updates.
            </p>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Email address" 
                className="text-sm bg-input-background border-border"
              />
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                JOIN
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 LUXE. All rights reserved.
          </p>
          
          {/* Social Links */}
          <div className="flex gap-4">
            <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
