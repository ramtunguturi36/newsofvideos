import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { 
  Folder as FolderIcon, 
  FileVideo, 
  Download, 
  Eye,
  Play,
  Calendar,
  CheckCircle,
  Search,
  Clock,
  QrCode,
  Video
} from 'lucide-react';
import { getPurchasedFolders } from '@/lib/api';
import type { TemplateItem } from '@/lib/types';

interface PurchasedFolder {
  _id: string;
  name: string;
  description?: string;
  purchaseDate: string;
  templates: TemplateItem[];
  coverPhotoUrl?: string;
  thumbnailUrl?: string;
}

const PurchasedFolders = () => {
  const [folders, setFolders] = useState<PurchasedFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedQR, setSelectedQR] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    loadPurchasedFolders();
  }, []);

  const loadPurchasedFolders = async () => {
    try {
      setLoading(true);
      const foldersData = await getPurchasedFolders();
      console.log('Received folder data:', foldersData);
      setFolders(foldersData);
    } catch (error) {
      console.error('Error loading purchased folders:', error);
    } finally {
      setLoading(false);
    }
  };

  const openVideoModal = (videoUrl: string) => {
    setSelectedVideo(videoUrl);
  };

  const openQRModal = (qrUrl: string, title: string) => {
    setSelectedQR({ url: qrUrl, title });
  };

  // Filter folders based on search term
  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    folder.templates.some(template =>
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 text-slate-900 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-slate-600">Loading your folders...</p>
            </div>
          </div>
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
              My Purchased Folders
            </h2>
            <p className="text-slate-700 text-sm md:text-base mt-1">
              Access all templates from your purchased folder collections
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search folders and templates..."
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
                      <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500/20 to-teal-500/20 overflow-hidden">
                        {folder.coverPhotoUrl ? (
                          <div className="relative h-12 w-12">
                            <img 
                              src={folder.coverPhotoUrl} 
                              alt={folder.name}
                              className="absolute inset-0 h-full w-full object-cover rounded-lg"
                              onError={(e) => {
                                console.error('Error loading image:', folder.coverPhotoUrl);
                                e.currentTarget.onerror = null;
                                e.currentTarget.style.display = 'none';
                                const fallbackElement = document.createElement('div');
                                fallbackElement.innerHTML = `<div class="h-full w-full flex items-center justify-center"><svg class="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z" /></svg></div>`;
                                e.currentTarget.parentNode.appendChild(fallbackElement.firstChild);
                              }}
                            />
                          </div>
                        ) : (
                          <FolderIcon className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                        )}
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
                      {formatDate(folder.purchaseDate)}
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
                              ₹{template.discountPrice || template.basePrice}
                            </span>
                          </div>

                          {/* Order ID */}
                          <div className="mb-3">
                            <Badge variant="outline" className="text-xs bg-white/80 border-slate-300 text-slate-700 px-1.5 py-0.5">
                              #{folder.purchaseDate.slice(-6)}
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
              <FolderIcon className="h-16 w-16 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              {searchTerm ? 'No folders found' : 'No purchased folders yet'}
            </h3>
            <p className="text-slate-600 text-lg mb-8">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Purchase some folder collections to see them here'
              }
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => window.location.href = '/folders'}
                className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-8 py-3 text-lg"
              >
                Browse Folder Marketplace
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
                <Button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = selectedQR.url;
                    link.download = `qr-code-${selectedQR.title}.png`;
                    link.click();
                  }}
                  className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download QR Code
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchasedFolders;
