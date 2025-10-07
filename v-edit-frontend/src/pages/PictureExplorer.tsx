import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Image as ImageIcon, 
  Folder as FolderIcon, 
  Search, 
  Filter, 
  Grid, 
  List,
  Eye,
  Download,
  ShoppingCart,
  Tag,
  Ruler,
  FileImage,
  ChevronRight,
  Home,
  Star,
  Clock
} from 'lucide-react';
import { getPictureHierarchy } from '@/lib/backend';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import type { PictureFolder, PictureTemplate } from '@/lib/types';

const PictureExplorer = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [folders, setFolders] = useState<PictureFolder[]>([]);
  const [templates, setTemplates] = useState<PictureTemplate[]>([]);
  const [path, setPath] = useState<PictureFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<PictureTemplate | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { addItem } = useCart();

  const currentFolderId = params.get('folderId');

  useEffect(() => {
    loadHierarchy();
  }, [currentFolderId]);

  const loadHierarchy = async () => {
    try {
      setLoading(true);
      const data = await getPictureHierarchy(currentFolderId || undefined);
      setFolders(data.folders || []);
      setTemplates(data.templates || []);
      setPath(data.path || []);
    } catch (error) {
      console.error('Error loading picture hierarchy:', error);
      toast.error('Failed to load picture templates');
    } finally {
      setLoading(false);
    }
  };

  const navigateToFolder = (folderId: string) => {
    setParams({ folderId });
  };

  const navigateUp = () => {
    if (path.length > 0) {
      const parentId = path[path.length - 1].parentId;
      if (parentId) {
        setParams({ folderId: parentId });
      } else {
        setParams({});
      }
    } else {
      setParams({});
    }
  };

  const handleAddToCart = (template: PictureTemplate) => {
    const price = template.discountPrice || template.basePrice;
    addItem({
      id: template._id,
      type: 'picture-template',
      title: template.title,
      price
    });
    toast.success(`${template.title} added to cart!`);
  };

  const handlePreview = (template: PictureTemplate) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredFolders = folders.filter(folder => {
    const matchesSearch = folder.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || folder.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading picture templates...</p>
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
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              Picture Templates
            </h1>
            <p className="text-slate-700 text-lg mt-2">
              Discover and purchase high-quality picture templates
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={() => navigate('/user/dashboard')}
              variant="outline"
              className="bg-white/80 border-slate-300 text-slate-700 hover:bg-white"
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm bg-white/80 backdrop-blur-lg rounded-lg p-3 border border-slate-200">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setParams({})}
            className="text-slate-600 hover:text-slate-900"
          >
            <Home className="h-4 w-4" />
          </Button>
          {path.map((folder, index) => (
            <React.Fragment key={folder._id}>
              <ChevronRight className="h-4 w-4 text-slate-400" />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setParams({ folderId: folder._id })}
                className="text-slate-600 hover:text-slate-900"
              >
                {folder.name}
              </Button>
            </React.Fragment>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search pictures, tags, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/80 border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md bg-white/80 text-slate-900 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="photography">Photography</option>
              <option value="graphics">Graphics</option>
              <option value="illustrations">Illustrations</option>
              <option value="templates">Templates</option>
              <option value="other">Other</option>
            </select>
            <div className="flex items-center space-x-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="bg-white/80 border-slate-300 text-slate-700 hover:bg-white"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="bg-white/80 border-slate-300 text-slate-700 hover:bg-white"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Folders */}
        {filteredFolders.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Folders</h2>
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-2'}>
              {filteredFolders.map((folder) => (
                <Card key={folder._id} className="group bg-white/90 backdrop-blur-lg border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500/20 to-teal-500/20">
                        <FolderIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-slate-900 line-clamp-1">
                          {folder.name}
                        </CardTitle>
                        <p className="text-slate-600 text-sm">
                          {folder.totalPictures} pictures
                        </p>
                      </div>
                    </div>
                    {folder.description && (
                      <p className="text-slate-600 text-sm line-clamp-2 mt-2">
                        {folder.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline" className="bg-white/80 border-slate-300 text-slate-700">
                        {folder.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => navigateToFolder(folder._id)}
                      className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white border-0"
                    >
                      Open Folder
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Templates */}
        {filteredTemplates.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Picture Templates</h2>
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-2'}>
              {filteredTemplates.map((template) => (
                <Card key={template._id} className="group bg-white/90 backdrop-blur-lg border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
                  <div className="aspect-video bg-slate-100 rounded-t-lg overflow-hidden">
                    <img
                      src={template.previewImageUrl}
                      alt={template.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-slate-900 line-clamp-1 mb-1">
                          {template.title}
                        </CardTitle>
                        {template.description && (
                          <p className="text-slate-600 text-sm line-clamp-2 mb-2">
                            {template.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreview(template)}
                          className="text-slate-500 hover:text-slate-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-3">
                      <Badge variant="outline" className="bg-white/80 border-slate-300 text-slate-700">
                        {template.category || 'Other'}
                      </Badge>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                        {template.format?.toUpperCase() || 'IMAGE'}
                      </Badge>
                      {template.dimensions && (
                        <Badge variant="outline" className="bg-white/80 border-slate-300 text-slate-700">
                          <Ruler className="h-3 w-3 mr-1" />
                          {template.dimensions.width}x{template.dimensions.height}
                        </Badge>
                      )}
                    </div>

                    {template.tags && template.tags.length > 0 && (
                      <div className="flex items-center space-x-1 mb-3">
                        <Tag className="h-3 w-3 text-slate-500" />
                        <div className="flex flex-wrap gap-1">
                          {template.tags.slice(0, 2).map((tag, index) => (
                            <span key={index} className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                          {template.tags.length > 2 && (
                            <span className="text-xs text-slate-500">
                              +{template.tags.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-green-600">
                          ₹{template.discountPrice || template.basePrice}
                        </span>
                        {template.discountPrice && (
                          <span className="text-sm text-slate-500 line-through">
                            ₹{template.basePrice}
                          </span>
                        )}
                      </div>
                      <Button
                        onClick={() => handleAddToCart(template)}
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white border-0"
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Add to Cart
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredFolders.length === 0 && filteredTemplates.length === 0 && (
          <div className="text-center py-16">
            <div className="h-32 w-32 rounded-full bg-white/80 backdrop-blur-lg flex items-center justify-center mx-auto mb-6 border border-slate-200">
              <ImageIcon className="h-16 w-16 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              {searchTerm ? 'No pictures found' : 'No picture templates yet'}
            </h3>
            <p className="text-slate-600 text-lg mb-8">
              {searchTerm 
                ? 'Try adjusting your search terms or filters'
                : 'Check back later for new picture templates'
              }
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => navigate('/user/dashboard')}
                className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-8 py-3 text-lg"
              >
                Back to Dashboard
              </Button>
            )}
          </div>
        )}

        {/* Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-4xl w-full bg-white border-slate-200">
            <DialogHeader>
              <DialogTitle className="text-slate-900">{selectedTemplate?.title}</DialogTitle>
            </DialogHeader>
            {selectedTemplate && (
              <div className="space-y-4">
                <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden">
                  <img
                    src={selectedTemplate.previewImageUrl}
                    alt={selectedTemplate.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-slate-900">Template Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Category:</span>
                        <Badge variant="outline">{selectedTemplate.category}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Format:</span>
                        <span className="font-medium">{selectedTemplate.format.toUpperCase()}</span>
                      </div>
                      {selectedTemplate.dimensions && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Dimensions:</span>
                          <span className="font-medium">
                            {selectedTemplate.dimensions.width}x{selectedTemplate.dimensions.height}px
                          </span>
                        </div>
                      )}
                      {selectedTemplate.fileSize && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">File Size:</span>
                          <span className="font-medium">
                            {(selectedTemplate.fileSize / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3 text-slate-900">Pricing</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Base Price:</span>
                        <span className="font-medium">₹{selectedTemplate.basePrice}</span>
                      </div>
                      {selectedTemplate.discountPrice && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Discount Price:</span>
                          <span className="font-medium text-green-600">₹{selectedTemplate.discountPrice}</span>
                        </div>
                      )}
                      {selectedTemplate.discountPrice && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">You Save:</span>
                          <span className="font-medium text-green-600">
                            ₹{selectedTemplate.basePrice - selectedTemplate.discountPrice}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      onClick={() => {
                        handleAddToCart(selectedTemplate);
                        setPreviewOpen(false);
                      }}
                      className="w-full mt-4 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart - ₹{selectedTemplate.discountPrice || selectedTemplate.basePrice}
                    </Button>
                  </div>
                </div>
                
                {selectedTemplate.tags && selectedTemplate.tags.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-slate-900">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="bg-slate-100 text-slate-700">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PictureExplorer;
