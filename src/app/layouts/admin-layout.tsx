import { Link, Outlet, useLocation } from 'react-router';
import { AdminGuard } from '../components/AdminGuard';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/auth-context';
import { Button } from '../components/ui/button';
import { cn } from '../components/ui/utils';

const navItems = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
];

export function AdminLayout() {
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <AdminGuard>
      <div className="min-h-screen flex bg-muted/30">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-card flex flex-col">
          <div className="p-6 border-b border-border">
            <Link to="/admin" className="text-xl tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>
              LUXE Admin
            </Link>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-md text-sm transition-colors',
                  location.pathname === to
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-border">
            <Link to="/">
              <Button variant="ghost" size="sm" className="w-full justify-start gap-3">
                ← Store
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-3 mt-2 text-muted-foreground"
              onClick={() => signOut()}
            >
              <LogOut className="w-5 h-5" />
              Sign out
            </Button>
          </div>
        </aside>
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
