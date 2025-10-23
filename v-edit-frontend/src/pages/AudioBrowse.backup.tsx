import React, { useEffect, useState, useRef } from "react";
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
  Play,
  Pause,
  Volume2,
  VolumeX,
  Filter,
  Clock,
  Headphones,
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
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<{ [key: string]: number }>({});
  const [duration, setDuration] = useState<{ [key: string]: number }>({});
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

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

  // Pagination logic for audio
  const totalPages = Math.ceil(filteredAudioItems.length / itemsPerPage);
  const paginatedAudioItems = filteredAudioItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, folderId]);

  // Audio player controls
  const togglePlayPause = (audioId: string, audioUrl: string) => {
    const audio = audioRefs.current[audioId];

    if (!audio) {
      const newAudio = new Audio(audioUrl);
      audioRefs.current[audioId] = newAudio;

      newAudio.addEventListener("timeupdate", () => {
        setCurrentTime((prev) => ({ ...prev, [audioId]: newAudio.currentTime }));
      });

      newAudio.addEventListener("loadedmetadata", () => {
        setDuration((prev) => ({ ...prev, [audioId]: newAudio.duration }));
      });

      newAudio.addEventListener("ended", () => {
        setPlayingId(null);
        setCurrentTime((prev) => ({ ...prev, [audioId]: 0 }));
      });

      newAudio.play();
      setPlayingId(audioId);
    } else {
      if (playingId === audioId) {
        audio.pause();
        setPlayingId(null);
      } else {
        // Stop any currently playing audio
        Object.keys(audioRefs.current).forEach((id) => {
          if (audioRefs.current[id]) {
            audioRefs.current[id].pause();
          }
        });

        audio.play();
        setPlayingId(audioId);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgress = (audioId: string): number => {
    const curr = currentTime[audioId] || 0;
    const dur = duration[audioId] || 0;
    return dur > 0 ? (curr / dur) * 100 : 0;
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      Object.values(audioRefs.current).forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
    };
  }, []);

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
          category="Audio Content"
          icon={Music}
          iconColor="text-orange-600"
          gradientFrom="from-orange-600"
          gradientTo="to-amber-600"
          breadcrumbs={path}
          onBreadcrumbClick={navigateToFolder}
          showMobileBack={!!folderId}
          onMobileBack={() =>
            path.length > 1
              ? navigateToFolder(path[path.length - 2]._id)
              : navigate("/audio-content")
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
                  placeholder="Search audio tracks..."
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
                        className="relative
