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
  Music,
  ShoppingCart,
  Eye,
  Download,
  CheckCircle,
  Lock,
  Users,
  Calendar,
  ArrowLeft,
  Play,
  Headphones,
} from "lucide-react";
import { getAudioHierarchy } from "@/lib/backend";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import type { AudioFolder, AudioContent } from "@/lib/types";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MarketplaceHeader from "@/components/MarketplaceHeader";

const AudioFolderMarketplace = () => {
  const navigate = useNavigate();
  const [folders, setFolders] = useState<AudioFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<AudioFolder | null>(
    null,
  );
  const [folderAudio, setFolderAudio] = useState<AudioContent[]>([]);
  const { addItem } = useCart();

  useEffect(() => {
    loadPurchasableFolders();
  }, []);

  const loadPurchasableFolders = async () => {
    try {
      setLoading(true);
      const data = await getAudioHierarchy(undefined);

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

  const loadFolderAudio = async (folderId: string) => {
    try {
      const data = await getAudioHierarchy(folderId);
      setFolderAudio(data.audio || []);
    } catch (error) {
      console.error("Error loading folder audio:", error);
      toast.error("Failed to load folder contents");
    }
  };

  const handlePreviewFolder = async (folder: AudioFolder) => {
    setSelectedFolder(folder);
    await loadFolderAudio(folder._id);
    setPreviewOpen(true);
  };

  const handleAddToCart = (folder: AudioFolder) => {
    if (!addItem) return;

    addItem({
      id: folder._id,
      type: "audio-folder",
      title: folder.name,
      price: folder.discountPrice || folder.basePrice,
    });

    toast.success("Added to cart");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading audio folders...</p>
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
            icon={Music}
            title="Audio Collections Marketplace"
            subtitle="Purchase complete audio folder collections and get instant access to all tracks"
            gradient="from-orange-500 to-amber-500"
            breadcrumbs={[{ label: "Audio" }, { label: "Folder Collections" }]}
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
                  <Card className="bg-white/90 backdrop-blur-lg border-slate-200/50 hover:border-orange-400 transition-all duration-300 hover:shadow-2xl group overflow-hidden h-full flex flex-col">
                    <CardHeader className="p-0">
                      <div className="relative h-48 bg-gradient-to-br from-orange-100 to-pink-100 overflow-hidden">
                        {folder.coverPhotoUrl ? (
                          <img
                            src={folder.coverPhotoUrl}
                            alt={folder.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music className="h-20 w-20 text-orange-400" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-orange-600 text-white">
                            {folder.totalAudio || 0} Tracks
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">
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
                            className="mb-4 border-orange-300 text-orange-700"
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
                                <div className="text-2xl font-bold text-orange-600">
                                  ₹{folder.discountPrice}
                                </div>
                              </div>
                            ) : (
                              <div className="text-2xl font-bold text-orange-600">
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
                            className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                          <Button
                            onClick={() => handleAddToCart(folder)}
                            className="flex-1 bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white"
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
                No audio folders available
              </h3>
              <p className="text-slate-500">
                Check back later for new audio folder collections
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
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-sm text-orange-600 mb-1">
                      Total Tracks
                    </div>
                    <div className="text-2xl font-bold text-orange-700">
                      {folderAudio.length}
                    </div>
                  </div>
                  <div className="bg-pink-50 p-4 rounded-lg">
                    <div className="text-sm text-pink-600 mb-1">Price</div>
                    <div className="text-2xl font-bold text-pink-700">
                      ₹
                      {selectedFolder?.discountPrice ||
                        selectedFolder?.basePrice}
                    </div>
                  </div>
                  {selectedFolder?.category && (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-sm text-red-600 mb-1">Category</div>
                      <div className="text-lg font-bold text-red-700">
                        {selectedFolder.category}
                      </div>
                    </div>
                  )}
                </div>

                {/* Audio Preview */}
                {folderAudio.length > 0 && (
                  <div>
                    <h4 className="text-lg font-bold text-slate-800 mb-4">
                      Audio tracks in this folder
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {folderAudio.slice(0, 8).map((audio) => (
                        <div
                          key={audio._id}
                          className="bg-slate-50 rounded-lg overflow-hidden border border-slate-200"
                        >
                          <div className="aspect-square bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center">
                            {audio.thumbnailUrl ? (
                              <img
                                src={audio.thumbnailUrl}
                                alt={audio.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Headphones className="h-8 w-8 text-orange-400" />
                            )}
                          </div>
                          <div className="p-2">
                            <p className="text-xs font-medium text-slate-800 line-clamp-1">
                              {audio.title}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {folderAudio.length > 8 && (
                      <p className="text-sm text-slate-500 mt-4 text-center">
                        +{folderAudio.length - 8} more tracks
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
                    className="flex-1 bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white"
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

export default AudioFolderMarketplace;
