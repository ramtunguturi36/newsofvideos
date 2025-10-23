import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Video, Image, Film, Music, Package, ShoppingCart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

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
      purchasesLink: "/user/purchased",
    },
    {
      id: "pictures",
      title: "Pictures",
      subtitle: "Image templates & graphics",
      icon: Image,
      gradient: "from-purple-500 to-pink-500",
      bgLight: "from-purple-50 to-pink-50",
      browseLink: "/picture-templates",
      purchasesLink: "/user/picture-templates",
    },
    {
      id: "video-content",
      title: "Video Content",
      subtitle: "Standalone video files",
      icon: Film,
      gradient: "from-green-500 to-teal-500",
      bgLight: "from-green-50 to-teal-50",
      browseLink: "/video-content",
      purchasesLink: "/user/video-content",
    },
    {
      id: "audio",
      title: "Audio",
      subtitle: "Music & sound effects",
      icon: Music,
      gradient: "from-orange-500 to-amber-500",
      bgLight: "from-orange-50 to-amber-50",
      browseLink: "/audio-content",
      purchasesLink: "/user/audio-content",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Fixed Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-12">
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
          </div>

          {/* Category Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <div
                  key={category.id}
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
                          <h3
                            className="text-3xl font-bold text-slate-900 mb-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text transition-all duration-300"
                            style={{
                              backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                            }}
                          >
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

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      {/* Browse Button */}
                      <Link to={category.browseLink} className="block">
                        <Button
                          className={`w-full bg-gradient-to-r ${category.gradient} hover:shadow-2xl text-white rounded-2xl py-7 text-lg font-bold transition-all duration-300 transform group-hover:scale-[1.03]`}
                        >
                          <Package className="h-6 w-6 mr-3" />
                          Browse Marketplace
                        </Button>
                      </Link>

                      {/* My Purchases Button */}
                      <Link to={category.purchasesLink} className="block">
                        <Button
                          variant="outline"
                          className="w-full border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:bg-slate-50 rounded-2xl py-7 text-lg font-bold transition-all duration-300 backdrop-blur-sm"
                        >
                          <ShoppingCart className="h-6 w-6 mr-3" />
                          My Purchases
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Decorative Corner Element */}
                  <div
                    className={`absolute -bottom-16 -right-16 w-32 h-32 bg-gradient-to-br ${category.gradient} opacity-10 rounded-full group-hover:scale-150 transition-transform duration-700`}
                  ></div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
