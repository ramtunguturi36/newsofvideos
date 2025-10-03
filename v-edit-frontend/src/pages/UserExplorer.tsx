import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getHierarchy } from '@/lib/backend'
import type { Folder, TemplateItem } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { useCart } from '@/context/CartContext'
import { checkFolderAccess } from '@/lib/api'
import CartDrawer from '@/components/CartDrawer'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { backend } from '@/lib/backend'
import { Eye, QrCode, Video, CheckCircle } from 'lucide-react'

function FolderCard({ folder, onClick, hasAccess }: { folder: Folder; onClick: () => void; hasAccess?: boolean }) {
  return (
    <div onClick={onClick} className="cursor-pointer group">
      <Card className="p-4 hover:shadow-2xl transition-shadow relative">
        <div className="aspect-video grid place-items-center text-yellow-400 text-5xl">📁</div>
        <div className="mt-2 text-white/90 truncate">{folder.name}</div>
        {hasAccess && (
          <div className="absolute top-2 right-2">
            <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />
              Owned
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

function TemplateCard({ item, showQr = false, isOwned = false, openVideoModal, openQRModal }: { 
  item: TemplateItem, 
  showQr?: boolean,
  isOwned?: boolean,
  openVideoModal: (url: string) => void,
  openQRModal: (url: string, title: string) => void
}) {
  const [hover, setHover] = useState(false)
  return (
    <div className="group bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 hover:border-white/40 hover:shadow-lg transition-all duration-300 overflow-hidden transform hover:-translate-y-1 hover:bg-white/20" 
         onMouseEnter={() => setHover(true)} 
         onMouseLeave={() => setHover(false)}>
      <div className="relative aspect-[4/3] bg-black overflow-hidden cursor-pointer"
           onClick={() => openVideoModal(item.videoUrl)}>
        <video 
          src={item.videoUrl} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
          muted 
          loop 
          playsInline
          onMouseEnter={(e) => {
            e.currentTarget.currentTime = 0;
            e.currentTarget.play();
          }}
          onMouseLeave={(e) => {
            e.currentTarget.pause();
            e.currentTarget.currentTime = 0;
          }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/90 rounded-full p-2 shadow-lg">
              <Eye className="h-4 w-4 text-gray-700" />
            </div>
          </div>
        </div>
        {(showQr || isOwned) && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-full shadow-lg">
            <CheckCircle className="h-2.5 w-2.5 inline mr-1" />
            {isOwned ? 'Owned' : 'Purchased'}
          </div>
        )}
        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
          Video
        </div>
      </div>
      <CardContent className="p-3">
        <h3 className="font-semibold text-white mb-1 line-clamp-1 text-sm">{item.title}</h3>
        <div className="mb-2">
          <span className="text-sm font-bold text-green-400">
            ₹{item.discountPrice || item.basePrice}
          </span>
          {item.discountPrice && (
            <span className="ml-1 text-xs text-gray-400 line-through">
              ₹{item.basePrice}
            </span>
          )}
        </div>
        
        {/* Action Buttons for Owned Templates */}
        {isOwned && (
          <div className="space-y-1">
            <Button
              size="sm"
              className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white border-0 text-xs py-1.5"
              onClick={(e) => {
                e.stopPropagation();
                openVideoModal(item.videoUrl);
              }}
            >
              <Eye className="h-3 w-3 mr-1" />
              View Video
            </Button>
            {item.qrUrl && (
              <Button
                size="sm"
                variant="outline"
                className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20 text-xs py-1.5"
                onClick={(e) => {
                  e.stopPropagation();
                  openQRModal(item.qrUrl, item.title);
                }}
              >
                <QrCode className="h-3 w-3 mr-1" />
                View QR
              </Button>
            )}
          </div>
        )}
        
        {/* Legacy QR button for purchased templates */}
        {showQr && item.qrUrl && !isOwned && (
          <Button
            size="sm"
            variant="outline"
            className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20 text-xs py-1.5 mt-1"
            onClick={() => openQRModal(item.qrUrl, item.title)}
          >
            <QrCode className="h-3 w-3 mr-1" />
            View QR
          </Button>
        )}
      </CardContent>
    </div>
  )
}

export default function UserExplorer() {
  console.log('UserExplorer component rendered');
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const currentFolderId = params.get('folderId') || undefined
  const [folders, setFolders] = useState<Folder[]>([])
  const [templates, setTemplates] = useState<TemplateItem[]>([])
  const [purchasedTemplates, setPurchasedTemplates] = useState<TemplateItem[]>([])
  const [purchasedTemplateIds, setPurchasedTemplateIds] = useState<Set<string>>(new Set())
  const [path, setPath] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasedLoading, setPurchasedLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'browse' | 'purchased'>('browse')
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [selectedQR, setSelectedQR] = useState<{ url: string; title: string } | null>(null)
  const [folderAccess, setFolderAccess] = useState<Record<string, boolean>>({})
  const { addItem } = useCart()
  const [open, setOpen] = useState(false)

  const openVideoModal = (videoUrl: string) => {
    setSelectedVideo(videoUrl);
  };

  const openQRModal = (qrUrl: string, title: string) => {
    setSelectedQR({ url: qrUrl, title });
  };

  useEffect(() => {
    setLoading(true)
    getHierarchy(currentFolderId)
      .then(async (data: any) => {
        setFolders(data.folders || [])
        setTemplates(data.templates || [])
        setPath(data.path || [])
        console.log('Loaded templates:', data.templates?.map((t: any) => ({ id: t._id, title: t.title })));
        
        // Check folder access for purchasable folders
        const purchasableFolders = (data.folders || []).filter((folder: any) => folder.isPurchasable)
        if (purchasableFolders.length > 0) {
          const token = localStorage.getItem('token')
          if (token) {
            const accessChecks = await Promise.allSettled(
              purchasableFolders.map((folder: any) => checkFolderAccess(folder._id))
            )
            
            const accessMap: Record<string, boolean> = {}
            accessChecks.forEach((result, index) => {
              if (result.status === 'fulfilled') {
                accessMap[purchasableFolders[index]._id] = result.value.hasAccess
              }
            })
            setFolderAccess(accessMap)
          }
        }
        
        // Load purchased templates to check ownership
        loadPurchasedTemplates()
      })
      .finally(() => setLoading(false))
  }, [currentFolderId])

  const loadPurchasedTemplates = async () => {
    try {
      setPurchasedLoading(true)
      const response = await backend.get('/purchases')
      const purchases = response.data.purchases || []
      
      const allPurchasedTemplates: TemplateItem[] = []
      const purchasedIds = new Set<string>()
      
      purchases.forEach((purchase: any) => {
        purchase.items.forEach((item: any) => {
          if (item.type === 'template' && item.qrUrl) {
            allPurchasedTemplates.push({
              _id: item.templateId || item.id,
              title: item.title,
              description: item.description || '',
              basePrice: item.price,
              discountPrice: item.price,
              qrUrl: item.qrUrl,
              videoUrl: item.videoUrl
            })
            purchasedIds.add(item.templateId || item.id)
          }
        })
      })
      
      setPurchasedTemplates(allPurchasedTemplates)
      setPurchasedTemplateIds(purchasedIds)
    } catch (error) {
      console.error('Error loading purchased templates:', error)
    } finally {
      setPurchasedLoading(false)
    }
  }

  const breadcrumbs = useMemo(() => {
    const items = [{ _id: '', name: 'Home' }, ...path]
    return items
  }, [path])

  // Load ownership data on component mount
  useEffect(() => {
    console.log('UserExplorer mounted, loading ownership data...');
    console.log('Refresh flag status:', localStorage.getItem('refreshOrders'));
    
    const loadOwnershipData = async () => {
      try {
        console.log('Fetching purchases for ownership data...');
        const response = await backend.get('/purchases');
        const purchases = response.data.purchases;
        console.log('Purchases response:', response.data);
        
        // Get all unique template IDs from purchases
        const templateIds = Array.from(new Set(
          purchases.flatMap(purchase => 
            purchase.items
              .filter((item: any) => item.type === 'template' && item.templateId)
              .map((item: any) => item.templateId)
          )
        ));
        
        console.log('All purchases:', purchases);
        console.log('Extracted template IDs from purchases:', templateIds);
        
        setPurchasedTemplateIds(new Set(templateIds));
        console.log('Initial ownership data loaded:', templateIds);
        console.log('Purchased template IDs set:', new Set(templateIds));
        
        // Check if refresh flag is set and clear it
        if (localStorage.getItem('refreshOrders') === 'true') {
          console.log('Refresh flag detected on mount, clearing it...');
          localStorage.removeItem('refreshOrders');
        }
      } catch (err) {
        console.error('Error loading ownership data:', err);
      }
    };
    
    loadOwnershipData();
  }, []);

  // Fetch purchased templates when the purchased tab is active
  useEffect(() => {
    if (activeTab === 'purchased') {
      const fetchPurchasedTemplates = async () => {
        try {
          setPurchasedLoading(true);
          const response = await backend.get('/purchases');
          const purchases = response.data.purchases;
          
          // Get all unique template IDs from purchases
          const templateIds = Array.from(new Set(
            purchases.flatMap(purchase => 
              purchase.items
                .filter((item: any) => item.type === 'template' && item.templateId)
                .map((item: any) => item.templateId)
            )
          ));
          
          if (templateIds.length > 0) {
            // Fetch template details for each purchased template
            const templatePromises = templateIds.map((id: string) => 
              backend.get(`/templates/${id}`).then((res: any) => res.data.template)
            );
            
            const templates = await Promise.all(templatePromises);
            setPurchasedTemplates(templates);
            
            // Update purchased template IDs for ownership checking
            setPurchasedTemplateIds(new Set(templateIds));
          } else {
            setPurchasedTemplates([]);
            setPurchasedTemplateIds(new Set());
          }
        } catch (err) {
          console.error('Error fetching purchased templates:', err);
        } finally {
          setPurchasedLoading(false);
        }
      };
      
      fetchPurchasedTemplates();
    }
  }, [activeTab]);

  // Listen for refresh flag from payment success
  useEffect(() => {
    console.log('Setting up refresh listener...');
    const handleStorageChange = () => {
      console.log('Storage change detected, checking refresh flag...');
      if (localStorage.getItem('refreshOrders') === 'true') {
        console.log('Refreshing purchased templates after payment...');
        // Refresh both purchased templates and ownership data
        if (activeTab === 'purchased') {
          const fetchPurchasedTemplates = async () => {
            try {
              setPurchasedLoading(true);
              const response = await backend.get('/purchases');
              const purchases = response.data.purchases;
              
              // Get all unique template IDs from purchases
              const templateIds = Array.from(new Set(
                purchases.flatMap(purchase => 
                  purchase.items
                    .filter((item: any) => item.type === 'template' && item.templateId)
                    .map((item: any) => item.templateId)
                )
              ));
              
              if (templateIds.length > 0) {
                // Fetch template details for each purchased template
                const templatePromises = templateIds.map((id: string) => 
                  backend.get(`/templates/${id}`).then((res: any) => res.data.template)
                );
                
                const templates = await Promise.all(templatePromises);
                setPurchasedTemplates(templates);
                
                // Update purchased template IDs for ownership checking
                setPurchasedTemplateIds(new Set(templateIds));
              } else {
                setPurchasedTemplates([]);
                setPurchasedTemplateIds(new Set());
              }
            } catch (err) {
              console.error('Error refreshing purchased templates:', err);
            } finally {
              setPurchasedLoading(false);
            }
          };
          fetchPurchasedTemplates();
        }
        
        // Also refresh ownership data for browse tab
        const refreshOwnership = async () => {
          try {
            const response = await backend.get('/purchases');
            const purchases = response.data.purchases;
            
            // Get all unique template IDs from purchases
            const templateIds = Array.from(new Set(
              purchases.flatMap(purchase => 
                purchase.items
                  .filter((item: any) => item.type === 'template' && item.templateId)
                  .map((item: any) => item.templateId)
              )
            ));
            
            setPurchasedTemplateIds(new Set(templateIds));
            console.log('Ownership data refreshed:', templateIds);
          } catch (err) {
            console.error('Error refreshing ownership data:', err);
          }
        };
        refreshOwnership();
        
        localStorage.removeItem('refreshOrders');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [activeTab]);

  return (
    <div className="min-h-screen text-white">
      <div className="flex h-16 items-center border-b border-white/10 px-4 justify-between">
        <div className="flex items-center gap-2 text-white/80">
          {activeTab === 'browse' && breadcrumbs.map((b, idx) => (
            <div key={b._id} className="flex items-center gap-2">
              <button
                className="hover:underline"
                onClick={() => setParams(b._id ? { folderId: b._id } : {})}
              >
                {b.name}
              </button>
              {idx < breadcrumbs.length - 1 && <span className="text-white/40">/</span>}
            </div>
          ))}
          {activeTab === 'purchased' && <span className="font-medium">My Purchases</span>}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            className={`px-4 py-2 ${activeTab === 'browse' ? 'border-b-2 border-white' : 'text-white/60'}`}
            onClick={() => setActiveTab('browse')}
          >
            Browse Templates
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'purchased' ? 'border-b-2 border-white' : 'text-white/60'}`}
            onClick={() => setActiveTab('purchased')}
          >
            My Purchases
          </button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/order-history')}>
            Order History
          </Button>
          <Button variant="outline" onClick={() => setOpen(true)}>
            Open Cart
          </Button>
          <Button variant="outline" onClick={async () => {
            console.log('Manual refresh triggered');
            // Manually trigger ownership data refresh
            try {
              const response = await backend.get('/purchases');
              const purchases = response.data.purchases;
              console.log('Manual refresh - purchases:', purchases);
              
              const templateIds = Array.from(new Set(
                purchases.flatMap(purchase => 
                  purchase.items
                    .filter((item: any) => item.type === 'template' && item.templateId)
                    .map((item: any) => item.templateId)
                )
              ));
              
              console.log('Manual refresh - template IDs:', templateIds);
              setPurchasedTemplateIds(new Set(templateIds));
              console.log('Manual refresh - ownership data updated');
            } catch (error) {
              console.error('Manual refresh error:', error);
            }
          }}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="p-4">
        {activeTab === 'browse' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {folders.map((f) => (
                <motion.div key={f._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <FolderCard 
                    folder={f} 
                    onClick={() => setParams({ folderId: f._id })} 
                    hasAccess={folderAccess[f._id]}
                  />
                </motion.div>
              ))}
              {templates.map((t) => {
                const isOwned = purchasedTemplateIds.has(t._id)
                console.log(`Template ${t._id} (${t.title}): isOwned=${isOwned}`)
                console.log(`Template ID type: ${typeof t._id}, value: "${t._id}"`)
                console.log(`Purchased IDs:`, Array.from(purchasedTemplateIds).map(id => ({ type: typeof id, value: `"${id}"` })))
                return (
                  <motion.div key={t._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <div className="space-y-2">
                      <TemplateCard 
                        item={t} 
                        showQr={false} 
                        isOwned={isOwned}
                        openVideoModal={openVideoModal} 
                        openQRModal={openQRModal} 
                      />
                      {!isOwned && (
                        <Button 
                          onClick={() => addItem({ 
                            id: t._id, 
                            type: 'template', 
                            title: t.title, 
                            price: t.discountPrice ?? t.basePrice 
                          })}
                          className="w-full text-xs py-1.5"
                        >
                          Add to Cart
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {purchasedLoading ? (
              <div className="col-span-full flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : purchasedTemplates.length > 0 ? (
              <AnimatePresence>
                {purchasedTemplates.map((t) => (
                  <motion.div 
                    key={t._id} 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="h-full"
                  >
                    <TemplateCard 
                      item={t} 
                      showQr={true} 
                      isOwned={true}
                      openVideoModal={openVideoModal} 
                      openQRModal={openQRModal} 
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="col-span-full text-center py-12 text-white/60">
                You haven't purchased any templates yet.
              </div>
            )}
          </div>
        )}
      </div>

      <CartDrawer open={open} onClose={() => setOpen(false)} />

      {/* Video Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl w-full bg-black/90 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Video Preview</DialogTitle>
          </DialogHeader>
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            {selectedVideo && (
              <video
                className="w-full h-full object-contain"
                src={selectedVideo}
                controls
                autoPlay
                muted
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      <Dialog open={!!selectedQR} onOpenChange={() => setSelectedQR(null)}>
        <DialogContent className="max-w-md w-full bg-white/10 backdrop-blur-lg border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedQR?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center p-6">
            {selectedQR && (
              <>
                <div className="bg-white p-4 rounded-lg mb-4">
                  <img 
                    src={selectedQR.url} 
                    alt={`QR Code for ${selectedQR.title}`}
                    className="w-64 h-64 mx-auto"
                  />
                </div>
                <p className="text-white/70 text-center text-sm">
                  Scan this QR code to access your template
                </p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
