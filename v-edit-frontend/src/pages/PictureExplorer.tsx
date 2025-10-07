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
  Clock,
  ArrowLeft,
  Palette,
  Sparkles,
  Heart,
  CheckCircle
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
    <div className="min-h-screen bg-gradient-to-br from-white via-lavender-50 to-pink-50 text-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Artistic Header */}
        <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-pink-200/50 relative overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-200/20 to-purple-200/20"></div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
                  Picture Templates
                </h1>
                <p className="text-slate-700 text-xl">
                  Discover and purchase high-quality picture templates
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  onClick={() => navigate('/user/dashboard')}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6 py-3 font-semibold"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm bg-white/90 backdrop-blur-lg rounded-xl p-4 border border-slate-200/50 shadow-lg animate-slide-up">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setParams({})}
            className="text-slate-600 hover:text-slate-900 hover:bg-pink-50 rounded-lg px-3 py-2"
          >
            <Home className="h-4 w-4 mr-2" />
            🏠
          </Button>
          {path.map((folder, index) => (
            <React.Fragment key={folder._id}>
              <ChevronRight className="h-4 w-4 text-slate-400" />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setParams({ folderId: folder._id })}
                className="text-slate-600 hover:text-slate-900 hover:bg-purple-50 rounded-lg px-3 py-2"
              >
                {folder.name}
              </Button>
            </React.Fragment>
          ))}
        </div>

        {/* Enhanced Search and Filter Row */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-slate-200/50 animate-scale-in">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500" />
              <Input
                placeholder="Search pictures, tags, or descriptions…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 bg-white/80 border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-pink-500 focus:ring-pink-500 rounded-xl h-12"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-slate-300 rounded-xl bg-white/80 text-slate-900 focus:border-pink-500 focus:ring-pink-500 h-12"
                >
                  <option value="all">All Categories</option>
                  <option value="photography">Photography</option>
                  <option value="graphics">Graphics</option>
                  <option value="illustrations">Illustrations</option>
                  <option value="templates">Templates</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex items-center space-x-2 bg-slate-100 rounded-xl p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`rounded-lg px-3 py-2 ${
                    viewMode === 'grid' 
                      ? 'bg-white shadow-sm text-slate-900' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`rounded-lg px-3 py-2 ${
                    viewMode === 'list' 
                      ? 'bg-white shadow-sm text-slate-900' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
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

        {/* Artistic Picture Templates Grid */}
        {currentFolderId && filteredTemplates.length > 0 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                <Palette className="h-6 w-6 mr-3 text-pink-600" />
                Picture Templates
              </h2>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Sparkles className="h-4 w-4" />
                <span>{filteredTemplates.length} templates available</span>
              </div>
            </div>
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6' : 'space-y-4'}>
              {filteredTemplates.map((template, index) => (
                <div
                  key={template._id}
                  className="group picture-card-enhanced rounded-2xl border border-slate-200/50 hover:border-blue-300 transition-all duration-500 overflow-hidden transform hover:-translate-y-4 hover:scale-105 animate-fade-in shadow-lg hover:shadow-3xl"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Enhanced Picture Preview */}
                  <div className="relative aspect-square bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 overflow-hidden rounded-t-2xl">
                    <img
                      src={template.previewImageUrl}
                      alt={template.title}
                      className="w-full h-full object-cover image-hover-effect"
                    />
                    {/* Elegant Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                    
                    {/* Top Action Buttons */}
                    <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <button
                        onClick={() => handlePreview(template)}
                        className="action-button text-slate-700 rounded-full"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="action-button text-pink-600 rounded-full"
                      >
                        <Heart className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {/* Bottom Info Bar */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="flex items-center justify-between text-white">
                        <span className="text-sm font-medium">{template.format?.toUpperCase() || 'IMAGE'}</span>
                        {template.dimensions && (
                          <span className="text-xs opacity-90">
                            {template.dimensions.width}×{template.dimensions.height}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Card Content */}
                  <div className="p-6 space-y-4">
                    {/* Template Title */}
                    <div>
                      <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 text-lg group-hover:text-pink-700 transition-colors">
                        {template.title}
                      </h3>
                      {template.description && (
                        <p className="text-slate-600 text-sm line-clamp-2">
                          {template.description}
                        </p>
                      )}
                    </div>
                    
                    {/* Enhanced Tags and Categories */}
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-pink-100 to-pink-200 text-pink-700 border border-pink-300 shadow-sm">
                        {template.category || 'Other'}
                      </span>
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 border border-purple-300 shadow-sm">
                        {template.format?.toUpperCase() || 'IMAGE'}
                      </span>
                      {template.dimensions && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border border-blue-300 shadow-sm">
                          <Ruler className="h-3 w-3 mr-1" />
                          {template.dimensions.width}×{template.dimensions.height}
                        </span>
                      )}
                    </div>

                    {/* Enhanced Tags */}
                    {template.tags && template.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {template.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span key={tagIndex} className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full font-medium hover:bg-slate-200 transition-colors">
                            #{tag}
                          </span>
                        ))}
                        {template.tags.length > 3 && (
                          <span className="text-xs text-slate-500 font-medium">
                            +{template.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Enhanced Price and Add to Cart */}
                    <div className="flex items-center justify-between pt-2 gap-3">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-slate-900">
                            ₹{template.discountPrice || template.basePrice}
                          </span>
                          {template.discountPrice && (
                            <span className="text-sm text-slate-500 line-through">
                              ₹{template.basePrice}
                            </span>
                          )}
                        </div>
                        {template.discountPrice && (
                          <span className="bg-gradient-to-r from-red-100 to-red-200 text-red-700 text-xs font-bold px-3 py-1 rounded-full border border-red-300 shadow-sm flex-shrink-0">
                            SALE
                          </span>
                        )}
                      </div>
                      <Button
                        onClick={() => handleAddToCart(template)}
                        className="premium-button text-white border-0 rounded-xl px-4 py-2.5 font-semibold hover:scale-105 text-sm whitespace-nowrap flex-shrink-0"
                      >
                        <ShoppingCart className="h-4 w-4 mr-1.5" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Artistic Empty State */}
        {filteredFolders.length === 0 && filteredTemplates.length === 0 && (
          <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 backdrop-blur-lg rounded-2xl shadow-xl p-16 text-center border border-pink-200/50 animate-fade-in">
            <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center mx-auto mb-8 shadow-lg">
              <ImageIcon className="h-12 w-12 text-pink-600" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-4">
              {searchTerm ? 'No pictures found' : 'No picture templates yet'}
            </h3>
            <p className="text-slate-600 text-xl mb-8">
              {searchTerm 
                ? 'Try adjusting your search terms or filters'
                : 'Check back later for new picture templates'
              }
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => navigate('/user/dashboard')}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
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
