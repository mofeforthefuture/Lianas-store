import { Outlet } from 'react-router';
import { Navigation } from '../components/navigation';
import { Footer } from '../components/footer';

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
