import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Video,
  Image,
  Film,
  Music,
  Search,
  Download,
  Loader2,
  Package,
  FolderOpen,
  FileText,
  Calendar,
  TrendingUp,
  ShoppingBag,
  Eye,
  ExternalLink,
} from "lucide-react";
import { backend } from "@/lib/backend";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

type CategoryType =
  | "all"
  | "video-templates"
  | "pictures"
  | "video-content"
  | "audio";
type ViewType = "folders" | "items";

interface PurchaseItem {
  _id: string;
  title: string;
  description?: string;
  type: string;
  price: number;
  category: CategoryType;
  qrUrl?: string;
  downloadImageUrl?: string;
  previewImageUrl?: string;
  downloadVideoUrl?: string;
  previewVideoUrl?: string;
  downloadAudioUrl?: string;
  previewAudioUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  purchaseDate?: string;
  folderName?: string;
}

interface PurchaseFolder {
  _id: string;
  name: string;
  itemCount: number;
  category: CategoryType;
  purchaseDate?: string;
  items?: PurchaseItem[];
}

interface Stats {
  totalItems: number;
  totalFolders: number;
  recentPurchaseDate?: string;
  categoryBreakdown: {
    videoTemplates: number;
    pictures: number;
    videoContent: number;
    audio: number;
  };
}

export default function MyPurchases() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<CategoryType>(
    (searchParams.get("category") as CategoryType) || "all",
  );
  const [activeView, setActiveView] = useState<ViewType>(
    (searchParams.get("view") as ViewType) || "items",
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [folders, setFolders] = useState<PurchaseFolder[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalItems: 0,
    totalFolders: 0,
    categoryBreakdown: {
      videoTemplates: 0,
      pictures: 0,
      videoContent: 0,
      audio: 0,
    },
  });
  const [downloading, setDownloading] = useState<string | null>(null);

  const categories = [
    {
      id: "all" as CategoryType,
      label: "All Purchases",
      icon: ShoppingBag,
      gradient: "from-purple-500 to-blue-500",
    },
    {
      id: "video-templates" as CategoryType,
      label: "Video Templates",
      icon: Video,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      id: "pictures" as CategoryType,
      label: "Pictures",
      icon: Image,
      gradient: "from-pink-500 to-rose-500",
    },
    {
      id: "video-content" as CategoryType,
      label: "Video Content",
      icon: Film,
      gradient: "from-green-500 to-teal-500",
    },
    {
      id: "audio" as CategoryType,
      label: "Audio",
      icon: Music,
      gradient: "from-orange-500 to-amber-500",
    },
  ];

  useEffect(() => {
    loadAllPurchases();
  }, []);

  useEffect(() => {
    setSearchParams({
      category: activeCategory,
      view: activeView,
    });
  }, [activeCategory, activeView]);

  const loadAllPurchases = async () => {
    try {
      setLoading(true);
      const response = await backend.get("/purchases");
      const purchases = response.data.purchases || [];

      const allItems: PurchaseItem[] = [];
      const allFolders: PurchaseFolder[] = [];
      const categoryCount = {
        videoTemplates: 0,
        pictures: 0,
        videoContent: 0,
        audio: 0,
      };

      let mostRecentDate: string | undefined;

      purchases.forEach((purchase: any) => {
        const purchaseDate = purchase.createdAt || purchase.date;
        if (
          !mostRecentDate ||
          new Date(purchaseDate) > new Date(mostRecentDate)
        ) {
          mostRecentDate = purchaseDate;
        }

        purchase.items.forEach((item: any) => {
          let category: CategoryType = "all";

          // Determine category based on item type
          if (item.type === "template") {
            category = "video-templates";
            categoryCount.videoTemplates++;
          } else if (
            item.type === "picture-template" ||
            item.type === "picture-folder"
          ) {
            category = "pictures";
            categoryCount.pictures++;
          } else if (
            item.type === "video-content" ||
            item.type === "video-folder"
          ) {
            category = "video-content";
            categoryCount.videoContent++;
          } else if (
            item.type === "audio-content" ||
            item.type === "audio-folder"
          ) {
            category = "audio";
            categoryCount.audio++;
          }

          // Handle folders
          if (
            item.type === "folder" ||
            item.type === "picture-folder" ||
            item.type === "video-folder" ||
            item.type === "audio-folder"
          ) {
            allFolders.push({
              _id: item.folderId || item._id,
              name: item.title || item.name,
              itemCount: item.itemCount || 0,
              category,
              purchaseDate,
            });
          } else {
            // Handle individual items
            allItems.push({
              _id: item.templateId || item._id,
              title: item.title || item.name,
              description: item.description,
              type: item.type,
              price: item.price,
              category,
              qrUrl: item.qrUrl,
              downloadImageUrl: item.downloadImageUrl,
              previewImageUrl: item.previewImageUrl,
              downloadVideoUrl: item.downloadVideoUrl,
              previewVideoUrl: item.previewVideoUrl,
              downloadAudioUrl: item.downloadAudioUrl,
              previewAudioUrl: item.previewAudioUrl,
              videoUrl: item.videoUrl,
              thumbnailUrl: item.thumbnailUrl,
              purchaseDate,
            });
          }
        });
      });

      setItems(allItems);
      setFolders(allFolders);
      setStats({
        totalItems: allItems.length,
        totalFolders: allFolders.length,
        recentPurchaseDate: mostRecentDate,
        categoryBreakdown: categoryCount,
      });
    } catch (error) {
      console.error("Error loading purchases:", error);
      toast.error("Failed to load purchases");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (item: PurchaseItem) => {
    if (downloading) return;

    try {
      setDownloading(item._id);
      toast.info("Preparing download...");

      let downloadUrl = "";
      let fileName = item.title || "download";

      // Determine the download URL based on item type
      if (item.type === "template" && item.qrUrl) {
        // Video templates - download QR code
        downloadUrl = item.qrUrl;
        fileName = `${fileName.replace(/\s+/g, "-")}-qr.png`;
      } else if (item.type === "picture-template") {
        // Picture templates - download image
        downloadUrl = item.downloadImageUrl || item.previewImageUrl || "";
        fileName = `${fileName.replace(/\s+/g, "-")}.jpg`;
      } else if (item.type === "video-content") {
        // Video content - download video
        downloadUrl = item.downloadVideoUrl || item.previewVideoUrl || "";
        fileName = `${fileName.replace(/\s+/g, "-")}.mp4`;
      } else if (item.type === "audio-content") {
        // Audio content - download audio
        downloadUrl = item.downloadAudioUrl || item.previewAudioUrl || "";
        fileName = `${fileName.replace(/\s+/g, "-")}.mp3`;
      }

      if (!downloadUrl) {
        toast.error("Download URL not available");
        return;
      }

      // Use backend download proxy
      const apiBaseUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");
      const proxyUrl = `${apiBaseUrl}/api/download-proxy?url=${encodeURIComponent(downloadUrl)}&filename=${encodeURIComponent(fileName)}`;

      const response = await fetch(proxyUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      toast.success("Download completed!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Download failed");
    } finally {
      setDownloading(null);
    }
  };

  const handleView = (item: PurchaseItem) => {
    // Handle viewing content based on type
    if (item.type === "template" && item.qrUrl) {
      // Open QR code in new tab
      window.open(item.qrUrl, "_blank");
    } else if (
      item.type === "video-content" &&
      (item.previewVideoUrl || item.downloadVideoUrl)
    ) {
      // Open video in new tab
      window.open(item.previewVideoUrl || item.downloadVideoUrl, "_blank");
    } else if (item.videoUrl) {
      // For templates with video URLs
      window.open(item.videoUrl, "_blank");
    } else {
      toast.info("No preview available for this item");
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      activeCategory === "all" || item.category === activeCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredFolders = folders.filter((folder) => {
    const matchesCategory =
      activeCategory === "all" || folder.category === activeCategory;
    const matchesSearch = folder.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getCategoryBadge = (category: CategoryType) => {
    const cat = categories.find((c) => c.id === category);
    if (!cat || category === "all") return null;

    const IconComponent = cat.icon;
    return (
      <div
        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${cat.gradient} text-white`}
      >
        <IconComponent className="h-3 w-3" />
        <span>{cat.label}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Navbar />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 shadow-2xl text-white">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2 flex items-center">
                    <Package className="h-10 w-10 mr-3" />
                    My Purchases
                  </h1>
                  <p className="text-purple-100 text-lg">
                    All your purchased content in one place
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center min-w-[100px]">
                    <div className="text-3xl font-bold">{stats.totalItems}</div>
                    <div className="text-sm text-purple-100">Items</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center min-w-[100px]">
                    <div className="text-3xl font-bold">
                      {stats.totalFolders}
                    </div>
                    <div className="text-sm text-purple-100">Folders</div>
                  </div>
                </div>
              </div>

              {stats.recentPurchaseDate && (
                <div className="mt-4 flex items-center space-x-2 text-sm text-purple-100">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Last purchase: {formatDate(stats.recentPurchaseDate)}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Category Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {categories.slice(1).map((cat, idx) => {
              const IconComponent = cat.icon;
              const count =
                cat.id === "video-templates"
                  ? stats.categoryBreakdown.videoTemplates
                  : cat.id === "pictures"
                    ? stats.categoryBreakdown.pictures
                    : cat.id === "video-content"
                      ? stats.categoryBreakdown.videoContent
                      : stats.categoryBreakdown.audio;

              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-slate-100"
                >
                  <div
                    className={`h-10 w-10 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center mb-2`}
                  >
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    {count}
                  </div>
                  <div className="text-sm text-slate-600">{cat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search your purchases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-6 bg-white border-2 border-slate-200 rounded-2xl text-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all shadow-lg"
              />
            </div>
          </motion.div>

          {/* Category Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <div className="bg-white rounded-2xl p-2 shadow-lg border-2 border-slate-100">
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const IconComponent = cat.icon;
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                        isActive
                          ? `bg-gradient-to-r ${cat.gradient} text-white shadow-lg scale-105`
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* View Toggle (Folders/Items) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <div className="bg-white rounded-2xl p-2 shadow-lg border-2 border-slate-100 inline-flex">
              <button
                onClick={() => setActiveView("items")}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeView === "items"
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Individual Items ({filteredItems.length})</span>
              </button>
              <button
                onClick={() => setActiveView("folders")}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeView === "folders"
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <FolderOpen className="h-4 w-4" />
                <span>Folders ({filteredFolders.length})</span>
              </button>
            </div>
          </motion.div>

          {/* Content Area */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
            </div>
          ) : (
            <>
              {activeView === "items" ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {filteredItems.length === 0 ? (
                    <div className="text-center py-20">
                      <Package className="h-20 w-20 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">
                        No items found
                      </h3>
                      <p className="text-slate-600 mb-6">
                        {searchTerm
                          ? "Try adjusting your search"
                          : "Start browsing our marketplace to make your first purchase"}
                      </p>
                      <Button
                        onClick={() => navigate("/user/dashboard")}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        Browse Marketplace
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredItems.map((item, idx) => (
                        <motion.div
                          key={item._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + idx * 0.05 }}
                          className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-slate-100 group"
                        >
                          {/* Preview Image/Video */}
                          <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                            {item.previewImageUrl ? (
                              <img
                                src={item.previewImageUrl}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : item.thumbnailUrl ? (
                              <img
                                src={item.thumbnailUrl}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : item.previewVideoUrl ? (
                              <video
                                src={item.previewVideoUrl}
                                className="w-full h-full object-cover"
                                muted
                              />
                            ) : item.qrUrl && item.type === "template" ? (
                              <img
                                src={item.qrUrl}
                                alt={item.title}
                                className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                {item.type === "template" ? (
                                  <Video className="h-16 w-16 text-slate-300" />
                                ) : item.type === "picture-template" ? (
                                  <Image className="h-16 w-16 text-slate-300" />
                                ) : item.type === "video-content" ? (
                                  <Film className="h-16 w-16 text-slate-300" />
                                ) : item.type === "audio-content" ? (
                                  <Music className="h-16 w-16 text-slate-300" />
                                ) : (
                                  <Package className="h-16 w-16 text-slate-300" />
                                )}
                              </div>
                            )}
                            <div className="absolute top-2 right-2">
                              {getCategoryBadge(item.category)}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-5">
                            <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1">
                              {item.title}
                            </h3>
                            <p className="text-xs text-slate-500 mb-2">
                              {item.type === "template"
                                ? "Video Template with QR"
                                : item.type === "picture-template"
                                  ? "Picture Template"
                                  : item.type === "video-content"
                                    ? "Video Content"
                                    : item.type === "audio-content"
                                      ? "Audio Content"
                                      : "Item"}
                            </p>
                            {item.description && (
                              <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                            {item.purchaseDate && (
                              <div className="flex items-center text-xs text-slate-500 mb-3">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatDate(item.purchaseDate)}
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleDownload(item)}
                                disabled={downloading === item._id}
                                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl"
                              >
                                {downloading === item._id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <Download className="h-4 w-4 mr-2" />
                                    {item.type === "template"
                                      ? "Download QR"
                                      : "Download"}
                                  </>
                                )}
                              </Button>
                              {(item.type === "template" ||
                                item.type === "video-content" ||
                                item.videoUrl) && (
                                <Button
                                  onClick={() => handleView(item)}
                                  variant="outline"
                                  className="rounded-xl"
                                  title={
                                    item.type === "template"
                                      ? "View QR Code"
                                      : "Preview"
                                  }
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {filteredFolders.length === 0 ? (
                    <div className="text-center py-20">
                      <FolderOpen className="h-20 w-20 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">
                        No folders found
                      </h3>
                      <p className="text-slate-600">
                        {searchTerm
                          ? "Try adjusting your search"
                          : "You haven't purchased any folders yet"}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredFolders.map((folder, idx) => (
                        <motion.div
                          key={folder._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + idx * 0.05 }}
                          className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-2 border-slate-100 group cursor-pointer"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <FolderOpen className="h-7 w-7 text-white" />
                            </div>
                            {getCategoryBadge(folder.category)}
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 mb-2">
                            {folder.name}
                          </h3>
                          <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
                            <span>{folder.itemCount} items</span>
                            {folder.purchaseDate && (
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatDate(folder.purchaseDate)}
                              </span>
                            )}
                          </div>
                          <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Folder
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
