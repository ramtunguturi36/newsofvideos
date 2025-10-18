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
  createPictureFolder,
  getPictureHierarchy,
  uploadPictureTemplate,
  updatePictureTemplate,
  deletePictureTemplate,
  updatePictureFolder,
  deletePictureFolder,
} from "@/lib/backend";
import { useCart } from "@/context/CartContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import type { PictureFolder, PictureTemplate } from "@/lib/types";
import {
  Plus,
  Upload,
  Folder as FolderIcon,
  FileImage,
  X,
  Edit,
  Trash2,
  Move,
  MoreVertical,
  DollarSign,
  ShoppingCart,
  Settings,
  Image as ImageIcon,
  Tag,
  Ruler,
} from "lucide-react";

const PictureTemplatesManager = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const currentFolderId = params.get("folderId") || undefined;
  const [folders, setFolders] = useState<PictureFolder[]>([]);
  const [templates, setTemplates] = useState<PictureTemplate[]>([]);
  const [path, setPath] = useState<PictureFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editFolderOpen, setEditFolderOpen] = useState(false);
  const [editTemplateOpen, setEditTemplateOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [folderDeleteInfo, setFolderDeleteInfo] = useState<{
    [key: string]: { canDelete: boolean; reason?: string };
  }>({});
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
  const [previewImageFile, setPreviewImageFile] = useState<File | null>(null);
  const [downloadImageFile, setDownloadImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Bulk upload state
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [bulkTitle, setBulkTitle] = useState("");
  const [bulkBasePrice, setBulkBasePrice] = useState("");
  const [bulkDiscountPrice, setBulkDiscountPrice] = useState("");
  const [bulkHasDiscount, setBulkHasDiscount] = useState(false);
  const [bulkImageFiles, setBulkImageFiles] = useState<FileList | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");

  // Edit states
  const [selectedFolder, setSelectedFolder] = useState<PictureFolder | null>(
    null,
  );
  const [selectedTemplate, setSelectedTemplate] =
    useState<PictureTemplate | null>(null);
  const [deleteItem, setDeleteItem] = useState<{
    type: "folder" | "template";
    id: string;
    name: string;
  } | null>(null);
  const [editFolderName, setEditFolderName] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editBasePrice, setEditBasePrice] = useState("");
  const [editDiscountPrice, setEditDiscountPrice] = useState("");
  const [editHasDiscount, setEditHasDiscount] = useState(false);
  const [editPreviewImageFile, setEditPreviewImageFile] = useState<File | null>(
    null,
  );
  const [editDownloadImageFile, setEditDownloadImageFile] =
    useState<File | null>(null);

  // Folder pricing states
  const [folderPricingOpen, setFolderPricingOpen] = useState(false);
  const [selectedFolderForPricing, setSelectedFolderForPricing] =
    useState<PictureFolder | null>(null);
  const [folderPricingData, setFolderPricingData] = useState({
    basePrice: "",
    discountPrice: "",
    isPurchasable: false,
    description: "",
    thumbnailUrl: "",
    previewImageUrl: "",
    coverPhotoUrl: "",
  });
  const [coverPhotoFile, setCoverPhotoFile] = useState<File | null>(null);
  const [isUploadingCoverPhoto, setIsUploadingCoverPhoto] = useState(false);

  useEffect(() => {
    setParentId(currentFolderId);
    setLoading(true);
    // Clear selections when navigating to a different folder
    setSelectedFolderIds(new Set());
    setSelectedTemplateIds(new Set());
    getPictureHierarchy(currentFolderId)
      .then((data) => {
        setFolders(data.folders || []);
        setTemplates(data.templates || []);
        setPath(data.path || []);

        // Check which folders can be deleted
        checkFolderDeleteStatus(data.folders || []);
      })
      .catch((error) => {
        // Handle error silently
      })
      .finally(() => setLoading(false));
  }, [currentFolderId]);

  // Function to check if folders can be deleted
  async function checkFolderDeleteStatus(folders: PictureFolder[]) {
    const deleteInfo: {
      [key: string]: { canDelete: boolean; reason?: string };
    } = {};

    for (const folder of folders) {
      try {
        // Try to get hierarchy for this folder to check for children and templates
        const hierarchy = await getPictureHierarchy(folder._id);
        const hasChildren = (hierarchy.folders || []).length > 0;
        const hasTemplates = (hierarchy.templates || []).length > 0;

        if (hasChildren) {
          deleteInfo[folder._id] = {
            canDelete: false,
            reason: `Contains ${hierarchy.folders?.length || 0} subfolder(s)`,
          };
        } else if (hasTemplates) {
          deleteInfo[folder._id] = {
            canDelete: false,
            reason: `Contains ${hierarchy.templates?.length || 0} template(s)`,
          };
        } else {
          deleteInfo[folder._id] = { canDelete: true };
        }
      } catch (error) {
        deleteInfo[folder._id] = {
          canDelete: false,
          reason: "Unable to check folder contents",
        };
      }
    }

    setFolderDeleteInfo(deleteInfo);
  }

  const breadcrumbs = useMemo(() => {
    const items = [{ _id: "", name: "Picture Templates" }, ...path];
    return items;
  }, [path]);

  async function handleCreateFolder(e: React.FormEvent) {
    e.preventDefault();
    if (!folderName.trim()) return;

    try {
      await createPictureFolder(folderName, parentId);
      setCreateOpen(false);
      setFolderName("");
      const data = await getPictureHierarchy(currentFolderId);
      setFolders(data.folders || []);
    } catch (error) {
      // Handle error silently
    }
  }

  async function handleUploadTemplate(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !basePrice || !previewImageFile || !downloadImageFile) {
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
    const validImageTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/gif",
      "image/webp",
    ];

    if (!validImageTypes.includes(previewImageFile.type)) {
      alert(
        "Please upload a valid preview image file (JPEG, PNG, JPG, GIF, or WebP)",
      );
      return;
    }

    if (!validImageTypes.includes(downloadImageFile.type)) {
      alert(
        "Please upload a valid download image file (JPEG, PNG, JPG, GIF, or WebP)",
      );
      return;
    }

    setIsUploading(true);
    try {
      await uploadPictureTemplate({
        title,
        basePrice: parseFloat(basePrice),
        discountPrice: hasDiscount ? parseFloat(discountPrice) : undefined,
        previewImageFile,
        downloadImageFile,
        parentId: currentFolderId,
      });

      setUploadOpen(false);
      setTitle("");
      setBasePrice("");
      setDiscountPrice("");
      setHasDiscount(false);
      setPreviewImageFile(null);
      setDownloadImageFile(null);

      const data = await getPictureHierarchy(currentFolderId);
      setTemplates(data.templates || []);
    } catch (error) {
      // Handle error silently
    } finally {
      setIsUploading(false);
    }
  }

  async function handleBulkUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!bulkImageFiles || bulkImageFiles.length === 0) {
      alert("Please select at least one image file");
      return;
    }

    if (!bulkBasePrice) {
      alert("Please enter a base price");
      return;
    }

    // Validate discount price if enabled
    if (bulkHasDiscount && !bulkDiscountPrice) {
      alert("Please enter a discount price or disable the discount option");
      return;
    }

    setUploadProgress(0);
    setUploadStatus("Starting bulk upload...");

    const totalFiles = bulkImageFiles.length;
    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < totalFiles; i++) {
      const file = bulkImageFiles[i];
      const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension

      try {
        setUploadStatus(`Uploading ${i + 1}/${totalFiles}: ${fileName}...`);

        // For bulk upload, use the same file for both preview and download
        // In a production scenario, you'd want watermarking on the backend
        await uploadPictureTemplate({
          title: bulkTitle || fileName,
          basePrice: parseFloat(bulkBasePrice),
          discountPrice: bulkHasDiscount
            ? parseFloat(bulkDiscountPrice)
            : undefined,
          previewImageFile: file,
          downloadImageFile: file, // Same file for now
          parentId: currentFolderId,
        });

        successCount++;
        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
      } catch (error) {
        failedCount++;
        console.error(`Failed to upload ${fileName}:`, error);
      }
    }

    setUploadStatus(
      `Completed: ${successCount} succeeded, ${failedCount} failed`,
    );

    // Refresh the list
    const data = await getPictureHierarchy(currentFolderId);
    setTemplates(data.templates || []);

    // Reset form after a delay
    setTimeout(() => {
      setBulkUploadOpen(false);
      setBulkTitle("");
      setBulkBasePrice("");
      setBulkDiscountPrice("");
      setBulkHasDiscount(false);
      setBulkImageFiles(null);
      setUploadProgress(0);
      setUploadStatus("");
    }, 2000);
  }

  function navigateToFolder(folderId: string) {
    setParams(folderId ? { folderId } : {});
  }

  // Edit folder functions
  function openEditFolder(folder: PictureFolder) {
    setSelectedFolder(folder);
    setEditFolderName(folder.name);
    setEditFolderOpen(true);
  }

  async function handleEditFolder(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFolder || !editFolderName.trim()) return;

    try {
      await updatePictureFolder(selectedFolder._id, { name: editFolderName });
      setEditFolderOpen(false);
      setSelectedFolder(null);
      setEditFolderName("");

      // Refresh the list
      const data = await getPictureHierarchy(currentFolderId);
      setFolders(data.folders || []);
    } catch (error) {
      alert("Failed to update folder");
    }
  }

  // Edit template functions
  function openEditTemplate(template: PictureTemplate) {
    setSelectedTemplate(template);
    setEditTitle(template.title);
    setEditBasePrice(template.basePrice.toString());
    setEditDiscountPrice(template.discountPrice?.toString() || "");
    setEditHasDiscount(!!template.discountPrice);
    setEditPreviewImageFile(null);
    setEditDownloadImageFile(null);
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
        basePrice: parseFloat(editBasePrice),
        discountPrice:
          editHasDiscount && editDiscountPrice
            ? parseFloat(editDiscountPrice)
            : undefined,
        previewImageFile: editPreviewImageFile || undefined,
        downloadImageFile: editDownloadImageFile || undefined,
      };

      await updatePictureTemplate(selectedTemplate._id, updateData);
      setEditTemplateOpen(false);
      setSelectedTemplate(null);

      // Reset edit form
      setEditTitle("");
      setEditBasePrice("");
      setEditDiscountPrice("");
      setEditHasDiscount(false);
      setEditPreviewImageFile(null);
      setEditDownloadImageFile(null);

      // Refresh the list
      const data = await getPictureHierarchy(currentFolderId);
      setTemplates(data.templates || []);
    } catch (error) {
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
    setDeleteError(null);
    setDeleteConfirmOpen(true);

    // Pre-check for folders that can't be deleted
    if (
      type === "folder" &&
      folderDeleteInfo[id] &&
      !folderDeleteInfo[id].canDelete
    ) {
      setDeleteError(
        folderDeleteInfo[id].reason || "Cannot delete this folder",
      );
    }
  }

  async function handleDelete() {
    if (!deleteItem) return;

    try {
      if (deleteItem.type === "folder") {
        await deletePictureFolder(deleteItem.id);
        const data = await getPictureHierarchy(currentFolderId);
        setFolders(data.folders || []);
      } else {
        await deletePictureTemplate(deleteItem.id);
        const data = await getPictureHierarchy(currentFolderId);
        setTemplates(data.templates || []);
      }
      setDeleteConfirmOpen(false);
      setDeleteItem(null);
      setDeleteError(null);
    } catch (error: any) {
      // Set error message to show in dialog
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete item";
      setDeleteError(errorMessage);
    }
  }

  // Folder pricing functions
  function openFolderPricing(folder: PictureFolder) {
    setSelectedFolderForPricing(folder);
    setFolderPricingData({
      basePrice: folder.basePrice.toString(),
      discountPrice: folder.discountPrice?.toString() || "",
      isPurchasable: folder.isPurchasable,
      description: folder.description || "",
      thumbnailUrl: folder.thumbnailUrl || "",
      previewImageUrl: folder.previewImageUrl || "",
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
        const { uploadPictureFolderCoverPhoto } = await import("@/lib/backend");
        const uploadResult = await uploadPictureFolderCoverPhoto(
          selectedFolderForPricing._id,
          coverPhotoFile,
        );
        coverPhotoUrl = uploadResult.folder.coverPhotoUrl;
        setIsUploadingCoverPhoto(false);
      }

      await updatePictureFolder(selectedFolderForPricing._id, {
        name: selectedFolderForPricing.name,
        parentId: selectedFolderForPricing.parentId || undefined,
        description: folderPricingData.description,
        basePrice: parseFloat(folderPricingData.basePrice),
        discountPrice: folderPricingData.discountPrice
          ? parseFloat(folderPricingData.discountPrice)
          : undefined,
        isPurchasable: folderPricingData.isPurchasable,
        thumbnailUrl: folderPricingData.thumbnailUrl,
        previewImageUrl: folderPricingData.previewImageUrl,
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
        thumbnailUrl: "",
        previewImageUrl: "",
        coverPhotoUrl: "",
      });

      // Refresh the list
      const data = await getPictureHierarchy(currentFolderId);
      setFolders(data.folders || []);
    } catch (error) {
      alert("Failed to update folder pricing");
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
    setDeleteError(null);

    const errors: string[] = [];
    let successCount = 0;

    // Delete selected folders
    for (const folderId of Array.from(selectedFolderIds)) {
      try {
        await deletePictureFolder(folderId);
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
        await deletePictureTemplate(templateId);
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
      setDeleteError(
        `Deleted ${successCount} item(s). Failed to delete ${errors.length} item(s):\n${errors.join("\n")}`,
      );
    } else {
      setBulkDeleteOpen(false);
      setSelectedFolderIds(new Set());
      setSelectedTemplateIds(new Set());

      // Refresh the list
      const data = await getPictureHierarchy(currentFolderId);
      setFolders(data.folders || []);
      setTemplates(data.templates || []);
    }
  };

  const totalSelected = selectedFolderIds.size + selectedTemplateIds.size;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-sm text-gray-500">
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
              className="hover:text-blue-600"
            >
              {item.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Picture Templates
          </h1>
          <p className="text-gray-600">
            Manage your picture templates and folders
          </p>
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
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
          <Button onClick={() => setUploadOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Template
          </Button>
          <Button onClick={() => setBulkUploadOpen(true)} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
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
                    className={`h-7 w-7 p-0 shadow-md border ${
                      folderDeleteInfo[folder._id]?.canDelete
                        ? "bg-red-500 hover:bg-red-600 border-red-600"
                        : "bg-gray-400 hover:bg-gray-400 border-gray-400 cursor-not-allowed"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (folderDeleteInfo[folder._id]?.canDelete) {
                        openDeleteConfirm("folder", folder._id, folder.name);
                      }
                    }}
                    disabled={!folderDeleteInfo[folder._id]?.canDelete}
                    title={
                      folderDeleteInfo[folder._id]?.canDelete
                        ? "Delete Folder"
                        : `Cannot delete: ${folderDeleteInfo[folder._id]?.reason || "Unknown reason"}`
                    }
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
      {templates.length > 0 && (
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
                    <img
                      src={template.previewImageUrl}
                      alt={template.title}
                      className="h-full w-full object-cover"
                    />
                    {template.downloadImageUrl && (
                      <img
                        src={template.downloadImageUrl}
                        alt="Download"
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
              Create a new folder to organize your picture templates.
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
            <DialogTitle>Upload New Picture Template</DialogTitle>
            <DialogDescription>
              Upload a new picture template with preview and download images.
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

            <div className="space-y-2">
              <Label htmlFor="basePrice">Base Price *</Label>
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
              <Label htmlFor="hasDiscount">Enable Discount</Label>
            </div>

            {hasDiscount && (
              <div className="space-y-2">
                <Label htmlFor="discountPrice">Discount Price</Label>
                <Input
                  id="discountPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="previewImage">Preview Image *</Label>
                <Input
                  id="previewImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setPreviewImageFile(e.target.files?.[0] || null)
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="downloadImage">Download Image *</Label>
                <Input
                  id="downloadImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setDownloadImageFile(e.target.files?.[0] || null)
                  }
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setUploadOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? "Uploading..." : "Upload"}
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
            <DialogDescription>Update the template details.</DialogDescription>
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
              <Label htmlFor="editBasePrice">Base Price *</Label>
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
              <Label htmlFor="editHasDiscount">Enable Discount</Label>
            </div>

            {editHasDiscount && (
              <div className="space-y-2">
                <Label htmlFor="editDiscountPrice">Discount Price</Label>
                <Input
                  id="editDiscountPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={editDiscountPrice}
                  onChange={(e) => setEditDiscountPrice(e.target.value)}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editPreviewImage">
                  Preview Image (optional)
                </Label>
                <Input
                  id="editPreviewImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setEditPreviewImageFile(e.target.files?.[0] || null)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDownloadImage">
                  Download Image (optional)
                </Label>
                <Input
                  id="editDownloadImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setEditDownloadImageFile(e.target.files?.[0] || null)
                  }
                />
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
              <Button type="submit">Update</Button>
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
              Are you sure you want to delete "{deleteItem?.name}"? This action
              cannot be undone.
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
        <DialogContent className="max-w-2xl">
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
                    <Label htmlFor="folderBasePrice">Base Price</Label>
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
                    <Label htmlFor="folderDiscountPrice">Discount Price</Label>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

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
              </>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFolderPricingOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUploadingCoverPhoto}>
                {isUploadingCoverPhoto ? "Uploading..." : "Save"}
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
                        🖼️ {template?.title || id}
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

      {/* Bulk Upload Dialog */}
      <Dialog open={bulkUploadOpen} onOpenChange={setBulkUploadOpen}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>Bulk Upload Templates</DialogTitle>
            <DialogDescription>
              Upload multiple picture templates at once with the same pricing.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBulkUpload} className="space-y-4">
            <div>
              <Label htmlFor="bulkTitle">
                Title Prefix (optional - uses filename if empty)
              </Label>
              <Input
                id="bulkTitle"
                value={bulkTitle}
                onChange={(e) => setBulkTitle(e.target.value)}
                placeholder="Enter title prefix"
              />
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
              <Label htmlFor="bulkImageFiles">
                Image Files * (JPEG, PNG, JPG, GIF, WebP)
              </Label>
              <Input
                id="bulkImageFiles"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                onChange={(e) => setBulkImageFiles(e.target.files)}
                required
              />
              {bulkImageFiles && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {bulkImageFiles.length} file(s)
                </p>
              )}
            </div>

            {uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">{uploadStatus}</p>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setBulkUploadOpen(false)}
                disabled={uploadProgress > 0 && uploadProgress < 100}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={uploadProgress > 0 && uploadProgress < 100}
              >
                Upload All
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PictureTemplatesManager;
