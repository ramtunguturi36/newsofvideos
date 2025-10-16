import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Folder as FolderIcon, 
  FileVideo, 
  ShoppingCart, 
  Eye, 
  Play,
  CheckCircle,
  Lock,
  Users,
  Calendar
} from 'lucide-react';
import { getPurchasableFolders, getFolderPreview, checkFolderAccess } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import type { Folder, FolderPreview, UserAccess } from '@/lib/types';

const FolderMarketplace = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<FolderPreview | null>(null);
  const [userAccess, setUserAccess] = useState<Record<string, boolean>>({});
  const { addItem } = useCart();

  useEffect(() => {
    loadFolders();
    
    // Check for refresh flag from payment success
    const checkRefreshFlag = () => {
      if (localStorage.getItem('refreshOrders') === 'true') {
        console.log('Refreshing folder access after payment...');
        loadFolders();
        localStorage.removeItem('refreshOrders');
      }
    };
    
    checkRefreshFlag();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      checkRefreshFlag();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadFolders = async () => {
    try {
      setLoading(true);
      const foldersData = await getPurchasableFolders();
      setFolders(foldersData);

      // Check user access for each folder
      const token = localStorage.getItem('token');
      if (token) {
        const accessChecks = await Promise.allSettled(
          foldersData.map(folder => checkFolderAccess(folder._id))
        );
        
        const accessMap: Record<string, boolean> = {};
        accessChecks.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            accessMap[foldersData[index]._id] = result.value.hasAccess;
          }
        });
        setUserAccess(accessMap);
      }
    } catch (error) {
      console.error('Error loading folders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (folder: Folder) => {
    try {
      const preview = await getFolderPreview(folder._id);
      // Convert the preview data to match the expected structure
      const folderPreview: FolderPreview = {
        folder: {
          ...folder,
          totalTemplates: preview.templateCount || folder.totalTemplates
        },
        templates: preview.templates
      };
      setSelectedFolder(folderPreview);
      setPreviewOpen(true);
    } catch (error) {
      console.error('Error loading folder preview:', error);
    }
  };

  const handleAddToCart = (folder: Folder) => {
    console.log('Adding folder to cart:', folder);
    const price = folder.discountPrice || folder.basePrice;
    console.log('Folder price:', price);
    
    addItem({
      id: folder._id,
      type: 'folder',
      title: folder.name,
      price
    });
    
    toast.success(`${folder.name} added to cart!`);
    console.log('Folder added to cart successfully');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading folder marketplace...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Template Folder Marketplace
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Purchase entire collections of templates and get instant access to all contents. 
            Perfect for comprehensive design packages and themed collections.
          </p>
        </div>

        {/* Folders Grid */}
        {folders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {folders.map((folder) => {
              const hasAccess = userAccess[folder._id];
              const price = folder.discountPrice || folder.basePrice;
              const originalPrice = folder.discountPrice ? folder.basePrice : null;
              
              console.log('Folder:', folder.name, 'hasAccess:', hasAccess, 'userAccess:', userAccess);

              return (
                <motion.div
                  key={folder._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    {/* Folder Thumbnail */}
                    <div className="relative aspect-video bg-gradient-to-br from-indigo-500 to-purple-600">
                      {folder.coverPhotoUrl ? (
                        <img 
                          src={folder.coverPhotoUrl} 
                          alt={folder.name}
                          className="w-full h-full object-cover"
                        />
                      ) : folder.thumbnailUrl ? (
                        <img 
                          src={folder.thumbnailUrl} 
                          alt={folder.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <FolderIcon className="h-16 w-16 text-white/80" />
                        </div>
                      )}
                      
                      {/* Access Status Badge */}
                      {hasAccess && (
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-green-500 text-white">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Owned
                          </Badge>
                        </div>
                      )}

                      {/* Discount Badge */}
                      {folder.discountPrice && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="destructive">
                            {Math.round(((folder.basePrice - folder.discountPrice) / folder.basePrice) * 100)}% OFF
                          </Badge>
                        </div>
                      )}

                      {/* Preview Button */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handlePreview(folder)}
                          className="bg-white/90 text-gray-900 hover:bg-white"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                      </div>
                    </div>

                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold line-clamp-1">
                        {folder.name}
                      </CardTitle>
                      {folder.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {folder.description}
                        </p>
                      )}
                    </CardHeader>

                    <CardContent className="pt-0">
                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <FileVideo className="h-4 w-4 mr-1" />
                          {folder.totalTemplates} templates
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(folder.createdAt)}
                        </div>
                      </div>

                      {/* Sample Templates */}
                      {folder.sampleTemplates && folder.sampleTemplates.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 mb-2">Preview templates:</p>
                          <div className="flex space-x-1">
                            {folder.sampleTemplates.slice(0, 3).map((template) => (
                              <div key={template._id} className="relative w-12 h-8 bg-gray-200 rounded overflow-hidden">
                                <video 
                                  src={template.videoUrl} 
                                  className="w-full h-full object-cover"
                                  muted
                                />
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                  <Play className="h-3 w-3 text-white" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Pricing and Action */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold text-gray-900">
                              ₹{price}
                            </span>
                            {originalPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                ₹{originalPrice}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {hasAccess ? (
                          <Button variant="outline" disabled>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Owned
                          </Button>
                        ) : (
                          <Button
                            onClick={() => {
                              console.log('Add to cart button clicked for folder:', folder.name);
                              handleAddToCart(folder);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700"
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Cart
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FolderIcon className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Folders Available</h3>
            <p className="text-gray-600">
              Check back later for new template collections and folder packages.
            </p>
          </div>
        )}

        {/* Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            {selectedFolder && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">
                    {selectedFolder.folder.name}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedFolder.folder.description || 'Template collection'}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Folder Stats */}
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center">
                      <FileVideo className="h-4 w-4 mr-1" />
                      {selectedFolder.templates.length} templates
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      Created by {selectedFolder.folder.createdBy}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(selectedFolder.folder.createdAt)}
                    </div>
                  </div>

                  {/* Templates Grid */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Included Templates</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {selectedFolder.templates.map((template) => (
                        <div key={template._id} className="bg-gray-50 rounded-lg p-3">
                          <div className="relative aspect-video bg-black rounded mb-2">
                            <video 
                              src={template.videoUrl} 
                              className="w-full h-full object-cover rounded"
                              muted
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <Play className="h-6 w-6 text-white" />
                            </div>
                          </div>
                          <h5 className="font-medium text-sm line-clamp-1">{template.title}</h5>
                          {template.description && (
                            <p className="text-xs text-gray-600 line-clamp-1 mt-1">
                              {template.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-medium">
                              ₹{template.discountPrice || template.basePrice}
                            </span>
                            {template.discountPrice && (
                              <span className="text-xs text-gray-500 line-through">
                                ₹{template.basePrice}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Bundle Price</h4>
                        <p className="text-sm text-gray-600">
                          Get all {selectedFolder.templates.length} templates
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-green-600">
                            ₹{selectedFolder.folder.discountPrice || selectedFolder.folder.basePrice}
                          </span>
                          {selectedFolder.folder.discountPrice && (
                            <span className="text-lg text-gray-500 line-through">
                              ₹{selectedFolder.folder.basePrice}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          Individual total: ₹{selectedFolder.templates.reduce((sum, t) => sum + (t.discountPrice || t.basePrice), 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3">
                    <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                      Close
                    </Button>
                    {!userAccess[selectedFolder.folder._id] && (
                      <Button
                        onClick={() => {
                          handleAddToCart(selectedFolder.folder);
                          setPreviewOpen(false);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default FolderMarketplace;
