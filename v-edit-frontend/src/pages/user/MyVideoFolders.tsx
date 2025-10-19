import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Film,
  FolderOpen,
  Search,
  CheckCircle,
  Eye,
  Filter,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Download,
  ExternalLink,
  ArrowLeft,
  Tag,
  Clock,
} from "lucide-react";
import { getVideoHierarchy, backend } from "@/lib/backend";
import type { VideoFolder, VideoContent } from "@/lib/types";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const MyVideoFolders = () => {
  const navigate = useNavigate();
  const [folders, setFolders] = useState<VideoFolder[]>([]);
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date" | "price">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentView, setCurrentView] = useState<"folders" | "videos">(
    "folders",
  );
  const [selectedFolder, setSelectedFolder] = useState<VideoFolder | null>(
    null,
  );

  // Load purchased video folders
  useEffect(() => {
    const loadPurchasedFolders = async () => {
      try {
        setLoading(true);

        // Get all video folders
        const data = await getVideoHierarchy(undefined);
        const allFolders = data.folders || [];

        // Get user's purchases to filter owned folders
        const response = await backend.get("/purchases");
        const purchases = response.data.purchases || [];

        // Get purchased folder IDs
        const purchasedFolderIds = new Set(
          purchases.flatMap((purchase: any) =>
            purchase.items
              .filter(
                (item: any) => item.type === "video-folder" && item.folderId,
              )
              .map((item: any) => item.folderId),
          ),
        );

        // Filter to only show purchased folders
        const purchasedFolders = allFolders.filter((folder) =>
          purchasedFolderIds.has(folder._id),
        );

        setFolders(purchasedFolders);
      } catch (error) {
        console.error("Error loading purchased folders:", error);
        toast.error("Failed to load your video folders");
        setFolders([]);
      } finally {
        setLoading(false);
      }
    };

    loadPurchasedFolders();
  }, []);

  // Open folder and load its videos
  const openFolder = async (folder: VideoFolder) => {
    try {
      setLoading(true);
      setSelectedFolder(folder);

      // Load videos in this folder
      const data = await getVideoHierarchy(folder._id);
      setVideos(data.videos || []);
      setCurrentView("videos");
    } catch (error) {
      console.error("Error loading folder videos:", error);
      toast.error("Failed to load folder contents");
    } finally {
      setLoading(false);
    }
  };

  // Go back to folder list
  const goBackToFolders = () => {
    setCurrentView("folders");
    setSelectedFolder(null);
    setVideos([]);
  };

  // Filter and sort folders
  const filteredFolders = folders
    .filter((folder) => {
      const matchesSearch =
        folder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        folder.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "date":
          comparison =
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime();
          break;
        case "price":
          comparison =
            (a.discountPrice || a.basePrice) - (b.discountPrice || b.basePrice);
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  // Filter and sort videos
  const filteredVideos = videos
    .filter((video) => {
      const matchesSearch =
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.title.localeCompare(b.title);
          break;
        case "date":
          comparison =
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime();
          break;
        case "price":
          comparison =
            (a.discountPrice || a.basePrice) - (b.discountPrice || b.basePrice);
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  const handleDownload = async (url: string, filename: string) => {
    try {
      // Use backend proxy to download with proper headers and avoid CORS
      const backendUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5000";
      const proxyUrl = `${backendUrl}/api/download-proxy?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;

      // Get auth token from localStorage
      const token = localStorage.getItem("token");

      // Fetch with credentials and auth token
      const response = await fetch(proxyUrl, {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download error:", error);
      throw error;
    }
  };

  const handleDownloadAll = async (folder: VideoFolder) => {
    try {
      // Load videos in the folder first
      const data = await getVideoHierarchy(folder._id);
      const folderVideos = data.videos || [];

      if (folderVideos.length === 0) {
        toast.error("No videos found in this folder");
        return;
      }

      toast.info(`Downloading ${folderVideos.length} videos...`);

      // Download each video
      for (let i = 0; i < folderVideos.length; i++) {
        const video = folderVideos[i];
        if (video.downloadVideoUrl) {
          await handleDownload(
            video.downloadVideoUrl,
            `${folder.name}-${i + 1}-${video.title}.mp4`,
          );
          // Add a longer delay between downloads to avoid browser limits
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      toast.success(`Successfully downloaded ${folderVideos.length} videos!`);
    } catch (error) {
      console.error("Error downloading videos:", error);
      toast.error("Failed to download videos");
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading && currentView === "folders") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your video folders...</p>
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
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3 flex items-center">
                  <FolderOpen className="h-8 w-8 mr-3 text-purple-600" />
                  My Video Folders
                </h1>
                <p className="text-slate-700 text-xl">
                  {currentView === "folders"
                    ? "Access your purchased video folder collections"
                    : `Viewing: ${selectedFolder?.name}`}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {currentView === "videos" && (
                  <Button
                    onClick={goBackToFolders}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6 py-3 font-semibold"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Folders
                  </Button>
                )}
                <Button
                  onClick={() => navigate("/user/dashboard")}
                  variant="outline"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50 rounded-xl px-6 py-3 font-semibold"
                >
                  Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-slate-200/50">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500" />
              <Input
                placeholder={
                  currentView === "folders"
                    ? "Search folders..."
                    : "Search videos..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 bg-white/80 border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500 rounded-xl h-12"
              />
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "name" | "date" | "price")
                }
                className="px-4 py-3 bg-white/80 border border-slate-300 text-slate-900 rounded-xl focus:border-purple-500 focus:ring-purple-500 h-12 font-medium"
              >
                <option value="date">Date</option>
                <option value="name">Name</option>
                <option value="price">Price</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="h-12 px-4 border-slate-300"
              >
                {sortOrder === "asc" ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
              </Button>
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

        {/* Content Area */}
        {currentView === "folders" ? (
          // Folders View
          filteredFolders.length > 0 ? (
            <div
              className={`grid ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"} gap-6`}
            >
              {filteredFolders.map((folder) => (
                <Card
                  key={folder._id}
                  className="bg-white/90 backdrop-blur-lg border-slate-200/50 hover:border-purple-400 transition-all duration-300 hover:shadow-2xl group overflow-hidden"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl group-hover:from-purple-200 group-hover:to-blue-200 transition-colors">
                        <FolderOpen className="h-8 w-8 text-purple-600" />
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Owned
                      </Badge>
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-purple-600 transition-colors">
                      {folder.name}
                    </h3>
                    {folder.description && (
                      <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                        {folder.description}
                      </p>
                    )}
                    {folder.category && (
                      <Badge
                        variant="outline"
                        className="mb-4 border-purple-300 text-purple-700"
                      >
                        {folder.category}
                      </Badge>
                    )}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                      <span className="text-sm text-slate-600">
                        {folder.totalVideos || 0} videos
                      </span>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => openFolder(folder)}
                          size="sm"
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          onClick={() => handleDownloadAll(folder)}
                          size="sm"
                          variant="outline"
                          className="border-purple-300 text-purple-700 hover:bg-purple-50"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/90 backdrop-blur-lg rounded-2xl border border-slate-200/50">
              <FolderOpen className="h-20 w-20 text-slate-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-700 mb-2">
                No video folders found
              </h3>
              <p className="text-slate-500 mb-6">
                You haven't purchased any video folders yet.
              </p>
              <Button
                onClick={() => navigate("/video-folders")}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                Browse Video Folders
              </Button>
            </div>
          )
        ) : (
          // Videos View
          <>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Loading videos...</p>
              </div>
            ) : filteredVideos.length > 0 ? (
              <div
                className={`grid ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"} gap-6`}
              >
                {filteredVideos.map((video) => (
                  <Card
                    key={video._id}
                    className="bg-white/90 backdrop-blur-lg border-slate-200/50 hover:border-purple-400 transition-all duration-300 hover:shadow-2xl group overflow-hidden"
                  >
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
                      {video.duration && (
                        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white font-medium flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDuration(video.duration)}
                        </div>
                      )}
                    </div>
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
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs bg-purple-50 text-purple-700"
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {video.downloadVideoUrl && (
                        <Button
                          onClick={async () => {
                            try {
                              await handleDownload(
                                video.downloadVideoUrl!,
                                `${video.title}.mp4`,
                              );
                              toast.success("Download complete!");
                            } catch (error) {
                              toast.error("Download failed");
                            }
                          }}
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white/90 backdrop-blur-lg rounded-2xl border border-slate-200/50">
                <Film className="h-20 w-20 text-slate-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-700 mb-2">
                  No videos found
                </h3>
                <p className="text-slate-500">
                  This folder doesn't contain any videos yet.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyVideoFolders;
