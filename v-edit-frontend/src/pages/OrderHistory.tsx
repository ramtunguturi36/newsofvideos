import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { backend } from '@/lib/backend';
// If the file does not exist, create '../../lib/backend.ts' with the following minimal implementation:
// export const backend = { get: async (url: string) => ({ data: { purchases: [] } }) };

type PurchaseItem = {
  type: 'template' | 'folder'
  templateId?: string
  folderId?: string
}

type Purchase = {
  _id: string
  items: PurchaseItem[]
  totalAmount: number
  discountApplied: number
  createdAt: string
}

export default function OrderHistory() {
  const navigate = useNavigate()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPurchases() {
      try {
        const res = await backend.get('/purchases')
        setPurchases(res.data.purchases)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchPurchases()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div>Loading order history...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Order History</h1>
          <Button onClick={() => navigate('/user/explorer')}>
            Continue Shopping
          </Button>
        </div>

        {purchases.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-medium mb-2">No orders yet</h3>
              <p className="text-white/60 mb-4">You haven't made any purchases yet.</p>
              <Button onClick={() => navigate('/user/explorer')}>
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <Card key={purchase._id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div>
                      <div className="font-medium">Order #{purchase._id.substring(0, 8)}</div>
                      <div className="text-sm text-white/60">
                        {new Date(purchase.createdAt).toLocaleDateString()} • {purchase.items.length} item(s)
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end">
                      <div className="font-semibold">₹{purchase.totalAmount.toFixed(2)}</div>
                      {purchase.discountApplied > 0 && (
                        <div className="text-sm text-green-400">
                          Saved ₹{purchase.discountApplied.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/payment-success?purchaseId=${purchase._id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
