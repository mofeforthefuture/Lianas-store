import { useState } from 'react';
import { Link } from 'react-router';
import { Search, ShoppingBag, Menu, X, User } from 'lucide-react';
import { useCart } from '../context/cart-context';
import { useAuth } from '../context/auth-context';
import { Button } from './ui/button';

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, isAdmin, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="text-2xl tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>
            LUXE
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm tracking-wide hover:text-accent transition-colors">
              HOME
            </Link>
            <Link to="/shop" className="text-sm tracking-wide hover:text-accent transition-colors">
              SHOP
            </Link>
            <Link to="/shop?category=Clothing" className="text-sm tracking-wide hover:text-accent transition-colors">
              CLOTHING
            </Link>
            <Link to="/shop?category=Accessories" className="text-sm tracking-wide hover:text-accent transition-colors">
              ACCESSORIES
            </Link>
            <Link to="/shop?category=Footwear" className="text-sm tracking-wide hover:text-accent transition-colors">
              FOOTWEAR
            </Link>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-2">
            {isAdmin && (
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="text-sm">
                  Admin
                </Button>
              </Link>
            )}
            <button className="p-2 hover:text-accent transition-colors" type="button" aria-label="Search">
              <Search className="w-5 h-5" />
            </button>
            <Link to="/cart" className="p-2 hover:text-accent transition-colors relative" aria-label="Cart">
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            {user ? (
              <Button variant="ghost" size="sm" onClick={() => signOut()} className="gap-1">
                <User className="w-4 h-4" />
                Sign out
              </Button>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" size="sm">Register</Button>
                </Link>
              </>
            )}
            <button
              type="button"
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 animate-in slide-in-from-top duration-300">
            <Link 
              to="/" 
              className="block text-sm tracking-wide hover:text-accent transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              HOME
            </Link>
            <Link 
              to="/shop" 
              className="block text-sm tracking-wide hover:text-accent transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              SHOP
            </Link>
            <Link 
              to="/shop?category=Clothing" 
              className="block text-sm tracking-wide hover:text-accent transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              CLOTHING
            </Link>
            <Link 
              to="/shop?category=Accessories" 
              className="block text-sm tracking-wide hover:text-accent transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              ACCESSORIES
            </Link>
            <Link 
              to="/shop?category=Footwear" 
              className="block text-sm tracking-wide hover:text-accent transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              FOOTWEAR
            </Link>
            {user ? (
              <button
                type="button"
                className="block text-sm tracking-wide hover:text-accent transition-colors py-2"
                onClick={() => { signOut(); setIsMenuOpen(false); }}
              >
                Sign out
              </button>
            ) : (
              <>
                <Link to="/login" className="block text-sm tracking-wide hover:text-accent transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                  Sign in
                </Link>
                <Link to="/register" className="block text-sm tracking-wide hover:text-accent transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}