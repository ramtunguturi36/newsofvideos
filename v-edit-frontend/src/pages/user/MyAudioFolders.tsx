import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Music,
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
  Headphones,
} from "lucide-react";
import { getAudioHierarchy, backend } from "@/lib/backend";
import type { AudioFolder, AudioContent } from "@/lib/types";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const MyAudioFolders = () => {
  const navigate = useNavigate();
  const [folders, setFolders] = useState<AudioFolder[]>([]);
  const [audio, setAudio] = useState<AudioContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date" | "price">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentView, setCurrentView] = useState<"folders" | "audio">(
    "folders",
  );
  const [selectedFolder, setSelectedFolder] = useState<AudioFolder | null>(
    null,
  );

  // Load purchased audio folders
  useEffect(() => {
    const loadPurchasedFolders = async () => {
      try {
        setLoading(true);

        // Get all audio folders
        const data = await getAudioHierarchy(undefined);
        const allFolders = data.folders || [];

        // Get user's purchases to filter owned folders
        const response = await backend.get("/purchases");
        const purchases = response.data.purchases || [];

        // Get purchased folder IDs
        const purchasedFolderIds = new Set(
          purchases.flatMap((purchase: any) =>
            purchase.items
              .filter(
                (item: any) => item.type === "audio-folder" && item.folderId,
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
        toast.error("Failed to load your audio folders");
        setFolders([]);
      } finally {
        setLoading(false);
      }
    };

    loadPurchasedFolders();
  }, []);

  // Open folder and load its audio
  const openFolder = async (folder: AudioFolder) => {
    try {
      setLoading(true);
      setSelectedFolder(folder);

      // Load audio in this folder
      const data = await getAudioHierarchy(folder._id);
      setAudio(data.audio || []);
      setCurrentView("audio");
    } catch (error) {
      console.error("Error loading folder audio:", error);
      toast.error("Failed to load folder contents");
    } finally {
      setLoading(false);
    }
  };

  // Go back to folder list
  const goBackToFolders = () => {
    setCurrentView("folders");
    setSelectedFolder(null);
    setAudio([]);
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

  // Filter and sort audio
  const filteredAudio = audio
    .filter((audioItem) => {
      const matchesSearch =
        audioItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        audioItem.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        audioItem.artist?.toLowerCase().includes(searchTerm.toLowerCase());
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

  const handleDownloadAll = async (folder: AudioFolder) => {
    try {
      // Load audio in the folder first
      const data = await getAudioHierarchy(folder._id);
      const folderAudio = data.audio || [];

      if (folderAudio.length === 0) {
        toast.error("No audio found in this folder");
        return;
      }

      toast.info(`Downloading ${folderAudio.length} audio tracks...`);

      // Download each audio
      for (let i = 0; i < folderAudio.length; i++) {
        const audioItem = folderAudio[i];
        if (audioItem.downloadAudioUrl) {
          await handleDownload(
            audioItem.downloadAudioUrl,
            `${folder.name}-${i + 1}-${audioItem.title}.mp3`,
          );
          // Add a longer delay between downloads to avoid browser limits
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      toast.success(
        `Successfully downloaded ${folderAudio.length} audio tracks!`,
      );
    } catch (error) {
      console.error("Error downloading audio:", error);
      toast.error("Failed to download audio");
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your audio folders...</p>
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
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-3 flex items-center">
                  <FolderOpen className="h-8 w-8 mr-3 text-orange-600" />
                  My Audio Folders
                </h1>
                <p className="text-slate-700 text-xl">
                  {currentView === "folders"
                    ? "Access your purchased audio folder collections"
                    : `Viewing: ${selectedFolder?.name}`}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {currentView === "audio" && (
                  <Button
                    onClick={goBackToFolders}
                    className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6 py-3 font-semibold"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Folders
                  </Button>
                )}
                <Button
                  onClick={() => navigate("/user/dashboard")}
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-50 rounded-xl px-6 py-3 font-semibold"
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
                    : "Search audio tracks..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 bg-white/80 border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500 rounded-xl h-12"
              />
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "name" | "date" | "price")
                }
                className="px-4 py-3 bg-white/80 border border-slate-300 text-slate-900 rounded-xl focus:border-orange-500 focus:ring-orange-500 h-12 font-medium"
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
                  className="bg-white/90 backdrop-blur-lg border-slate-200/50 hover:border-orange-400 transition-all duration-300 hover:shadow-2xl group overflow-hidden"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-orange-100 to-pink-100 rounded-xl group-hover:from-orange-200 group-hover:to-pink-200 transition-colors">
                        <FolderOpen className="h-8 w-8 text-orange-600" />
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Owned
                      </Badge>
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-orange-600 transition-colors">
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
                        className="mb-4 border-orange-300 text-orange-700"
                      >
                        {folder.category}
                      </Badge>
                    )}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                      <span className="text-sm text-slate-600">
                        {folder.totalAudio || 0} tracks
                      </span>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => openFolder(folder)}
                          size="sm"
                          className="bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          onClick={() => handleDownloadAll(folder)}
                          size="sm"
                          variant="outline"
                          className="border-orange-300 text-orange-700 hover:bg-orange-50"
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
                No audio folders found
              </h3>
              <p className="text-slate-500 mb-6">
                You haven't purchased any audio folders yet.
              </p>
              <Button
                onClick={() => navigate("/audio-folders")}
                className="bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white"
              >
                Browse Audio Folders
              </Button>
            </div>
          )
        ) : (
          // Audio View
          <>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Loading audio tracks...</p>
              </div>
            ) : filteredAudio.length > 0 ? (
              <div
                className={`grid ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"} gap-6`}
              >
                {filteredAudio.map((audioItem) => (
                  <Card
                    key={audioItem._id}
                    className="bg-white/90 backdrop-blur-lg border-slate-200/50 hover:border-orange-400 transition-all duration-300 hover:shadow-2xl group overflow-hidden"
                  >
                    <div className="relative aspect-square bg-gradient-to-br from-orange-100 to-pink-100 overflow-hidden">
                      {audioItem.thumbnailUrl ? (
                        <img
                          src={audioItem.thumbnailUrl}
                          alt={audioItem.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Headphones className="h-16 w-16 text-orange-400" />
                        </div>
                      )}
                      {audioItem.duration && (
                        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white font-medium flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDuration(audioItem.duration)}
                        </div>
                      )}
                    </div>
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

                      {audioItem.downloadAudioUrl && (
                        <Button
                          onClick={async () => {
                            try {
                              await handleDownload(
                                audioItem.downloadAudioUrl!,
                                `${audioItem.title}.mp3`,
                              );
                              toast.success("Download complete!");
                            } catch (error) {
                              toast.error("Download failed");
                            }
                          }}
                          className="w-full bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white"
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
                <Music className="h-20 w-20 text-slate-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-700 mb-2">
                  No audio tracks found
                </h3>
                <p className="text-slate-500">
                  This folder doesn't contain any audio tracks yet.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyAudioFolders;
