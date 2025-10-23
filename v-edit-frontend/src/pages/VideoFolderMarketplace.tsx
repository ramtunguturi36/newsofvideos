import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Folder as FolderIcon,
  Film,
  ShoppingCart,
  Eye,
  Download,
  CheckCircle,
  Lock,
  Users,
  Calendar,
  ArrowLeft,
  Play,
} from "lucide-react";
import { getVideoHierarchy } from "@/lib/backend";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import type { VideoFolder, VideoContent } from "@/lib/types";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MarketplaceHeader from "@/components/MarketplaceHeader";

const VideoFolderMarketplace = () => {
  const navigate = useNavigate();
  const [folders, setFolders] = useState<VideoFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<VideoFolder | null>(
    null,
  );
  const [folderVideos, setFolderVideos] = useState<VideoContent[]>([]);
  const { addItem } = useCart();

  useEffect(() => {
    loadPurchasableFolders();
  }, []);

  const loadPurchasableFolders = async () => {
    try {
      setLoading(true);
      const data = await getVideoHierarchy(undefined);

      // Filter only purchasable folders
      const purchasableFolders = data.folders.filter(
        (folder) => folder.isPurchasable,
      );
      setFolders(purchasableFolders);
    } catch (error) {
      console.error("Error loading purchasable folders:", error);
      toast.error("Failed to load folders");
    } finally {
      setLoading(false);
    }
  };

  const loadFolderVideos = async (folderId: string) => {
    try {
      const data = await getVideoHierarchy(folderId);
      setFolderVideos(data.videos || []);
    } catch (error) {
      console.error("Error loading folder videos:", error);
      toast.error("Failed to load folder contents");
    }
  };

  const handlePreviewFolder = async (folder: VideoFolder) => {
    setSelectedFolder(folder);
    await loadFolderVideos(folder._id);
    setPreviewOpen(true);
  };

  const handleAddToCart = (folder: VideoFolder) => {
    if (!addItem) return;

    addItem({
      id: folder._id,
      type: "video-folder",
      title: folder.name,
      price: folder.discountPrice || folder.basePrice,
    });

    toast.success("Added to cart");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading video folders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Navbar />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Marketplace Header */}
          <MarketplaceHeader
            icon={Film}
            title="Video Content Marketplace"
            subtitle="Purchase complete video folder collections and get instant access"
            gradient="from-green-500 to-teal-500"
            breadcrumbs={[
              { label: "Video Content" },
              { label: "Folder Collections" },
            ]}
          />

          {/* Folders Grid */}
          {folders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {folders.map((folder, index) => (
                <motion.div
                  key={folder._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-white/90 backdrop-blur-lg border-slate-200/50 hover:border-purple-400 transition-all duration-300 hover:shadow-2xl group overflow-hidden h-full flex flex-col">
                    <CardHeader className="p-0">
                      <div className="relative h-48 bg-gradient-to-br from-purple-100 to-blue-100 overflow-hidden">
                        {folder.coverPhotoUrl ? (
                          <img
                            src={folder.coverPhotoUrl}
                            alt={folder.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film className="h-20 w-20 text-purple-400" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-purple-600 text-white">
                            {folder.totalVideos || 0} Videos
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-purple-600 transition-colors">
                          {folder.name}
                        </h3>
                        {folder.description && (
                          <p className="text-sm text-slate-600 mb-4 line-clamp-2">
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
                      </div>

                      <div className="space-y-3 mt-4">
                        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                          <div>
                            {folder.discountPrice ? (
                              <div>
                                <div className="text-sm text-slate-500 line-through">
                                  ₹{folder.basePrice}
                                </div>
                                <div className="text-2xl font-bold text-purple-600">
                                  ₹{folder.discountPrice}
                                </div>
                              </div>
                            ) : (
                              <div className="text-2xl font-bold text-purple-600">
                                ₹{folder.basePrice}
                              </div>
                            )}
                          </div>
                          {folder.discountPrice && (
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-700"
                            >
                              Save ₹{folder.basePrice - folder.discountPrice}
                            </Badge>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handlePreviewFolder(folder)}
                            variant="outline"
                            className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-50"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                          <Button
                            onClick={() => handleAddToCart(folder)}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/90 backdrop-blur-lg rounded-2xl border border-slate-200/50">
              <FolderIcon className="h-20 w-20 text-slate-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-700 mb-2">
                No video folders available
              </h3>
              <p className="text-slate-500">
                Check back later for new video folder collections
              </p>
            </div>
          )}

          {/* Preview Dialog */}
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-800">
                  {selectedFolder?.name}
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                  {selectedFolder?.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Folder Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-purple-600 mb-1">
                      Total Videos
                    </div>
                    <div className="text-2xl font-bold text-purple-700">
                      {folderVideos.length}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 mb-1">Price</div>
                    <div className="text-2xl font-bold text-blue-700">
                      ₹
                      {selectedFolder?.discountPrice ||
                        selectedFolder?.basePrice}
                    </div>
                  </div>
                  {selectedFolder?.category && (
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <div className="text-sm text-indigo-600 mb-1">
                        Category
                      </div>
                      <div className="text-lg font-bold text-indigo-700">
                        {selectedFolder.category}
                      </div>
                    </div>
                  )}
                </div>

                {/* Videos Preview */}
                {folderVideos.length > 0 && (
                  <div>
                    <h4 className="text-lg font-bold text-slate-800 mb-4">
                      Videos in this folder
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {folderVideos.slice(0, 8).map((video) => (
                        <div
                          key={video._id}
                          className="bg-slate-50 rounded-lg overflow-hidden border border-slate-200"
                        >
                          <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                            {video.thumbnailUrl ? (
                              <img
                                src={video.thumbnailUrl}
                                alt={video.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Film className="h-8 w-8 text-purple-400" />
                            )}
                          </div>
                          <div className="p-2">
                            <p className="text-xs font-medium text-slate-800 line-clamp-1">
                              {video.title}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {folderVideos.length > 8 && (
                      <p className="text-sm text-slate-500 mt-4 text-center">
                        +{folderVideos.length - 8} more videos
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <Button
                    onClick={() => setPreviewOpen(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      if (selectedFolder) handleAddToCart(selectedFolder);
                      setPreviewOpen(false);
                    }}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart - ₹
                    {selectedFolder?.discountPrice || selectedFolder?.basePrice}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VideoFolderMarketplace;
