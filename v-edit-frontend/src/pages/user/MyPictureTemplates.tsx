import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Image, 
  Download, 
  Search, 
  CheckCircle, 
  Eye,
  Filter,
  Grid,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { getPictureHierarchy, backend } from '@/lib/backend';
import type { PictureTemplate } from '@/lib/types';
import { toast } from 'sonner';

const MyPictureTemplates = () => {
  const [templates, setTemplates] = useState<PictureTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'price'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Load purchased picture templates
  useEffect(() => {
    const loadPurchasedTemplates = async () => {
      try {
        setLoading(true);
        
        // Test endpoint to check all picture templates in database
        console.log('🧪 Testing direct database query...');
        try {
          const testResponse = await backend.get('/picture-content/test-picture-templates');
          console.log('🧪 Test response:', testResponse.data);
        } catch (testError) {
          console.error('🧪 Test error:', testError);
        }

        // Get all picture templates
        const data = await getPictureHierarchy(undefined);
        const allTemplates = data.templates || [];
        
        console.log('🖼️ All available picture templates:', allTemplates.length);
        allTemplates.forEach((template, index) => {
          console.log(`Template ${index}:`, {
            id: template._id,
            title: template.title,
            category: template.category
          });
        });
        
        // Get user's purchases to filter owned templates
        console.log('🔄 Fetching purchases from /api/purchases...');
        const response = await backend.get('/purchases');
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response data:', response.data);
        
        const purchases = response.data.purchases || [];
        
        // Debug: Log all purchase items to see what types we have
        console.log('🔍 All purchase items:');
        purchases.forEach((purchase, index) => {
          if (purchase.items && purchase.items.length > 0) {
            console.log(`Purchase ${index} (${purchase.items.length} items):`, purchase.items);
            purchase.items.forEach((item, itemIndex) => {
              console.log(`  Item ${itemIndex}:`, {
                type: item.type,
                templateId: item.templateId,
                folderId: item.folderId,
                title: item.title
              });
            });
          }
        });
          
          // Get purchased template IDs
          const purchasedTemplateIds = new Set(
            purchases.flatMap(purchase => 
              purchase.items
                .filter((item: any) => item.type === 'picture-template' && item.templateId)
                .map((item: any) => item.templateId)
            )
          );
          
          console.log('🎯 Purchased picture template IDs:', Array.from(purchasedTemplateIds));
          
          // Filter to only show purchased templates
          const purchasedTemplates = allTemplates.filter(template => 
            purchasedTemplateIds.has(template._id)
          );
          
          console.log('✅ Final purchased templates count:', purchasedTemplates.length);
          console.log('✅ Purchased templates:', purchasedTemplates);
          
          setTemplates(purchasedTemplates);
      } catch (error) {
        console.error('Error loading purchased templates:', error);
        toast.error('Failed to load your picture templates');
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };

    loadPurchasedTemplates();
  }, []);

  // Filter and sort templates
  const filteredTemplates = templates
    .filter(template => {
      const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'date':
          comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          break;
        case 'price':
          comparison = (a.discountPrice || a.basePrice) - (b.discountPrice || b.basePrice);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];

  const handleDownload = (template: PictureTemplate) => {
    if (template.downloadImageUrl) {
      window.open(template.downloadImageUrl, '_blank');
      toast.success('Download started');
    } else {
      toast.error('Download link not available');
    }
  };

  const handlePreview = (template: PictureTemplate) => {
    if (template.previewImageUrl) {
      window.open(template.previewImageUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center">
              <Image className="h-8 w-8 mr-3 text-purple-600" />
              My Picture Templates
            </h1>
            <p className="text-slate-600 mt-2">
              Access and download your purchased picture templates
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">{templates.length}</div>
            <div className="text-sm text-slate-600">Templates Owned</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-slate-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search your picture templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="lg:w-48">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="lg:w-48">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-');
                setSortBy(newSortBy as any);
                setSortOrder(newSortOrder as any);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="price-asc">Price Low-High</option>
              <option value="price-desc">Price High-Low</option>
            </select>
          </div>

          {/* View Mode */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="px-3"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="px-3"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Templates Grid/List */}
      {filteredTemplates.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          : "space-y-4"
        }>
          {filteredTemplates.map((template) => (
            <Card key={template._id} className="group bg-white/80 backdrop-blur-lg border border-slate-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300 overflow-hidden">
              {viewMode === 'grid' ? (
                <>
                  <div className="relative aspect-[4/3] bg-black overflow-hidden cursor-pointer"
                       onClick={() => handlePreview(template)}>
                    {template.previewImageUrl ? (
                      <>
                        <img
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          src={template.previewImageUrl}
                          alt={template.title}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-white/90 rounded-full p-2 shadow-lg">
                              <Eye className="h-4 w-4 text-gray-700" />
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                        <div className="text-center">
                          <Image className="h-8 w-8 text-gray-400 mx-auto mb-1" />
                          <span className="text-gray-400 text-xs">No preview</span>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow-lg">
                      <CheckCircle className="h-3 w-3 inline mr-1" />
                      Owned
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {template.category}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                      {template.title}
                    </h3>
                    {template.description && (
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                        {template.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm text-slate-500">
                        {template.dimensions && `${template.dimensions.width} × ${template.dimensions.height}`}
                      </div>
                      <div className="text-sm font-medium text-purple-600">
                        ₹{template.discountPrice || template.basePrice}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDownload(template)}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </CardContent>
                </>
              ) : (
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative w-20 h-20 bg-black rounded-lg overflow-hidden cursor-pointer flex-shrink-0"
                         onClick={() => handlePreview(template)}>
                      {template.previewImageUrl ? (
                        <img
                          className="w-full h-full object-cover"
                          src={template.previewImageUrl}
                          alt={template.title}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                          <Image className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 mb-1 truncate">
                            {template.title}
                          </h3>
                          {template.description && (
                            <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                              {template.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-slate-500">
                            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                              {template.category}
                            </span>
                            {template.dimensions && (
                              <span>{template.dimensions.width} × {template.dimensions.height}</span>
                            )}
                            <span className="font-medium text-purple-600">
                              ₹{template.discountPrice || template.basePrice}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreview(template)}
                            className="text-slate-600 hover:text-slate-900"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                          <Button
                            onClick={() => handleDownload(template)}
                            size="sm"
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-12 text-center border border-slate-200">
          <Image className="h-16 w-16 text-slate-400 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-slate-900 mb-3">No Picture Templates Yet</h3>
          <p className="text-slate-600 mb-6">
            You haven't purchased any picture templates yet. Start exploring our collection!
          </p>
          <Button
            onClick={() => window.location.href = '/picture-templates'}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            <Image className="h-4 w-4 mr-2" />
            Browse Picture Templates
          </Button>
        </div>
      )}
    </div>
  );
};

export default MyPictureTemplates;
