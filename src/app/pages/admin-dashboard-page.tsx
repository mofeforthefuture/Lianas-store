import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function AdminDashboardPage() {
  const [stats, setStats] = useState<{
    totalOrders: number;
    pendingPayments: number;
    totalRevenue: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [ordersRes, paymentsRes] = await Promise.all([
        supabase.from('orders').select('id, total_amount, status', { count: 'exact', head: false }),
        supabase.from('payments').select('id, status').eq('status', 'pending'),
      ]);

      const orders = (ordersRes.data ?? []) as { id: string; total_amount: number; status: string }[];
      const totalOrders = ordersRes.count ?? orders.length;
      const totalRevenue = orders
        .filter((o) => ['confirmed', 'shipped', 'completed'].includes(o.status))
        .reduce((sum, o) => sum + Number(o.total_amount), 0);
      const pendingPayments = paymentsRes.data?.length ?? 0;

      setStats({ totalOrders, pendingPayments, totalRevenue });
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>
          Dashboard
        </h1>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>
        Dashboard
      </h1>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground tracking-wide">Total Orders</p>
          <p className="text-3xl mt-2" style={{ fontFamily: 'var(--font-heading)' }}>
            {stats?.totalOrders ?? 0}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground tracking-wide">Pending Payments</p>
          <p className="text-3xl mt-2" style={{ fontFamily: 'var(--font-heading)' }}>
            {stats?.pendingPayments ?? 0}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground tracking-wide">Total Revenue</p>
          <p className="text-3xl mt-2" style={{ fontFamily: 'var(--font-heading)' }}>
            ${(stats?.totalRevenue ?? 0).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
