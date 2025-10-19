import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Music,
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
  Headphones,
  Sparkles,
  Heart,
  CheckCircle,
  Disc,
  Radio,
} from "lucide-react";
import { getAudioHierarchy } from "@/lib/backend";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import type { AudioFolder, AudioContent } from "@/lib/types";

const AudioExplorer = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [folders, setFolders] = useState<AudioFolder[]>([]);
  const [audio, setAudio] = useState<AudioContent[]>([]);
  const [path, setPath] = useState<AudioFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [selectedAudio, setSelectedAudio] = useState<AudioContent | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { addItem } = useCart();

  const currentFolderId = params.get("folderId");

  useEffect(() => {
    loadHierarchy();
  }, [currentFolderId]);

  const loadHierarchy = async () => {
    try {
      setLoading(true);
      const data = await getAudioHierarchy(currentFolderId || undefined);
      setFolders(data.folders || []);
      setAudio(data.audio || []);
      setPath(data.path || []);
    } catch (error) {
      console.error("Error loading audio hierarchy:", error);
      toast.error("Failed to load audio content");
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

  const handleAddToCart = (audioItem: AudioContent) => {
    const price = audioItem.discountPrice || audioItem.basePrice;
    addItem({
      id: audioItem._id,
      type: "audio-content",
      title: audioItem.title,
      price,
    });
    toast.success(`${audioItem.title} added to cart!`);
  };

  const handlePreview = (audioItem: AudioContent) => {
    setSelectedAudio(audioItem);
    setPreviewOpen(true);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatBitrate = (bitrate?: number) => {
    if (!bitrate) return "N/A";
    return `${Math.round(bitrate / 1000)} kbps`;
  };

  const filteredAudio = audio.filter((audioItem) => {
    const matchesSearch =
      audioItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audioItem.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audioItem.artist?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audioItem.album?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audioItem.tags?.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    const matchesCategory =
      filterCategory === "all" || audioItem.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredFolders = folders.filter((folder) => {
    const matchesSearch = folder.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || folder.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading audio content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-pink-50 text-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-100 via-pink-100 to-red-100 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-orange-200/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-200/20 to-pink-200/20"></div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-3">
                  Audio Content
                </h1>
                <p className="text-slate-700 text-xl">
                  Discover and purchase high-quality audio content
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => navigate("/user/dashboard")}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6 py-3 font-semibold"
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
            className="text-slate-600 hover:text-slate-900 hover:bg-orange-50 rounded-lg px-3 py-2"
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
                className="text-slate-600 hover:text-slate-900 hover:bg-pink-50 rounded-lg px-3 py-2"
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
                placeholder="Search audio, artists, albums, or tags…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 bg-white/80 border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500 rounded-xl h-12"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="pl-10 pr-10 py-3 bg-white/80 border border-slate-300 text-slate-900 rounded-xl focus:border-orange-500 focus:ring-orange-500 appearance-none cursor-pointer h-12 font-medium"
                >
                  <option value="all">All Categories</option>
                  <option value="audiobooks">📚 Audiobooks</option>
                  <option value="music">🎵 Music</option>
                  <option value="podcasts">🎙️ Podcasts</option>
                  <option value="sound-effects">🔊 Sound Effects</option>
                  <option value="ambient">🌊 Ambient</option>
                  <option value="other">🌟 Other</option>
                </select>
              </div>
              <div className="flex bg-slate-100 rounded-xl p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={`rounded-lg ${viewMode === "grid" ? "bg-white shadow-md" : ""}`}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={`rounded-lg ${viewMode === "list" ? "bg-white shadow-md" : ""}`}
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
              <FolderIcon className="h-6 w-6 mr-2 text-orange-600" />
              Folders
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredFolders.map((folder) => (
                <Card
                  key={folder._id}
                  onClick={() => navigateToFolder(folder._id)}
                  className="bg-white/90 backdrop-blur-lg border-slate-200/50 hover:border-orange-400 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:scale-105 group overflow-hidden"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-orange-100 to-pink-100 rounded-xl group-hover:from-orange-200 group-hover:to-pink-200 transition-colors">
                        <FolderIcon className="h-8 w-8 text-orange-600" />
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-orange-100 text-orange-700"
                      >
                        {folder.totalAudio || 0} tracks
                      </Badge>
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-orange-600 transition-colors">
                      {folder.name}
                    </h3>
                    {folder.description && (
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {folder.description}
                      </p>
                    )}
                    {folder.category && (
                      <Badge
                        variant="outline"
                        className="mt-3 border-orange-300 text-orange-700"
                      >
                        {folder.category}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Audio Section */}
        {filteredAudio.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center">
              <Music className="h-6 w-6 mr-2 text-orange-600" />
              Audio Tracks ({filteredAudio.length})
            </h2>
            <div
              className={`grid ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"} gap-6`}
            >
              {filteredAudio.map((audioItem) => (
                <Card
                  key={audioItem._id}
                  className="bg-white/90 backdrop-blur-lg border-slate-200/50 hover:border-orange-400 transition-all duration-300 hover:shadow-2xl group overflow-hidden"
                >
                  <CardHeader className="p-0">
                    <div className="relative aspect-square bg-gradient-to-br from-orange-100 to-pink-100 overflow-hidden">
                      {audioItem.thumbnailUrl ? (
                        <img
                          src={audioItem.thumbnailUrl}
                          alt={audioItem.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Disc className="h-24 w-24 text-orange-400 animate-spin-slow" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white font-medium flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDuration(audioItem.duration)}
                      </div>
                      <Button
                        onClick={() => handlePreview(audioItem)}
                        className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-orange-600/90 hover:bg-orange-700 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <Play className="h-8 w-8" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 mb-1 line-clamp-1">
                        {audioItem.title}
                      </h3>
                      {audioItem.artist && (
                        <p className="text-sm text-slate-600 line-clamp-1">
                          by {audioItem.artist}
                        </p>
                      )}
                      {audioItem.album && (
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {audioItem.album}
                        </p>
                      )}
                      {audioItem.description &&
                        !audioItem.artist &&
                        !audioItem.album && (
                          <p className="text-sm text-slate-600 line-clamp-2">
                            {audioItem.description}
                          </p>
                        )}
                    </div>

                    {audioItem.tags && audioItem.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {audioItem.tags.slice(0, 3).map((tag, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs bg-orange-50 text-orange-700"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <div>
                        {audioItem.discountPrice ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-slate-500 line-through">
                              ₹{audioItem.basePrice}
                            </span>
                            <span className="text-xl font-bold text-orange-600">
                              ₹{audioItem.discountPrice}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xl font-bold text-orange-600">
                            ₹{audioItem.basePrice}
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handlePreview(audioItem)}
                          variant="outline"
                          size="sm"
                          className="border-orange-300 text-orange-700 hover:bg-orange-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleAddToCart(audioItem)}
                          size="sm"
                          className="bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white"
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center justify-between">
                      <span className="uppercase">{audioItem.format}</span>
                      <span>{formatFileSize(audioItem.fileSize)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredFolders.length === 0 && filteredAudio.length === 0 && (
          <div className="text-center py-20 bg-white/90 backdrop-blur-lg rounded-2xl border border-slate-200/50">
            <Music className="h-20 w-20 text-slate-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-700 mb-2">
              No audio found
            </h3>
            <p className="text-slate-500">
              {searchTerm || filterCategory !== "all"
                ? "Try adjusting your search or filters"
                : "This folder is empty"}
            </p>
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-800">
              {selectedAudio?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedAudio && (
            <div className="space-y-4">
              <div className="relative bg-gradient-to-br from-orange-100 to-pink-100 rounded-lg p-8">
                {selectedAudio.thumbnailUrl ? (
                  <img
                    src={selectedAudio.thumbnailUrl}
                    alt={selectedAudio.title}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                ) : (
                  <div className="w-full h-64 flex items-center justify-center mb-4">
                    <Headphones className="h-32 w-32 text-orange-400" />
                  </div>
                )}
                <audio
                  src={selectedAudio.previewAudioUrl}
                  controls
                  className="w-full"
                >
                  Your browser does not support the audio tag.
                </audio>
                <div className="mt-2 text-center text-sm text-orange-600 font-semibold">
                  🎵 Preview Audio
                </div>
              </div>

              {selectedAudio.artist && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Artist</h4>
                  <p className="text-slate-600">{selectedAudio.artist}</p>
                </div>
              )}

              {selectedAudio.album && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Album</h4>
                  <p className="text-slate-600">{selectedAudio.album}</p>
                </div>
              )}

              {selectedAudio.description && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">
                    Description
                  </h4>
                  <p className="text-slate-600">{selectedAudio.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">
                    Duration
                  </h4>
                  <p className="text-slate-600">
                    {formatDuration(selectedAudio.duration)}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Format</h4>
                  <p className="text-slate-600 uppercase">
                    {selectedAudio.format}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Bitrate</h4>
                  <p className="text-slate-600">
                    {formatBitrate(selectedAudio.bitrate)}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">
                    File Size
                  </h4>
                  <p className="text-slate-600">
                    {formatFileSize(selectedAudio.fileSize)}
                  </p>
                </div>
              </div>

              {selectedAudio.tags && selectedAudio.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAudio.tags.map((tag, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="bg-orange-50 text-orange-700"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div>
                  {selectedAudio.discountPrice ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-lg text-slate-500 line-through">
                        ₹{selectedAudio.basePrice}
                      </span>
                      <span className="text-3xl font-bold text-orange-600">
                        ₹{selectedAudio.discountPrice}
                      </span>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold text-orange-600">
                      ₹{selectedAudio.basePrice}
                    </span>
                  )}
                </div>
                <Button
                  onClick={() => {
                    handleAddToCart(selectedAudio);
                    setPreviewOpen(false);
                  }}
                  className="bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold text-lg"
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

export default AudioExplorer;
