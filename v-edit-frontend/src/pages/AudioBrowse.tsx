import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  FolderOpen,
  ShoppingCart,
  Eye,
  Package,
  Gift,
  Music,
  Loader2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Filter,
  Clock,
} from "lucide-react";
import { getAudioHierarchy } from "@/lib/backend";
import type { AudioFolder, AudioContent } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MarketplaceHeader from "@/components/MarketplaceHeader";

export default function AudioBrowse() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [folders, setFolders] = useState<AudioFolder[]>([]);
  const [audioItems, setAudioItems] = useState<AudioContent[]>([]);
  const [path, setPath] = useState<AudioFolder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "bundles" | "free">(
    "all",
  );
  const { addItem, items: cartItems } = useCart();

  const folderId = params.get("folderId") || undefined;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Audio player state
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [playingStates, setPlayingStates] = useState<Map<string, boolean>>(
    new Map(),
  );
  const [currentTimes, setCurrentTimes] = useState<Map<string, number>>(
    new Map(),
  );
  const [durations, setDurations] = useState<Map<string, number>>(new Map());
  const [volumes, setVolumes] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    loadData();
  }, [folderId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getAudioHierarchy(folderId);
      setFolders(data.folders || []);
      setAudioItems(data.audio || []);
      setPath(data.path || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const navigateToFolder = (folderId: string) => {
    navigate(`/audio-content?folderId=${folderId}`);
  };

  const handleAddToCart = (item: AudioFolder | AudioContent, type: string) => {
    const cartItem = {
      id: item._id,
      type: type,
      title: "name" in item ? item.name : item.title,
      price:
        "discountPrice" in item && item.discountPrice
          ? item.discountPrice
          : "basePrice" in item
            ? item.basePrice
            : 0,
      data: item,
    };
    addItem(cartItem as any);
    toast.success(`Added to cart`);
  };

  const isInCart = (id: string): boolean => {
    return cartItems?.some((item: any) => item.id === id) || false;
  };

  // Filter folders based on filter type and search
  const filteredFolders = folders
    .filter((folder) => {
      if (filterType === "bundles") return folder.isPurchasable;
      if (filterType === "free") return !folder.isPurchasable;
      return true;
    })
    .filter((folder) =>
      folder.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  // Filter audio items based on search
  const filteredAudioItems = audioItems.filter(
    (audio) =>
      audio.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audio.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Pagination logic for audio items
  const totalPages = Math.ceil(filteredAudioItems.length / itemsPerPage);
  const paginatedAudioItems = filteredAudioItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, folderId]);

  // Audio player functions - using useRef to prevent infinite loops
  const audioRefsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  const registerAudioRef = (id: string, element: HTMLAudioElement | null) => {
    if (element && !audioRefsRef.current.has(id)) {
      audioRefsRef.current.set(id, element);

      // Set up event listeners
      const handleLoadedMetadata = () => {
        setDurations((prev) => {
          const newDurations = new Map(prev);
          newDurations.set(id, element.duration);
          return newDurations;
        });
      };

      const handleTimeUpdate = () => {
        setCurrentTimes((prev) => {
          const newTimes = new Map(prev);
          newTimes.set(id, element.currentTime);
          return newTimes;
        });
      };

      const handleEnded = () => {
        setPlayingStates((prev) => {
          const newStates = new Map(prev);
          newStates.set(id, false);
          return newStates;
        });
        setCurrentlyPlaying(null);
      };

      element.addEventListener("loadedmetadata", handleLoadedMetadata);
      element.addEventListener("timeupdate", handleTimeUpdate);
      element.addEventListener("ended", handleEnded);
    }
  };

  const togglePlayPause = (id: string) => {
    const audio = audioRefsRef.current.get(id);
    if (!audio) return;

    // Pause any currently playing audio
    if (currentlyPlaying && currentlyPlaying !== id) {
      const currentAudio = audioRefsRef.current.get(currentlyPlaying);
      if (currentAudio) {
        currentAudio.pause();
        setPlayingStates((prev) => {
          const newStates = new Map(prev);
          newStates.set(currentlyPlaying, false);
          return newStates;
        });
      }
    }

    const isPlaying = playingStates.get(id) || false;
    if (isPlaying) {
      audio.pause();
      setCurrentlyPlaying(null);
    } else {
      audio.play();
      setCurrentlyPlaying(id);
    }

    setPlayingStates((prev) => {
      const newStates = new Map(prev);
      newStates.set(id, !isPlaying);
      return newStates;
    });
  };

  const toggleMute = (id: string) => {
    const audio = audioRefsRef.current.get(id);
    if (!audio) return;

    audio.muted = !audio.muted;
    setVolumes((prev) => {
      const newVolumes = new Map(prev);
      newVolumes.set(id, audio.muted ? 0 : 1);
      return newVolumes;
    });
  };

  const handleSeek = (id: string, value: number) => {
    const audio = audioRefsRef.current.get(id);
    if (!audio) return;

    audio.currentTime = value;
    setCurrentTimes((prev) => {
      const newTimes = new Map(prev);
      newTimes.set(id, value);
      return newTimes;
    });
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading audio content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <MarketplaceHeader
          icon={Music}
          title={path.length > 0 ? path[path.length - 1].name : "Audio Content"}
          subtitle="Browse audio tracks and sound effects. Buy complete bundles or individual items."
          gradient="from-orange-500 to-amber-500"
          breadcrumbs={
            path.length > 0
              ? [
                  { label: "Audio Content", href: "/audio-content" },
                  ...path.map((folder, index) => ({
                    label: folder.name,
                    href:
                      index < path.length - 1
                        ? `/audio-content?folderId=${folder._id}`
                        : undefined,
                  })),
                ]
              : [{ label: "Audio Content" }]
          }
        />

        <div className="mt-8">
          {/* Search and Filter Bar */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search audio content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setFilterType("all")}
                  variant={filterType === "all" ? "default" : "outline"}
                  className={`rounded-xl ${
                    filterType === "all"
                      ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white"
                      : "border-2 border-slate-200"
                  }`}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  All
                </Button>
                <Button
                  onClick={() => setFilterType("bundles")}
                  variant={filterType === "bundles" ? "default" : "outline"}
                  className={`rounded-xl ${
                    filterType === "bundles"
                      ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white"
                      : "border-2 border-slate-200"
                  }`}
                >
                  <Gift className="h-4 w-4 mr-2" />
                  Bundles
                </Button>
                <Button
                  onClick={() => setFilterType("free")}
                  variant={filterType === "free" ? "default" : "outline"}
                  className={`rounded-xl ${
                    filterType === "free"
                      ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white"
                      : "border-2 border-slate-200"
                  }`}
                >
                  Free
                </Button>
              </div>
            </div>
          </div>

          {/* Folders Grid - Only show when at root or has subfolders */}
          {filteredFolders.length > 0 &&
            (folderId === undefined || filteredFolders.length > 0) && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                  <FolderOpen className="h-6 w-6 mr-2 text-orange-600" />
                  {filterType === "bundles"
                    ? "Bundle Deals"
                    : filterType === "free"
                      ? "Browse Categories"
                      : "All Categories"}
                  <span className="ml-3 text-sm font-normal text-slate-500">
                    ({filteredFolders.length})
                  </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredFolders.map((folder) => (
                    <div
                      key={folder._id}
                      className={`group rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                        folder.isPurchasable
                          ? "border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      {/* Folder Badge */}
                      {folder.isPurchasable && (
                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 flex items-center justify-center">
                          <Gift className="h-3 w-3 mr-1" />
                          BUNDLE DEAL - SAVE BIG!
                        </div>
                      )}

                      {/* Folder Image */}
                      <div
                        className="relative aspect-video overflow-hidden bg-slate-100 cursor-pointer"
                        onClick={() =>
                          !folder.isPurchasable && navigateToFolder(folder._id)
                        }
                      >
                        {folder.coverPhotoUrl ? (
                          <img
                            src={folder.coverPhotoUrl}
                            alt={folder.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div
                            className={`w-full h-full flex items-center justify-center ${
                              folder.isPurchasable
                                ? "bg-gradient-to-r from-amber-100 to-orange-100"
                                : "bg-gradient-to-r from-orange-100 to-amber-100"
                            }`}
                          >
                            <FolderOpen
                              className={`h-16 w-16 ${
                                folder.isPurchasable
                                  ? "text-amber-600"
                                  : "text-orange-600"
                              }`}
                            />
                          </div>
                        )}
                      </div>

                      {/* Folder Content */}
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">
                          {folder.name}
                        </h3>

                        {folder.isPurchasable ? (
                          <>
                            {/* Purchasable Folder */}
                            <div className="mb-4">
                              <div className="flex items-baseline space-x-2 mb-1">
                                {folder.discountPrice ? (
                                  <>
                                    <span className="text-2xl font-bold text-slate-900">
                                      ₹{folder.discountPrice}
                                    </span>
                                    <span className="text-sm text-slate-500 line-through">
                                      ₹{folder.basePrice}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-2xl font-bold text-slate-900">
                                    ₹{folder.basePrice}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600">
                                💰 Bundle price • Or buy items individually
                              </p>
                            </div>

                            <div className="space-y-2">
                              <Button
                                onClick={() =>
                                  handleAddToCart(folder, "audio-folder")
                                }
                                disabled={isInCart(folder._id)}
                                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-full font-semibold shadow-lg"
                              >
                                {isInCart(folder._id) ? (
                                  <>
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    In Cart
                                  </>
                                ) : (
                                  <>
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    Buy Bundle
                                  </>
                                )}
                              </Button>
                              <Button
                                onClick={() => navigateToFolder(folder._id)}
                                variant="outline"
                                className="w-full rounded-full border-2 border-slate-300 hover:border-slate-400"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Browse Items
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Free Browse Folder */}
                            <p className="text-sm text-slate-600 mb-4">
                              Browse free • Buy items individually
                            </p>
                            <Button
                              onClick={() => navigateToFolder(folder._id)}
                              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full font-semibold"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Items
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Audio Items Grid - In-Card Player - Only show when inside a folder */}
          {filteredAudioItems.length > 0 && folderId && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                  <Music className="h-6 w-6 mr-2 text-orange-600" />
                  Audio Tracks
                  <span className="ml-3 text-sm font-normal text-slate-500">
                    ({filteredAudioItems.length} total)
                  </span>
                </h2>

                {/* Items per page selector */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-600">Show:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="border border-slate-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm text-slate-600">per page</span>
                </div>
              </div>

              {/* Audio List - Spotify Style */}
              <div className="space-y-2">
                {paginatedAudioItems.map((audio) => {
                  const isPlaying = playingStates.get(audio._id) || false;
                  const duration = durations.get(audio._id) || 0;

                  return (
                    <div
                      key={audio._id}
                      className="group bg-white rounded-lg border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all duration-200 p-4"
                    >
                      {/* Hidden audio element */}
                      <audio
                        ref={(el) => registerAudioRef(audio._id, el)}
                        src={audio.previewAudioUrl}
                        preload="metadata"
                      />

                      <div className="flex items-center gap-4">
                        {/* Play Button - Small */}
                        <button
                          onClick={() => togglePlayPause(audio._id)}
                          className="flex-shrink-0 bg-orange-600 hover:bg-orange-700 text-white rounded-full p-2 shadow-md transition-all"
                        >
                          {isPlaying ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4 fill-white" />
                          )}
                        </button>

                        {/* Audio Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-slate-900 truncate">
                            {audio.title}
                          </h3>
                          {duration > 0 && (
                            <p className="text-sm text-slate-500">
                              {formatTime(duration)}
                            </p>
                          )}
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-2 flex-shrink-0">
                          {audio.discountPrice ? (
                            <>
                              <span className="text-xl font-bold text-slate-900">
                                ₹{audio.discountPrice}
                              </span>
                              <span className="text-sm text-slate-500 line-through">
                                ₹{audio.basePrice}
                              </span>
                            </>
                          ) : (
                            <span className="text-xl font-bold text-slate-900">
                              ₹{audio.basePrice}
                            </span>
                          )}
                        </div>

                        {/* Add to Cart Button */}
                        <Button
                          onClick={() =>
                            handleAddToCart(audio, "audio-content")
                          }
                          disabled={isInCart(audio._id)}
                          className="flex-shrink-0 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-full"
                        >
                          {isInCart(audio._id) ? (
                            <>
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              In Cart
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Add to Cart
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center space-x-2">
                  <Button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                  >
                    Previous
                  </Button>

                  <div className="flex items-center space-x-1">
                    {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = idx + 1;
                      } else if (currentPage <= 3) {
                        pageNum = idx + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + idx;
                      } else {
                        pageNum = currentPage - 2 + idx;
                      }

                      return (
                        <Button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          className={`rounded-full w-10 h-10 ${
                            currentPage === pageNum
                              ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white"
                              : ""
                          }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                  >
                    Next
                  </Button>

                  <span className="text-sm text-slate-600 ml-4">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {filteredFolders.length === 0 && filteredAudioItems.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-slate-100 mb-6">
                <Package className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                No content found
              </h3>
              <p className="text-slate-600 mb-6">
                {searchTerm
                  ? "Try adjusting your search or filter."
                  : "This category is empty."}
              </p>
              {searchTerm && (
                <Button
                  onClick={() => setSearchTerm("")}
                  variant="outline"
                  className="rounded-full"
                >
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
