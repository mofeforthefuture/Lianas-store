import { RouterProvider } from 'react-router';
import { router } from './routes';
import { CartProvider } from './context/cart-context';
import { AuthProvider } from './context/auth-context';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router} />
        <Toaster />
      </CartProvider>
    </AuthProvider>
  );
}