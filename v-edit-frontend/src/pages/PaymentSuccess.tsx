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

        // Process all items - separate simple items from folders
        console.log("🔄 Processing items for content...");
        const allContent: ContentItem[] = [];
        const folderFetchPromises: Promise<any>[] = [];

        // First pass: Add simple items immediately
        for (const item of purchaseData.items) {
          console.log("🔄 Processing item:", item.type);

          if (item.type === "template") {
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
          } else if (item.type === "picture-template") {
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
          } else if (item.type === "video-content") {
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
          } else if (item.type === "audio-content") {
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
          } else if (item.type === "folder") {
            // Video template folder - fetch in parallel
            folderFetchPromises.push(
              backend
                .get(`/folders/${item.folderId || item.id}/preview`)
                .then((res) => ({
                  type: "video-template-folder",
                  templates: res.data.data.templates || [],
                }))
                .catch((err) => {
                  console.error("Error fetching video folder:", err);
                  return { type: "video-template-folder", templates: [] };
                }),
            );
          }
        }

        console.log("✅ Simple items processed:", allContent.length);
        setContentItems(allContent);

        // Process folders in parallel
        const folders: FolderItem[] = [];
        const folderItems = purchaseData.items.filter(
          (item) =>
            item.type === "picture-folder" ||
            item.type === "video-folder" ||
            item.type === "audio-folder",
        );

        console.log("🔄 Fetching folder details in parallel...");

        // Fetch all folders in parallel
        const folderPromises = folderItems.map(async (item) => {
          try {
            if (item.type === "picture-folder") {
              const res = await backend.get(
                `/picture-content/picture-hierarchy?folderId=${item.folderId || item.id}`,
              );
              return {
                _id: item.folderId || item.id,
                title: item.title,
                description: item.description,
                type: "picture-folder" as const,
                folderId: item.folderId || item.id,
                templates: (res.data.templates || []).map((template: any) => ({
                  _id: template._id,
                  title: template.title,
                  description: template.description || "",
                  basePrice: template.basePrice,
                  discountPrice: template.discountPrice,
                  type: "picture" as const,
                  previewImageUrl: template.previewImageUrl,
                  downloadImageUrl: template.downloadImageUrl,
                })),
              };
            } else if (item.type === "video-folder") {
              const res = await backend.get(
                `/video-content/video-hierarchy?folderId=${item.folderId || item.id}`,
              );
              return {
                _id: item.folderId || item.id,
                title: item.title,
                description: item.description,
                type: "video-folder" as const,
                folderId: item.folderId || item.id,
                templates: (res.data.videos || []).map((video: any) => ({
                  _id: video._id,
                  title: video.title,
                  description: video.description || "",
                  basePrice: video.basePrice,
                  discountPrice: video.discountPrice,
                  type: "video" as const,
                  previewVideoUrl: video.previewVideoUrl,
                  downloadVideoUrl: video.downloadVideoUrl,
                  thumbnailUrl: video.thumbnailUrl,
                })),
              };
            } else if (item.type === "audio-folder") {
              const res = await backend.get(
                `/audio-content/audio-hierarchy?folderId=${item.folderId || item.id}`,
              );
              return {
                _id: item.folderId || item.id,
                title: item.title,
                description: item.description,
                type: "audio-folder" as const,
                folderId: item.folderId || item.id,
                templates: (res.data.audio || []).map((audio: any) => ({
                  _id: audio._id,
                  title: audio.title,
                  description: audio.description || "",
                  basePrice: audio.basePrice,
                  discountPrice: audio.discountPrice,
                  type: "audio" as const,
                  previewAudioUrl: audio.previewAudioUrl,
                  downloadAudioUrl: audio.downloadAudioUrl,
                  thumbnailUrl: audio.thumbnailUrl,
                })),
              };
            }
            return null;
          } catch (error) {
            console.error(`Error fetching ${item.type}:`, error);
            // Return minimal folder info even on error
            return {
              _id: item.folderId || item.id,
              title: item.title,
              description: item.description,
              type: item.type as
                | "picture-folder"
                | "video-folder"
                | "audio-folder",
              folderId: item.folderId || item.id,
              templates: [],
            };
          }
        });

        // Wait for all folder fetches to complete
        const folderResults = await Promise.all(folderPromises);
        folders.push(
          ...(folderResults.filter((f) => f !== null) as FolderItem[]),
        );

        // Add folder templates to content for video template folders
        const folderTemplateResults = await Promise.all(folderFetchPromises);
        for (const result of folderTemplateResults) {
          if (result.templates && result.templates.length > 0) {
            const templates = result.templates.map((template: any) => ({
              _id: template._id,
              title: template.title,
              description: template.description || "",
              basePrice: template.basePrice,
              discountPrice: template.discountPrice,
              type: "template" as const,
              qrUrl: template.qrUrl,
              videoUrl: template.videoUrl,
            }));
            allContent.push(...templates);
          }
        }

        console.log("✅ All folders processed:", folders.length);
        setFolderItems(folders);
        setContentItems(allContent);
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
      const itemType =
        folder.type === "picture-folder"
          ? "pictures"
          : folder.type === "video-folder"
            ? "videos"
            : "audio tracks";
      const fileExt =
        folder.type === "picture-folder"
          ? "png"
          : folder.type === "video-folder"
            ? "mp4"
            : "mp3";

      toast.info(`Downloading ${folder.templates.length} ${itemType}...`);

      for (let i = 0; i < folder.templates.length; i++) {
        const template = folder.templates[i];
        const downloadUrl =
          template.downloadImageUrl ||
          template.downloadVideoUrl ||
          template.downloadAudioUrl;

        if (downloadUrl) {
          await handleDownload(
            downloadUrl,
            `${folder.title}-${i + 1}-${template.title.replace(/\s+/g, "-")}.${fileExt}`,
          );
          // Add a longer delay between downloads to avoid browser limits
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      toast.success(
        `Successfully downloaded ${folder.templates.length} ${itemType}!`,
      );
    } catch (error) {
      console.error("Error downloading all items:", error);
      toast.error("Failed to download some items");
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

  // Get folders by type
  const pictureFolders = folderItems.filter(
    (item) => item.type === "picture-folder",
  );
  const videoFolders = folderItems.filter(
    (item) => item.type === "video-folder",
  );
  const audioFolders = folderItems.filter(
    (item) => item.type === "audio-folder",
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 mb-6 shadow-lg">
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
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Payment Successful!
          </h1>
          <p className="text-xl text-slate-600">
            Thank you for your purchase. Your items are ready to download.
          </p>
        </motion.div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Order Summary</h2>
            <div className="text-right">
              <div className="text-sm text-slate-500 mb-1">Order ID</div>
              <div className="font-mono text-sm text-slate-900 bg-slate-100 px-3 py-1 rounded">
                {purchase.orderId || purchase._id}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl">
              <div className="text-sm text-slate-600 mb-2">Items Purchased</div>
              <div className="text-3xl font-bold text-slate-900">
                {purchase.items.length}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
              <div className="text-sm text-slate-600 mb-2">Purchase Date</div>
              <div className="text-lg font-semibold text-slate-900">
                {new Date(purchase.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
              <div className="text-sm text-slate-600 mb-2">Total Amount</div>
              <div className="text-3xl font-bold text-green-600">
                ₹{(purchase.totalAmount || 0).toFixed(2)}
              </div>
              {purchase.discountApplied > 0 && (
                <div className="text-sm text-green-600 mt-1">
                  Saved ₹{purchase.discountApplied.toFixed(2)}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/user/dashboard")}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg px-8 py-3"
            >
              Go to Dashboard
            </Button>
            <Button
              onClick={() => navigate("/user/purchased")}
              variant="outline"
              className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg px-8 py-3"
            >
              View My Purchases
            </Button>
          </div>
        </motion.div>

        {/* Purchased Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Your Purchased Items
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {purchase.items.map((item, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        item.type.includes("folder")
                          ? "bg-gradient-to-r from-purple-500 to-pink-500"
                          : "bg-gradient-to-r from-blue-500 to-cyan-500"
                      }`}
                    >
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {item.type.includes("folder") ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        )}
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {item.type.includes("folder")
                          ? "Folder Bundle"
                          : "Individual Item"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      ₹{item.price.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
