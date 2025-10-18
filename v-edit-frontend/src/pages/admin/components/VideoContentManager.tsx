import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  createVideoFolder,
  getVideoHierarchy,
  uploadVideoContent,
  updateVideoContent,
  deleteVideoContent,
  updateVideoFolder,
  deleteVideoFolder,
} from "@/lib/backend";
import { useSearchParams } from "react-router-dom";
import type { VideoFolder, VideoContent } from "@/lib/types";
import {
  Plus,
  Upload,
  Folder as FolderIcon,
  Video as VideoIcon,
  X,
  Edit,
  Trash2,
  Play,
  Film,
  Clock,
  DollarSign,
  Settings,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

const VideoContentManager = () => {
  const [params, setParams] = useSearchParams();
  const currentFolderId = params.get("folderId") || undefined;
  const [folders, setFolders] = useState<VideoFolder[]>([]);
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [path, setPath] = useState<VideoFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [editFolderOpen, setEditFolderOpen] = useState(false);
  const [editVideoOpen, setEditVideoOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Multi-select delete state
  const [selectedFolderIds, setSelectedFolderIds] = useState<Set<string>>(
    new Set(),
  );
  const [selectedVideoIds, setSelectedVideoIds] = useState<Set<string>>(
    new Set(),
  );
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Create folder state
  const [folderName, setFolderName] = useState("");
  const [parentId, setParentId] = useState<string | undefined>(currentFolderId);

  // Upload video state
  const [title, setTitle] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [hasDiscount, setHasDiscount] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Bulk upload state
  const [bulkTitle, setBulkTitle] = useState("");
  const [bulkBasePrice, setBulkBasePrice] = useState("");
  const [bulkDiscountPrice, setBulkDiscountPrice] = useState("");
  const [bulkHasDiscount, setBulkHasDiscount] = useState(false);
  const [bulkVideoFiles, setBulkVideoFiles] = useState<FileList | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");

  // Edit states
  const [selectedFolder, setSelectedFolder] = useState<VideoFolder | null>(
    null,
  );
  const [selectedVideo, setSelectedVideo] = useState<VideoContent | null>(null);
  const [deleteItem, setDeleteItem] = useState<{
    type: "folder" | "video";
    id: string;
    name: string;
  } | null>(null);
  const [editFolderName, setEditFolderName] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editBasePrice, setEditBasePrice] = useState("");
  const [editDiscountPrice, setEditDiscountPrice] = useState("");
  const [editHasDiscount, setEditHasDiscount] = useState(false);
  const [editVideoFile, setEditVideoFile] = useState<File | null>(null);

  // Folder pricing states
  const [folderPricingOpen, setFolderPricingOpen] = useState(false);
  const [selectedFolderForPricing, setSelectedFolderForPricing] =
    useState<VideoFolder | null>(null);
  const [folderPricingData, setFolderPricingData] = useState({
    basePrice: "",
    discountPrice: "",
    isPurchasable: false,
    description: "",
    coverPhotoUrl: "",
  });
  const [coverPhotoFile, setCoverPhotoFile] = useState<File | null>(null);
  const [isUploadingCoverPhoto, setIsUploadingCoverPhoto] = useState(false);

  // Preview player states
  const [previewVideoOpen, setPreviewVideoOpen] = useState(false);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string>("");
  const [previewVideoTitle, setPreviewVideoTitle] = useState<string>("");

  useEffect(() => {
    setParentId(currentFolderId);
    // Clear selections when navigating to a different folder
    setSelectedFolderIds(new Set());
    setSelectedVideoIds(new Set());
    loadHierarchy();
  }, [currentFolderId]);

  const loadHierarchy = async () => {
    setLoading(true);
    try {
      const data = await getVideoHierarchy(currentFolderId);
      setFolders(data.folders || []);
      setVideos(data.videos || []);
      setPath(data.path || []);
    } catch (error) {
      toast.error("Failed to load video hierarchy");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbs = useMemo(() => {
    const items = [{ _id: "", name: "Video Content" }, ...path];
    return items;
  }, [path]);

  async function handleCreateFolder(e: React.FormEvent) {
    e.preventDefault();
    if (!folderName.trim()) {
      toast.error("Folder name is required");
      return;
    }

    try {
      await createVideoFolder(folderName, parentId);
      setCreateOpen(false);
      setFolderName("");
      toast.success("Folder created successfully");
      loadHierarchy();
    } catch (error) {
      toast.error("Failed to create folder");
      console.error(error);
    }
  }

  async function handleUploadVideo(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim() || !basePrice || !videoFile) {
      toast.error("Title, price, and video file are required");
      return;
    }

    setIsUploading(true);
    try {
      await uploadVideoContent({
        title,
        basePrice: parseFloat(basePrice),
        discountPrice:
          hasDiscount && discountPrice ? parseFloat(discountPrice) : undefined,
        videoFile,
        parentId,
      });

      setUploadOpen(false);
      resetUploadForm();
      toast.success("Video uploaded successfully! Watermark has been applied.");
      loadHierarchy();
    } catch (error) {
      toast.error("Failed to upload video");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleBulkUpload(e: React.FormEvent) {
    e.preventDefault();
    if (
      !bulkTitle.trim() ||
      !bulkBasePrice ||
      !bulkVideoFiles ||
      bulkVideoFiles.length === 0
    ) {
      toast.error(
        "Please fill all required fields and select at least one video file",
      );
      return;
    }

    // Validate discount price if enabled
    if (bulkHasDiscount) {
      if (!bulkDiscountPrice) {
        toast.error(
          "Please enter a discount price or disable the discount option",
        );
        return;
      }
      const basePriceNum = parseFloat(bulkBasePrice);
      const discountPriceNum = parseFloat(bulkDiscountPrice);
      if (discountPriceNum >= basePriceNum) {
        toast.error("Discount price must be less than the base price");
        return;
      }
    }

    setIsUploading(true);
    setUploadProgress(0);
    const totalFiles = bulkVideoFiles.length;
    let successCount = 0;

    try {
      for (let i = 0; i < bulkVideoFiles.length; i++) {
        const videoFile = bulkVideoFiles[i];
        const itemNumber = i + 1;
        const itemTitle = `${bulkTitle} ${itemNumber}`;

        setUploadStatus(
          `Uploading ${itemNumber} of ${totalFiles}: ${itemTitle}`,
        );

        try {
          await uploadVideoContent({
            title: itemTitle,
            basePrice: parseFloat(bulkBasePrice),
            discountPrice:
              bulkHasDiscount && bulkDiscountPrice
                ? parseFloat(bulkDiscountPrice)
                : undefined,
            videoFile: videoFile,
            parentId: currentFolderId,
          });

          successCount++;
          setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
        } catch (error) {
          console.error(`Failed to upload ${itemTitle}:`, error);
          toast.error(`Failed to upload ${itemTitle}`);
        }
      }

      setBulkUploadOpen(false);
      setBulkTitle("");
      setBulkBasePrice("");
      setBulkDiscountPrice("");
      setBulkHasDiscount(false);
      setBulkVideoFiles(null);
      setUploadProgress(0);
      setUploadStatus("");

      loadHierarchy();
      toast.success(
        `Successfully uploaded ${successCount} of ${totalFiles} videos`,
      );
    } catch (error) {
      toast.error("Bulk upload failed");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadStatus("");
    }
  }

  function resetUploadForm() {
    setTitle("");
    setBasePrice("");
    setDiscountPrice("");
    setHasDiscount(false);
    setVideoFile(null);
  }

  function navigateToFolder(folderId: string) {
    setParams({ folderId });
  }

  function openEditFolder(folder: VideoFolder) {
    setSelectedFolder(folder);
    setEditFolderName(folder.name);
    setEditFolderOpen(true);
  }

  async function handleEditFolder(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFolder || !editFolderName.trim()) {
      toast.error("Folder name is required");
      return;
    }

    try {
      await updateVideoFolder(selectedFolder._id, {
        name: editFolderName,
        parentId: selectedFolder.parentId || undefined,
      });
      setEditFolderOpen(false);
      setSelectedFolder(null);
      toast.success("Folder updated successfully");
      loadHierarchy();
    } catch (error) {
      toast.error("Failed to update folder");
      console.error(error);
    }
  }

  function openEditVideo(video: VideoContent) {
    setSelectedVideo(video);
    setEditTitle(video.title);
    setEditBasePrice(video.basePrice.toString());
    setEditDiscountPrice(video.discountPrice?.toString() || "");
    setEditHasDiscount(!!video.discountPrice);
    setEditVideoOpen(true);
  }

  async function handleEditVideo(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedVideo || !editTitle.trim() || !editBasePrice) {
      toast.error("Title and base price are required");
      return;
    }

    setIsUploading(true);
    try {
      await updateVideoContent(selectedVideo._id, {
        title: editTitle,
        basePrice: parseFloat(editBasePrice),
        discountPrice:
          editHasDiscount && editDiscountPrice
            ? parseFloat(editDiscountPrice)
            : undefined,
        videoFile: editVideoFile || undefined,
      });

      setEditVideoOpen(false);
      setSelectedVideo(null);
      setEditVideoFile(null);
      toast.success("Video updated successfully");
      loadHierarchy();
    } catch (error) {
      toast.error("Failed to update video");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  }

  function openDeleteConfirm(
    type: "folder" | "video",
    id: string,
    name: string,
  ) {
    setDeleteError(null);
    setDeleteItem({ type, id, name });
    setDeleteConfirmOpen(true);
  }

  async function handleDelete() {
    if (!deleteItem || deleteError) return;

    try {
      if (deleteItem.type === "folder") {
        await deleteVideoFolder(deleteItem.id);
        toast.success("Folder deleted successfully");
      } else {
        await deleteVideoContent(deleteItem.id);
        toast.success("Video deleted successfully");
      }
      setDeleteConfirmOpen(false);
      setDeleteItem(null);
      setDeleteError(null);
      loadHierarchy();
    } catch (error) {
      toast.error(`Failed to delete ${deleteItem.type}`);
      console.error(error);
    }
  }

  function openFolderPricing(folder: VideoFolder) {
    setSelectedFolderForPricing(folder);
    setFolderPricingData({
      basePrice: folder.basePrice?.toString() || "0",
      discountPrice: folder.discountPrice?.toString() || "",
      isPurchasable: folder.isPurchasable || false,
      description: folder.description || "",
      coverPhotoUrl: folder.coverPhotoUrl || "",
    });
    setFolderPricingOpen(true);
  }

  async function handleFolderPricing(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFolderForPricing) return;

    try {
      // First upload cover photo if provided
      let coverPhotoUrl = folderPricingData.coverPhotoUrl;
      if (coverPhotoFile) {
        setIsUploadingCoverPhoto(true);
        const { uploadVideoFolderCoverPhoto } = await import("@/lib/backend");
        const uploadResult = await uploadVideoFolderCoverPhoto(
          selectedFolderForPricing._id,
          coverPhotoFile,
        );
        coverPhotoUrl = uploadResult.folder.coverPhotoUrl;
        setIsUploadingCoverPhoto(false);
      }

      await updateVideoFolder(selectedFolderForPricing._id, {
        name: selectedFolderForPricing.name,
        parentId: selectedFolderForPricing.parentId || undefined,
        description: folderPricingData.description,
        basePrice: parseFloat(folderPricingData.basePrice),
        discountPrice: folderPricingData.discountPrice
          ? parseFloat(folderPricingData.discountPrice)
          : undefined,
        isPurchasable: folderPricingData.isPurchasable,
        coverPhotoUrl: coverPhotoUrl,
      });

      setFolderPricingOpen(false);
      setSelectedFolderForPricing(null);
      setCoverPhotoFile(null);

      // Reset folder pricing data
      setFolderPricingData({
        basePrice: "0",
        discountPrice: "",
        isPurchasable: false,
        description: "",
        coverPhotoUrl: "",
      });

      toast.success("Folder pricing updated successfully");
      loadHierarchy();
    } catch (error) {
      toast.error("Failed to update folder pricing");
      console.error(error);
      setIsUploadingCoverPhoto(false);
    }
  }

  // Multi-select handlers
  const toggleFolderSelection = (folderId: string) => {
    setSelectedFolderIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const toggleVideoSelection = (videoId: string) => {
    setSelectedVideoIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  const toggleSelectAllFolders = () => {
    if (selectedFolderIds.size === folders.length && folders.length > 0) {
      setSelectedFolderIds(new Set());
    } else {
      setSelectedFolderIds(new Set(folders.map((f) => f._id)));
    }
  };

  const toggleSelectAllVideos = () => {
    if (selectedVideoIds.size === videos.length && videos.length > 0) {
      setSelectedVideoIds(new Set());
    } else {
      setSelectedVideoIds(new Set(videos.map((v) => v._id)));
    }
  };

  const openBulkDelete = () => {
    if (selectedFolderIds.size === 0 && selectedVideoIds.size === 0) {
      return;
    }
    setBulkDeleteOpen(true);
  };

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    setDeleteError(null);

    const errors: string[] = [];
    let successCount = 0;

    // Delete selected folders
    for (const folderId of Array.from(selectedFolderIds)) {
      try {
        await deleteVideoFolder(folderId);
        successCount++;
      } catch (error) {
        const folderName =
          folders.find((f) => f._id === folderId)?.name || folderId;
        errors.push(
          `Folder "${folderName}": ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }

    // Delete selected videos
    for (const videoId of Array.from(selectedVideoIds)) {
      try {
        await deleteVideoContent(videoId);
        successCount++;
      } catch (error) {
        const videoName =
          videos.find((v) => v._id === videoId)?.title || videoId;
        errors.push(
          `Video "${videoName}": ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }

    setIsBulkDeleting(false);

    if (errors.length > 0) {
      setDeleteError(
        `Deleted ${successCount} item(s). Failed to delete ${errors.length} item(s):\n${errors.join("\n")}`,
      );
    } else {
      toast.success(`Successfully deleted ${successCount} item(s)`);
      setBulkDeleteOpen(false);
      setSelectedFolderIds(new Set());
      setSelectedVideoIds(new Set());

      // Refresh the list
      loadHierarchy();
    }
  };

  const totalSelected = selectedFolderIds.size + selectedVideoIds.size;

  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  function openVideoPreview(video: VideoContent) {
    // Admin sees the original unwatermarked video
    setPreviewVideoUrl(video.downloadVideoUrl);
    setPreviewVideoTitle(video.title);
    setPreviewVideoOpen(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-sm text-slate-500">
        {breadcrumbs.map((item, index) => (
          <React.Fragment key={item._id}>
            {index > 0 && <span>/</span>}
            <button
              onClick={() => {
                if (index === 0) {
                  setParams({});
                } else {
                  setParams({ folderId: item._id });
                }
              }}
              className="hover:text-purple-600 transition-colors"
            >
              {item.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Video Content
          </h1>
          <p className="text-slate-600">Manage your video content library</p>
          {totalSelected > 0 && (
            <p className="text-sm text-blue-600 mt-1">
              {totalSelected} item(s) selected
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          {totalSelected > 0 && (
            <Button
              onClick={openBulkDelete}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected ({totalSelected})
            </Button>
          )}
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
          <Button
            onClick={() => setUploadOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Video
          </Button>
          <Button onClick={() => setBulkUploadOpen(true)} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
        </div>
      </div>

      {/* Folders */}
      {folders.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 flex items-center">
              <FolderIcon className="h-5 w-5 mr-2 text-purple-600" />
              Folders ({folders.length})
            </h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleSelectAllFolders}
              className="text-sm"
            >
              {selectedFolderIds.size === folders.length && folders.length > 0
                ? "Deselect All"
                : "Select All"}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {folders.map((folder) => (
              <Card
                key={folder._id}
                className="hover:shadow-lg transition-shadow relative overflow-hidden"
              >
                {/* Selection checkbox */}
                <div
                  className="absolute top-2 left-2 z-20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selectedFolderIds.has(folder._id)}
                    onChange={() => toggleFolderSelection(folder._id)}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                {/* Cover Photo Section */}
                {folder.coverPhotoUrl && (
                  <div className="relative h-32 bg-gradient-to-br from-purple-100 to-blue-100">
                    <img
                      src={folder.coverPhotoUrl}
                      alt={folder.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded flex items-center">
                      <ImageIcon className="h-3 w-3 mr-1" />
                      Cover
                    </div>
                  </div>
                )}

                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => navigateToFolder(folder._id)}
                    >
                      <div className="flex items-center mb-2">
                        <div className="p-2 bg-purple-100 rounded-lg mr-3">
                          <FolderIcon className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-800">
                            {folder.name}
                          </h3>
                          {/* Pricing Badge */}
                          {folder.isPurchasable && (
                            <div className="mt-1">
                              <span className="inline-flex items-center bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded">
                                <DollarSign className="h-3 w-3 mr-0.5" />
                                {folder.discountPrice
                                  ? `₹${folder.discountPrice}`
                                  : `₹${folder.basePrice}`}
                                {folder.discountPrice && (
                                  <span className="ml-1 line-through text-gray-500">
                                    ₹{folder.basePrice}
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                          {!folder.isPurchasable && (
                            <div className="mt-1">
                              <span className="inline-flex items-center bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded">
                                No Pricing
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openFolderPricing(folder)}
                        title="Folder Pricing"
                      >
                        <Settings className="h-4 w-4 text-purple-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditFolder(folder)}
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          openDeleteConfirm("folder", folder._id, folder.name)
                        }
                        title="Delete Folder (including all contents)"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    {folder.totalVideos || 0} video(s)
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Videos */}
      {currentFolderId && videos.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 flex items-center">
              <VideoIcon className="h-5 w-5 mr-2 text-purple-600" />
              Videos ({videos.length})
            </h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleSelectAllVideos}
              className="text-sm"
            >
              {selectedVideoIds.size === videos.length && videos.length > 0
                ? "Deselect All"
                : "Select All"}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos.map((video) => (
              <Card
                key={video._id}
                className="hover:shadow-lg transition-shadow overflow-hidden relative"
              >
                {/* Selection checkbox */}
                <div
                  className="absolute top-2 left-2 z-20 bg-white rounded"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selectedVideoIds.has(video._id)}
                    onChange={() => toggleVideoSelection(video._id)}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
                <div className="relative aspect-video bg-gradient-to-br from-purple-100 to-blue-100">
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="h-16 w-16 text-purple-400" />
                    </div>
                  )}
                  {video.duration && (
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs text-white flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDuration(video.duration)}
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-slate-800 mb-1 line-clamp-1">
                    {video.title}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center text-sm">
                      <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                      <span className="font-semibold text-green-600">
                        ₹{video.discountPrice || video.basePrice}
                      </span>
                      {video.discountPrice && (
                        <span className="ml-2 text-xs text-slate-400 line-through">
                          ₹{video.basePrice}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openVideoPreview(video)}
                        title="Preview Video"
                      >
                        <Play className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditVideo(video)}
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          openDeleteConfirm("video", video._id, video.title)
                        }
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && folders.length === 0 && videos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
          <FolderIcon className="h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium mb-1">No videos or folders</h3>
          <p className="text-sm text-slate-500 mb-4">
            Get started by uploading a video or creating a folder.
          </p>
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={() => setCreateOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <FolderIcon className="mr-2 h-4 w-4" />
              New Folder
            </Button>
            <Button
              size="sm"
              onClick={() => setUploadOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Video
            </Button>
          </div>
        </div>
      )}

      {/* Create Folder Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Create a new folder to organize your videos.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateFolder} className="space-y-4">
            <div>
              <Label htmlFor="folderName">Folder Name *</Label>
              <Input
                id="folderName"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Enter folder name"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Create Folder
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upload Video Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Video</DialogTitle>
            <DialogDescription>
              Upload a video. A watermarked preview will be automatically
              generated.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUploadVideo} className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter video title"
                required
              />
            </div>

            <div>
              <Label htmlFor="basePrice">Base Price (₹) *</Label>
              <Input
                id="basePrice"
                type="number"
                step="0.01"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="hasDiscount"
                checked={hasDiscount}
                onCheckedChange={setHasDiscount}
              />
              <Label htmlFor="hasDiscount">Enable Discount</Label>
            </div>

            {hasDiscount && (
              <div>
                <Label htmlFor="discountPrice">Discount Price (₹)</Label>
                <Input
                  id="discountPrice"
                  type="number"
                  step="0.01"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            )}

            <div>
              <Label htmlFor="videoFile">
                Video File * (MP4, MOV, AVI, WEBM, MKV)
              </Label>
              <Input
                id="videoFile"
                type="file"
                accept="video/mp4,video/quicktime,video/x-msvideo,video/webm,video/x-matroska"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                required
              />
              {videoFile && (
                <p className="text-sm text-slate-600 mt-1">
                  Selected: {videoFile.name} (
                  {(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setUploadOpen(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Video
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={bulkUploadOpen} onOpenChange={setBulkUploadOpen}>
        <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk Upload Videos</DialogTitle>
            <DialogDescription>
              Upload multiple videos at once. All videos will have the same
              price and will be numbered automatically.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBulkUpload} className="space-y-4">
            <div>
              <Label htmlFor="bulkTitle">Base Title *</Label>
              <Input
                id="bulkTitle"
                value={bulkTitle}
                onChange={(e) => setBulkTitle(e.target.value)}
                placeholder="e.g., Tutorial Video"
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                Videos will be named: "{bulkTitle} 1", "{bulkTitle} 2", etc.
              </p>
            </div>

            <div>
              <Label htmlFor="bulkBasePrice">Base Price (₹) *</Label>
              <Input
                id="bulkBasePrice"
                type="number"
                step="0.01"
                value={bulkBasePrice}
                onChange={(e) => setBulkBasePrice(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="bulkHasDiscount"
                checked={bulkHasDiscount}
                onCheckedChange={setBulkHasDiscount}
              />
              <Label htmlFor="bulkHasDiscount">Enable Discount</Label>
            </div>

            {bulkHasDiscount && (
              <div>
                <Label htmlFor="bulkDiscountPrice">Discount Price (₹)</Label>
                <Input
                  id="bulkDiscountPrice"
                  type="number"
                  step="0.01"
                  value={bulkDiscountPrice}
                  onChange={(e) => setBulkDiscountPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            )}

            <div>
              <Label htmlFor="bulkVideoFiles">
                Select Video Files * (MP4, MOV, AVI, WEBM, MKV)
              </Label>
              <Input
                id="bulkVideoFiles"
                type="file"
                accept="video/mp4,video/quicktime,video/x-msvideo,video/webm,video/x-matroska"
                multiple
                onChange={(e) => setBulkVideoFiles(e.target.files)}
                required
              />
              {bulkVideoFiles && (
                <p className="text-sm text-slate-600 mt-1">
                  {bulkVideoFiles.length} video(s) selected (
                  {(
                    Array.from(bulkVideoFiles).reduce(
                      (sum, file) => sum + file.size,
                      0,
                    ) /
                    (1024 * 1024)
                  ).toFixed(2)}{" "}
                  MB total)
                </p>
              )}
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">{uploadStatus}</span>
                  <span className="font-medium">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setBulkUploadOpen(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  "Upload All"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Folder Dialog */}
      <Dialog open={editFolderOpen} onOpenChange={setEditFolderOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
            <DialogDescription>Update the folder name.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditFolder} className="space-y-4">
            <div>
              <Label htmlFor="editFolderName">Folder Name *</Label>
              <Input
                id="editFolderName"
                value={editFolderName}
                onChange={(e) => setEditFolderName(e.target.value)}
                placeholder="Enter folder name"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditFolderOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Update Folder
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Video Dialog */}
      <Dialog open={editVideoOpen} onOpenChange={setEditVideoOpen}>
        <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Video</DialogTitle>
            <DialogDescription>Update the video details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditVideo} className="space-y-4">
            <div>
              <Label htmlFor="editTitle">Title *</Label>
              <Input
                id="editTitle"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter video title"
                required
              />
            </div>

            <div>
              <Label htmlFor="editBasePrice">Base Price (₹) *</Label>
              <Input
                id="editBasePrice"
                type="number"
                step="0.01"
                value={editBasePrice}
                onChange={(e) => setEditBasePrice(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="editHasDiscount"
                checked={editHasDiscount}
                onCheckedChange={setEditHasDiscount}
              />
              <Label htmlFor="editHasDiscount">Enable Discount</Label>
            </div>

            {editHasDiscount && (
              <div>
                <Label htmlFor="editDiscountPrice">Discount Price (₹)</Label>
                <Input
                  id="editDiscountPrice"
                  type="number"
                  step="0.01"
                  value={editDiscountPrice}
                  onChange={(e) => setEditDiscountPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            )}

            <div>
              <Label htmlFor="editVideoFile">Replace Video (Optional)</Label>
              <Input
                id="editVideoFile"
                type="file"
                accept="video/mp4,video/quicktime,video/x-msvideo,video/webm,video/x-matroska"
                onChange={(e) => setEditVideoFile(e.target.files?.[0] || null)}
              />
              {editVideoFile && (
                <p className="text-sm text-slate-600 mt-1">
                  Selected: {editVideoFile.name} (
                  {(editVideoFile.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditVideoOpen(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Updating...
                  </>
                ) : (
                  "Update Video"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              {deleteItem?.type === "folder" ? (
                <>
                  Are you sure you want to delete the folder "{deleteItem?.name}
                  " and <strong>ALL its contents</strong>?
                  <br />
                  <br />
                  <span className="text-red-600 font-semibold">
                    Warning: This will permanently delete all subfolders and
                    videos inside this folder.
                  </span>
                  <br />
                  <br />
                  This action cannot be undone.
                </>
              ) : (
                <>
                  Are you sure you want to delete "{deleteItem?.name}"? This
                  action cannot be undone.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {deleteError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <X className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Cannot Delete
                  </h3>
                  <div className="mt-2 text-sm text-red-700">{deleteError}</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setDeleteError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!!deleteError}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Folder Pricing Dialog */}
      <Dialog open={folderPricingOpen} onOpenChange={setFolderPricingOpen}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>Set Folder Pricing</DialogTitle>
            <DialogDescription>
              Configure pricing and settings for the folder.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFolderPricing} className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isPurchasable"
                checked={folderPricingData.isPurchasable}
                onCheckedChange={(checked) =>
                  setFolderPricingData({
                    ...folderPricingData,
                    isPurchasable: checked,
                  })
                }
              />
              <Label htmlFor="isPurchasable">Make folder purchasable</Label>
            </div>

            {folderPricingData.isPurchasable && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="folderBasePrice">Base Price (₹)</Label>
                    <Input
                      id="folderBasePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={folderPricingData.basePrice}
                      onChange={(e) =>
                        setFolderPricingData({
                          ...folderPricingData,
                          basePrice: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="folderDiscountPrice">
                      Discount Price (₹)
                    </Label>
                    <Input
                      id="folderDiscountPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={folderPricingData.discountPrice}
                      onChange={(e) =>
                        setFolderPricingData({
                          ...folderPricingData,
                          discountPrice: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="folderDescription">Description</Label>
                  <textarea
                    id="folderDescription"
                    placeholder="Enter folder description"
                    value={folderPricingData.description}
                    onChange={(e) =>
                      setFolderPricingData({
                        ...folderPricingData,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coverPhoto">Cover Photo</Label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImageIcon className="w-8 h-8 mb-2 text-slate-500" />
                        <p className="mb-2 text-sm text-slate-500">
                          <span className="font-semibold">
                            Click to upload cover photo
                          </span>
                        </p>
                        <p className="text-xs text-slate-500">
                          PNG, JPG, JPEG, GIF, or WebP
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) =>
                          setCoverPhotoFile(e.target.files?.[0] || null)
                        }
                      />
                    </label>
                  </div>
                  {coverPhotoFile && (
                    <div className="flex items-center justify-between p-2 text-sm bg-slate-50 rounded">
                      <span className="truncate">{coverPhotoFile.name}</span>
                      <button
                        type="button"
                        onClick={() => setCoverPhotoFile(null)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {folderPricingData.coverPhotoUrl && !coverPhotoFile && (
                    <div className="mt-2">
                      <img
                        src={folderPricingData.coverPhotoUrl}
                        alt="Current cover"
                        className="h-32 w-full object-cover rounded"
                      />
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFolderPricingOpen(false);
                  setCoverPhotoFile(null);
                }}
                disabled={isUploadingCoverPhoto}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={isUploadingCoverPhoto}
              >
                {isUploadingCoverPhoto ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  "Save Pricing"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Delete Selected Items</DialogTitle>
            <DialogDescription>
              You are about to delete {totalSelected} item(s). This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedFolderIds.size > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-2">
                  ⚠️ Folders ({selectedFolderIds.size})
                </h4>
                <p className="text-sm text-red-700 mb-3">
                  Deleting folders will permanently remove all contents
                  (subfolders and videos) inside them.
                </p>
                <ul className="space-y-1 max-h-40 overflow-y-auto">
                  {Array.from(selectedFolderIds).map((id) => {
                    const folder = folders.find((f) => f._id === id);
                    return (
                      <li key={id} className="text-sm text-red-800">
                        📁 {folder?.name || id}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {selectedVideoIds.size > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 mb-2">
                  Videos ({selectedVideoIds.size})
                </h4>
                <ul className="space-y-1 max-h-40 overflow-y-auto">
                  {Array.from(selectedVideoIds).map((id) => {
                    const video = videos.find((v) => v._id === id);
                    return (
                      <li key={id} className="text-sm text-orange-800">
                        🎥 {video?.title || id}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {deleteError && (
              <div className="bg-red-100 border border-red-300 rounded-lg p-4">
                <p className="text-sm text-red-800 whitespace-pre-wrap">
                  {deleteError}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setBulkDeleteOpen(false);
                setDeleteError(null);
              }}
              disabled={isBulkDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isBulkDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete {totalSelected} Item(s)
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Preview Player Dialog */}
      <Dialog open={previewVideoOpen} onOpenChange={setPreviewVideoOpen}>
        <DialogContent className="bg-white max-w-4xl">
          <DialogHeader>
            <DialogTitle>Preview: {previewVideoTitle}</DialogTitle>
            <DialogDescription>
              Admin preview - Original unwatermarked video
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {previewVideoUrl && (
              <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  src={previewVideoUrl}
                  controls
                  autoPlay
                  className="w-full h-full"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => setPreviewVideoOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoContentManager;
