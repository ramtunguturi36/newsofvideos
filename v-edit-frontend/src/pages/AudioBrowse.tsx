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
  Music,
  Loader2,
} from "lucide-react";
import { getAudioHierarchy } from "@/lib/backend";
import type { AudioFolder, AudioContent } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading audio content...</p>
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
                  onClick={() => navigate("/audio-content")}
                  className="font-medium text-slate-900 hover:text-purple-600 transition-colors"
                >
                  Audio
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
                placeholder="Search audio and folders..."
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
              : "Audio Content Marketplace"}
          </h1>
          <p className="text-lg text-slate-600">
            Browse music and sound effects. Buy complete bundles or individual
            items.
          </p>
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

        {/* Audio Items Grid - Only show when inside a folder */}
        {filteredAudioItems.length > 0 && folderId && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
              <Music className="h-6 w-6 mr-2 text-orange-600" />
              Audio Content
              <span className="ml-3 text-sm font-normal text-slate-500">
                ({filteredAudioItems.length})
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAudioItems.map((audio) => (
                <div
                  key={audio._id}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-orange-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Audio Preview */}
                  <div className="relative aspect-video bg-gradient-to-br from-orange-100 to-amber-100 overflow-hidden flex items-center justify-center">
                    <Music className="h-16 w-16 text-orange-600" />
                    {audio.previewAudioUrl && (
                      <audio
                        className="absolute bottom-2 left-2 right-2"
                        src={audio.previewAudioUrl}
                        controls
                        preload="metadata"
                      />
                    )}
                  </div>

                  {/* Audio Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2">
                      {audio.title}
                    </h3>

                    <div className="flex items-baseline space-x-2 mb-4">
                      <span className="text-2xl font-bold text-slate-900">
                        ₹{audio.discountPrice || audio.basePrice}
                      </span>
                      {audio.discountPrice && (
                        <span className="text-sm text-slate-500 line-through">
                          ₹{audio.basePrice}
                        </span>
                      )}
                    </div>

                    <Button
                      onClick={() => handleAddToCart(audio, "audio-content")}
                      disabled={isInCart(audio._id)}
                      className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-full font-semibold"
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
              ))}
            </div>
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
    </div>
  );
}
