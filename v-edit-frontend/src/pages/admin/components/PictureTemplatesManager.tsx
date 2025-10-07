import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { 
  createPictureFolder, 
  getPictureHierarchy, 
  uploadPictureTemplate, 
  updatePictureTemplate, 
  deletePictureTemplate, 
  updatePictureFolder, 
  deletePictureFolder
} from '@/lib/backend';
import { useCart } from '@/context/CartContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { PictureFolder, PictureTemplate } from '@/lib/types';
import { Plus, Upload, Folder as FolderIcon, FileImage, X, Edit, Trash2, Move, MoreVertical, DollarSign, ShoppingCart, Settings, Image as ImageIcon, Tag, Ruler } from 'lucide-react';

const PictureTemplatesManager = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const currentFolderId = params.get('folderId') || undefined;
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
  const [folderDeleteInfo, setFolderDeleteInfo] = useState<{ [key: string]: { canDelete: boolean; reason?: string } }>({});
  const { addItem } = useCart();

  // Create folder state
  const [folderName, setFolderName] = useState('');
  const [parentId, setParentId] = useState<string | undefined>(currentFolderId);

  // Upload template state
  const [title, setTitle] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [hasDiscount, setHasDiscount] = useState(false);
  const [previewImageFile, setPreviewImageFile] = useState<File | null>(null);
  const [downloadImageFile, setDownloadImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Edit states
  const [selectedFolder, setSelectedFolder] = useState<PictureFolder | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PictureTemplate | null>(null);
  const [deleteItem, setDeleteItem] = useState<{ type: 'folder' | 'template'; id: string; name: string } | null>(null);
  const [editFolderName, setEditFolderName] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editBasePrice, setEditBasePrice] = useState('');
  const [editDiscountPrice, setEditDiscountPrice] = useState('');
  const [editHasDiscount, setEditHasDiscount] = useState(false);
  const [editPreviewImageFile, setEditPreviewImageFile] = useState<File | null>(null);
  const [editDownloadImageFile, setEditDownloadImageFile] = useState<File | null>(null);

  // Folder pricing states
  const [folderPricingOpen, setFolderPricingOpen] = useState(false);
  const [selectedFolderForPricing, setSelectedFolderForPricing] = useState<PictureFolder | null>(null);
  const [folderPricingData, setFolderPricingData] = useState({
    basePrice: '',
    discountPrice: '',
    isPurchasable: false,
    description: '',
    thumbnailUrl: '',
    previewImageUrl: ''
  });

  useEffect(() => {
    setParentId(currentFolderId);
    setLoading(true);
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
    const deleteInfo: { [key: string]: { canDelete: boolean; reason?: string } } = {};
    
    for (const folder of folders) {
      try {
        // Try to get hierarchy for this folder to check for children and templates
        const hierarchy = await getPictureHierarchy(folder._id);
        const hasChildren = (hierarchy.folders || []).length > 0;
        const hasTemplates = (hierarchy.templates || []).length > 0;
        
        if (hasChildren) {
          deleteInfo[folder._id] = { 
            canDelete: false, 
            reason: `Contains ${hierarchy.folders?.length || 0} subfolder(s)` 
          };
        } else if (hasTemplates) {
          deleteInfo[folder._id] = { 
            canDelete: false, 
            reason: `Contains ${hierarchy.templates?.length || 0} template(s)` 
          };
        } else {
          deleteInfo[folder._id] = { canDelete: true };
        }
      } catch (error) {
        deleteInfo[folder._id] = { canDelete: false, reason: 'Unable to check folder contents' };
      }
    }
    
    setFolderDeleteInfo(deleteInfo);
  }

  const breadcrumbs = useMemo(() => {
    const items = [{ _id: '', name: 'Picture Templates' }, ...path];
    return items;
  }, [path]);

  async function handleCreateFolder(e: React.FormEvent) {
    e.preventDefault();
    if (!folderName.trim()) return;
    
    try {
      await createPictureFolder(folderName, parentId);
      setCreateOpen(false);
      setFolderName('');
      const data = await getPictureHierarchy(currentFolderId);
      setFolders(data.folders || []);
    } catch (error) {
      // Handle error silently
    }
  }

  async function handleUploadTemplate(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !basePrice || !previewImageFile || !downloadImageFile) {
      alert('Please fill all required fields');
      return;
    }

    // Validate discount price if enabled
    if (hasDiscount) {
      if (!discountPrice) {
        alert('Please enter a discount price or disable the discount option');
        return;
      }
      const basePriceNum = parseFloat(basePrice);
      const discountPriceNum = parseFloat(discountPrice);
      
      if (discountPriceNum >= basePriceNum) {
        alert('Discount price must be less than the base price');
        return;
      }
      
      if (discountPriceNum <= 0) {
        alert('Discount price must be greater than 0');
        return;
      }
    }

    // Validate file types
    const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    
    if (!validImageTypes.includes(previewImageFile.type)) {
      alert('Please upload a valid preview image file (JPEG, PNG, JPG, GIF, or WebP)');
      return;
    }
    
    if (!validImageTypes.includes(downloadImageFile.type)) {
      alert('Please upload a valid download image file (JPEG, PNG, JPG, GIF, or WebP)');
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
        parentId: currentFolderId
      });
      
      setUploadOpen(false);
      setTitle('');
      setBasePrice('');
      setDiscountPrice('');
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
      setEditFolderName('');
      
      // Refresh the list
      const data = await getPictureHierarchy(currentFolderId);
      setFolders(data.folders || []);
    } catch (error) {
      alert('Failed to update folder');
    }
  }

  // Edit template functions
  function openEditTemplate(template: PictureTemplate) {
    setSelectedTemplate(template);
    setEditTitle(template.title);
    setEditBasePrice(template.basePrice.toString());
    setEditDiscountPrice(template.discountPrice?.toString() || '');
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
        alert('Please enter a discount price or disable the discount option');
        return;
      }
      const basePriceNum = parseFloat(editBasePrice);
      const discountPriceNum = parseFloat(editDiscountPrice);
      
      if (discountPriceNum >= basePriceNum) {
        alert('Discount price must be less than the base price');
        return;
      }
    }

    try {
      const updateData = {
        title: editTitle,
        basePrice: parseFloat(editBasePrice),
        discountPrice: editHasDiscount && editDiscountPrice ? parseFloat(editDiscountPrice) : undefined,
        previewImageFile: editPreviewImageFile || undefined,
        downloadImageFile: editDownloadImageFile || undefined
      };

      await updatePictureTemplate(selectedTemplate._id, updateData);
      setEditTemplateOpen(false);
      setSelectedTemplate(null);
      
      // Reset edit form
      setEditTitle('');
      setEditBasePrice('');
      setEditDiscountPrice('');
      setEditHasDiscount(false);
      setEditPreviewImageFile(null);
      setEditDownloadImageFile(null);
      
      // Refresh the list
      const data = await getPictureHierarchy(currentFolderId);
      setTemplates(data.templates || []);
    } catch (error) {
      alert('Failed to update template');
    }
  }

  // Delete functions
  function openDeleteConfirm(type: 'folder' | 'template', id: string, name: string) {
    setDeleteItem({ type, id, name });
    setDeleteError(null);
    setDeleteConfirmOpen(true);
    
    // Pre-check for folders that can't be deleted
    if (type === 'folder' && folderDeleteInfo[id] && !folderDeleteInfo[id].canDelete) {
      setDeleteError(folderDeleteInfo[id].reason || 'Cannot delete this folder');
    }
  }

  async function handleDelete() {
    if (!deleteItem) return;
    
    try {
      if (deleteItem.type === 'folder') {
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
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete item';
      setDeleteError(errorMessage);
    }
  }

  // Folder pricing functions
  function openFolderPricing(folder: PictureFolder) {
    setSelectedFolderForPricing(folder);
    setFolderPricingData({
      basePrice: folder.basePrice.toString(),
      discountPrice: folder.discountPrice?.toString() || '',
      isPurchasable: folder.isPurchasable,
      description: folder.description || '',
      thumbnailUrl: folder.thumbnailUrl || '',
      previewImageUrl: folder.previewImageUrl || ''
    });
    setFolderPricingOpen(true);
  }

  async function handleFolderPricing(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFolderForPricing) return;

    try {
      await updatePictureFolder(selectedFolderForPricing._id, {
        name: selectedFolderForPricing.name,
        parentId: selectedFolderForPricing.parentId,
        description: folderPricingData.description,
        basePrice: parseFloat(folderPricingData.basePrice),
        discountPrice: folderPricingData.discountPrice ? parseFloat(folderPricingData.discountPrice) : undefined,
        isPurchasable: folderPricingData.isPurchasable,
        thumbnailUrl: folderPricingData.thumbnailUrl,
        previewImageUrl: folderPricingData.previewImageUrl
      });
      
      setFolderPricingOpen(false);
      setSelectedFolderForPricing(null);
      
      // Reset folder pricing data
      setFolderPricingData({
        basePrice: '0',
        discountPrice: '',
        isPurchasable: false,
        description: '',
        thumbnailUrl: '',
        previewImageUrl: ''
      });
      
      // Refresh the list
      const data = await getPictureHierarchy(currentFolderId);
      setFolders(data.folders || []);
    } catch (error) {
      alert('Failed to update folder pricing');
    }
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Picture Templates</h1>
          <p className="text-gray-600">Manage your picture templates and folders</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
          <Button onClick={() => setUploadOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Template
          </Button>
        </div>
      </div>

      {/* Folder Grid */}
      {folders.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {folders.map((folder) => (
            <div key={folder._id} className="group relative">
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigateToFolder(folder._id)}>
                <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                  <FolderIcon className="h-12 w-12 text-yellow-400 mb-2" />
                  <p className="text-sm font-medium text-center">{folder.name}</p>
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
                      ? 'bg-red-500 hover:bg-red-600 border-red-600' 
                      : 'bg-gray-400 hover:bg-gray-400 border-gray-400 cursor-not-allowed'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (folderDeleteInfo[folder._id]?.canDelete) {
                      openDeleteConfirm('folder', folder._id, folder.name);
                    }
                  }}
                  disabled={!folderDeleteInfo[folder._id]?.canDelete}
                  title={
                    folderDeleteInfo[folder._id]?.canDelete 
                      ? "Delete Folder" 
                      : `Cannot delete: ${folderDeleteInfo[folder._id]?.reason || 'Unknown reason'}`
                  }
                >
                  <Trash2 className="h-3 w-3 text-white" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Templates Grid */}
      {templates.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Templates ({templates.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {templates.map((template) => (
              <div key={template._id} className="group relative">
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
                          openDeleteConfirm('template', template._id, template.title);
                        }}
                        title="Delete Template"
                      >
                        <Trash2 className="h-3 w-3 text-white" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-3 bg-white">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-sm line-clamp-1 text-gray-900">{template.title || 'Untitled Template'}</h4>
                      <div className="text-sm font-medium">
                        {template.discountPrice ? (
                          <>
                            <span className="text-gray-500 line-through text-xs mr-1">₹{template.basePrice}</span>
                            <span className="text-green-600">₹{template.discountPrice}</span>
                          </>
                        ) : (
                          <span className="text-gray-900">₹{template.basePrice}</span>
                        )}
                      </div>
                    </div>
                    {template.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-1">{template.description}</p>
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
            <Button size="sm" variant="outline" onClick={() => setUploadOpen(true)}>
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
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
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
                  onChange={(e) => setPreviewImageFile(e.target.files?.[0] || null)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="downloadImage">Download Image *</Label>
                <Input
                  id="downloadImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setDownloadImageFile(e.target.files?.[0] || null)}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setUploadOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Upload'}
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
            <DialogDescription>
              Update the folder name.
            </DialogDescription>
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
              <Button type="button" variant="outline" onClick={() => setEditFolderOpen(false)}>
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
              Update the template details.
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
                <Label htmlFor="editPreviewImage">Preview Image (optional)</Label>
                <Input
                  id="editPreviewImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditPreviewImageFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDownloadImage">Download Image (optional)</Label>
                <Input
                  id="editDownloadImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditDownloadImageFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditTemplateOpen(false)}>
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
              Are you sure you want to delete "{deleteItem?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {deleteError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <X className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Cannot Delete</h3>
                  <div className="mt-2 text-sm text-red-700">
                    {deleteError}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={() => {
              setDeleteConfirmOpen(false);
              setDeleteError(null);
            }}>
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
                onCheckedChange={(checked) => setFolderPricingData({ ...folderPricingData, isPurchasable: checked })}
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
                      onChange={(e) => setFolderPricingData({ ...folderPricingData, basePrice: e.target.value })}
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
                      onChange={(e) => setFolderPricingData({ ...folderPricingData, discountPrice: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="folderDescription">Description</Label>
                  <textarea
                    id="folderDescription"
                    placeholder="Enter folder description"
                    value={folderPricingData.description}
                    onChange={(e) => setFolderPricingData({ ...folderPricingData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              </>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setFolderPricingOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PictureTemplatesManager;