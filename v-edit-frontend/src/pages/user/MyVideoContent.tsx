import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Video,
  Download,
  Search,
  CheckCircle,
  Eye,
  Filter,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Play,
  Film,
  Clock
} from 'lucide-react';
import { getVideoHierarchy, backend } from '@/lib/backend';
import type { VideoContent } from '@/lib/types';
import { toast } from 'sonner';

const MyVideoContent = () => {
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'price'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    loadPurchasedVideos();
  }, []);

  const loadPurchasedVideos = async () => {
    try {
      setLoading(true);

      // Get all video content
      const data = await getVideoHierarchy(undefined);
      const allVideos = data.videos || [];

      console.log('🎬 All available video content:', allVideos.length);

      // Get user's purchases to filter owned videos
      console.log('🔄 Fetching purchases from /api/purchases...');
      const response = await backend.get('/purchases');

      console.log('📡 Response status:', response.status);
      console.log('📡 Response data:', response.data);

      const purchases = response.data.purchases || [];

      console.log('🔍 All purchase items:');
      purchases.forEach((purchase: any, index: number) => {
        if (purchase.items && purchase.items.length > 0) {
          console.log(`Purchase ${index} (${purchase.items.length} items):`, purchase.items);
        }
      });

      // Get purchased video IDs
      const purchasedVideoIds = new Set(
        purchases.flatMap((purchase: any) =>
          purchase.items
            .filter((item: any) => item.type === 'video-content' && item.templateId)
            .map((item: any) => item.templateId)
        )
      );

      console.log('🎯 Purchased video content IDs:', Array.from(purchasedVideoIds));

      // Filter to only show purchased videos
      const purchasedVideos = allVideos.filter(video =>
        purchasedVideoIds.has(video._id)
      );

      console.log('✅ Final purchased videos count:', purchasedVideos.length);
      console.log('✅ Purchased videos:', purchasedVideos);

      setVideos(purchasedVideos);
    } catch (error) {
      console.error('Error loading purchased videos:', error);
      toast.error('Failed to load purchased videos');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (video: VideoContent) => {
    try {
      toast.info('Starting download...');

      // Open the download URL in a new tab
      const link = document.createElement('a');
      link.href = video.downloadVideoUrl;
      link.download = `${video.title}.${video.format}`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Downloading ${video.title}`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download video');
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  // Filter videos
  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        video.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || video.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort videos
  const sortedVideos = [...filteredVideos].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'price':
        const priceA = a.discountPrice || a.basePrice;
        const priceB = b.discountPrice || b.basePrice;
        comparison = priceA - priceB;
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-100 via-blue-100 to-indigo-100 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              My Video Content
            </h1>
            <p className="text-slate-600">
              Access and download your purchased videos
            </p>
          </div>
          <div className="bg-white rounded-xl px-6 py-3 shadow-md">
            <div className="text-sm text-slate-500">Total Videos</div>
            <div className="text-3xl font-bold text-purple-600">{videos.length}</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500 z-10" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="pl-10 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="animations">Animations</option>
              <option value="tutorials">Tutorials</option>
              <option value="music-videos">Music Videos</option>
              <option value="commercials">Commercials</option>
              <option value="documentaries">Documentaries</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'price')}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
            </select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-white shadow-sm' : ''}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-white shadow-sm' : ''}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Videos Grid/List */}
      {sortedVideos.length > 0 ? (
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-6`}>
          {sortedVideos.map((video) => (
            <Card key={video._id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
              <CardContent className="p-0">
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gradient-to-br from-purple-100 to-blue-100 overflow-hidden">
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="h-16 w-16 text-purple-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white font-medium flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDuration(video.duration)}
                  </div>
                  <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Purchased
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 mb-1 line-clamp-1">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {video.description}
                      </p>
                    )}
                  </div>

                  {video.category && (
                    <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      {video.category}
                    </div>
                  )}

                  <div className="text-xs text-slate-500 space-y-1">
                    {video.resolution && (
                      <div>Resolution: {video.resolution.width}x{video.resolution.height}</div>
                    )}
                    <div>Format: {video.format.toUpperCase()}</div>
                    <div>Size: {formatFileSize(video.fileSize)}</div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-slate-200">
                    <Button
                      onClick={() => handleDownload(video)}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      onClick={() => window.open(video.downloadVideoUrl, '_blank')}
                      variant="outline"
                      className="border-purple-300 text-purple-700 hover:bg-purple-50"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl shadow-md">
          <Video className="h-20 w-20 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">
            {searchTerm || filterCategory !== 'all'
              ? 'No videos found matching your filters'
              : 'No purchased videos yet'}
          </h3>
          <p className="text-slate-500 mb-6">
            {searchTerm || filterCategory !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Browse the marketplace to purchase your first video'}
          </p>
          {!searchTerm && filterCategory === 'all' && (
            <Button
              onClick={() => window.location.href = '/video-content'}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              Browse Videos
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default MyVideoContent;
