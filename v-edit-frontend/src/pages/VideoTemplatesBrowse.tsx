import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Search,
  FolderOpen,
  ShoppingCart,
  Eye,
  Package,
  ChevronRight,
  Home,
  Filter,
  Gift,
  Video,
  Loader2,
  Play,
  X,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
} from "lucide-react";
import { getHierarchy } from "@/lib/backend";
import type { Folder, TemplateItem } from "@/lib/backend";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MarketplaceHeader from "@/components/MarketplaceHeader";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function VideoTemplatesBrowse() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [path, setPath] = useState<Folder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "bundles" | "free">(
    "all",
  );
  const { addItem, items: cartItems } = useCart();

  const folderId = params.get("folderId") || undefined;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Video modal state
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  useEffect(() => {
    loadData();
  }, [folderId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getHierarchy(folderId);
      setFolders(data.folders || []);
      setTemplates(data.templates || []);
      setPath(data.path || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const navigateToFolder = (folderId: string) => {
    navigate(`/folders?folderId=${folderId}`);
  };

  const handleAddToCart = (item: Folder | TemplateItem, type: string) => {
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

  // Filter templates based on search
  const filteredTemplates = templates.filter(
    (template) =>
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Pagination logic for templates
  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const paginatedTemplates = filteredTemplates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, folderId]);

  const handleVideoPlay = (videoUrl: string) => {
    setSelectedVideo(videoUrl);
    setIsVideoModalOpen(true);
    setIsPlaying(true);
    setIsMuted(false);
  };

  const togglePlayPause = () => {
    if (videoRef) {
      if (isPlaying) {
        videoRef.pause();
      } else {
        videoRef.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef) {
      videoRef.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef) {
      if (videoRef.requestFullscreen) {
        videoRef.requestFullscreen();
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading video templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Navbar />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Marketplace Header */}
          <MarketplaceHeader
            icon={Video}
            title={
              path.length > 0 ? path[path.length - 1].name : "Video Templates"
            }
            subtitle="Browse video templates with QR codes. Buy complete bundles or individual items."
            gradient="from-blue-500 to-cyan-500"
            breadcrumbs={
              path.length > 0
                ? [
                    { label: "Video Templates", href: "/folders" },
                    ...path.map((folder, index) => ({
                      label: folder.name,
                      href:
                        index < path.length - 1
                          ? `/folders?folderId=${folder._id}`
                          : undefined,
                    })),
                  ]
                : [{ label: "Video Templates" }]
            }
          />

          {/* Filters and Search */}
          <div className="mb-6">
            <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-slate-100">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search templates and folders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 bg-slate-50 border-slate-200 rounded-xl"
                  />
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => setFilterType("all")}
                    variant={filterType === "all" ? "default" : "outline"}
                    className={`rounded-xl ${
                      filterType === "all"
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                        : ""
                    }`}
                  >
                    All
                  </Button>
                  <Button
                    onClick={() => setFilterType("bundles")}
                    variant={filterType === "bundles" ? "default" : "outline"}
                    className={`rounded-xl ${
                      filterType === "bundles"
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                        : ""
                    }`}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Bundles
                  </Button>
                  <Button
                    onClick={() => setFilterType("free")}
                    variant={filterType === "free" ? "default" : "outline"}
                    className={`rounded-xl ${
                      filterType === "free"
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                        : ""
                    }`}
                  >
                    <Gift className="h-4 w-4 mr-2" />
                    Free
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid */}

          {/* Folders Grid - Only show when at root or has subfolders */}
          {filteredFolders.length > 0 &&
            (folderId === undefined || filteredFolders.length > 0) && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                  <FolderOpen className="h-6 w-6 mr-2 text-blue-600" />
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
                                : "bg-gradient-to-r from-blue-100 to-cyan-100"
                            }`}
                          >
                            <FolderOpen
                              className={`h-16 w-16 ${
                                folder.isPurchasable
                                  ? "text-amber-600"
                                  : "text-blue-600"
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
                                <span className="text-2xl font-bold text-slate-900">
                                  ₹{folder.discountPrice || folder.basePrice}
                                </span>
                                {folder.discountPrice && (
                                  <span className="text-sm text-slate-500 line-through">
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
                                  handleAddToCart(folder, "folder")
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
                              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-full font-semibold"
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

          {/* Templates Grid - Vertical Reels Style - Only show when inside a folder */}
          {filteredTemplates.length > 0 && folderId && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                  <Video className="h-6 w-6 mr-2 text-purple-600" />
                  Video Templates
                  <span className="ml-3 text-sm font-normal text-slate-500">
                    ({filteredTemplates.length} total)
                  </span>
                </h2>

                {/* Items per page selector */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-600">Show:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="border border-slate-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm text-slate-600">per page</span>
                </div>
              </div>

              {/* Vertical Reels Grid - 9:16 aspect ratio */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {paginatedTemplates.map((template) => (
                  <div
                    key={template._id}
                    className="group bg-white rounded-2xl overflow-hidden border-2 border-slate-200 hover:border-purple-400 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Vertical Video Preview - 9:16 aspect ratio */}
                    <div
                      className="relative overflow-hidden bg-black"
                      style={{ aspectRatio: "9/16" }}
                    >
                      {template.videoUrl ? (
                        <>
                          <video
                            className="w-full h-full object-cover"
                            src={template.videoUrl}
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            onMouseEnter={(e) => e.currentTarget.play()}
                            onMouseLeave={(e) => {
                              e.currentTarget.pause();
                              e.currentTarget.currentTime = 0;
                            }}
                          />
                          {/* Play button overlay */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button
                              onClick={() =>
                                handleVideoPlay(template.videoUrl!)
                              }
                              className="bg-white/90 hover:bg-white rounded-full p-4 shadow-2xl transform hover:scale-110 transition-all duration-300"
                            >
                              <Play className="h-8 w-8 text-purple-600 fill-purple-600" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                          <Video className="h-12 w-12 text-slate-400" />
                        </div>
                      )}

                      {/* Price badge on video */}
                      <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                        ₹{template.discountPrice || template.basePrice}
                      </div>
                    </div>

                    {/* Template Info - Compact */}
                    <div className="p-3">
                      <h3 className="text-sm font-bold text-slate-900 mb-2 line-clamp-2 leading-tight">
                        {template.title}
                      </h3>

                      {/* Price Display */}
                      <div className="flex items-baseline space-x-2 mb-2">
                        {template.discountPrice ? (
                          <>
                            <span className="text-lg font-bold text-slate-900">
                              ₹{template.discountPrice}
                            </span>
                            <span className="text-xs text-slate-500 line-through">
                              ₹{template.basePrice}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-slate-900">
                            ₹{template.basePrice}
                          </span>
                        )}
                      </div>

                      <Button
                        onClick={() => handleAddToCart(template, "template")}
                        disabled={isInCart(template._id)}
                        size="sm"
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-semibold text-xs"
                      >
                        {isInCart(template._id) ? (
                          <>
                            <ShoppingCart className="h-3 w-3 mr-1" />
                            In Cart
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-3 w-3 mr-1" />
                            Add to Cart
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
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
                              ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
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
          {filteredFolders.length === 0 && filteredTemplates.length === 0 && (
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

      {/* Video Player Modal */}
      <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black">
          <div className="relative">
            {selectedVideo && (
              <div className="relative bg-black">
                <video
                  ref={setVideoRef}
                  src={selectedVideo}
                  className="w-full max-h-[80vh] object-contain"
                  autoPlay
                  loop
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                {/* Video Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={togglePlayPause}
                      className="bg-white/90 hover:bg-white rounded-full p-3 transition-all"
                    >
                      {isPlaying ? (
                        <Pause className="h-6 w-6 text-purple-600" />
                      ) : (
                        <Play className="h-6 w-6 text-purple-600 fill-purple-600" />
                      )}
                    </button>

                    <button
                      onClick={toggleMute}
                      className="bg-white/90 hover:bg-white rounded-full p-3 transition-all"
                    >
                      {isMuted ? (
                        <VolumeX className="h-6 w-6 text-purple-600" />
                      ) : (
                        <Volume2 className="h-6 w-6 text-purple-600" />
                      )}
                    </button>

                    <button
                      onClick={handleFullscreen}
                      className="bg-white/90 hover:bg-white rounded-full p-3 transition-all"
                    >
                      <Maximize className="h-6 w-6 text-purple-600" />
                    </button>
                  </div>
                </div>

                {/* Close button */}
                <button
                  onClick={() => setIsVideoModalOpen(false)}
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full p-2 transition-all"
                >
                  <X className="h-6 w-6 text-slate-900" />
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
