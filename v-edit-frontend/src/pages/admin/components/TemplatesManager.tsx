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
  createFolder,
  getHierarchy,
  uploadTemplate,
  updateTemplate,
  deleteTemplate,
  updateFolder,
  deleteFolder,
  moveTemplate,
  moveFolder,
} from "@/lib/backend";
import { useCart } from "@/context/CartContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import type { Folder, TemplateItem } from "@/lib/backend";
import {
  Plus,
  Upload,
  Folder as FolderIcon,
  FileVideo,
  X,
  Edit,
  Trash2,
  Move,
  MoreVertical,
  DollarSign,
  ShoppingCart,
  Settings,
  Image as ImageIcon,
  Play,
} from "lucide-react";

// ... (FolderCard and TemplateCard components remain the same as in AdminExplorer.tsx)

const TemplatesManager = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const currentFolderId = params.get("folderId") || undefined;
  const [folders, setFolders] = useState<Folder[]>([]);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [path, setPath] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editFolderOpen, setEditFolderOpen] = useState(false);
  const [editTemplateOpen, setEditTemplateOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const { addItem } = useCart();

  // Multi-select delete state
  const [selectedFolderIds, setSelectedFolderIds] = useState<Set<string>>(
    new Set(),
  );
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<Set<string>>(
    new Set(),
  );
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Create folder state
  const [folderName, setFolderName] = useState("");
  const [parentId, setParentId] = useState<string | undefined>(currentFolderId);

  // Upload template state
  const [title, setTitle] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [hasDiscount, setHasDiscount] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Edit states
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(
    null,
  );
  const [deleteItem, setDeleteItem] = useState<{
    type: "folder" | "template";
    id: string;
    name: string;
  } | null>(null);
  const [editFolderName, setEditFolderName] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editBasePrice, setEditBasePrice] = useState("");
  const [editDiscountPrice, setEditDiscountPrice] = useState("");
  const [editHasDiscount, setEditHasDiscount] = useState(false);
  const [editVideoFile, setEditVideoFile] = useState<File | null>(null);
  const [editQrFile, setEditQrFile] = useState<File | null>(null);

  // Folder pricing states
  const [folderPricingOpen, setFolderPricingOpen] = useState(false);
  const [selectedFolderForPricing, setSelectedFolderForPricing] =
    useState<Folder | null>(null);
  const [folderPricingData, setFolderPricingData] = useState({
    basePrice: "",
    discountPrice: "",
    isPurchasable: false,
    description: "",
    thumbnailUrl: "",
    previewVideoUrl: "",
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
    setLoading(true);
    // Clear selections when navigating to a different folder
    setSelectedFolderIds(new Set());
    setSelectedTemplateIds(new Set());
    getHierarchy(currentFolderId)
      .then((data) => {
        setFolders(data.folders || []);
        setTemplates(data.templates || []);
        setPath(data.path || []);
      })
      .catch((error) => {
        console.error("Error loading hierarchy:", error);
      })
      .finally(() => setLoading(false));
  }, [currentFolderId]);

  const breadcrumbs = useMemo(() => {
    const items = [{ _id: "", name: "Templates" }, ...path];
    return items;
  }, [path]);

  async function handleCreateFolder(e: React.FormEvent) {
    e.preventDefault();
    if (!folderName.trim()) return;

    try {
      await createFolder(folderName, parentId);
      setCreateOpen(false);
      setFolderName("");
      const data = await getHierarchy(currentFolderId);
      setFolders(data.folders || []);
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  }

  async function handleUploadTemplate(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !basePrice || !videoFile || !qrFile) {
      alert("Please fill all required fields");
      return;
    }

    // Validate discount price if enabled
    if (hasDiscount) {
      if (!discountPrice) {
        alert("Please enter a discount price or disable the discount option");
        return;
      }
      const basePriceNum = parseFloat(basePrice);
      const discountPriceNum = parseFloat(discountPrice);

      if (discountPriceNum >= basePriceNum) {
        alert("Discount price must be less than the base price");
        return;
      }

      if (discountPriceNum <= 0) {
        alert("Discount price must be greater than 0");
        return;
      }
    }

    // Validate file types
    const validVideoTypes = ["video/mp4", "video/webm", "video/quicktime"];
    const validImageTypes = ["image/jpeg", "image/png", "image/jpg"];

    if (!validVideoTypes.includes(videoFile.type)) {
      alert("Please upload a valid video file (MP4, WebM, or QuickTime)");
      return;
    }

    if (!validImageTypes.includes(qrFile.type)) {
      alert("Please upload a valid image file for QR code (JPEG, JPG, or PNG)");
      return;
    }

    setIsUploading(true);
    try {
      // Convert string prices to numbers
      const basePriceNum = parseFloat(basePrice);
      const discountPriceNum =
        hasDiscount && discountPrice ? parseFloat(discountPrice) : undefined;

      // Match field names with backend expectations
      const templateData = {
        title,
        basePrice: basePriceNum,
        discountPrice: discountPriceNum,
        videoFile,
        qrFile,
        parentId: currentFolderId || undefined,
      };

      await uploadTemplate(templateData);
      setUploadOpen(false);
      setTitle("");
      setBasePrice("");
      setDiscountPrice("");
      setHasDiscount(false);
      setVideoFile(null);
      setQrFile(null);

      // Refresh the list
      const data = await getHierarchy(currentFolderId);
      setTemplates(data.templates || []);
    } catch (error) {
      console.error("Error uploading template:", error);
      // Show more detailed error message to the user
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const errorMessage =
          error.response.data?.message || "Failed to upload template";
        alert(`Error: ${errorMessage}`);
      } else if (error.request) {
        // The request was made but no response was received
        alert("No response from server. Please check your connection.");
      } else {
        // Something happened in setting up the request that triggered an Error
        alert(`Error: ${error.message}`);
      }
    } finally {
      setIsUploading(false);
    }
  }

  function navigateToFolder(folderId: string) {
    setParams(folderId ? { folderId } : {});
  }

  // Edit folder functions
  function openEditFolder(folder: Folder) {
    setSelectedFolder(folder);
    setEditFolderName(folder.name);
    setEditFolderOpen(true);
  }

  async function handleEditFolder(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFolder || !editFolderName.trim()) return;

    try {
      await updateFolder(selectedFolder._id, { name: editFolderName });
      setEditFolderOpen(false);
      setSelectedFolder(null);
      setEditFolderName("");

      // Refresh the list
      const data = await getHierarchy(currentFolderId);
      setFolders(data.folders || []);
    } catch (error) {
      console.error("Error updating folder:", error);
      alert("Failed to update folder");
    }
  }

  // Edit template functions
  function openEditTemplate(template: TemplateItem) {
    setSelectedTemplate(template);
    setEditTitle(template.title);
    setEditDescription(template.description || "");
    setEditBasePrice(template.basePrice.toString());
    setEditDiscountPrice(template.discountPrice?.toString() || "");
    setEditHasDiscount(!!template.discountPrice);
    setEditVideoFile(null);
    setEditQrFile(null);
    setEditTemplateOpen(true);
  }

  async function handleEditTemplate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTemplate || !editTitle || !editBasePrice) return;

    // Validate discount price if enabled
    if (editHasDiscount) {
      if (!editDiscountPrice) {
        alert("Please enter a discount price or disable the discount option");
        return;
      }
      const basePriceNum = parseFloat(editBasePrice);
      const discountPriceNum = parseFloat(editDiscountPrice);

      if (discountPriceNum >= basePriceNum) {
        alert("Discount price must be less than the base price");
        return;
      }
    }

    try {
      const updateData = {
        title: editTitle,
        description: editDescription,
        basePrice: parseFloat(editBasePrice),
        discountPrice:
          editHasDiscount && editDiscountPrice
            ? parseFloat(editDiscountPrice)
            : undefined,
        videoFile: editVideoFile || undefined,
        qrFile: editQrFile || undefined,
      };

      await updateTemplate(selectedTemplate._id, updateData);
      setEditTemplateOpen(false);
      setSelectedTemplate(null);

      // Reset edit form
      setEditTitle("");
      setEditDescription("");
      setEditBasePrice("");
      setEditDiscountPrice("");
      setEditHasDiscount(false);
      setEditVideoFile(null);
      setEditQrFile(null);

      // Refresh the list
      const data = await getHierarchy(currentFolderId);
      setTemplates(data.templates || []);
    } catch (error) {
      console.error("Error updating template:", error);
      alert("Failed to update template");
    }
  }

  // Delete functions
  function openDeleteConfirm(
    type: "folder" | "template",
    id: string,
    name: string,
  ) {
    setDeleteItem({ type, id, name });
    setDeleteConfirmOpen(true);
  }

  // Folder pricing functions
  function openFolderPricing(folder: Folder) {
    setSelectedFolderForPricing(folder);
    setFolderPricingData({
      basePrice: folder.basePrice?.toString() || "0",
      discountPrice: folder.discountPrice?.toString() || "",
      isPurchasable: folder.isPurchasable || false,
      description: folder.description || "",
      thumbnailUrl: folder.thumbnailUrl || "",
      previewVideoUrl: folder.previewVideoUrl || "",
      coverPhotoUrl: folder.coverPhotoUrl || "",
    });
    setFolderPricingOpen(true);
  }

  async function handleUpdateFolderPricing(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFolderForPricing) return;

    try {
      // First upload cover photo if provided
      let coverPhotoUrl = folderPricingData.coverPhotoUrl;
      if (coverPhotoFile) {
        setIsUploadingCoverPhoto(true);
        const { uploadFolderCoverPhoto } = await import("@/lib/backend");
        const uploadResult = await uploadFolderCoverPhoto(
          selectedFolderForPricing._id,
          coverPhotoFile,
        );
        coverPhotoUrl = uploadResult.folder.coverPhotoUrl;
        setIsUploadingCoverPhoto(false);
      }

      const updateData = {
        basePrice: parseFloat(folderPricingData.basePrice) || 0,
        discountPrice: folderPricingData.discountPrice
          ? parseFloat(folderPricingData.discountPrice)
          : undefined,
        isPurchasable: folderPricingData.isPurchasable,
        description: folderPricingData.description || undefined,
        thumbnailUrl: folderPricingData.thumbnailUrl || undefined,
        previewVideoUrl: folderPricingData.previewVideoUrl || undefined,
        coverPhotoUrl: coverPhotoUrl || undefined,
      };

      // Import the API function dynamically to avoid circular import
      const { updateFolderPricing } = await import("@/lib/api");
      await updateFolderPricing(selectedFolderForPricing._id, updateData);

      setFolderPricingOpen(false);
      setSelectedFolderForPricing(null);
      setCoverPhotoFile(null);

      // Refresh the list
      const data = await getHierarchy(currentFolderId);
      setFolders(data.folders || []);
    } catch (error) {
      console.error("Error updating folder pricing:", error);
      alert("Failed to update folder pricing");
      setIsUploadingCoverPhoto(false);
    }
  }

  async function handleDelete() {
    if (!deleteItem) return;

    try {
      if (deleteItem.type === "folder") {
        await deleteFolder(deleteItem.id);
        const data = await getHierarchy(currentFolderId);
        setFolders(data.folders || []);
      } else {
        await deleteTemplate(deleteItem.id);
        const data = await getHierarchy(currentFolderId);
        setTemplates(data.templates || []);
      }

      setDeleteConfirmOpen(false);
      setDeleteItem(null);
    } catch (error) {
      console.error("Error deleting item:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to delete item";
      alert(errorMessage);
    }
  }

  function openVideoPreview(template: TemplateItem) {
    // Admin sees the original unwatermarked video
    setPreviewVideoUrl(template.videoUrl);
    setPreviewVideoTitle(template.title);
    setPreviewVideoOpen(true);
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

  const toggleTemplateSelection = (templateId: string) => {
    setSelectedTemplateIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(templateId)) {
        newSet.delete(templateId);
      } else {
        newSet.add(templateId);
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

  const toggleSelectAllTemplates = () => {
    if (selectedTemplateIds.size === templates.length && templates.length > 0) {
      setSelectedTemplateIds(new Set());
    } else {
      setSelectedTemplateIds(new Set(templates.map((t) => t._id)));
    }
  };

  const openBulkDelete = () => {
    if (selectedFolderIds.size === 0 && selectedTemplateIds.size === 0) {
      return;
    }
    setBulkDeleteOpen(true);
  };

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    const errors: string[] = [];
    let successCount = 0;

    // Delete selected folders
    for (const folderId of Array.from(selectedFolderIds)) {
      try {
        await deleteFolder(folderId);
        successCount++;
      } catch (error) {
        const folderName =
          folders.find((f) => f._id === folderId)?.name || folderId;
        errors.push(
          `Folder "${folderName}": ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }

    // Delete selected templates
    for (const templateId of Array.from(selectedTemplateIds)) {
      try {
        await deleteTemplate(templateId);
        successCount++;
      } catch (error) {
        const templateName =
          templates.find((t) => t._id === templateId)?.title || templateId;
        errors.push(
          `Template "${templateName}": ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }

    setIsBulkDeleting(false);

    if (errors.length > 0) {
      alert(
        `Deleted ${successCount} item(s). Failed to delete ${errors.length} item(s):\n${errors.join("\n")}`,
      );
    } else {
      alert(`Successfully deleted ${successCount} item(s)`);
      setBulkDeleteOpen(false);
      setSelectedFolderIds(new Set());
      setSelectedTemplateIds(new Set());

      // Refresh the list
      const data = await getHierarchy(currentFolderId);
      setFolders(data.folders || []);
      setTemplates(data.templates || []);
    }
  };

  const totalSelected = selectedFolderIds.size + selectedTemplateIds.size;

  return (
    <div className="space-y-6">
      {/* Header with breadcrumbs and action buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={item._id}>
                {index > 0 && <span>/</span>}
                <button
                  onClick={() => navigateToFolder(item._id)}
                  className={`hover:text-primary ${index === breadcrumbs.length - 1 ? "font-medium text-foreground" : ""}`}
                >
                  {item.name}
                </button>
              </React.Fragment>
            ))}
          </div>
          {totalSelected > 0 && (
            <p className="text-sm text-blue-600 mt-1">
              {totalSelected} item(s) selected
            </p>
          )}
        </div>
        <div className="flex space-x-2 w-full sm:w-auto">
          {totalSelected > 0 && (
            <Button
              size="sm"
              onClick={openBulkDelete}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected ({totalSelected})
            </Button>
          )}
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <FolderIcon className="mr-2 h-4 w-4" />
            New Folder
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setUploadOpen(true)}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Template
          </Button>
        </div>
      </div>

      {/* Folder Grid */}
      {folders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium">Folders ({folders.length})</h3>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {folders.map((folder) => (
              <div key={folder._id} className="group relative">
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
                <Card
                  className="h-full hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigateToFolder(folder._id)}
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                    {folder.coverPhotoUrl ? (
                      <div className="relative w-full h-20 mb-2 rounded-lg overflow-hidden">
                        <img
                          src={folder.coverPhotoUrl}
                          alt={folder.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded flex items-center">
                          <ImageIcon className="h-2.5 w-2.5 mr-0.5" />
                          Cover
                        </div>
                      </div>
                    ) : (
                      <FolderIcon className="h-12 w-12 text-yellow-400 mb-2" />
                    )}
                    <p className="text-sm font-medium text-center mb-1">
                      {folder.name}
                    </p>
                    {/* Pricing Badge */}
                    {folder.isPurchasable && (
                      <div className="mt-1">
                        <span className="inline-flex items-center bg-green-100 text-green-800 text-xs font-semibold px-1.5 py-0.5 rounded">
                          <DollarSign className="h-2.5 w-2.5 mr-0.5" />
                          {folder.discountPrice
                            ? `₹${folder.discountPrice}`
                            : `₹${folder.basePrice}`}
                        </span>
                      </div>
                    )}
                    {!folder.isPurchasable && (
                      <div className="mt-1">
                        <span className="inline-flex items-center bg-gray-100 text-gray-600 text-xs font-semibold px-1.5 py-0.5 rounded">
                          No Pricing
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Management buttons */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1 z-10">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 w-7 p-0 bg-white shadow-md hover:bg-gray-100 border"
                    onClick={(e) => {
                      e.stopPropagation();
                      openFolderPricing(folder);
                    }}
                    title="Set Folder Pricing"
                  >
                    <DollarSign className="h-3 w-3 text-green-600" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 w-7 p-0 bg-white shadow-md hover:bg-gray-100 border"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditFolder(folder);
                    }}
                    title="Edit Folder"
                  >
                    <Edit className="h-3 w-3 text-gray-700" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-7 w-7 p-0 bg-red-500 shadow-md hover:bg-red-600 border border-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteConfirm("folder", folder._id, folder.name);
                    }}
                    title="Delete Folder"
                  >
                    <Trash2 className="h-3 w-3 text-white" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Templates Grid */}
      {currentFolderId && templates.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium">
              Templates ({templates.length})
            </h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleSelectAllTemplates}
              className="text-sm"
            >
              {selectedTemplateIds.size === templates.length &&
              templates.length > 0
                ? "Deselect All"
                : "Select All"}
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {templates.map((template) => (
              <div key={template._id} className="group relative">
                {/* Selection checkbox */}
                <div
                  className="absolute top-2 left-2 z-20 bg-white rounded"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selectedTemplateIds.has(template._id)}
                    onChange={() => toggleTemplateSelection(template._id)}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
                <Card className="h-full overflow-hidden">
                  <div className="relative aspect-video bg-black">
                    <video
                      src={template.videoUrl}
                      className="h-full w-full object-cover"
                      muted
                      loop
                      onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                      onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
                    />
                    {template.qrUrl && (
                      <img
                        src={template.qrUrl}
                        alt="QR Code"
                        className="absolute bottom-2 right-2 h-10 w-10 rounded border border-white/20"
                      />
                    )}

                    {/* Management buttons overlay */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1 z-10">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-7 w-7 p-0 bg-white shadow-md hover:bg-gray-100 border"
                        onClick={(e) => {
                          e.stopPropagation();
                          openVideoPreview(template);
                        }}
                        title="Preview Video"
                      >
                        <Play className="h-3 w-3 text-green-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-7 w-7 p-0 bg-white shadow-md hover:bg-gray-100 border"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditTemplate(template);
                        }}
                        title="Edit Template"
                      >
                        <Edit className="h-3 w-3 text-gray-700" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 w-7 p-0 bg-red-500 shadow-md hover:bg-red-600 border border-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteConfirm(
                            "template",
                            template._id,
                            template.title,
                          );
                        }}
                        title="Delete Template"
                      >
                        <Trash2 className="h-3 w-3 text-white" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-3 bg-white">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-sm line-clamp-1 text-gray-900">
                        {template.title || "Untitled Template"}
                      </h4>
                      <div className="text-sm font-medium">
                        {template.discountPrice ? (
                          <>
                            <span className="text-gray-500 line-through text-xs mr-1">
                              ₹{template.basePrice}
                            </span>
                            <span className="text-green-600">
                              ₹{template.discountPrice}
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-900">
                            ₹{template.basePrice}
                          </span>
                        )}
                      </div>
                    </div>
                    {template.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                        {template.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && folders.length === 0 && templates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
          <FolderIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-1">No templates or folders</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get started by uploading a template or creating a folder.
          </p>
          <div className="flex space-x-2">
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <FolderIcon className="mr-2 h-4 w-4" />
              New Folder
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setUploadOpen(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Template
            </Button>
          </div>
        </div>
      )}

      {/* Create Folder Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Create a new folder to organize your templates.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateFolder} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="folderName">Folder Name</Label>
              <Input
                id="folderName"
                placeholder="Enter folder name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upload Template Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload New Template</DialogTitle>
            <DialogDescription>
              Upload a new template with video and QR code.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUploadTemplate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter template title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price (₹) *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="hasDiscount"
                  checked={hasDiscount}
                  onCheckedChange={setHasDiscount}
                />
                <Label htmlFor="hasDiscount" className="text-sm font-medium">
                  Enable Discount Pricing
                </Label>
              </div>

              {hasDiscount && (
                <div className="space-y-2">
                  <Label htmlFor="discountPrice">Discount Price (₹) *</Label>
                  <Input
                    id="discountPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    required={hasDiscount}
                  />
                  {basePrice &&
                    discountPrice &&
                    parseFloat(discountPrice) >= parseFloat(basePrice) && (
                      <p className="text-sm text-red-500">
                        Discount price must be less than base price
                      </p>
                    )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Video File *</Label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FileVideo className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">
                          Click to upload video
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">MP4, WebM, or MOV</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="video/*"
                      onChange={(e) =>
                        setVideoFile(e.target.files?.[0] || null)
                      }
                      required
                    />
                  </label>
                </div>
                {videoFile && (
                  <div className="flex items-center justify-between p-2 text-sm bg-gray-50 rounded">
                    <span className="truncate">{videoFile.name}</span>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => setVideoFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>QR Code Image *</Label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-2 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                        ></path>
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">
                          Click to upload QR code
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, or JPEG</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => setQrFile(e.target.files?.[0] || null)}
                      required
                    />
                  </label>
                </div>
                {qrFile && (
                  <div className="flex items-center justify-between p-2 text-sm bg-gray-50 rounded">
                    <span className="truncate">{qrFile.name}</span>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => setQrFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setUploadOpen(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? "Uploading..." : "Upload Template"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Folder Dialog */}
      <Dialog open={editFolderOpen} onOpenChange={setEditFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
            <DialogDescription>Update the folder name.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditFolder} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editFolderName">Folder Name</Label>
              <Input
                id="editFolderName"
                placeholder="Enter folder name"
                value={editFolderName}
                onChange={(e) => setEditFolderName(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditFolderOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Update</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={editTemplateOpen} onOpenChange={setEditTemplateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Update template details. Leave files empty to keep existing ones.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditTemplate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editTitle">Title *</Label>
              <Input
                id="editTitle"
                placeholder="Enter template title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editDescription">Description</Label>
              <Input
                id="editDescription"
                placeholder="Enter template description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editBasePrice">Base Price (₹) *</Label>
                <Input
                  id="editBasePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={editBasePrice}
                  onChange={(e) => setEditBasePrice(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="editHasDiscount"
                  checked={editHasDiscount}
                  onCheckedChange={setEditHasDiscount}
                />
                <Label
                  htmlFor="editHasDiscount"
                  className="text-sm font-medium"
                >
                  Enable Discount Pricing
                </Label>
              </div>

              {editHasDiscount && (
                <div className="space-y-2">
                  <Label htmlFor="editDiscountPrice">
                    Discount Price (₹) *
                  </Label>
                  <Input
                    id="editDiscountPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={editDiscountPrice}
                    onChange={(e) => setEditDiscountPrice(e.target.value)}
                    required={editHasDiscount}
                  />
                  {editBasePrice &&
                    editDiscountPrice &&
                    parseFloat(editDiscountPrice) >=
                      parseFloat(editBasePrice) && (
                      <p className="text-sm text-red-500">
                        Discount price must be less than base price
                      </p>
                    )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>New Video File (optional)</Label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FileVideo className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">
                          Click to upload new video
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">MP4, WebM, or MOV</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="video/*"
                      onChange={(e) =>
                        setEditVideoFile(e.target.files?.[0] || null)
                      }
                    />
                  </label>
                </div>
                {editVideoFile && (
                  <div className="flex items-center justify-between p-2 text-sm bg-gray-50 rounded">
                    <span className="truncate">{editVideoFile.name}</span>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => setEditVideoFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>New QR Code Image (optional)</Label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-2 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                        ></path>
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">
                          Click to upload new QR code
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, or JPEG</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) =>
                        setEditQrFile(e.target.files?.[0] || null)
                      }
                    />
                  </label>
                </div>
                {editQrFile && (
                  <div className="flex items-center justify-between p-2 text-sm bg-gray-50 rounded">
                    <span className="truncate">{editQrFile.name}</span>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => setEditQrFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditTemplateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Update Template</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Folder Pricing Dialog */}
      <Dialog open={folderPricingOpen} onOpenChange={setFolderPricingOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Set Folder Pricing</DialogTitle>
            <DialogDescription>
              Configure pricing and purchasability for "
              {selectedFolderForPricing?.name}". Users will get access to all
              templates within this folder.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateFolderPricing} className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isPurchasable"
                checked={folderPricingData.isPurchasable}
                onCheckedChange={(checked) =>
                  setFolderPricingData((prev) => ({
                    ...prev,
                    isPurchasable: checked,
                  }))
                }
              />
              <Label htmlFor="isPurchasable" className="text-sm font-medium">
                Enable Folder Purchase
              </Label>
            </div>

            {folderPricingData.isPurchasable && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="folderBasePrice">Base Price (₹) *</Label>
                    <Input
                      id="folderBasePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={folderPricingData.basePrice}
                      onChange={(e) =>
                        setFolderPricingData((prev) => ({
                          ...prev,
                          basePrice: e.target.value,
                        }))
                      }
                      required={folderPricingData.isPurchasable}
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
                      placeholder="Optional discount price"
                      value={folderPricingData.discountPrice}
                      onChange={(e) =>
                        setFolderPricingData((prev) => ({
                          ...prev,
                          discountPrice: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="folderDescription">Description</Label>
                  <Input
                    id="folderDescription"
                    placeholder="Brief description of the folder contents"
                    value={folderPricingData.description}
                    onChange={(e) =>
                      setFolderPricingData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="coverPhoto">Cover Photo</Label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <ImageIcon className="w-8 h-8 mb-2 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">
                              Click to upload cover photo
                            </span>
                          </p>
                          <p className="text-xs text-gray-500">
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
                      <div className="flex items-center justify-between p-2 text-sm bg-gray-50 rounded">
                        <span className="truncate">{coverPhotoFile.name}</span>
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => setCoverPhotoFile(null)}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    {folderPricingData.coverPhotoUrl && !coverPhotoFile && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-2">
                          Current cover photo:
                        </p>
                        <img
                          src={folderPricingData.coverPhotoUrl}
                          alt="Current cover photo"
                          className="w-20 h-20 object-cover rounded border"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                      <Input
                        id="thumbnailUrl"
                        placeholder="https://example.com/thumbnail.jpg"
                        value={folderPricingData.thumbnailUrl}
                        onChange={(e) =>
                          setFolderPricingData((prev) => ({
                            ...prev,
                            thumbnailUrl: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="previewVideoUrl">Preview Video URL</Label>
                      <Input
                        id="previewVideoUrl"
                        placeholder="https://example.com/preview.mp4"
                        value={folderPricingData.previewVideoUrl}
                        onChange={(e) =>
                          setFolderPricingData((prev) => ({
                            ...prev,
                            previewVideoUrl: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFolderPricingOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUploadingCoverPhoto}>
                {isUploadingCoverPhoto ? "Uploading..." : "Update Folder"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
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
                    templates inside this folder.
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
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
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
                  (subfolders and templates) inside them.
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

            {selectedTemplateIds.size > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 mb-2">
                  Templates ({selectedTemplateIds.size})
                </h4>
                <ul className="space-y-1 max-h-40 overflow-y-auto">
                  {Array.from(selectedTemplateIds).map((id) => {
                    const template = templates.find((t) => t._id === id);
                    return (
                      <li key={id} className="text-sm text-orange-800">
                        🎬 {template?.title || id}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setBulkDeleteOpen(false)}
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

export default TemplatesManager;
