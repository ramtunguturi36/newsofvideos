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
  Image,
  Loader2,
} from "lucide-react";
import { getPictureHierarchy } from "@/lib/backend";
import type { PictureFolder, PictureTemplate } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

export default function PicturesBrowse() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [folders, setFolders] = useState<PictureFolder[]>([]);
  const [templates, setTemplates] = useState<PictureTemplate[]>([]);
  const [path, setPath] = useState<PictureFolder[]>([]);
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
      const data = await getPictureHierarchy(folderId);
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
    navigate(`/picture-templates?folderId=${folderId}`);
  };

  const handleAddToCart = (
    item: PictureFolder | PictureTemplate,
    type: string,
  ) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading picture templates...</p>
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
                  onClick={() => navigate("/picture-templates")}
                  className="font-medium text-slate-900 hover:text-purple-600 transition-colors"
                >
                  Pictures
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
                placeholder="Search pictures and folders..."
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
              : "Picture Templates Marketplace"}
          </h1>
          <p className="text-lg text-slate-600">
            Browse image templates and graphics. Buy complete bundles or
            individual items.
          </p>
        </div>

        {/* Folders Grid - Only show when at root or has subfolders */}
        {filteredFolders.length > 0 &&
          (folderId === undefined || filteredFolders.length > 0) && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <FolderOpen className="h-6 w-6 mr-2 text-purple-600" />
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
                        ? "border-pink-300 bg-gradient-to-br from-pink-50 to-purple-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    {/* Folder Badge */}
                    {folder.isPurchasable && (
                      <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold px-3 py-1 flex items-center justify-center">
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
                              ? "bg-gradient-to-r from-pink-100 to-purple-100"
                              : "bg-gradient-to-r from-purple-100 to-pink-100"
                          }`}
                        >
                          <FolderOpen
                            className={`h-16 w-16 ${
                              folder.isPurchasable
                                ? "text-pink-600"
                                : "text-purple-600"
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
                                handleAddToCart(folder, "picture-folder")
                              }
                              disabled={isInCart(folder._id)}
                              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-full font-semibold shadow-lg"
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
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full font-semibold"
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

        {/* Templates Grid - Only show when inside a folder */}
        {filteredTemplates.length > 0 && folderId && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
              <Image className="h-6 w-6 mr-2 text-purple-600" />
              Picture Templates
              <span className="ml-3 text-sm font-normal text-slate-500">
                ({filteredTemplates.length})
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTemplates.map((template) => (
                <div
                  key={template._id}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Image Preview */}
                  <div className="relative aspect-square bg-slate-100 overflow-hidden">
                    {template.previewImageUrl ? (
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        src={template.previewImageUrl}
                        alt={template.title}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                        <Image className="h-12 w-12 text-slate-400" />
                      </div>
                    )}
                  </div>

                  {/* Template Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2">
                      {template.title}
                    </h3>

                    <div className="flex items-baseline space-x-2 mb-4">
                      <span className="text-2xl font-bold text-slate-900">
                        ₹{template.discountPrice || template.basePrice}
                      </span>
                      {template.discountPrice && (
                        <span className="text-sm text-slate-500 line-through">
                          ₹{template.basePrice}
                        </span>
                      )}
                    </div>

                    <Button
                      onClick={() =>
                        handleAddToCart(template, "picture-template")
                      }
                      disabled={isInCart(template._id)}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full font-semibold"
                    >
                      {isInCart(template._id) ? (
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
    </div>
  );
}
