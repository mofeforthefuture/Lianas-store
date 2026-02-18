import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getReceiptUrl } from '../lib/storage';
import type { Order, Payment } from '../types/database';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import type { OrderStatus, PaymentStatus } from '../types/database';
import { format } from 'date-fns';

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<(Order & { payments?: Payment[] })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (ordersError) {
      toast.error(ordersError.message);
      setLoading(false);
      return;
    }
    const ordersList = (ordersData ?? []) as Order[];
    const { data: paymentsData } = await supabase.from('payments').select('*');
    const paymentsByOrder = (paymentsData ?? []).reduce(
      (acc, p) => {
        const pid = (p as Payment).order_id;
        if (!acc[pid]) acc[pid] = [];
        acc[pid].push(p as Payment);
        return acc;
      },
      {} as Record<string, Payment[]>
    );
    setOrders(
      ordersList.map((o) => ({
        ...o,
        payments: paymentsByOrder[o.id] ?? [],
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Order updated');
    fetchOrders();
  };

  const updatePaymentStatus = async (paymentId: string, status: PaymentStatus) => {
    const { error } = await supabase.from('payments').update({ status }).eq('id', paymentId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Payment updated');
    const order = orders.find((o) => o.payments?.some((p) => p.id === paymentId));
    if (order && status === 'approved') {
      await supabase.from('orders').update({ status: 'confirmed' }).eq('id', order.id);
    }
    fetchOrders();
  };

  const openReceipt = async (path: string) => {
    const url = await getReceiptUrl(path);
    if (url) window.open(url, '_blank');
    else toast.error('Could not load receipt');
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl tracking-wide mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
          Orders
        </h1>
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>
        Orders
      </h1>

      {orders.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center text-muted-foreground">
          No orders yet.
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(order.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}…</TableCell>
                  <TableCell>${Number(order.total_amount).toFixed(2)}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>
                    {order.payments?.length
                      ? order.payments.map((p) => (
                          <div key={p.id} className="flex flex-wrap items-center gap-2 text-sm">
                            <span>{p.status}</span>
                            {p.receipt_url && (
                              <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-accent"
                                onClick={() => openReceipt(p.receipt_url!)}
                              >
                                View receipt
                              </Button>
                            )}
                            {p.status === 'pending' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7"
                                  onClick={() => updatePaymentStatus(p.id, 'approved')}
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-destructive"
                                  onClick={() => updatePaymentStatus(p.id, 'rejected')}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        ))
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(v) => updateOrderStatus(order.id, v as OrderStatus)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending_payment">Pending payment</SelectItem>
                        <SelectItem value="payment_submitted">Payment submitted</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
