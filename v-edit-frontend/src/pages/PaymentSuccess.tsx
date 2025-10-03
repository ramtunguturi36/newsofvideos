import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { backend } from '@/lib/backend'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

type PurchaseItem = {
  id: string
  type: 'template' | 'folder'
  title: string
  description?: string
  price: number
  videoUrl?: string
  qrUrl?: string
  templateId?: string
  folderId?: string
}

type Purchase = {
  _id: string
  items: PurchaseItem[]
  totalAmount: number
  discountApplied: number
  createdAt: string
  paymentId: string
  orderId: string
}

type TemplateItem = {
  _id: string
  title: string
  description?: string
  basePrice: number
  discountPrice?: number
  videoUrl: string
  qrUrl: string
}

export default function PaymentSuccess() {
  const location = useLocation()
  const navigate = useNavigate()
  const [purchase, setPurchase] = useState<Purchase | null>(null)
  const [templates, setTemplates] = useState<TemplateItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const purchaseId = searchParams.get('purchaseId')
    
    console.log('PaymentSuccess page loaded, purchaseId:', purchaseId);
    
    if (!purchaseId) {
      console.log('No purchaseId found, redirecting to explorer');
      navigate('/user/explorer')
      return
    }

    async function fetchPurchase() {
      try {
        console.log('Fetching purchase details for ID:', purchaseId);
        // Fetch purchase details using direct endpoint
        const purchaseRes = await backend.get(`/purchases/${purchaseId}`)
        console.log('Purchase response:', purchaseRes.data);
        const purchaseData = purchaseRes.data.purchase as Purchase
        
        if (!purchaseData) {
          throw new Error('Purchase not found')
        }
        
        console.log('Purchase data:', purchaseData);
        console.log('Total amount:', purchaseData.totalAmount);
        console.log('Items:', purchaseData.items);
        
        setPurchase(purchaseData)
        
        // Set flag to refresh order history when user navigates back
        console.log('Setting refreshOrders flag to true');
        localStorage.setItem('refreshOrders', 'true')
        
        // Process both template and folder items
        const allTemplates: TemplateItem[] = []
        
        for (const item of purchaseData.items) {
          if (item.type === 'template') {
            // Direct template purchase
            allTemplates.push({
              _id: item.templateId || item.id,
              title: item.title,
              description: item.description || '',
              basePrice: item.price,
              discountPrice: item.price,
              qrUrl: item.qrUrl,
              videoUrl: item.videoUrl
            })
          } else if (item.type === 'folder') {
            // Folder purchase - fetch all templates in the folder
            try {
              const folderResponse = await backend.get(`/folders/${item.folderId || item.id}/preview`)
              const folderData = folderResponse.data.data
              
              if (folderData.templates && folderData.templates.length > 0) {
                const folderTemplates = folderData.templates.map((template: any) => ({
                  _id: template._id,
                  title: template.title,
                  description: template.description || '',
                  basePrice: template.basePrice,
                  discountPrice: template.discountPrice,
                  qrUrl: template.qrUrl,
                  videoUrl: template.videoUrl
                }))
                allTemplates.push(...folderTemplates)
              }
            } catch (error) {
              console.error('Error fetching folder templates:', error)
            }
          }
        }
        
        setTemplates(allTemplates)
      } catch (err: unknown) {
        console.error('Error fetching purchase details:', err);
        navigate('/user/explorer');
      } finally {
        setLoading(false)
      }
    }

    fetchPurchase()
  }, [location, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div>Loading payment details...</div>
      </div>
    )
  }

  if (!purchase) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div>Payment details not found.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Success Animation and Header */}
        <div className="text-center mb-12">
          <div className="mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="relative"
            >
              <div className="w-24 h-24 mx-auto bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <motion.div
                className="absolute inset-0 bg-green-400 rounded-full opacity-20"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent mb-4"
          >
            Payment Successful!
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-white/80 text-xl"
          >
            Thank you for your purchase! Your templates are ready to use.
          </motion.p>
        </div>

        {/* Order Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div>
                  <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Order Summary
                  </h2>
                  <p className="text-white/70 text-lg">Transaction completed successfully</p>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                  <div className="text-sm text-white/60 mb-2">Order ID</div>
                  <div className="font-mono bg-white/10 px-4 py-2 rounded-lg text-green-400 border border-green-400/30">
                    {purchase.orderId || purchase._id}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                  <div className="text-sm text-white/60 mb-2">Purchase Date</div>
                  <div className="text-xl font-semibold">
                    {new Date(purchase.createdAt).toLocaleString('en-US', {
                      dateStyle: 'full',
                      timeStyle: 'short'
                    })}
                  </div>
                </div>
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                  <div className="text-sm text-white/60 mb-2">Total Amount</div>
                  <div className="text-3xl font-bold text-green-400">
                    ₹{(purchase.totalAmount || 0).toFixed(2)}
                  </div>
                  {purchase.discountApplied > 0 && (
                    <div className="text-sm text-white/60 mt-2">
                      Discount Applied: <span className="text-green-400">-₹{purchase.discountApplied.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Purchased Items */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="my-12"
        >
          <h2 className="text-3xl font-bold mb-8 flex items-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Purchased Items
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {purchase.items.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + idx * 0.1 }}
              >
                <Card className="bg-white/10 backdrop-blur-lg border border-white/20 hover:border-white/30 transition-all duration-300 hover:shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <div className="p-2 rounded-lg bg-blue-500/20 mr-3">
                            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {item.type === 'template' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                              )}
                            </svg>
                          </div>
                          <div>
                            <span className="font-semibold text-xl text-white">
                              {item.title}
                            </span>
                            <div className="text-sm text-white/60 mt-1">
                              {item.type === 'template' ? 'Template' : 'Folder'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-white/60">
                          <span className="px-3 py-1 rounded-lg bg-white/10 font-mono text-xs">
                            {item.type === 'template' ? item.templateId : item.folderId}
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-green-400">₹{item.price.toFixed(2)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>


        {/* QR Codes Section */}
        {templates.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="my-12"
          >
            <h2 className="text-3xl font-bold mb-8 flex items-center bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              Your QR Codes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {templates.map((template, idx) => (
                <motion.div
                  key={template._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + idx * 0.1 }}
                >
                  <Card className="bg-white/10 backdrop-blur-lg border border-white/20 hover:border-white/30 transition-all duration-300 hover:shadow-xl group">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-xl mb-4 text-white group-hover:text-blue-300 transition-colors">
                        {template.title}
                      </h3>
                      <div className="bg-white p-6 rounded-xl mb-6 shadow-lg">
                        {template.qrUrl ? (
                          <img 
                            src={template.qrUrl} 
                            alt={`QR Code for ${template.title}`}
                            className="w-full rounded-lg"
                            onError={(e) => {
                              console.error('QR Code failed to load:', template.qrUrl);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500">QR Code not available</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-white/80 mb-6 text-center">
                        Scan this QR code to access your template instantly
                      </p>
                      {template.qrUrl && (
                        <button 
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = template.qrUrl;
                            link.download = `qr-${template.title.replace(/\s+/g, '-')}.png`;
                            link.target = '_blank';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 rounded-lg text-white font-semibold transform hover:scale-105"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download QR Code
                        </button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="my-12"
          >
            <h2 className="text-3xl font-bold mb-8 flex items-center bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              Your QR Codes
            </h2>
            <div className="text-center py-12">
              <div className="text-white/60 text-lg mb-4">
                Loading QR codes for your purchased templates...
              </div>
              <div className="text-white/40 text-sm">
                If this takes too long, please refresh the page or contact support.
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center my-8">
          <Button
            onClick={() => navigate('/user/orders')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            View Order History
          </Button>
          <Button 
            onClick={() => navigate('/user/dashboard')}
            variant="outline"
            className="border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 px-8 py-3 rounded-lg font-semibold transition-all duration-300 backdrop-blur-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  )
}