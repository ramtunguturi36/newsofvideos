import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Video,
  Folder as FolderIcon,
  Search,
  Filter,
  Grid,
  List,
  Eye,
  Download,
  ShoppingCart,
  Tag,
  Clock,
  ChevronRight,
  Home,
  ArrowLeft,
  Play,
  Film,
  Sparkles,
  Heart,
  CheckCircle
} from 'lucide-react';
import { getVideoHierarchy } from '@/lib/backend';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import type { VideoFolder, VideoContent } from '@/lib/types';

const VideoExplorer = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [folders, setFolders] = useState<VideoFolder[]>([]);
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [path, setPath] = useState<VideoFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedVideo, setSelectedVideo] = useState<VideoContent | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { addItem } = useCart();

  const currentFolderId = params.get('folderId');

  useEffect(() => {
    loadHierarchy();
  }, [currentFolderId]);

  const loadHierarchy = async () => {
    try {
      setLoading(true);
      const data = await getVideoHierarchy(currentFolderId || undefined);
      setFolders(data.folders || []);
      setVideos(data.videos || []);
      setPath(data.path || []);
    } catch (error) {
      console.error('Error loading video hierarchy:', error);
      toast.error('Failed to load video content');
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

  const handleAddToCart = (video: VideoContent) => {
    const price = video.discountPrice || video.basePrice;
    addItem({
      id: video._id,
      type: 'video-content',
      title: video.title,
      price
    });
    toast.success(`${video.title} added to cart!`);
  };

  const handlePreview = (video: VideoContent) => {
    setSelectedVideo(video);
    setPreviewOpen(true);
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

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        video.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        video.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || video.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredFolders = folders.filter(folder => {
    const matchesSearch = folder.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || folder.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading video content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-blue-50 text-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-100 via-blue-100 to-indigo-100 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-purple-200/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-200/20 to-blue-200/20"></div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                  Video Content
                </h1>
                <p className="text-slate-700 text-xl">
                  Discover and purchase high-quality video content
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => navigate('/user/dashboard')}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6 py-3 font-semibold"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm bg-white/90 backdrop-blur-lg rounded-xl p-4 border border-slate-200/50 shadow-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setParams({})}
            className="text-slate-600 hover:text-slate-900 hover:bg-purple-50 rounded-lg px-3 py-2"
          >
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
          {path.map((folder) => (
            <React.Fragment key={folder._id}>
              <ChevronRight className="h-4 w-4 text-slate-400" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setParams({ folderId: folder._id })}
                className="text-slate-600 hover:text-slate-900 hover:bg-blue-50 rounded-lg px-3 py-2"
              >
                {folder.name}
              </Button>
            </React.Fragment>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-slate-200/50">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500" />
              <Input
                placeholder="Search videos, tags, or descriptions…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 bg-white/80 border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500 rounded-xl h-12"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="pl-10 pr-10 py-3 bg-white/80 border border-slate-300 text-slate-900 rounded-xl focus:border-purple-500 focus:ring-purple-500 appearance-none cursor-pointer h-12 font-medium"
                >
                  <option value="all">All Categories</option>
                  <option value="animations">🎨 Animations</option>
                  <option value="tutorials">📚 Tutorials</option>
                  <option value="music-videos">🎵 Music Videos</option>
                  <option value="commercials">📺 Commercials</option>
                  <option value="documentaries">🎬 Documentaries</option>
                  <option value="other">🌟 Other</option>
                </select>
              </div>
              <div className="flex bg-slate-100 rounded-xl p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`rounded-lg ${viewMode === 'grid' ? 'bg-white shadow-md' : ''}`}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`rounded-lg ${viewMode === 'list' ? 'bg-white shadow-md' : ''}`}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Folders Section */}
        {filteredFolders.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center">
              <FolderIcon className="h-6 w-6 mr-2 text-purple-600" />
              Folders
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredFolders.map((folder) => (
                <Card
                  key={folder._id}
                  onClick={() => navigateToFolder(folder._id)}
                  className="bg-white/90 backdrop-blur-lg border-slate-200/50 hover:border-purple-400 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:scale-105 group overflow-hidden"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl group-hover:from-purple-200 group-hover:to-blue-200 transition-colors">
                        <FolderIcon className="h-8 w-8 text-purple-600" />
                      </div>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                        {folder.totalVideos || 0} videos
                      </Badge>
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-purple-600 transition-colors">
                      {folder.name}
                    </h3>
                    {folder.description && (
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {folder.description}
                      </p>
                    )}
                    {folder.category && (
                      <Badge variant="outline" className="mt-3 border-purple-300 text-purple-700">
                        {folder.category}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Videos Section */}
        {filteredVideos.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center">
              <Video className="h-6 w-6 mr-2 text-purple-600" />
              Videos ({filteredVideos.length})
            </h2>
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-6`}>
              {filteredVideos.map((video) => (
                <Card
                  key={video._id}
                  className="bg-white/90 backdrop-blur-lg border-slate-200/50 hover:border-purple-400 transition-all duration-300 hover:shadow-2xl group overflow-hidden"
                >
                  <CardHeader className="p-0">
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
                      <Button
                        onClick={() => handlePreview(video)}
                        className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-purple-600/90 hover:bg-purple-700 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <Play className="h-8 w-8" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
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

                    {video.tags && video.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {video.tags.slice(0, 3).map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs bg-purple-50 text-purple-700">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <div>
                        {video.discountPrice ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-slate-500 line-through">₹{video.basePrice}</span>
                            <span className="text-xl font-bold text-purple-600">₹{video.discountPrice}</span>
                          </div>
                        ) : (
                          <span className="text-xl font-bold text-purple-600">₹{video.basePrice}</span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handlePreview(video)}
                          variant="outline"
                          size="sm"
                          className="border-purple-300 text-purple-700 hover:bg-purple-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleAddToCart(video)}
                          size="sm"
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {video.resolution && (
                      <div className="text-xs text-slate-500 flex items-center justify-between">
                        <span>{video.resolution.width}x{video.resolution.height}</span>
                        <span>{formatFileSize(video.fileSize)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredFolders.length === 0 && filteredVideos.length === 0 && (
          <div className="text-center py-20 bg-white/90 backdrop-blur-lg rounded-2xl border border-slate-200/50">
            <Video className="h-20 w-20 text-slate-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-700 mb-2">No videos found</h3>
            <p className="text-slate-500">
              {searchTerm || filterCategory !== 'all'
                ? 'Try adjusting your search or filters'
                : 'This folder is empty'}
            </p>
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-800">
              {selectedVideo?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedVideo && (
            <div className="space-y-4">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  src={selectedVideo.previewVideoUrl}
                  controls
                  className="w-full h-full"
                  poster={selectedVideo.thumbnailUrl}
                >
                  Your browser does not support the video tag.
                </video>
                <div className="absolute top-4 left-4 bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold text-sm">
                  PREVIEW ONLY - WATERMARKED
                </div>
              </div>

              {selectedVideo.description && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Description</h4>
                  <p className="text-slate-600">{selectedVideo.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Duration</h4>
                  <p className="text-slate-600">{formatDuration(selectedVideo.duration)}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Format</h4>
                  <p className="text-slate-600 uppercase">{selectedVideo.format}</p>
                </div>
                {selectedVideo.resolution && (
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Resolution</h4>
                    <p className="text-slate-600">
                      {selectedVideo.resolution.width}x{selectedVideo.resolution.height}
                    </p>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">File Size</h4>
                  <p className="text-slate-600">{formatFileSize(selectedVideo.fileSize)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div>
                  {selectedVideo.discountPrice ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-lg text-slate-500 line-through">₹{selectedVideo.basePrice}</span>
                      <span className="text-3xl font-bold text-purple-600">₹{selectedVideo.discountPrice}</span>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold text-purple-600">₹{selectedVideo.basePrice}</span>
                  )}
                </div>
                <Button
                  onClick={() => {
                    handleAddToCart(selectedVideo);
                    setPreviewOpen(false);
                  }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold text-lg"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoExplorer;
