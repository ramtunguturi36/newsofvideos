import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Eye, 
  QrCode, 
  Video, 
  FolderOpen,
  CheckCircle,
  Clock,
  Search,
  X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { backend } from '@/lib/backend';
import { toast } from 'sonner';

interface PurchasedTemplate {
  _id: string;
  title: string;
  description: string;
  price: number;
  qrUrl: string;
  videoUrl: string;
  createdAt: string;
  orderId: string;
}

interface PurchasedFolder {
  _id: string;
  name: string;
  templates: PurchasedTemplate[];
  createdAt: string;
}

export default function PurchasedTemplates() {
  const [purchasedFolders, setPurchasedFolders] = useState<PurchasedFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedQR, setSelectedQR] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    fetchPurchasedTemplates();
  }, []);

  const fetchPurchasedTemplates = async () => {
    try {
      setLoading(true);
      const response = await backend.get('/purchases');
      const purchases = response.data.purchases || [];
      
      // Group templates by folder (if they have folder info) or create a general folder
      const folderMap = new Map<string, PurchasedFolder>();
      
      purchases.forEach((purchase: any) => {
        console.log('Processing purchase:', purchase);
        purchase.items.forEach((item: any) => {
          console.log('Processing item:', item);
          if (item.type === 'template' && item.qrUrl) {
            const folderName = item.folderName || 'General Templates';
            const folderId = item.folderId || 'general';
            
            if (!folderMap.has(folderId)) {
              folderMap.set(folderId, {
                _id: folderId,
                name: folderName,
                templates: [],
                createdAt: purchase.createdAt
              });
            }
            
            folderMap.get(folderId)!.templates.push({
              _id: item.templateId || item.id,
              title: item.title,
              description: item.description || '',
              price: item.price,
              qrUrl: item.qrUrl,
              videoUrl: item.videoUrl || '',
              createdAt: purchase.createdAt,
              orderId: purchase.orderId || purchase._id
            });
          }
        });
      });
      
      setPurchasedFolders(Array.from(folderMap.values()));
    } catch (error) {
      console.error('Error fetching purchased templates:', error);
      toast.error('Failed to load purchased templates');
    } finally {
      setLoading(false);
    }
  };

  const filteredFolders = purchasedFolders.filter(folder =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    folder.templates.some(template =>
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const openVideoModal = (videoUrl: string) => {
    setSelectedVideo(videoUrl);
  };

  const openQRModal = (qrUrl: string, title: string) => {
    setSelectedQR({ url: qrUrl, title });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 text-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              My Purchased Templates
            </h2>
            <p className="text-slate-700 text-sm md:text-base mt-1">
              Access your purchased video templates and QR codes
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-48 md:w-64 bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

      {/* Purchased Folders */}
      {filteredFolders.length > 0 ? (
        <div className="space-y-4">
          {filteredFolders.map((folder) => (
            <Card key={folder._id} className="overflow-hidden bg-white/90 backdrop-blur-lg border-slate-200 shadow-lg">
              <div className="bg-gradient-to-r from-blue-500/10 to-teal-500/10 p-4 md:p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500/20 to-teal-500/20">
                      <FolderOpen className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-slate-900">{folder.name}</h3>
                      <p className="text-slate-700 text-sm md:text-base">
                        {folder.templates.length} template{folder.templates.length !== 1 ? 's' : ''} purchased
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-white/80 border-slate-300 text-slate-700 text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(folder.createdAt).toLocaleDateString()}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                  {folder.templates.map((template) => (
                    <div
                      key={template._id}
                      className="group bg-white/80 backdrop-blur-lg rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden transform hover:-translate-y-1 hover:bg-white/90"
                    >
                      {/* Template Info - Very Compact */}
                      <div className="p-3">
                        {/* Purchased Badge */}
                        <div className="flex justify-between items-start mb-2">
                          <Badge className="bg-green-500 text-white text-xs px-1.5 py-0.5">
                            <CheckCircle className="h-2.5 w-2.5 mr-1" />
                            Purchased
                          </Badge>
                        </div>

                        <h4 className="font-semibold text-slate-900 mb-2 line-clamp-2 text-sm leading-tight">
                          {template.title}
                        </h4>
                        
                        {/* Price */}
                        <div className="mb-3">
                          <span className="text-lg font-bold text-green-400">
                            ₹{template.price}
                          </span>
                        </div>

                        {/* Order ID */}
                        <div className="mb-3">
                          <Badge variant="outline" className="text-xs bg-white/80 border-slate-300 text-slate-700 px-1.5 py-0.5">
                            #{template.orderId.slice(-6)}
                          </Badge>
                        </div>

                        {/* Actions - Compact */}
                        <div className="space-y-2">
                          <Button
                            size="sm"
                            className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white border-0 text-xs py-1.5"
                            onClick={() => openVideoModal(template.videoUrl)}
                            disabled={!template.videoUrl}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Video
                          </Button>
                          {template.qrUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full bg-white border-slate-300 text-slate-700 hover:bg-slate-50 text-xs py-1.5"
                              onClick={() => openQRModal(template.qrUrl, template.title)}
                            >
                              <QrCode className="h-3 w-3 mr-1" />
                              View QR
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="h-32 w-32 rounded-full bg-white/80 backdrop-blur-lg flex items-center justify-center mx-auto mb-6 border border-slate-200">
            <FolderOpen className="h-16 w-16 text-slate-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">
            {searchTerm ? 'No templates found' : 'No purchased templates yet'}
          </h3>
          <p className="text-slate-600 text-lg mb-8">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Purchase some templates to see them here'
            }
          </p>
          {!searchTerm && (
            <Button 
              onClick={() => window.location.href = '/user/dashboard'}
              className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-8 py-3 text-lg"
            >
              Browse Templates
            </Button>
          )}
        </div>
      )}
      </div>

      {/* Video Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl w-full bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Video Preview</DialogTitle>
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
        <DialogContent className="max-w-md w-full bg-white backdrop-blur-lg border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900">{selectedQR?.title}</DialogTitle>
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
                <p className="text-slate-700 text-center text-sm">
                  Scan this QR code to access your template
                </p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
