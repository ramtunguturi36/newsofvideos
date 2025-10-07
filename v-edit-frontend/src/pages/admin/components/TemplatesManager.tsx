import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { 
  createFolder, 
  getHierarchy, 
  uploadTemplate, 
  updateTemplate, 
  deleteTemplate, 
  updateFolder, 
  deleteFolder,
  moveTemplate,
  moveFolder 
} from '@/lib/backend';
import { useCart } from '@/context/CartContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { Folder, TemplateItem } from '@/lib/backend';
import { Plus, Upload, Folder as FolderIcon, FileVideo, X, Edit, Trash2, Move, MoreVertical, DollarSign, ShoppingCart, Settings } from 'lucide-react';

// ... (FolderCard and TemplateCard components remain the same as in AdminExplorer.tsx)

const TemplatesManager = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const currentFolderId = params.get('folderId') || undefined;
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

  // Create folder state
  const [folderName, setFolderName] = useState('');
  const [parentId, setParentId] = useState<string | undefined>(currentFolderId);

  // Upload template state
  const [title, setTitle] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [hasDiscount, setHasDiscount] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Edit states
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<{ type: 'folder' | 'template'; id: string; name: string } | null>(null);
  const [editFolderName, setEditFolderName] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editBasePrice, setEditBasePrice] = useState('');
  const [editDiscountPrice, setEditDiscountPrice] = useState('');
  const [editHasDiscount, setEditHasDiscount] = useState(false);
  const [editVideoFile, setEditVideoFile] = useState<File | null>(null);
  const [editQrFile, setEditQrFile] = useState<File | null>(null);

  // Folder pricing states
  const [folderPricingOpen, setFolderPricingOpen] = useState(false);
  const [selectedFolderForPricing, setSelectedFolderForPricing] = useState<Folder | null>(null);
  const [folderPricingData, setFolderPricingData] = useState({
    basePrice: '',
    discountPrice: '',
    isPurchasable: false,
    description: '',
    thumbnailUrl: '',
    previewVideoUrl: ''
  });

  useEffect(() => {
    setParentId(currentFolderId);
    setLoading(true);
    getHierarchy(currentFolderId)
      .then((data) => {
        setFolders(data.folders || []);
        setTemplates(data.templates || []);
        setPath(data.path || []);
      })
      .catch((error) => {
        console.error('Error loading hierarchy:', error);
      })
      .finally(() => setLoading(false));
  }, [currentFolderId]);

  const breadcrumbs = useMemo(() => {
    const items = [{ _id: '', name: 'Templates' }, ...path];
    return items;
  }, [path]);

  async function handleCreateFolder(e: React.FormEvent) {
    e.preventDefault();
    if (!folderName.trim()) return;
    
    try {
      await createFolder(folderName, parentId);
      setCreateOpen(false);
      setFolderName('');
      const data = await getHierarchy(currentFolderId);
      setFolders(data.folders || []);
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  }

  async function handleUploadTemplate(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !basePrice || !videoFile || !qrFile) {
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
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    
    if (!validVideoTypes.includes(videoFile.type)) {
      alert('Please upload a valid video file (MP4, WebM, or QuickTime)');
      return;
    }
    
    if (!validImageTypes.includes(qrFile.type)) {
      alert('Please upload a valid image file for QR code (JPEG, JPG, or PNG)');
      return;
    }

    setIsUploading(true);
    try {
      // Convert string prices to numbers
      const basePriceNum = parseFloat(basePrice);
      const discountPriceNum = hasDiscount && discountPrice ? parseFloat(discountPrice) : undefined;

      // Match field names with backend expectations
      const templateData = {
        title,
        basePrice: basePriceNum,
        discountPrice: discountPriceNum,
        videoFile,
        qrFile,
        parentId: currentFolderId || undefined
      };

      await uploadTemplate(templateData);
      setUploadOpen(false);
      setTitle('');
      setBasePrice('');
      setDiscountPrice('');
      setHasDiscount(false);
      setVideoFile(null);
      setQrFile(null);

      // Refresh the list
      const data = await getHierarchy(currentFolderId);
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Error uploading template:', error);
      // Show more detailed error message to the user
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const errorMessage = error.response.data?.message || 'Failed to upload template';
        alert(`Error: ${errorMessage}`);
      } else if (error.request) {
        // The request was made but no response was received
        alert('No response from server. Please check your connection.');
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
      setEditFolderName('');
      
      // Refresh the list
      const data = await getHierarchy(currentFolderId);
      setFolders(data.folders || []);
    } catch (error) {
      console.error('Error updating folder:', error);
      alert('Failed to update folder');
    }
  }

  // Edit template functions
  function openEditTemplate(template: TemplateItem) {
    setSelectedTemplate(template);
    setEditTitle(template.title);
    setEditDescription(template.description || '');
    setEditBasePrice(template.basePrice.toString());
    setEditDiscountPrice(template.discountPrice?.toString() || '');
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
        description: editDescription,
        basePrice: parseFloat(editBasePrice),
        discountPrice: editHasDiscount && editDiscountPrice ? parseFloat(editDiscountPrice) : undefined,
        videoFile: editVideoFile || undefined,
        qrFile: editQrFile || undefined,
      };

      await updateTemplate(selectedTemplate._id, updateData);
      setEditTemplateOpen(false);
      setSelectedTemplate(null);
      
      // Reset edit form
      setEditTitle('');
      setEditDescription('');
      setEditBasePrice('');
      setEditDiscountPrice('');
      setEditHasDiscount(false);
      setEditVideoFile(null);
      setEditQrFile(null);
      
      // Refresh the list
      const data = await getHierarchy(currentFolderId);
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Error updating template:', error);
      alert('Failed to update template');
    }
  }

  // Delete functions
  function openDeleteConfirm(type: 'folder' | 'template', id: string, name: string) {
    setDeleteItem({ type, id, name });
    setDeleteConfirmOpen(true);
  }

  // Folder pricing functions
  function openFolderPricing(folder: Folder) {
    setSelectedFolderForPricing(folder);
    setFolderPricingData({
      basePrice: folder.basePrice?.toString() || '0',
      discountPrice: folder.discountPrice?.toString() || '',
      isPurchasable: folder.isPurchasable || false,
      description: folder.description || '',
      thumbnailUrl: folder.thumbnailUrl || '',
      previewVideoUrl: folder.previewVideoUrl || ''
    });
    setFolderPricingOpen(true);
  }

  async function handleUpdateFolderPricing(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFolderForPricing) return;

    try {
      const updateData = {
        basePrice: parseFloat(folderPricingData.basePrice) || 0,
        discountPrice: folderPricingData.discountPrice ? parseFloat(folderPricingData.discountPrice) : undefined,
        isPurchasable: folderPricingData.isPurchasable,
        description: folderPricingData.description || undefined,
        thumbnailUrl: folderPricingData.thumbnailUrl || undefined,
        previewVideoUrl: folderPricingData.previewVideoUrl || undefined
      };

      // Import the API function dynamically to avoid circular import
      const { updateFolderPricing } = await import('@/lib/api');
      await updateFolderPricing(selectedFolderForPricing._id, updateData);
      
      setFolderPricingOpen(false);
      setSelectedFolderForPricing(null);
      
      // Refresh the list
      const data = await getHierarchy(currentFolderId);
      setFolders(data.folders || []);
    } catch (error) {
      console.error('Error updating folder pricing:', error);
      alert('Failed to update folder pricing');
    }
  }

  async function handleDelete() {
    if (!deleteItem) return;

    try {
      if (deleteItem.type === 'folder') {
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
      console.error('Error deleting item:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete item';
      alert(errorMessage);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with breadcrumbs and action buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={item._id}>
              {index > 0 && <span>/</span>}
              <button
                onClick={() => navigateToFolder(item._id)}
                className={`hover:text-primary ${index === breadcrumbs.length - 1 ? 'font-medium text-foreground' : ''}`}
              >
                {item.name}
              </button>
            </React.Fragment>
          ))}
        </div>
        <div className="flex space-x-2 w-full sm:w-auto">
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
                  className="h-7 w-7 p-0 bg-red-500 shadow-md hover:bg-red-600 border border-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteConfirm('folder', folder._id, folder.name);
                  }}
                  title="Delete Folder"
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
                  {basePrice && discountPrice && parseFloat(discountPrice) >= parseFloat(basePrice) && (
                    <p className="text-sm text-red-500">Discount price must be less than base price</p>
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
                        <span className="font-semibold">Click to upload video</span>
                      </p>
                      <p className="text-xs text-gray-500">MP4, WebM, or MOV</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="video/*"
                      onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
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
                      <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path>
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload QR code</span>
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
                {isUploading ? 'Uploading...' : 'Upload Template'}
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
                <Label htmlFor="editHasDiscount" className="text-sm font-medium">
                  Enable Discount Pricing
                </Label>
              </div>
              
              {editHasDiscount && (
                <div className="space-y-2">
                  <Label htmlFor="editDiscountPrice">Discount Price (₹) *</Label>
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
                  {editBasePrice && editDiscountPrice && parseFloat(editDiscountPrice) >= parseFloat(editBasePrice) && (
                    <p className="text-sm text-red-500">Discount price must be less than base price</p>
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
                        <span className="font-semibold">Click to upload new video</span>
                      </p>
                      <p className="text-xs text-gray-500">MP4, WebM, or MOV</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="video/*"
                      onChange={(e) => setEditVideoFile(e.target.files?.[0] || null)}
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
                      <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path>
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload new QR code</span>
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, or JPEG</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => setEditQrFile(e.target.files?.[0] || null)}
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
              Configure pricing and purchasability for "{selectedFolderForPricing?.name}". 
              Users will get access to all templates within this folder.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateFolderPricing} className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isPurchasable"
                checked={folderPricingData.isPurchasable}
                onCheckedChange={(checked) => setFolderPricingData(prev => ({ ...prev, isPurchasable: checked }))}
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
                      onChange={(e) => setFolderPricingData(prev => ({ ...prev, basePrice: e.target.value }))}
                      required={folderPricingData.isPurchasable}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="folderDiscountPrice">Discount Price (₹)</Label>
                    <Input
                      id="folderDiscountPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Optional discount price"
                      value={folderPricingData.discountPrice}
                      onChange={(e) => setFolderPricingData(prev => ({ ...prev, discountPrice: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="folderDescription">Description</Label>
                  <Input
                    id="folderDescription"
                    placeholder="Brief description of the folder contents"
                    value={folderPricingData.description}
                    onChange={(e) => setFolderPricingData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                    <Input
                      id="thumbnailUrl"
                      placeholder="https://example.com/thumbnail.jpg"
                      value={folderPricingData.thumbnailUrl}
                      onChange={(e) => setFolderPricingData(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="previewVideoUrl">Preview Video URL</Label>
                    <Input
                      id="previewVideoUrl"
                      placeholder="https://example.com/preview.mp4"
                      value={folderPricingData.previewVideoUrl}
                      onChange={(e) => setFolderPricingData(prev => ({ ...prev, previewVideoUrl: e.target.value }))}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setFolderPricingOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Folder</Button>
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
              {deleteItem?.type === 'folder' && (
                <span className="block mt-2 text-red-600 font-medium">
                  Note: You can only delete empty folders. Move or delete all contents first.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplatesManager;
