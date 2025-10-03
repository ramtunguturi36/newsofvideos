import React, { useEffect, useState } from 'react';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  Truck, 
  CreditCard, 
  FileText, 
  Search, 
  Filter, 
  ChevronDown, 
  Download,
  ArrowUpDown,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { backend } from '@/lib/backend';
import { toast } from 'sonner';

// Order types
type OrderItem = {
  id: string;
  type: 'template' | 'folder';
  title: string;
  price: number;
  videoUrl?: string;
  qrUrl?: string;
  templateId?: string;
  folderId?: string;
};

type Order = {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  discountApplied: number;
  createdAt: string;
  paymentId: string;
  orderId: string;
};

const statuses = {
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: Clock },
  delivered: { label: 'Delivered', color: 'bg-purple-100 text-purple-800', icon: Truck },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800', icon: XCircle },
  refunded: { label: 'Refunded', color: 'bg-yellow-100 text-yellow-800', icon: Clock }
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await backend.get('/purchases');
        setOrders(response.data.purchases || []);
        
        // Clear refresh flag after successful fetch
        localStorage.removeItem('refreshOrders');
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Listen for refresh flag
  useEffect(() => {
    const handleStorageChange = () => {
      if (localStorage.getItem('refreshOrders') === 'true') {
        const fetchOrders = async () => {
          try {
            const response = await backend.get('/purchases');
            setOrders(response.data.purchases || []);
            localStorage.removeItem('refreshOrders');
            toast.success('Orders updated!');
          } catch (error) {
            console.error('Error refreshing orders:', error);
          }
        };
        fetchOrders();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const filteredOrders = orders.filter(order =>
    (order.orderId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.items.some(item => (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Order History</h2>
            <p className="text-muted-foreground">
              View your past orders and track their status
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 text-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              Order History
            </h2>
            <p className="text-slate-700 text-lg mt-2">
              View your past orders and track their status
            </p>
          </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-10 gap-2 bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Export
            </span>
          </Button>
        </div>
      </div>

      <Card className="bg-white/90 backdrop-blur-lg border-slate-200 shadow-lg">
        <CardHeader className="px-7">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-slate-900 text-xl">Orders</CardTitle>
            <div className="flex flex-1 items-center space-x-2 md:justify-end">
              <div className="relative w-full md:w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="search"
                  placeholder="Search orders..."
                  className="w-full rounded-lg bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500 pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead className="text-slate-700">Order</TableHead>
                <TableHead className="text-slate-700">Date</TableHead>
                <TableHead className="text-slate-700">Status</TableHead>
                <TableHead className="text-slate-700">Items</TableHead>
                <TableHead className="text-right text-slate-700">Total</TableHead>
                <TableHead className="text-right text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const StatusIcon = statuses.completed.icon; // All orders are completed after payment
                return (
                  <TableRow key={order._id} className="hover:bg-slate-50 border-slate-200">
                    <TableCell className="font-medium text-slate-900">
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4 text-slate-500" />
                        {order.orderId || order._id}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-700">
                      {format(new Date(order.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className="border-green-300 bg-green-100 text-green-700"
                      >
                        <StatusIcon className="mr-1 h-3.5 w-3.5" />
                        {statuses.completed.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-700">{order.items.length} item{order.items.length > 1 ? 's' : ''}</TableCell>
                    <TableCell className="text-right text-slate-900 font-semibold">
                      ₹{order.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => window.open(`/payment-success?purchaseId=${order._id}`, '_blank')}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-slate-600">
                    {searchTerm ? 'No orders found matching your search.' : 'No orders found.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
