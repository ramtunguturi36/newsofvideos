import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { backend } from "@/lib/backend";
import { toast } from "sonner";
import { motion } from "framer-motion";

type PurchaseItem = {
  id: string;
  type:
    | "template"
    | "folder"
    | "picture-template"
    | "picture-folder"
    | "video-content"
    | "video-folder"
    | "audio-content"
    | "audio-folder";
  title: string;
  description?: string;
  price: number;
  videoUrl?: string;
  qrUrl?: string;
  previewImageUrl?: string;
  downloadImageUrl?: string;
  previewVideoUrl?: string;
  downloadVideoUrl?: string;
  previewAudioUrl?: string;
  downloadAudioUrl?: string;
  thumbnailUrl?: string;
  templateId?: string;
  folderId?: string;
};

type Purchase = {
  _id: string;
  items: PurchaseItem[];
  totalAmount: number;
  discountApplied: number;
  createdAt: string;
  paymentId: string;
  orderId: string;
};

type ContentItem = {
  _id: string;
  title: string;
  description?: string;
  basePrice: number;
  discountPrice?: number;
  type: "template" | "picture" | "video" | "audio";
  qrUrl?: string;
  videoUrl?: string;
  previewImageUrl?: string;
  downloadImageUrl?: string;
  previewVideoUrl?: string;
  downloadVideoUrl?: string;
  previewAudioUrl?: string;
  downloadAudioUrl?: string;
  thumbnailUrl?: string;
};

type FolderItem = {
  _id: string;
  title: string;
  description?: string;
  type: "picture-folder" | "video-folder" | "audio-folder";
  folderId: string;
  templates: ContentItem[];
};

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [folderItems, setFolderItems] = useState<FolderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const purchaseId = searchParams.get("purchaseId");

    console.log("🔍 PaymentSuccess page loaded");
    console.log("🔍 URL search params:", location.search);
    console.log("🔍 PurchaseId from URL:", purchaseId);
    console.log("🔍 Current location:", location.pathname);

    if (!purchaseId) {
      console.log("❌ No purchaseId found, redirecting to explorer");
      navigate("/user/explorer");
      return;
    }

    async function fetchPurchase() {
      try {
        console.log("🚀 Starting fetchPurchase for ID:", purchaseId);
        console.log("🚀 Making API call to /purchases/" + purchaseId);

        // Fetch purchase details using direct endpoint
        const purchaseRes = await backend.get(`/purchases/${purchaseId}`);
        console.log("✅ Purchase API response received");
        console.log("✅ Response status:", purchaseRes.status);
        console.log("✅ Response data:", purchaseRes.data);

        const purchaseData = purchaseRes.data.purchase as Purchase;

        if (!purchaseData) {
          console.log("❌ Purchase data is null/undefined");
          throw new Error("Purchase not found");
        }

        console.log("✅ Purchase data found:", purchaseData);
        console.log("✅ Total amount:", purchaseData.totalAmount);
        console.log("✅ Items count:", purchaseData.items?.length);
        console.log("✅ Items details:", purchaseData.items);

        setPurchase(purchaseData);

        // Set flag to refresh order history when user navigates back
        console.log("Setting refreshOrders flag to true");
        localStorage.setItem("refreshOrders", "true");

        // Process all items
        console.log("🔄 Processing items for content...");
        const allContent: ContentItem[] = [];

        for (const item of purchaseData.items) {
          console.log("🔄 Processing item:", item);
          console.log("🔄 Item type:", item.type);
          console.log("🔄 Item ID:", item.id);
          console.log("🔄 Item title:", item.title);

          if (item.type === "template") {
            console.log("📹 Processing video template (with QR)");
            // Original video template with QR code
            allContent.push({
              _id: item.templateId || item.id,
              title: item.title,
              description: item.description || "",
              basePrice: item.price,
              discountPrice: item.price,
              type: "template",
              qrUrl: item.qrUrl,
              videoUrl: item.videoUrl,
            });
            console.log("✅ Video template added");
          } else if (item.type === "folder") {
            console.log("📁 Processing video folder (with QR)");
            // Video folder purchase - fetch all templates in the folder
            try {
              const folderResponse = await backend.get(
                `/folders/${item.folderId || item.id}/preview`,
              );
              const folderData = folderResponse.data.data;

              if (folderData.templates && folderData.templates.length > 0) {
                const folderTemplates = folderData.templates.map(
                  (template: any) => ({
                    _id: template._id,
                    title: template.title,
                    description: template.description || "",
                    basePrice: template.basePrice,
                    discountPrice: template.discountPrice,
                    type: "template" as const,
                    qrUrl: template.qrUrl,
                    videoUrl: template.videoUrl,
                  }),
                );
                allContent.push(...folderTemplates);
              }
            } catch (error) {
              console.error("Error fetching folder templates:", error);
            }
          } else if (item.type === "picture-template") {
            console.log("🖼️ Processing picture template");
            // Direct picture template purchase
            allContent.push({
              _id: item.templateId || item.id,
              title: item.title,
              description: item.description || "",
              basePrice: item.price,
              discountPrice: item.price,
              type: "picture",
              previewImageUrl: item.previewImageUrl,
              downloadImageUrl: item.downloadImageUrl,
            });
            console.log("✅ Picture template added");
          } else if (item.type === "picture-folder") {
            console.log(
              "📁 Processing picture folder - storing as folder item",
            );
            // Picture folder purchase - store as folder item instead of individual templates
            // This will be displayed with Download All button
          } else if (item.type === "video-content") {
            console.log("🎬 Processing video content");
            // Video content
            allContent.push({
              _id: item.templateId || item.id,
              title: item.title,
              description: item.description || "",
              basePrice: item.price,
              discountPrice: item.price,
              type: "video",
              previewVideoUrl: item.previewVideoUrl,
              downloadVideoUrl: item.downloadVideoUrl,
              thumbnailUrl: item.thumbnailUrl,
            });
            console.log("✅ Video content added");
          } else if (item.type === "video-folder") {
            console.log("📁 Processing video folder");
            // Video folder purchase
            try {
              const folderResponse = await backend.get(
                `/video-content/video-hierarchy?folderId=${item.folderId || item.id}`,
              );
              const folderData = folderResponse.data;

              if (folderData.videos && folderData.videos.length > 0) {
                const folderVideos = folderData.videos.map((video: any) => ({
                  _id: video._id,
                  title: video.title,
                  description: video.description || "",
                  basePrice: video.basePrice,
                  discountPrice: video.discountPrice,
                  type: "video" as const,
                  previewVideoUrl: video.previewVideoUrl,
                  downloadVideoUrl: video.downloadVideoUrl,
                  thumbnailUrl: video.thumbnailUrl,
                }));
                allContent.push(...folderVideos);
              }
            } catch (error) {
              console.error("Error fetching video folder content:", error);
            }
          } else if (item.type === "audio-content") {
            console.log("🎵 Processing audio content");
            // Audio content
            allContent.push({
              _id: item.templateId || item.id,
              title: item.title,
              description: item.description || "",
              basePrice: item.price,
              discountPrice: item.price,
              type: "audio",
              previewAudioUrl: item.previewAudioUrl,
              downloadAudioUrl: item.downloadAudioUrl,
              thumbnailUrl: item.thumbnailUrl,
            });
            console.log("✅ Audio content added");
          } else if (item.type === "audio-folder") {
            console.log("📁 Processing audio folder");
            // Audio folder purchase
            try {
              const folderResponse = await backend.get(
                `/audio-content/audio-hierarchy?folderId=${item.folderId || item.id}`,
              );
              const folderData = folderResponse.data;

              if (folderData.audio && folderData.audio.length > 0) {
                const folderAudio = folderData.audio.map((audio: any) => ({
                  _id: audio._id,
                  title: audio.title,
                  description: audio.description || "",
                  basePrice: audio.basePrice,
                  discountPrice: audio.discountPrice,
                  type: "audio" as const,
                  previewAudioUrl: audio.previewAudioUrl,
                  downloadAudioUrl: audio.downloadAudioUrl,
                  thumbnailUrl: audio.thumbnailUrl,
                }));
                allContent.push(...folderAudio);
              }
            } catch (error) {
              console.error("Error fetching audio folder content:", error);
            }
          }
        }

        console.log(
          "✅ All content processed. Total count:",
          allContent.length,
        );
        console.log("✅ Final content array:", allContent);
        setContentItems(allContent);

        // Process folders separately
        const folders: FolderItem[] = [];
        for (const item of purchaseData.items) {
          if (item.type === "picture-folder") {
            try {
              const folderResponse = await backend.get(
                `/picture-content/picture-hierarchy?folderId=${item.folderId || item.id}`,
              );
              const folderData = folderResponse.data;

              const folderTemplates = (folderData.templates || []).map(
                (template: any) => ({
                  _id: template._id,
                  title: template.title,
                  description: template.description || "",
                  basePrice: template.basePrice,
                  discountPrice: template.discountPrice,
                  type: "picture" as const,
                  previewImageUrl: template.previewImageUrl,
                  downloadImageUrl: template.downloadImageUrl,
                }),
              );

              folders.push({
                _id: item.folderId || item.id,
                title: item.title,
                description: item.description,
                type: "picture-folder",
                folderId: item.folderId || item.id,
                templates: folderTemplates,
              });
            } catch (error) {
              console.error("Error fetching picture folder templates:", error);
            }
          }
        }
        setFolderItems(folders);
        console.log("✅ PaymentSuccess data loading completed successfully");
      } catch (err: unknown) {
        console.error("❌ Error fetching purchase details:", err);
        console.error("❌ Error details:", {
          message: (err as Error).message,
          stack: (err as Error).stack,
          name: (err as Error).name,
        });
        navigate("/user/explorer");
      } finally {
        console.log("🏁 Setting loading to false");
        setLoading(false);
      }
    }

    fetchPurchase();
  }, [location, navigate]);

  const handleDownloadAll = async (folder: FolderItem) => {
    try {
      toast.info(`Downloading ${folder.templates.length} pictures...`);

      for (let i = 0; i < folder.templates.length; i++) {
        const template = folder.templates[i];
        if (template.downloadImageUrl) {
          await handleDownload(
            template.downloadImageUrl,
            `${folder.title.replace(/\s+/g, "-")}-${i + 1}-${template.title.replace(/\s+/g, "-")}.png`,
          );
          // Add a small delay between downloads to avoid overwhelming the browser
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      toast.success(
        `Successfully downloaded all ${folder.templates.length} pictures!`,
      );
    } catch (error) {
      console.error("Download all error:", error);
      toast.error("Failed to download some pictures. Please try again.");
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      toast.info("Starting download...");

      // Use backend proxy to download with proper headers
      const backendUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5000";
      const proxyUrl = `${backendUrl}/api/download-proxy?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;

      // Get auth token from localStorage
      const token = localStorage.getItem("token");

      // Fetch with credentials and auth token
      const response = await fetch(proxyUrl, {
        method: "GET",
        credentials: "include", // Include cookies for authentication
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      // Create blob from response
      const blob = await response.blob();

      // Create download link with blob URL
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up blob URL
      window.URL.revokeObjectURL(blobUrl);

      toast.success("Download completed!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div>Loading payment details...</div>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div>Payment details not found.</div>
      </div>
    );
  }

  // Separate content by type
  const qrTemplates = contentItems.filter((item) => item.type === "template");
  const pictureContent = contentItems.filter((item) => item.type === "picture");
  const videoContent = contentItems.filter((item) => item.type === "video");
  const audioContent = contentItems.filter((item) => item.type === "audio");

  // Get picture folders
  const pictureFolders = folderItems.filter(
    (item) => item.type === "picture-folder",
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Success Animation and Header */}
        <div className="text-center mb-12">
          <div className="mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="relative"
            >
              <div className="w-24 h-24 mx-auto bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <motion.div
                className="absolute inset-0 bg-green-400 rounded-full opacity-20"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent mb-4"
          >
            Payment Successful!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-white/80 text-xl"
          >
            Thank you for your purchase! Your content is ready to use.
          </motion.p>
        </div>

        {/* Order Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div>
                  <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Order Summary
                  </h2>
                  <p className="text-white/70 text-lg">
                    Transaction completed successfully
                  </p>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                  <div className="text-sm text-white/60 mb-2">Order ID</div>
                  <div className="font-mono bg-white/10 px-4 py-2 rounded-lg text-green-400 border border-green-400/30">
                    {purchase.orderId || purchase._id}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                  <div className="text-sm text-white/60 mb-2">
                    Purchase Date
                  </div>
                  <div className="text-xl font-semibold">
                    {new Date(purchase.createdAt).toLocaleString("en-US", {
                      dateStyle: "full",
                      timeStyle: "short",
                    })}
                  </div>
                </div>
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                  <div className="text-sm text-white/60 mb-2">Total Amount</div>
                  <div className="text-3xl font-bold text-green-400">
                    ₹{(purchase.totalAmount || 0).toFixed(2)}
                  </div>
                  {purchase.discountApplied > 0 && (
                    <div className="text-sm text-white/60 mt-2">
                      Discount Applied:{" "}
                      <span className="text-green-400">
                        -₹{purchase.discountApplied.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Purchased Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="my-12"
        >
          <h2 className="text-3xl font-bold mb-8 flex items-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            <svg
              className="w-8 h-8 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            Purchased Items
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {purchase.items.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + idx * 0.1 }}
              >
                <Card className="bg-white/10 backdrop-blur-lg border border-white/20 hover:border-white/30 transition-all duration-300 hover:shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <div className="p-2 rounded-lg bg-blue-500/20 mr-3">
                            <svg
                              className="w-6 h-6 text-blue-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              {item.type.includes("template") ||
                              item.type === "template" ? (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                                />
                              ) : (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                                />
                              )}
                            </svg>
                          </div>
                          <div>
                            <span className="font-semibold text-xl text-white">
                              {item.title}
                            </span>
                            <div className="text-sm text-white/60 mt-1">
                              {item.type.includes("folder") ? "Folder" : "Item"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-white/60">
                          <span className="px-3 py-1 rounded-lg bg-white/10 font-mono text-xs">
                            {item.templateId || item.folderId || item.id}
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-green-400">
                          ₹{item.price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* QR Codes Section - Only for original templates */}
        {qrTemplates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="my-12"
          >
            <h2 className="text-3xl font-bold mb-8 flex items-center bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              <svg
                className="w-8 h-8 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
              Your QR Codes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {qrTemplates.map((template, idx) => (
                <motion.div
                  key={template._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + idx * 0.1 }}
                >
                  <Card className="bg-white/10 backdrop-blur-lg border border-white/20 hover:border-white/30 transition-all duration-300 hover:shadow-xl group">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-xl mb-4 text-white group-hover:text-blue-300 transition-colors">
                        {template.title}
                      </h3>
                      <div className="bg-white p-6 rounded-xl mb-6 shadow-lg">
                        {template.qrUrl ? (
                          <img
                            src={template.qrUrl}
                            alt={`QR Code for ${template.title}`}
                            className="w-full rounded-lg"
                            onError={(e) => {
                              console.error(
                                "QR Code failed to load:",
                                template.qrUrl,
                              );
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500">
                              QR Code not available
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-white/80 mb-6 text-center">
                        Scan this QR code to access your template instantly
                      </p>
                      {template.qrUrl && (
                        <button
                          onClick={() =>
                            handleDownload(
                              template.qrUrl!,
                              `qr-${template.title.replace(/\s+/g, "-")}.png`,
                            )
                          }
                          className="flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 rounded-lg text-white font-semibold transform hover:scale-105"
                        >
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                          Download QR Code
                        </button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Picture Folders Section */}
        {pictureFolders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="my-12"
          >
            <h2 className="text-3xl font-bold mb-8 flex items-center bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              <svg
                className="w-8 h-8 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
              Your Picture Folders
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {pictureFolders.map((folder, idx) => (
                <motion.div
                  key={folder._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + idx * 0.1 }}
                >
                  <Card className="bg-white/10 backdrop-blur-lg border border-white/20 hover:border-white/30 transition-all duration-300 hover:shadow-xl group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-2xl mb-2 text-white group-hover:text-pink-300 transition-colors">
                            {folder.title}
                          </h3>
                          {folder.description && (
                            <p className="text-sm text-white/70 mb-3">
                              {folder.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="bg-pink-500/20 text-pink-300 px-3 py-1 rounded-full text-sm font-medium">
                              {folder.templates.length} Pictures
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <svg
                            className="w-12 h-12 text-pink-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                            />
                          </svg>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-white/80 mb-3 text-center">
                          This folder contains {folder.templates.length}{" "}
                          high-quality pictures
                        </p>
                      </div>

                      <button
                        onClick={() => handleDownloadAll(folder)}
                        className="flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 transition-all duration-300 rounded-lg text-white font-semibold transform hover:scale-105"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        Download All {folder.templates.length} Pictures
                      </button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Picture Content Section */}
        {pictureContent.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="my-12"
          >
            <h2 className="text-3xl font-bold mb-8 flex items-center bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              <svg
                className="w-8 h-8 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Your Pictures
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pictureContent.map((item, idx) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + idx * 0.1 }}
                >
                  <Card className="bg-white/10 backdrop-blur-lg border border-white/20 hover:border-white/30 transition-all duration-300 hover:shadow-xl group">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-xl mb-4 text-white group-hover:text-pink-300 transition-colors">
                        {item.title}
                      </h3>
                      <div className="bg-black/30 rounded-xl mb-6 overflow-hidden">
                        {item.downloadImageUrl ? (
                          <img
                            src={item.downloadImageUrl}
                            alt={item.title}
                            className="w-full h-64 object-cover"
                            onError={(e) => {
                              console.error(
                                "Image failed to load:",
                                item.downloadImageUrl,
                              );
                            }}
                          />
                        ) : (
                          <div className="w-full h-64 bg-gray-700 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400">
                              Preview not available
                            </span>
                          </div>
                        )}
                      </div>
                      {item.downloadImageUrl && (
                        <button
                          onClick={() =>
                            handleDownload(
                              item.downloadImageUrl!,
                              `${item.title.replace(/\s+/g, "-")}.png`,
                            )
                          }
                          className="flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 transition-all duration-300 rounded-lg text-white font-semibold transform hover:scale-105"
                        >
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                          Download Picture
                        </button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Video Content Section */}
        {videoContent.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="my-12"
          >
            <h2 className="text-3xl font-bold mb-8 flex items-center bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              <svg
                className="w-8 h-8 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Your Videos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {videoContent.map((item, idx) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + idx * 0.1 }}
                >
                  <Card className="bg-white/10 backdrop-blur-lg border border-white/20 hover:border-white/30 transition-all duration-300 hover:shadow-xl group">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-xl mb-4 text-white group-hover:text-blue-300 transition-colors">
                        {item.title}
                      </h3>
                      <div className="bg-black/30 rounded-xl mb-6 overflow-hidden">
                        {item.previewVideoUrl ? (
                          <video
                            src={item.previewVideoUrl}
                            controls
                            className="w-full h-64 object-cover"
                            poster={item.thumbnailUrl}
                            onError={(e) => {
                              console.error(
                                "Video failed to load:",
                                item.previewVideoUrl,
                              );
                            }}
                          >
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <div className="w-full h-64 bg-gray-700 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400">
                              Preview not available
                            </span>
                          </div>
                        )}
                      </div>
                      {item.downloadVideoUrl && (
                        <button
                          onClick={() =>
                            handleDownload(
                              item.downloadVideoUrl!,
                              `${item.title.replace(/\s+/g, "-")}.mp4`,
                            )
                          }
                          className="flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 rounded-lg text-white font-semibold transform hover:scale-105"
                        >
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                          Download Video
                        </button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Audio Content Section */}
        {audioContent.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="my-12"
          >
            <h2 className="text-3xl font-bold mb-8 flex items-center bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              <svg
                className="w-8 h-8 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
              Your Audio Files
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {audioContent.map((item, idx) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + idx * 0.1 }}
                >
                  <Card className="bg-white/10 backdrop-blur-lg border border-white/20 hover:border-white/30 transition-all duration-300 hover:shadow-xl group">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-xl mb-4 text-white group-hover:text-orange-300 transition-colors">
                        {item.title}
                      </h3>
                      {item.thumbnailUrl && (
                        <div className="bg-black/30 rounded-xl mb-4 overflow-hidden">
                          <img
                            src={item.thumbnailUrl}
                            alt={item.title}
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      )}
                      <div className="bg-black/30 rounded-xl mb-6 p-4">
                        {item.previewAudioUrl ? (
                          <audio
                            src={item.previewAudioUrl}
                            controls
                            className="w-full"
                            onError={(e) => {
                              console.error(
                                "Audio failed to load:",
                                item.previewAudioUrl,
                              );
                            }}
                          >
                            Your browser does not support the audio tag.
                          </audio>
                        ) : (
                          <div className="w-full h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 text-sm">
                              Preview not available
                            </span>
                          </div>
                        )}
                      </div>
                      {item.downloadAudioUrl && (
                        <button
                          onClick={() =>
                            handleDownload(
                              item.downloadAudioUrl!,
                              `${item.title.replace(/\s+/g, "-")}.mp3`,
                            )
                          }
                          className="flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all duration-300 rounded-lg text-white font-semibold transform hover:scale-105"
                        >
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                          Download Audio
                        </button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center my-8">
          <Button
            onClick={() => navigate("/user/orders")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            View Order History
          </Button>
          <Button
            onClick={() => navigate("/user/dashboard")}
            variant="outline"
            className="border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 px-8 py-3 rounded-lg font-semibold transition-all duration-300 backdrop-blur-sm"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}
