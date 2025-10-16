import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Image, 
  FolderOpen, 
  Search, 
  CheckCircle, 
  Eye,
  Filter,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Download,
  ExternalLink,
  ArrowLeft,
  Tag,
  Ruler
} from 'lucide-react';
import { getPictureHierarchy, backend } from '@/lib/backend';
import type { PictureFolder, PictureTemplate } from '@/lib/types';
import { toast } from 'sonner';

const MyPictureFolders = () => {
  const [folders, setFolders] = useState<PictureFolder[]>([]);
  const [templates, setTemplates] = useState<PictureTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'price'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentView, setCurrentView] = useState<'folders' | 'templates'>('folders');
  const [selectedFolder, setSelectedFolder] = useState<PictureFolder | null>(null);

  // Load purchased picture folders
  useEffect(() => {
    const loadPurchasedFolders = async () => {
      try {
        setLoading(true);
        
        // Get all picture folders
        const data = await getPictureHierarchy(undefined);
        const allFolders = data.folders || [];
        
        // Get user's purchases to filter owned folders
        const response = await backend.get('/purchases');
        const purchases = response.data.purchases || [];
          
          // Get purchased folder IDs
          const purchasedFolderIds = new Set(
            purchases.flatMap(purchase => 
              purchase.items
                .filter((item: any) => item.type === 'picture-folder' && item.folderId)
                .map((item: any) => item.folderId)
            )
          );
          
          // Filter to only show purchased folders
          const purchasedFolders = allFolders.filter(folder => 
            purchasedFolderIds.has(folder._id)
          );
          
          setFolders(purchasedFolders);
      } catch (error) {
        console.error('Error loading purchased folders:', error);
        toast.error('Failed to load your picture folders');
        setFolders([]);
      } finally {
        setLoading(false);
      }
    };

    loadPurchasedFolders();
  }, []);

  // Open folder and load its templates
  const openFolder = async (folder: PictureFolder) => {
    try {
      setLoading(true);
      setSelectedFolder(folder);
      
      // Load templates in this folder
      const data = await getPictureHierarchy(folder._id);
      setTemplates(data.templates || []);
      setCurrentView('templates');
    } catch (error) {
      console.error('Error loading folder templates:', error);
      toast.error('Failed to load folder contents');
    } finally {
      setLoading(false);
    }
  };

  // Go back to folder list
  const goBackToFolders = () => {
    setCurrentView('folders');
    setSelectedFolder(null);
    setTemplates([]);
  };

  // Filter and sort folders
  const filteredFolders = folders
    .filter(folder => {
      const matchesSearch = folder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           folder.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
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

  // Filter and sort templates
  const filteredTemplates = templates
    .filter(template => {
      const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
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

  const handleDownloadAll = (folder: PictureFolder) => {
    // This would typically download all templates in the folder
    toast.info('Bulk download feature coming soon!');
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
            {currentView === 'folders' ? (
              <>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center">
                  <FolderOpen className="h-8 w-8 mr-3 text-purple-600" />
                  My Picture Folders
                </h1>
                <p className="text-slate-600 mt-2">
                  Access your purchased picture folder collections
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goBackToFolders}
                    className="mr-3 text-slate-600 hover:text-slate-900"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Folders
                  </Button>
                  <h1 className="text-3xl font-bold text-slate-900 flex items-center">
                    <Image className="h-8 w-8 mr-3 text-purple-600" />
                    {selectedFolder?.name}
                  </h1>
                </div>
                <p className="text-slate-600 mt-2">
                  Download individual pictures from this collection
                </p>
              </>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">
              {currentView === 'folders' ? folders.length : templates.length}
            </div>
            <div className="text-sm text-slate-600">
              {currentView === 'folders' ? 'Folders Owned' : 'Pictures Available'}
            </div>
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
                placeholder="Search your picture folders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
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

      {/* Content based on current view */}
      {currentView === 'folders' ? (
        /* Folders Grid/List */
        filteredFolders.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          : "space-y-4"
        }>
          {filteredFolders.map((folder) => (
            <Card key={folder._id} className="group bg-white/80 backdrop-blur-lg border border-slate-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300 overflow-hidden">
              {viewMode === 'grid' ? (
                <>
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center cursor-pointer overflow-hidden"
                       onClick={() => openFolder(folder)}>
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
                      <div className="text-center">
                        <FolderOpen className="h-16 w-16 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                        <div className="text-sm text-purple-700 font-medium">
                          {folder.totalPictures || 0} Pictures
                        </div>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow-lg">
                      <CheckCircle className="h-3 w-3 inline mr-1" />
                      Owned
                    </div>
                    <div className="absolute bottom-2 left-2 bg-white/90 text-purple-700 text-xs px-2 py-1 rounded font-medium">
                      Collection
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                      {folder.name}
                    </h3>
                    {folder.description && (
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                        {folder.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm text-slate-500">
                        {folder.totalPictures || 0} items
                      </div>
                      <div className="text-sm font-medium text-purple-600">
                        ₹{folder.discountPrice || folder.basePrice}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button
                        onClick={() => handleViewFolder(folder)}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Collection
                      </Button>
                      <Button
                        onClick={() => handleDownloadAll(folder)}
                        variant="outline"
                        className="w-full text-purple-600 border-purple-300 hover:bg-purple-50"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download All
                      </Button>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center cursor-pointer flex-shrink-0"
                         onClick={() => handleViewFolder(folder)}>
                      <FolderOpen className="h-10 w-10 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 mb-1 truncate">
                            {folder.name}
                          </h3>
                          {folder.description && (
                            <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                              {folder.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-slate-500">
                            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                              Collection
                            </span>
                            <span>{folder.totalPictures || 0} pictures</span>
                            <span className="font-medium text-purple-600">
                              ₹{folder.discountPrice || folder.basePrice}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openFolder(folder)}
                            className="text-slate-600 hover:text-slate-900"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            onClick={() => handleDownloadAll(folder)}
                            size="sm"
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download All
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
            <FolderOpen className="h-16 w-16 text-slate-400 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-slate-900 mb-3">No Picture Folders Yet</h3>
            <p className="text-slate-600 mb-6">
              You haven't purchased any picture folder collections yet. Start exploring our collections!
            </p>
            <Button
              onClick={() => window.location.href = '/picture-templates'}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              Browse Picture Collections
            </Button>
          </div>
        )
      ) : (
        /* Templates Grid/List */
        filteredTemplates.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            : "space-y-4"
          }>
            {filteredTemplates.map((template) => (
              <Card key={template._id} className="group bg-white/80 backdrop-blur-lg border border-slate-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300 overflow-hidden">
                {viewMode === 'grid' ? (
                  <>
                    <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                      {template.previewImageUrl ? (
                        <img
                          src={template.previewImageUrl}
                          alt={template.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="h-12 w-12 text-slate-400" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow-lg">
                        <CheckCircle className="h-3 w-3 inline mr-1" />
                        Owned
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        Picture
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2 text-sm">
                        {template.title}
                      </h3>
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-lg font-bold text-purple-600">
                          ₹{template.discountPrice || template.basePrice}
                        </div>
                        {template.discountPrice && (
                          <div className="text-sm text-slate-500 line-through">
                            ₹{template.basePrice}
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => window.open(template.downloadImageUrl, '_blank')}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                        {template.previewImageUrl ? (
                          <img
                            src={template.previewImageUrl}
                            alt={template.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Image className="h-8 w-8 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 mb-1 line-clamp-1">
                          {template.title}
                        </h3>
                        {template.description && (
                          <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                            {template.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-slate-500">
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                            Picture
                          </span>
                          <span className="font-medium text-purple-600">
                            ₹{template.discountPrice || template.basePrice}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          onClick={() => window.open(template.downloadImageUrl, '_blank')}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                          size="sm"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
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
            <h3 className="text-xl font-bold text-slate-900 mb-3">No Pictures in This Folder</h3>
            <p className="text-slate-600 mb-6">
              This folder doesn't contain any pictures yet.
            </p>
          </div>
        )
      )}
    </div>
  );
};

export default MyPictureFolders;
