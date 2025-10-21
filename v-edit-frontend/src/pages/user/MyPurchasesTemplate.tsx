import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Search,
  Download,
  Eye,
  Package,
  FileText,
  Loader2,
  Home,
  ChevronRight,
  FolderOpen,
  Video,
  ExternalLink,
} from "lucide-react";
import { backend } from "@/lib/backend";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

interface MyPurchasesTemplateProps {
  title: string;
  description: string;
  apiEndpoint: string;
  icon: React.ElementType;
  gradient: string;
  itemType: "template" | "picture" | "video" | "audio";
}

export default function MyPurchasesTemplate({
  title,
  description,
  apiEndpoint,
  icon: IconComponent,
  gradient,
  itemType,
}: MyPurchasesTemplateProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"folders" | "items">("folders");
  const [folders, setFolders] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      const response = await backend.get(apiEndpoint);
      setFolders(response.data.folders || []);
      setItems(response.data.items || []);
    } catch (error) {
      console.error("Error loading purchases:", error);
      toast.error("Failed to load purchases");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (item: any) => {
    try {
      toast.info("Preparing download...");
      // Add download logic here
    } catch (error) {
      toast.error("Download failed");
    }
  };

  const filteredFolders = folders.filter((folder) =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredItems = items.filter((item) => {
    const title = item.title || item.name;
    return title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading your purchases...</p>
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
                <Home className="h-4 w-4" />
                <ChevronRight className="h-4 w-4" />
                <span className="font-medium text-slate-900">My Purchases</span>
                <ChevronRight className="h-4 w-4" />
                <span className="font-medium text-slate-900">{title}</span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder={`Search your ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-full border-slate-300"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div
              className={`h-16 w-16 rounded-2xl bg-gradient-to-r ${gradient} flex items-center justify-center shadow-lg`}
            >
              <IconComponent className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-1">
                My {title}
              </h1>
              <p className="text-lg text-slate-600">{description}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-8">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab("folders")}
              className={`flex-1 px-6 py-4 font-semibold transition-all duration-200 ${
                activeTab === "folders"
                  ? `bg-gradient-to-r ${gradient} text-white`
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Folders</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === "folders"
                      ? "bg-white/30 text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {folders.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("items")}
              className={`flex-1 px-6 py-4 font-semibold transition-all duration-200 ${
                activeTab === "items"
                  ? `bg-gradient-to-r ${gradient} text-white`
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Individual Items</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === "items"
                      ? "bg-white/30 text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {items.length}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Folders Tab Content */}
        {activeTab === "folders" && (
          <div>
            {filteredFolders.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFolders.map((folder) => (
                  <div
                    key={folder._id}
                    className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300"
                  >
                    {/* Folder Image */}
                    <div className="relative aspect-video overflow-hidden bg-slate-100">
                      {folder.coverPhotoUrl ? (
                        <img
                          src={folder.coverPhotoUrl}
                          alt={folder.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div
                          className={`w-full h-full flex items-center justify-center bg-gradient-to-r ${gradient.replace(
                            "500",
                            "100",
                          )}`}
                        >
                          <FolderOpen
                            className={`h-16 w-16 ${gradient
                              .split(" ")[0]
                              .replace("from-", "text-")}`}
                          />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        OWNED
                      </div>
                    </div>

                    {/* Folder Content */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                        {folder.name}
                      </h3>
                      <p className="text-sm text-slate-600 mb-4">
                        {folder.totalTemplates || folder.itemCount || 0} items
                      </p>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleDownload(folder)}
                          variant="outline"
                          className="flex-1 rounded-full border-2"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download All
                        </Button>
                        <Button
                          className={`flex-1 bg-gradient-to-r ${gradient} hover:opacity-90 text-white rounded-full`}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Open
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-slate-100 mb-6">
                  <Package className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  No folders yet
                </h3>
                <p className="text-slate-600 mb-6">
                  You haven't purchased any folder bundles yet.
                </p>
                <Button
                  onClick={() => navigate("/user/dashboard")}
                  className={`bg-gradient-to-r ${gradient} hover:opacity-90 text-white rounded-full px-8`}
                >
                  Browse Marketplace
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Items Tab Content */}
        {activeTab === "items" && (
          <div>
            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                  <div
                    key={item._id}
                    className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300"
                  >
                    {/* Item Preview */}
                    <div className="relative aspect-video overflow-hidden bg-black">
                      {item.videoUrl || item.previewImageUrl ? (
                        itemType === "template" || itemType === "video" ? (
                          <video
                            className="w-full h-full object-cover"
                            src={item.videoUrl}
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
                          <img
                            src={item.previewImageUrl || item.thumbnailUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                          <IconComponent className="h-12 w-12 text-slate-400" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        OWNED
                      </div>
                    </div>

                    {/* Item Content */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-slate-900 mb-4 line-clamp-2">
                        {item.title || item.name}
                      </h3>
                      <Button
                        onClick={() => handleDownload(item)}
                        className={`w-full bg-gradient-to-r ${gradient} hover:opacity-90 text-white rounded-full font-semibold`}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-slate-100 mb-6">
                  <FileText className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  No items yet
                </h3>
                <p className="text-slate-600 mb-6">
                  You haven't purchased any individual items yet.
                </p>
                <Button
                  onClick={() => navigate("/user/dashboard")}
                  className={`bg-gradient-to-r ${gradient} hover:opacity-90 text-white rounded-full px-8`}
                >
                  Browse Marketplace
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
