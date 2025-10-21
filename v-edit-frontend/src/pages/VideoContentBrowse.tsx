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
  Gift,
  Film,
  Loader2,
} from "lucide-react";
import { getVideoHierarchy } from "@/lib/backend";
import type { VideoFolder, VideoContent } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

export default function VideoContentBrowse() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [folders, setFolders] = useState<VideoFolder[]>([]);
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [path, setPath] = useState<VideoFolder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "bundles" | "free">(
    "all",
  );
  const { addItem, items: cartItems } = useCart();

  const folderId = params.get("folderId") || undefined;

  useEffect(() => {
    loadData();
  }, [folderId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getVideoHierarchy(folderId);
      setFolders(data.folders || []);
      setVideos(data.videos || []);
      setPath(data.path || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const navigateToFolder = (folderId: string) => {
    navigate(`/video-content?folderId=${folderId}`);
  };

  const handleAddToCart = (item: VideoFolder | VideoContent, type: string) => {
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

  // Filter videos based on search
  const filteredVideos = videos.filter(
    (video) =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading video content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Fixed Navbar */}
      <Navbar />

      {/* Sub Header */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-lg border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate("/user/dashboard")}
                variant="outline"
                className="rounded-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-600">
                <button
                  onClick={() => navigate("/user/dashboard")}
                  className="hover:text-purple-600 transition-colors"
                >
                  <Home className="h-4 w-4 flex-shrink-0" />
                </button>
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-400" />
                <button
                  onClick={() => navigate("/video-content")}
                  className="font-medium text-slate-900 hover:text-purple-600 transition-colors"
                >
                  Video Content
                </button>
                {path.length > 0 && (
                  <>
                    {path.map((folder, index) => (
                      <React.Fragment key={folder._id}>
                        <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-400" />
                        {index === path.length - 1 ? (
                          <span className="font-medium text-slate-900">
                            {folder.name}
                          </span>
                        ) : (
                          <button
                            onClick={() => navigateToFolder(folder._id)}
                            className="hover:text-purple-600 transition-colors font-medium"
                          >
                            {folder.name}
                          </button>
                        )}
                      </React.Fragment>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Search and Filter Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search videos and folders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-full border-slate-300"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                onClick={() => setFilterType("all")}
                className="rounded-full"
              >
                All
              </Button>
              <Button
                variant={filterType === "bundles" ? "default" : "outline"}
                onClick={() => setFilterType("bundles")}
                className="rounded-full"
              >
                <Gift className="h-4 w-4 mr-2" />
                Bundles
              </Button>
              <Button
                variant={filterType === "free" ? "default" : "outline"}
                onClick={() => setFilterType("free")}
                className="rounded-full"
              >
                Free Browse
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            {path.length > 0
              ? path[path.length - 1].name
              : "Video Content Marketplace"}
          </h1>
          <p className="text-lg text-slate-600">
            Browse professional video content. Buy complete bundles or
            individual items.
          </p>
        </div>

        {/* Folders Grid - Only show when at root or has subfolders */}
        {filteredFolders.length > 0 &&
          (folderId === undefined || filteredFolders.length > 0) && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <FolderOpen className="h-6 w-6 mr-2 text-green-600" />
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
                        ? "border-teal-300 bg-gradient-to-br from-teal-50 to-green-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    {/* Folder Badge */}
                    {folder.isPurchasable && (
                      <div className="bg-gradient-to-r from-teal-500 to-green-500 text-white text-xs font-bold px-3 py-1 flex items-center justify-center">
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
                              ? "bg-gradient-to-r from-teal-100 to-green-100"
                              : "bg-gradient-to-r from-green-100 to-teal-100"
                          }`}
                        >
                          <FolderOpen
                            className={`h-16 w-16 ${
                              folder.isPurchasable
                                ? "text-teal-600"
                                : "text-green-600"
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
                                handleAddToCart(folder, "video-folder")
                              }
                              disabled={isInCart(folder._id)}
                              className="w-full bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 text-white rounded-full font-semibold shadow-lg"
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
                            className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-full font-semibold"
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

        {/* Videos Grid - Only show when inside a folder */}
        {filteredVideos.length > 0 && folderId && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
              <Film className="h-6 w-6 mr-2 text-green-600" />
              Video Content
              <span className="ml-3 text-sm font-normal text-slate-500">
                ({filteredVideos.length})
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVideos.map((video) => (
                <div
                  key={video._id}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-green-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Video Preview */}
                  <div className="relative aspect-video bg-black overflow-hidden">
                    {video.previewVideoUrl ? (
                      <video
                        className="w-full h-full object-cover"
                        src={video.previewVideoUrl}
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
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                        <Film className="h-12 w-12 text-slate-400" />
                      </div>
                    )}
                  </div>

                  {/* Video Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2">
                      {video.title}
                    </h3>

                    <div className="flex items-baseline space-x-2 mb-4">
                      <span className="text-2xl font-bold text-slate-900">
                        ₹{video.discountPrice || video.basePrice}
                      </span>
                      {video.discountPrice && (
                        <span className="text-sm text-slate-500 line-through">
                          ₹{video.basePrice}
                        </span>
                      )}
                    </div>

                    <Button
                      onClick={() => handleAddToCart(video, "video-content")}
                      disabled={isInCart(video._id)}
                      className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-full font-semibold"
                    >
                      {isInCart(video._id) ? (
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
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredFolders.length === 0 && filteredVideos.length === 0 && (
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
    </div>
  );
}
