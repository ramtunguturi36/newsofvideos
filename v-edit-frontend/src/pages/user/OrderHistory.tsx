import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Package, ShoppingBag, Loader } from 'lucide-react';
import { format } from 'date-fns';
import { backend } from '@/lib/backend';
import { toast } from 'sonner';

interface OrderItem {
  id: string;
  title: string;
  price: number;
  qrUrl?: string;
  videoUrl?: string;
  type: 'template' | 'folder';
  templateId?: string;
  folderId?: string;
}

interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: 'completed' | 'processing' | 'failed';
  discountApplied?: number;
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  // Fetch orders from the backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await backend.get('/purchases');
        
        // Transform purchase data to match Order interface
        const transformedOrders: Order[] = response.data.purchases.map((purchase: any) => ({
          id: purchase._id,
          date: purchase.createdAt,
          items: purchase.items.map((item: any) => ({
            id: item.id,
            title: item.title,
            price: item.price,
            qrUrl: item.qrUrl || '',
            videoUrl: item.videoUrl || '/placeholder-video.mp4'
          })),
          total: purchase.totalAmount,
          status: 'completed'
        }));
        
        setOrders(transformedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleDownload = async (qrUrl: string, title: string) => {
    setDownloading(qrUrl);
    try {
      // Create an anchor element to trigger the download
      const link = document.createElement('a');
      link.href = qrUrl;
      link.download = `qr-${title.toLowerCase().replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex justify-center items-center text-white/80">
        <Loader className="h-8 w-8 animate-spin" />
        <span className="ml-3 text-lg">Loading your orders...</span>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center p-8 max-w-md mx-auto bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800">
          <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">No Orders Yet</h3>
          <p className="text-gray-400 mb-6">Start exploring our templates and create something amazing today.</p>
          <Button 
            onClick={() => window.location.href = '/'}
            className="bg-blue-500 hover:bg-blue-600 transition-colors"
          >
            <Package className="mr-2 h-4 w-4" />
            Browse Templates
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex items-center">
        <ShoppingBag className="h-6 w-6 mr-3 text-blue-400" />
        <h1 className="text-2xl font-bold text-white">Order History</h1>
      </div>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden bg-gray-900/50 backdrop-blur-sm border border-gray-800">
            <CardHeader className="px-6 py-4 border-b border-gray-800">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-2 sm:mb-0">
                  <CardTitle className="text-lg text-white mb-1">Order #{order.id}</CardTitle>
                  <p className="text-sm text-gray-400">
                    {format(new Date(order.date), 'MMMM d, yyyy h:mm a')}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    order.status === 'completed' 
                      ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500/30' 
                      : order.status === 'processing' 
                        ? 'bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/30' 
                        : 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <div className="mt-2 sm:mt-0">
                    <span className="text-lg font-medium text-white">
                      ₹{order.total.toFixed(2)}
                    </span>
                    {order.discountApplied && order.discountApplied > 0 && (
                      <span className="ml-2 text-sm text-green-400">
                        (-₹{order.discountApplied.toFixed(2)})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-gray-800">
                {order.items.map((item) => (
                  <li key={item.id} className="p-4 hover:bg-gray-800/30 transition-colors">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-20 w-32 bg-gray-800 rounded-md overflow-hidden">
                        {item.videoUrl ? (
                          <video 
                            src={item.videoUrl} 
                            className="h-full w-full object-cover"
                            muted
                            loop
                            onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                            onMouseLeave={(e) => (e.target as HTMLVideoElement).pause()}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gray-800 text-gray-600">
                            <Package className="h-8 w-8" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-white mb-1">
                              {item.title}
                            </h4>
                            <p className="text-sm text-gray-400">
                              {item.type.charAt(0).toUpperCase() + item.type.slice(1)} • ID: {item.templateId || item.folderId}
                            </p>
                          </div>
                          <p className="text-lg font-medium text-white">
                            ₹{item.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex space-x-3">
                          {item.qrUrl && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload(item.qrUrl!, item.title)}
                                disabled={downloading === item.qrUrl}
                                className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                              >
                                {downloading === item.qrUrl ? (
                                  <>
                                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                                    Downloading...
                                  </>
                                ) : (
                                  <>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download QR
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                                onClick={() => {
                                  window.open(item.qrUrl, '_blank');
                                }}
                              >
                                <Package className="mr-2 h-4 w-4" />
                                View Template
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
