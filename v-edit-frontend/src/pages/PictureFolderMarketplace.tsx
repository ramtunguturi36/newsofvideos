import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Folder as FolderIcon, 
  Image, 
  ShoppingCart, 
  Eye, 
  Download,
  CheckCircle,
  Lock,
  Users,
  Calendar
} from 'lucide-react';
import { getPictureHierarchy } from '@/lib/backend';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import type { PictureFolder, PictureTemplate } from '@/lib/types';

const PictureFolderMarketplace = () => {
  const [folders, setFolders] = useState<PictureFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<PictureFolder | null>(null);
  const [folderTemplates, setFolderTemplates] = useState<PictureTemplate[]>([]);
  const { addItem } = useCart();

  useEffect(() => {
    loadPurchasableFolders();
  }, []);

  const loadPurchasableFolders = async () => {
    try {
      setLoading(true);
      const data = await getPictureHierarchy(undefined);
      
      // Filter only purchasable folders
      const purchasableFolders = data.folders.filter(folder => folder.isPurchasable);
      setFolders(purchasableFolders);
    } catch (error) {
      console.error('Error loading purchasable folders:', error);
      toast.error('Failed to load folders');
    } finally {
      setLoading(false);
    }
  };

  const loadFolderTemplates = async (folderId: string) => {
    try {
      const data = await getPictureHierarchy(folderId);
      setFolderTemplates(data.templates);
    } catch (error) {
      console.error('Error loading folder templates:', error);
      toast.error('Failed to load folder contents');
    }
  };

  const handlePreviewFolder = async (folder: PictureFolder) => {
    setSelectedFolder(folder);
    await loadFolderTemplates(folder._id);
    setPreviewOpen(true);
  };

  const handleAddToCart = (folder: PictureFolder) => {
    if (!addItem) return;
    
    addItem({
      id: folder._id,
      type: 'picture-folder',
      title: folder.name,
      price: folder.discountPrice || folder.basePrice,
      data: folder
    });
    
    toast.success('Added to cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading picture folders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Picture Folder Store
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Browse and purchase complete picture collections at discounted prices
            </p>
          </motion.div>
        </div>

        {/* Folders Grid */}
        {folders.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 border border-slate-200 shadow-lg max-w-md mx-auto">
              <FolderIcon className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Picture Folders Available</h3>
              <p className="text-slate-600">Check back later for new picture collections!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {folders.map((folder, index) => (
              <motion.div
                key={folder._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="group bg-white/80 backdrop-blur-lg border border-slate-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 hover:bg-white/90">
                  <CardHeader className="p-0">
                    <div className="relative aspect-video bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden">
                      {folder.thumbnailUrl ? (
                        <img
                          src={folder.thumbnailUrl}
                          alt={folder.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="h-12 w-12 text-purple-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 hover:bg-white text-slate-700"
                          onClick={() => handlePreviewFolder(folder)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-purple-500 text-white">
                          {folder.totalPictures} pictures
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-2">
                        {folder.name}
                      </h3>
                      {folder.description && (
                        <p className="text-slate-600 text-sm line-clamp-2">
                          {folder.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-purple-600">
                          ₹{folder.discountPrice || folder.basePrice}
                        </span>
                        {folder.discountPrice && (
                          <span className="text-lg text-slate-500 line-through">
                            ₹{folder.basePrice}
                          </span>
                        )}
                      </div>
                      {folder.discountPrice && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Save ₹{folder.basePrice - folder.discountPrice}
                        </Badge>
                      )}
                    </div>

                    <Button
                      onClick={() => handleAddToCart(folder)}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900">
                {selectedFolder?.name}
              </DialogTitle>
              <DialogDescription>
                Preview the contents of this picture collection
              </DialogDescription>
            </DialogHeader>

            {selectedFolder && (
              <div className="space-y-6">
                {/* Folder Info */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center">
                        <Image className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{selectedFolder.name}</h3>
                        <p className="text-sm text-slate-600">
                          {folderTemplates.length} pictures available
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">
                        ₹{selectedFolder.discountPrice || selectedFolder.basePrice}
                      </div>
                      {selectedFolder.discountPrice && (
                        <div className="text-sm text-slate-500 line-through">
                          ₹{selectedFolder.basePrice}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {selectedFolder.description && (
                    <p className="text-slate-600 text-sm">{selectedFolder.description}</p>
                  )}
                </div>

                {/* Templates Preview */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-4">Collection Preview</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {folderTemplates.slice(0, 8).map((template) => (
                      <div
                        key={template._id}
                        className="group bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="aspect-square bg-slate-100 overflow-hidden">
                          {template.previewImageUrl ? (
                            <img
                              src={template.previewImageUrl}
                              alt={template.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Image className="h-8 w-8 text-slate-400" />
                            </div>
                          )}
                        </div>
                        <div className="p-2">
                          <p className="text-xs font-medium text-slate-900 line-clamp-1">
                            {template.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            ₹{template.discountPrice || template.basePrice}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {folderTemplates.length > 8 && (
                    <p className="text-sm text-slate-500 mt-4 text-center">
                      +{folderTemplates.length - 8} more pictures in this collection
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <Button
                    onClick={() => handleAddToCart(selectedFolder)}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart - ₹{selectedFolder.discountPrice || selectedFolder.basePrice}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPreviewOpen(false)}
                    className="px-8"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PictureFolderMarketplace;
