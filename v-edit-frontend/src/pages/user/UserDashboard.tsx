import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Video,
  Image,
  Film,
  Music,
  Package,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { backend } from "@/lib/backend";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

interface CategoryStats {
  owned: number;
  total: number;
  latest?: string;
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<Record<string, CategoryStats>>({
    "video-templates": { owned: 0, total: 0 },
    pictures: { owned: 0, total: 0 },
    "video-content": { owned: 0, total: 0 },
    audio: { owned: 0, total: 0 },
  });
  const [loading, setLoading] = useState(true);

  // Category cards data
  const categories = [
    {
      id: "video-templates",
      title: "Video Templates",
      subtitle: "Templates with QR codes",
      icon: Video,
      gradient: "from-blue-500 to-cyan-500",
      bgLight: "from-blue-50 to-cyan-50",
      browseLink: "/folders",
      apiEndpoint: "/purchases/video-templates",
      totalEndpoint: "/templates",
    },
    {
      id: "pictures",
      title: "Pictures",
      subtitle: "Image templates & graphics",
      icon: Image,
      gradient: "from-purple-500 to-pink-500",
      bgLight: "from-purple-50 to-pink-50",
      browseLink: "/picture-templates",
      apiEndpoint: "/purchases/pictures",
      totalEndpoint: "/pictures",
    },
    {
      id: "video-content",
      title: "Video Content",
      subtitle: "Standalone video files",
      icon: Film,
      gradient: "from-green-500 to-teal-500",
      bgLight: "from-green-50 to-teal-50",
      browseLink: "/video-content",
      apiEndpoint: "/purchases/video-content",
      totalEndpoint: "/videos",
    },
    {
      id: "audio",
      title: "Audio",
      subtitle: "Music & sound effects",
      icon: Music,
      gradient: "from-orange-500 to-amber-500",
      bgLight: "from-orange-50 to-amber-50",
      browseLink: "/audio-content",
      apiEndpoint: "/purchases/audio-content",
      totalEndpoint: "/audios",
    },
  ];

  useEffect(() => {
    loadCategoryStats();
  }, []);

  const loadCategoryStats = async () => {
    try {
      setLoading(true);
      const newStats: Record<string, CategoryStats> = {};

      // Load owned items for each category
      for (const category of categories) {
        try {
          // Get owned items
          const ownedResponse = await backend.get(category.apiEndpoint);
          const ownedItems = ownedResponse.data.items || [];
          const ownedFolders = ownedResponse.data.folders || [];
          const ownedCount = ownedItems.length + ownedFolders.length;

          // Get latest item title
          let latestTitle = "";
          if (ownedItems.length > 0) {
            const sortedItems = [...ownedItems].sort(
              (a, b) =>
                new Date(b.purchaseDate || 0).getTime() -
                new Date(a.purchaseDate || 0).getTime(),
            );
            latestTitle = sortedItems[0]?.title || sortedItems[0]?.name || "";
          }

          // For now, we'll use a placeholder for total (you can implement proper counting)
          newStats[category.id] = {
            owned: ownedCount,
            total: 0, // Can be fetched from marketplace endpoints if needed
            latest: latestTitle,
          };
        } catch (error) {
          console.error(`Error loading stats for ${category.id}:`, error);
          newStats[category.id] = { owned: 0, total: 0 };
        }
      }

      setStats(newStats);
    } catch (error) {
      console.error("Error loading category stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (owned: number, total: number) => {
    if (total === 0) return 0;
    return Math.min((owned / total) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Fixed Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 shadow-2xl text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
              <div className="relative z-10">
                <h1 className="text-4xl md:text-5xl font-bold mb-3">
                  Welcome back, {user?.name?.split(" ")[0] || "User"}! 👋
                </h1>
                <p className="text-lg text-purple-100 mb-6">
                  Your creative workspace is ready. What would you like to
                  create today?
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Account Active</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <span className="text-sm font-medium">
                      🎉 Welcome to V-Edit
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Category Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              const categoryStats = stats[category.id] || {
                owned: 0,
                total: 0,
              };

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-transparent hover:border-slate-300 transform hover:-translate-y-2"
                >
                  {/* Gradient Background Overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                  ></div>

                  {/* Card Content */}
                  <div className="relative z-10 p-8">
                    {/* Icon and Title */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`h-20 w-20 rounded-3xl bg-gradient-to-br ${category.gradient} flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
                        >
                          <IconComponent className="h-10 w-10 text-white" />
                        </div>
                        <div>
                          <h3 className="text-3xl font-bold text-slate-900 mb-1">
                            {category.title}
                          </h3>
                          <p className="text-base text-slate-600 font-medium">
                            {category.subtitle}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Decorative Line */}
                    <div
                      className={`h-1 w-24 bg-gradient-to-r ${category.gradient} rounded-full mb-6 group-hover:w-full transition-all duration-500`}
                    ></div>

                    {/* Stats Section */}
                    <div className="mb-6 space-y-3">
                      {/* Owned Items */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Package className="h-5 w-5 text-slate-500" />
                          <span className="text-sm font-medium text-slate-600">
                            Your Library
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-2xl font-bold bg-gradient-to-r ${category.gradient} bg-clip-text text-transparent`}
                          >
                            {loading ? "..." : categoryStats.owned}
                          </span>
                          <span className="text-sm text-slate-500">items</span>
                        </div>
                      </div>

                      {/* Latest Purchase */}
                      {!loading && categoryStats.latest && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Sparkles className="h-4 w-4 text-amber-500" />
                          <span className="text-slate-600">Latest:</span>
                          <span className="font-medium text-slate-900 truncate max-w-[200px]">
                            {categoryStats.latest}
                          </span>
                        </div>
                      )}

                      {/* New Indicator */}
                      <div className="flex items-center space-x-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-slate-600">
                          New content added weekly
                        </span>
                      </div>

                      {/* Visual Separator */}
                      <div className="pt-3 border-t border-slate-100"></div>

                      {/* Quick Stats Grid */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-3 border border-slate-200">
                          <div className="text-xs text-slate-600 mb-1">
                            Premium Quality
                          </div>
                          <div className="text-sm font-bold text-slate-900">
                            ✓ HD Assets
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-3 border border-slate-200">
                          <div className="text-xs text-slate-600 mb-1">
                            Instant Access
                          </div>
                          <div className="text-sm font-bold text-slate-900">
                            ✓ Download
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Single Enhanced CTA Button */}
                    <Link to={category.browseLink} className="block">
                      <Button
                        className={`w-full bg-gradient-to-r ${category.gradient} hover:shadow-2xl text-white rounded-2xl py-7 text-lg font-bold transition-all duration-300 transform group-hover:scale-[1.03] relative overflow-hidden`}
                      >
                        {/* Animated shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>

                        <span className="relative flex items-center justify-center">
                          <Package className="h-6 w-6 mr-3" />
                          Browse & Explore
                        </span>
                      </Button>
                    </Link>

                    {/* Quick Link to Purchases */}
                    {!loading && categoryStats.owned > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-3 text-center"
                      >
                        <Link
                          to="/user/my-purchases"
                          className="text-sm text-slate-600 hover:text-slate-900 font-medium inline-flex items-center space-x-1 transition-colors"
                        >
                          <span>View your purchases</span>
                          <span className="text-xs">→</span>
                        </Link>
                      </motion.div>
                    )}
                  </div>

                  {/* Decorative Corner Element */}
                  <div
                    className={`absolute -bottom-16 -right-16 w-32 h-32 bg-gradient-to-br ${category.gradient} opacity-10 rounded-full group-hover:scale-150 transition-transform duration-700`}
                  ></div>

                  {/* Ownership Badge (if user owns items) */}
                  {!loading && categoryStats.owned > 0 && (
                    <div className="absolute top-4 right-4">
                      <div
                        className={`bg-gradient-to-r ${category.gradient} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center space-x-1`}
                      >
                        <Package className="h-3 w-3" />
                        <span>{categoryStats.owned}</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Call to Action Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-3xl p-8 border-2 border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                Need help getting started? 🚀
              </h2>
              <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                Explore our vast collection of premium templates, images,
                videos, and audio files. All purchases include instant access
                and lifetime downloads.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/user/my-purchases">
                  <Button
                    variant="outline"
                    className="rounded-full px-6 py-6 text-base font-semibold border-2 border-slate-300 hover:border-purple-400 hover:bg-purple-50"
                  >
                    <Package className="h-5 w-5 mr-2" />
                    View All Purchases
                  </Button>
                </Link>
                <Link to="/user/orders">
                  <Button
                    variant="outline"
                    className="rounded-full px-6 py-6 text-base font-semibold border-2 border-slate-300 hover:border-blue-400 hover:bg-blue-50"
                  >
                    📦 Order History
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
