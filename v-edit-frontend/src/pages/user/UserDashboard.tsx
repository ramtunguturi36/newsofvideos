import React, { useEffect, useState } from "react";
import {
  useNavigate,
  useSearchParams,
  Link,
  Outlet,
  useLocation,
} from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ShoppingCart,
  Loader2,
  ShoppingBag,
  Star,
  Clock,
  DollarSign,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  ChevronDown,
  ShoppingBasket,
  Settings as SettingsIcon,
  HelpCircle,
  Download,
  Bell,
  MoreHorizontal,
  Upload,
  Image as ImageIcon,
  FolderOpen,
  Folder as FolderIcon,
  Plus,
  Check,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Info,
  Home,
  ChevronRight,
  History,
  Video,
  QrCode,
  Phone,
  MapPin,
  User as UserIcon,
  Image,
  Filter,
  Play,
  ArrowLeft,
  ChevronUp,
  Library,
  UserCheck,
  Search,
  PanelLeft,
  PanelLeftClose,
  Film,
  Music,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import CartDrawer from "@/components/CartDrawer";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getHierarchy,
  getPictureHierarchy,
  getVideoHierarchy,
  getAudioHierarchy,
  backend,
} from "@/lib/backend";
import type {
  Folder,
  TemplateItem,
  PictureFolder,
  PictureTemplate,
  VideoFolder,
  VideoContent,
  AudioFolder,
  AudioContent,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface ExtendedTemplateItem extends TemplateItem {
  // TemplateItem already has videoUrl, qrUrl, folderId from the base type
}

interface ExtendedFolder extends Folder {
  // Folder already has all needed properties from the base type
}

interface ExtendedPictureTemplate extends PictureTemplate {
  // PictureTemplate already has previewImageUrl, downloadImageUrl, folderId from the base type
}

interface ExtendedPictureFolder extends PictureFolder {
  // PictureFolder already has all needed properties from the base type
}

interface ExtendedVideoFolder extends VideoFolder {
  // VideoFolder already has all needed properties from the base type
}

interface ExtendedVideoContent extends VideoContent {
  // VideoContent already has all needed properties from the base type
}

interface ExtendedAudioFolder extends AudioFolder {
  // AudioFolder already has all needed properties from the base type
}

interface ExtendedAudioContent extends AudioContent {
  // AudioContent already has all needed properties from the base type
}

// Stats card component
function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendText,
  description,
  className = "",
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  trendText?: string;
  description?: string;
  className?: string;
}) {
  const trendColors = {
    up: "text-green-500",
    down: "text-red-500",
    neutral: "text-gray-500",
  };

  const trendIcons = {
    up: "↑",
    down: "↓",
    neutral: "→",
  };

  return (
    <Card
      className={`bg-white/80 backdrop-blur-lg border border-slate-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/90 ${className}`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="p-3 rounded-full bg-gradient-to-r from-blue-500/20 to-teal-500/20 text-blue-600">
            <Icon className="h-6 w-6" />
          </div>
          {trend && (
            <span className={`text-sm font-medium ${trendColors[trend]}`}>
              {trendIcons[trend]} {trendText}
            </span>
          )}
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {description && (
            <p className="text-xs text-slate-500 mt-1">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Navigation sections with accordion structure
const navigationSections = [
  {
    title: "EXPLORE",
    icon: Library,
    items: [
      {
        name: "Dashboard",
        icon: LayoutDashboard,
        path: "/user/dashboard",
        description: "Your personalized dashboard overview",
      },
      {
        name: "Video Templates",
        icon: Video,
        path: "/user/dashboard",
        description: "Browse and manage video templates",
      },
      {
        name: "Video Folders",
        icon: ShoppingCart,
        path: "/folders",
        description: "Buy complete video template collections",
        badge: "Hot",
      },
      {
        name: "Picture Templates",
        icon: Image,
        path: "/picture-templates",
        description: "Browse and purchase picture templates",
      },
      {
        name: "Picture Folders",
        icon: FolderIcon,
        path: "/picture-folders",
        description: "Browse and purchase picture collections",
      },
      {
        name: "Video Content",
        icon: Film,
        path: "/video-content",
        description: "Browse and purchase video content",
      },
      {
        name: "Audio Content",
        icon: Music,
        path: "/audio-content",
        description: "Browse and purchase audio content",
      },
    ],
  },
  {
    title: "MY LIBRARY",
    icon: UserCheck,
    items: [
      {
        name: "Order History",
        icon: History,
        path: "/user/orders",
        description: "View your purchase history",
      },
      {
        name: "My Video Templates",
        icon: CheckCircle,
        path: "/user/purchased",
        description: "Access your purchased video templates",
      },
      {
        name: "My Video Folders",
        icon: FolderIcon,
        path: "/user/folders",
        description: "Access your purchased video folder collections",
      },
      {
        name: "My Picture Templates",
        icon: Image,
        path: "/user/picture-templates",
        description: "Access your purchased picture templates",
      },
      {
        name: "My Picture Folders",
        icon: FolderIcon,
        path: "/user/picture-folders",
        description: "Access your purchased picture folder collections",
      },
      {
        name: "My Video Content",
        icon: Film,
        path: "/user/video-content",
        description: "Access your purchased video content",
      },
      {
        name: "My Audio Content",
        icon: Music,
        path: "/user/audio-content",
        description: "Access your purchased audio content",
      },
    ],
  },
  {
    title: "ACCOUNT",
    icon: UserIcon,
    items: [
      {
        name: "Settings",
        icon: SettingsIcon,
        path: "/user/settings",
        description: "Account and app settings",
      },
      {
        name: "Help & Support",
        icon: HelpCircle,
        path: "/contact",
        description: "Get help and support",
      },
    ],
  },
];

export default function UserDashboard() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [folders, setFolders] = useState<ExtendedFolder[]>([]);
  const [templates, setTemplates] = useState<ExtendedTemplateItem[]>([]);
  const [path, setPath] = useState<ExtendedFolder[]>([]);
  const [purchasedTemplates, setPurchasedTemplates] = useState<Set<string>>(
    new Set(),
  );

  // Picture template states
  const [pictureFolders, setPictureFolders] = useState<ExtendedPictureFolder[]>(
    [],
  );
  const [pictureTemplates, setPictureTemplates] = useState<
    ExtendedPictureTemplate[]
  >([]);
  const [picturePath, setPicturePath] = useState<ExtendedPictureFolder[]>([]);
  const [purchasedPictureTemplates, setPurchasedPictureTemplates] = useState<
    Set<string>
  >(new Set());

  // Video content states
  const [videoContentFolders, setVideoContentFolders] = useState<
    ExtendedVideoFolder[]
  >([]);
  const [videoContents, setVideoContents] = useState<ExtendedVideoContent[]>(
    [],
  );
  const [videoContentPath, setVideoContentPath] = useState<
    ExtendedVideoFolder[]
  >([]);
  const [purchasedVideoContents, setPurchasedVideoContents] = useState<
    Set<string>
  >(new Set());
  const [showAllVideoContentFolders, setShowAllVideoContentFolders] =
    useState(false);

  // Audio content states
  const [audioContentFolders, setAudioContentFolders] = useState<
    ExtendedAudioFolder[]
  >([]);
  const [audioContents, setAudioContents] = useState<ExtendedAudioContent[]>(
    [],
  );
  const [audioContentPath, setAudioContentPath] = useState<
    ExtendedAudioFolder[]
  >([]);
  const [purchasedAudioContents, setPurchasedAudioContents] = useState<
    Set<string>
  >(new Set());
  const [showAllAudioContentFolders, setShowAllAudioContentFolders] =
    useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedQR, setSelectedQR] = useState<{
    url: string;
    title: string;
  } | null>(null);
  const [showAllVideoFolders, setShowAllVideoFolders] = useState(false);
  const [showAllPictureFolders, setShowAllPictureFolders] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["EXPLORE"]),
  );
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const openVideoModal = (videoUrl: string) => {
    setSelectedVideo(videoUrl);
  };

  const openQRModal = (qrUrl: string, title: string) => {
    setSelectedQR({ url: qrUrl, title });
  };

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionTitle)) {
        newSet.delete(sectionTitle);
      } else {
        newSet.add(sectionTitle);
      }
      return newSet;
    });
  };

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  // Generate breadcrumb navigation
  const getBreadcrumbs = () => {
    if (params.get("folderId")) {
      return [
        { name: "Home", path: "/user/dashboard", icon: Home },
        ...path.map((folder) => ({
          name: folder.name,
          path: `/user/dashboard?folderId=${folder._id}`,
          icon: FolderOpen,
        })),
        { name: "Current", path: "", icon: null },
      ];
    }

    const currentItem = navigationSections
      .flatMap((section) => section.items)
      .find((item) => location.pathname === item.path);
    return [
      { name: "Home", path: "/user/dashboard", icon: Home },
      { name: currentItem?.name || "Dashboard", path: "", icon: null },
    ];
  };

  // Filter templates and folders based on search term
  const filteredTemplates = templates.filter(
    (template) =>
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredFolders = folders.filter((folder) =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Filter picture templates and folders based on search term
  const filteredPictureTemplates = pictureTemplates.filter(
    (template) =>
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredPictureFolders = pictureFolders.filter((folder) =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Filter video content folders and items
  const filteredVideoContentFolders = videoContentFolders.filter((folder) =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredVideoContents = videoContents.filter(
    (content) =>
      content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Filter audio content folders and items
  const filteredAudioContentFolders = audioContentFolders.filter((folder) =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredAudioContents = audioContents.filter(
    (content) =>
      content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Mock user data - replace with actual auth context
  const { user, logout } = useAuth() || {
    user: { name: "John Doe", email: "john@example.com" },
    logout: () => {},
  };
  const { items: cartItems = [], addItem } = useCart() || {};

  // Load ownership data on component mount
  useEffect(() => {
    const loadOwnershipData = async () => {
      try {
        const response = await backend.get("/purchases");
        const purchases = response.data.purchases || [];

        // Get all unique template IDs from purchases
        const templateIds = Array.from(
          new Set(
            purchases.flatMap((purchase: any) => {
              return purchase.items
                .filter(
                  (item: any) => item.type === "template" && item.templateId,
                )
                .map((item: any) => item.templateId);
            }),
          ),
        );

        // Get all unique picture template IDs from purchases
        const pictureTemplateIds = Array.from(
          new Set(
            purchases.flatMap((purchase: any) => {
              return purchase.items
                .filter(
                  (item: any) =>
                    item.type === "picture-template" && item.templateId,
                )
                .map((item: any) => item.templateId);
            }),
          ),
        );

        setPurchasedTemplates(new Set(templateIds as string[]));
        setPurchasedPictureTemplates(new Set(pictureTemplateIds as string[]));

        // Check if refresh flag is set and clear it
        if (localStorage.getItem("refreshOrders") === "true") {
          localStorage.removeItem("refreshOrders");
        }
      } catch (err) {
        console.error("Error loading ownership data:", err);
      }
    };

    loadOwnershipData();
  }, []);

  // Listen for refresh flag from payment success
  useEffect(() => {
    const handleStorageChange = () => {
      if (localStorage.getItem("refreshOrders") === "true") {
        const refreshOwnership = async () => {
          try {
            const response = await backend.get("/purchases");
            const purchases = response.data.purchases || [];

            // Get all unique template IDs from purchases
            const templateIds = Array.from(
              new Set(
                purchases.flatMap((purchase: any) =>
                  purchase.items
                    .filter(
                      (item: any) =>
                        item.type === "template" && item.templateId,
                    )
                    .map((item: any) => item.templateId),
                ),
              ),
            );

            // Get all unique picture template IDs from purchases
            const pictureTemplateIds = Array.from(
              new Set(
                purchases.flatMap((purchase: any) =>
                  purchase.items
                    .filter(
                      (item: any) =>
                        item.type === "picture-template" && item.templateId,
                    )
                    .map((item: any) => item.templateId),
                ),
              ),
            );

            setPurchasedTemplates(new Set(templateIds as string[]));
            setPurchasedPictureTemplates(
              new Set(pictureTemplateIds as string[]),
            );
          } catch (err) {
            console.error("Error refreshing ownership data:", err);
          }
        };
        refreshOwnership();

        localStorage.removeItem("refreshOrders");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Load folder contents
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const folderId = params.get("folderId") || undefined;
        const data = await getHierarchy(folderId);
        setFolders(data.folders as ExtendedFolder[]);
        setTemplates(data.templates as ExtendedTemplateItem[]);
        setPath((data.path || []) as ExtendedFolder[]);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load content");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params]);

  // Load picture template contents
  useEffect(() => {
    const loadPictureData = async () => {
      try {
        const data = await getPictureHierarchy(undefined);
        setPictureFolders(data.folders as ExtendedPictureFolder[]);
        setPictureTemplates(data.templates as ExtendedPictureTemplate[]);
        setPicturePath((data.path || []) as ExtendedPictureFolder[]);
      } catch (error) {
        console.error("Error loading picture data:", error);
      }
    };

    loadPictureData();
  }, []);

  // Load video content
  useEffect(() => {
    const loadVideoContentData = async () => {
      try {
        const data = await getVideoHierarchy(undefined);
        setVideoContentFolders(data.folders as ExtendedVideoFolder[]);
        setVideoContents(data.videos as ExtendedVideoContent[]);
        setVideoContentPath((data.path || []) as ExtendedVideoFolder[]);
      } catch (error) {
        console.error("Error loading video content data:", error);
      }
    };

    loadVideoContentData();
  }, []);

  // Load audio content
  useEffect(() => {
    const loadAudioContentData = async () => {
      try {
        const data = await getAudioHierarchy(undefined);
        setAudioContentFolders(data.folders as ExtendedAudioFolder[]);
        setAudioContents(data.audio as ExtendedAudioContent[]);
        setAudioContentPath((data.path || []) as ExtendedAudioFolder[]);
      } catch (error) {
        console.error("Error loading audio content data:", error);
      }
    };

    loadAudioContentData();
  }, []);

  // Check if item is in cart
  const isInCart = (id: string): boolean => {
    return (
      cartItems?.some(
        (item: { id: string; type: string }) =>
          item.id === id && item.type === "template",
      ) || false
    );
  };

  // Add to cart handler
  const handleAddToCart = (template: ExtendedTemplateItem) => {
    if (!addItem) return;

    addItem({
      id: template._id,
      type: "template",
      title: template.title,
      price: template.discountPrice || template.basePrice,
      data: template,
    } as any);

    toast.success("Added to cart");
  };

  // Navigate to folder
  const navigateToFolder = (folderId: string) => {
    setParams(folderId ? { folderId } : {});
  };

  // Navigate to template details
  const navigateToTemplate = (templateId: string) => {
    navigate(`/user/explorer/${templateId}`);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Toggle user menu
  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  // Close mobile menu when a link is clicked
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout?.();
      navigate("/login");
      toast.success("Successfully logged out");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 text-slate-900 flex">
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMobileMenu}
          className="bg-white/90 backdrop-blur-lg border-slate-200 text-slate-700 hover:bg-white shadow-lg"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar - Redesigned with Accordion */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-gradient-to-b from-slate-50/95 to-white/95 backdrop-blur-lg border-r border-slate-200/50 shadow-2xl transform transition-all duration-300 ease-in-out",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          sidebarCollapsed
            ? "md:w-16 md:translate-x-0"
            : "md:w-80 md:translate-x-0",
          "md:static md:flex-shrink-0",
        )}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div
            className={cn(
              "border-b border-slate-200/50",
              sidebarCollapsed ? "p-4" : "p-8",
            )}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                V
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    V-Edit Pro
                  </h1>
                  <p className="text-sm text-slate-600">
                    Professional Video Templates
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* User Profile Section */}
          <div
            className={cn(
              "border-b border-slate-200/50 bg-slate-50/30",
              sidebarCollapsed ? "p-4" : "p-6",
            )}
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {user?.name?.charAt(0) || "M"}
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">
                    {user?.name || "Marky"}
                  </p>
                  <p className="text-sm text-slate-600 truncate">
                    {user?.email || "marky@example.com"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Accordion Navigation */}
          <nav
            className={cn(
              "flex-1 overflow-y-auto",
              sidebarCollapsed ? "p-2" : "p-6",
            )}
          >
            {sidebarCollapsed ? (
              <div className="space-y-4">
                {navigationSections
                  .flatMap((section) => section.items)
                  .map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={closeMobileMenu}
                        className={cn(
                          "flex items-center justify-center p-3 rounded-xl transition-all duration-300 relative group",
                          isActive
                            ? "bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 shadow-lg"
                            : "text-slate-600 hover:bg-slate-100 hover:text-purple-600",
                        )}
                        title={item.name}
                      >
                        <div className="relative">
                          <item.icon
                            className={cn(
                              "h-5 w-5 transition-colors",
                              isActive
                                ? "text-purple-600"
                                : "text-slate-500 group-hover:text-purple-500",
                            )}
                          />
                          {item.badge && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
              </div>
            ) : (
              <div className="space-y-8">
                {navigationSections.map((section) => {
                  const isExpanded = expandedSections.has(section.title);
                  const ChevronIcon = isExpanded ? ChevronUp : ChevronDown;

                  return (
                    <div key={section.title} className="space-y-3">
                      {/* Section Header */}
                      <button
                        onClick={() => toggleSection(section.title)}
                        className="w-full flex items-center justify-between px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-slate-700 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <section.icon className="h-4 w-4" />
                          <span>{section.title}</span>
                        </div>
                        <ChevronIcon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                      </button>

                      {/* Section Items */}
                      {isExpanded && (
                        <div className="space-y-1 pl-2">
                          {section.items.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                              <Link
                                key={item.name}
                                to={item.path}
                                onClick={closeMobileMenu}
                                className={cn(
                                  "group flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300 relative",
                                  isActive
                                    ? "bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 shadow-lg border-l-4 border-purple-500"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-purple-600 hover:shadow-md",
                                )}
                              >
                                <div className="relative">
                                  <item.icon
                                    className={cn(
                                      "h-5 w-5 mr-3 transition-colors",
                                      isActive
                                        ? "text-purple-600"
                                        : "text-slate-500 group-hover:text-purple-500",
                                    )}
                                  />
                                  {item.badge && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                <span className="flex-1">{item.name}</span>
                                {isActive && (
                                  <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </nav>

          {/* Sidebar Footer - Sign Out */}
          <div
            className={cn(
              "border-t border-slate-200/50 mt-auto",
              sidebarCollapsed ? "p-2" : "p-6",
            )}
          >
            <button
              onClick={confirmLogout}
              disabled={isLoggingOut}
              className={cn(
                "flex items-center justify-center text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50/50 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 hover:border-red-200 hover:shadow-md",
                sidebarCollapsed ? "w-full p-3" : "w-full px-6 py-3",
              )}
              title={sidebarCollapsed ? "Sign Out" : undefined}
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {!sidebarCollapsed && (
                    <span className="ml-2">Signing out...</span>
                  )}
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4" />
                  {!sidebarCollapsed && <span className="ml-2">Sign Out</span>}
                </>
              )}
            </button>

            {/* Logout Confirmation Dialog */}
            {showLogoutConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Sign out
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to sign out?
                  </p>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowLogoutConfirm(false)}
                      disabled={isLoggingOut}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoggingOut ? "Signing out..." : "Sign out"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={cn(
          "flex-1 flex flex-col overflow-hidden",
          sidebarCollapsed ? "md:ml-0" : "md:ml-0",
        )}
      >
        {/* Top Bar - Redesigned */}
        <header className="bg-slate-50/95 backdrop-blur-lg border-b border-slate-200/50 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between h-16 px-6 lg:px-8">
            {/* Left Side: Sidebar Toggle + Breadcrumb Navigation */}
            <div className="flex items-center space-x-4">
              {/* Sidebar Toggle Button */}
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 md:block hidden"
                title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {sidebarCollapsed ? (
                  <PanelLeft className="h-5 w-5" />
                ) : (
                  <PanelLeftClose className="h-5 w-5" />
                )}
              </button>

              {/* Breadcrumb Navigation */}
              <div className="flex items-center space-x-2">
                {getBreadcrumbs().map((crumb, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && (
                      <ChevronRight className="h-4 w-4 text-slate-400 mx-1" />
                    )}
                    <div className="flex items-center space-x-1">
                      {crumb.icon && (
                        <crumb.icon className="h-4 w-4 text-slate-400" />
                      )}
                      {crumb.path ? (
                        <Link
                          to={crumb.path}
                          className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                        >
                          {crumb.name}
                        </Link>
                      ) : (
                        <span className="text-sm font-semibold text-slate-900">
                          {crumb.name}
                        </span>
                      )}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Center: Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search templates, projects, or folders…"
                  value={globalSearchTerm}
                  onChange={(e) => setGlobalSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100/50 border border-slate-200 rounded-full text-sm placeholder:text-slate-400 focus:bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition-all duration-200"
                />
              </div>
            </div>

            {/* Right Side: User Action Hub */}
            <div className="flex items-center">
              <div className="flex items-center bg-slate-100/50 rounded-full p-1 space-x-1">
                {/* Notifications */}
                <button className="relative p-2 rounded-full text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-all duration-200">
                  <Bell className="h-5 w-5" />
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-purple-500 rounded-full"></div>
                </button>

                {/* Cart */}
                <button
                  onClick={() => setCartOpen(true)}
                  className="relative p-2 rounded-full text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-all duration-200"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
                      {cartItems.length}
                    </span>
                  )}
                </button>

                {/* User Profile */}
                <div className="relative">
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-200 transition-all duration-200 focus:outline-none"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-medium shadow-lg">
                      {user?.name?.charAt(0) || "M"}
                    </div>
                    <ChevronDown
                      className={`h-3 w-3 text-slate-500 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* User Menu Dropdown */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl py-2 z-50 border border-slate-200/50">
                      <div className="px-4 py-3 border-b border-slate-200/50">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-medium shadow-lg">
                            {user?.name?.charAt(0) || "M"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {user?.name || "Marky"}
                            </p>
                            <p className="text-xs text-slate-600 truncate">
                              {user?.email || "marky@example.com"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Link
                        to="/user/settings"
                        className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <SettingsIcon className="h-4 w-4 mr-3" />
                        Your Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Nested routes will be rendered here */}
            <Outlet />

            {/* Dashboard content (only shown when at dashboard route) */}
            {location.pathname === "/user/dashboard" &&
              !params.get("folderId") && (
                <>
                  {/* Welcome Banner - Refined */}
                  <div className="bg-gradient-to-r from-purple-50/80 to-indigo-50/80 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-purple-200/30 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex-1">
                        <h2 className="text-4xl font-bold text-slate-900 mb-3">
                          Welcome back, {user?.name?.split(" ")[0] || "Marky"}!
                          👋
                        </h2>
                        <p className="text-slate-600 text-lg mb-6">
                          Here's what's happening with your account today.
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-slate-100 text-slate-700 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
                            <CheckCircle className="h-4 w-4 mr-2 text-slate-500" />
                            Account Active
                          </span>
                          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-slate-100 text-slate-700 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
                            <Star className="h-4 w-4 mr-2 text-slate-500" />
                            Pro Member
                          </span>
                          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-slate-100 text-slate-700 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
                            <Bell className="h-4 w-4 mr-2 text-slate-500" />3
                            New Notifications
                          </span>
                        </div>
                      </div>
                      <div className="mt-6 md:mt-0 md:ml-8">
                        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-slate-900 mb-1">
                              {purchasedTemplates.size}
                            </div>
                            <div className="text-sm text-slate-600 font-medium">
                              Templates Owned
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Video Categories Section - Unified Design */}
                  {filteredFolders.length > 0 && (
                    <div className="mb-8 bg-white rounded-2xl shadow-lg p-8 border border-slate-200/50">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h2 className="text-3xl font-bold text-blue-600 flex items-center mb-2">
                            <FolderOpen className="h-8 w-8 mr-3" />
                            Video Categories
                          </h2>
                          <p className="text-slate-600 text-lg">
                            View and explore template types
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-slate-700 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
                            {filteredFolders.length} categories available
                          </span>
                          <Button
                            onClick={() =>
                              setShowAllVideoFolders(!showAllVideoFolders)
                            }
                            variant="outline"
                            className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 rounded-full px-6 py-2 transition-all duration-200 hover:scale-105"
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {showAllVideoFolders ? "Show Less" : "See All"}
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {(showAllVideoFolders
                          ? filteredFolders
                          : filteredFolders.slice(0, 5)
                        ).map((folder) => (
                          <div
                            key={folder._id}
                            className="group overflow-hidden rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 bg-white text-left cursor-pointer hover:-translate-y-1 h-full flex flex-col"
                            onClick={() => navigateToFolder(folder._id)}
                          >
                            <div className="h-40 w-full overflow-hidden bg-slate-100">
                              {folder.coverPhotoUrl ? (
                                <img
                                  src={folder.coverPhotoUrl}
                                  alt={folder.name}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  onError={(e) => {
                                    // Fallback to default background if image fails to load
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.style.display = "none";
                                    target.parentElement!.style.background =
                                      "linear-gradient(to right, #e0f2fe, #bae6fd)";
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-100 to-cyan-100 group-hover:from-blue-200 group-hover:to-cyan-200">
                                  <FolderOpen className="h-12 w-12 text-blue-600" />
                                </div>
                              )}
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                              <h3 className="font-bold text-slate-900 group-hover:text-blue-700 text-lg mb-1 line-clamp-1">
                                {folder.name}
                              </h3>
                              <p className="text-slate-600 text-sm">
                                View templates
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Picture Categories Section - Unified Design */}
                  {filteredPictureFolders.length > 0 && (
                    <div className="mb-8 bg-white rounded-2xl shadow-lg p-8 border border-slate-200/50">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h2 className="text-3xl font-bold text-purple-600 flex items-center mb-2">
                            <Image className="h-8 w-8 mr-3" />
                            Picture Categories
                          </h2>
                          <p className="text-slate-600 text-lg">
                            View and explore picture template types
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-slate-700 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
                            {filteredPictureFolders.length} categories available
                          </span>
                          <Button
                            onClick={() =>
                              setShowAllPictureFolders(!showAllPictureFolders)
                            }
                            variant="outline"
                            className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 rounded-full px-6 py-2 transition-all duration-200 hover:scale-105"
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {showAllPictureFolders ? "Show Less" : "See All"}
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {(showAllPictureFolders
                          ? filteredPictureFolders
                          : filteredPictureFolders.slice(0, 5)
                        ).map((folder) => (
                          <div
                            key={folder._id}
                            className="group overflow-hidden rounded-xl border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 bg-white text-left cursor-pointer hover:-translate-y-1 h-full flex flex-col"
                            onClick={() =>
                              navigate(
                                `/picture-templates?folderId=${folder._id}`,
                              )
                            }
                          >
                            <div className="h-40 w-full overflow-hidden bg-slate-100">
                              {folder.coverPhotoUrl ? (
                                <img
                                  src={folder.coverPhotoUrl}
                                  alt={folder.name}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  onError={(e) => {
                                    // Fallback to default background if image fails to load
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.style.display = "none";
                                    target.parentElement!.style.background =
                                      "linear-gradient(to right, #f3e8ff, #e9d5ff)";
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-purple-100 to-pink-100 group-hover:from-purple-200 group-hover:to-pink-200">
                                  <Image className="h-12 w-12 text-purple-600" />
                                </div>
                              )}
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                              <h3 className="font-bold text-slate-900 group-hover:text-purple-700 text-lg mb-1 line-clamp-1">
                                {folder.name}
                              </h3>
                              <p className="text-slate-600 text-sm">
                                View Pictures
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Video Content Categories Section - Unified Design */}
                  {filteredVideoContentFolders.length > 0 && (
                    <div className="mb-8 bg-white rounded-2xl shadow-lg p-8 border border-slate-200/50">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h2 className="text-3xl font-bold text-green-600 flex items-center mb-2">
                            <Film className="h-8 w-8 mr-3" />
                            Video Content Categories
                          </h2>
                          <p className="text-slate-600 text-lg">
                            Browse and purchase professional video content
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-slate-700 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
                            {filteredVideoContentFolders.length} categories
                            available
                          </span>
                          <Button
                            onClick={() =>
                              setShowAllVideoContentFolders(
                                !showAllVideoContentFolders,
                              )
                            }
                            variant="outline"
                            className="border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 rounded-full px-6 py-2 transition-all duration-200 hover:scale-105"
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {showAllVideoContentFolders
                              ? "Show Less"
                              : "See All"}
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {(showAllVideoContentFolders
                          ? filteredVideoContentFolders
                          : filteredVideoContentFolders.slice(0, 5)
                        ).map((folder) => (
                          <div
                            key={folder._id}
                            className="group overflow-hidden rounded-xl border border-slate-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 bg-white text-left cursor-pointer hover:-translate-y-1 h-full flex flex-col"
                            onClick={() =>
                              navigate(`/video-content?folderId=${folder._id}`)
                            }
                          >
                            <div className="h-40 w-full overflow-hidden bg-slate-100">
                              {folder.coverPhotoUrl ? (
                                <img
                                  src={folder.coverPhotoUrl}
                                  alt={folder.name}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.style.display = "none";
                                    target.parentElement!.style.background =
                                      "linear-gradient(to right, #d1fae5, #a7f3d0)";
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-green-100 to-emerald-100 group-hover:from-green-200 group-hover:to-emerald-200">
                                  <Film className="h-12 w-12 text-green-600" />
                                </div>
                              )}
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                              <h3 className="font-bold text-slate-900 group-hover:text-green-700 text-lg mb-1 line-clamp-1">
                                {folder.name}
                              </h3>
                              <p className="text-slate-600 text-sm">
                                View Video Content
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Audio Content Categories Section - Unified Design */}
                  {filteredAudioContentFolders.length > 0 && (
                    <div className="mb-8 bg-white rounded-2xl shadow-lg p-8 border border-slate-200/50">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h2 className="text-3xl font-bold text-orange-600 flex items-center mb-2">
                            <Music className="h-8 w-8 mr-3" />
                            Audio Content Categories
                          </h2>
                          <p className="text-slate-600 text-lg">
                            Browse and purchase professional audio content
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-slate-700 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
                            {filteredAudioContentFolders.length} categories
                            available
                          </span>
                          <Button
                            onClick={() =>
                              setShowAllAudioContentFolders(
                                !showAllAudioContentFolders,
                              )
                            }
                            variant="outline"
                            className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded-full px-6 py-2 transition-all duration-200 hover:scale-105"
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {showAllAudioContentFolders
                              ? "Show Less"
                              : "See All"}
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {(showAllAudioContentFolders
                          ? filteredAudioContentFolders
                          : filteredAudioContentFolders.slice(0, 5)
                        ).map((folder) => (
                          <div
                            key={folder._id}
                            className="group overflow-hidden rounded-xl border border-slate-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300 bg-white text-left cursor-pointer hover:-translate-y-1 h-full flex flex-col"
                            onClick={() =>
                              navigate(`/audio-content?folderId=${folder._id}`)
                            }
                          >
                            <div className="h-40 w-full overflow-hidden bg-slate-100">
                              {folder.coverPhotoUrl ? (
                                <img
                                  src={folder.coverPhotoUrl}
                                  alt={folder.name}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.style.display = "none";
                                    target.parentElement!.style.background =
                                      "linear-gradient(to right, #fed7aa, #fdba74)";
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-orange-100 to-amber-100 group-hover:from-orange-200 group-hover:to-amber-200">
                                  <Music className="h-12 w-12 text-orange-600" />
                                </div>
                              )}
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                              <h3 className="font-bold text-slate-900 group-hover:text-orange-700 text-lg mb-1 line-clamp-1">
                                {folder.name}
                              </h3>
                              <p className="text-slate-600 text-sm">
                                View Audio Content
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Templates Grid - Unified Design */}
                  {filteredTemplates.length > 0 && (
                    <div className="mb-8 bg-white rounded-2xl shadow-lg p-8 border border-slate-200/50">
                      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                        <Video className="h-6 w-6 mr-2 text-slate-600" />
                        Video Templates
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                        {filteredTemplates.map((template) => (
                          <div
                            key={template._id}
                            className="group bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 overflow-hidden hover:-translate-y-1"
                          >
                            <div className="relative aspect-[4/3] bg-black overflow-hidden">
                              {template.videoUrl ? (
                                <>
                                  <video
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                                    src={template.videoUrl}
                                    muted
                                    loop
                                    playsInline
                                    preload="metadata"
                                    onClick={() =>
                                      openVideoModal(template.videoUrl)
                                    }
                                    onMouseEnter={(e) => {
                                      e.currentTarget.currentTime = 0;
                                      e.currentTarget.play();
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.pause();
                                      e.currentTarget.currentTime = 0;
                                    }}
                                  />
                                </>
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                                  <div className="text-center">
                                    <Video className="h-8 w-8 text-gray-400 mx-auto mb-1" />
                                    <span className="text-gray-400 text-xs">
                                      No preview
                                    </span>
                                  </div>
                                </div>
                              )}
                              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                                Video
                              </div>
                            </div>
                            <div className="p-4">
                              <h3 className="font-semibold text-slate-900 mb-2 line-clamp-1 text-sm">
                                {template.title}
                              </h3>
                              <div className="mb-3">
                                <span className="text-sm font-bold text-slate-900">
                                  ₹
                                  {template.discountPrice || template.basePrice}
                                </span>
                                {template.discountPrice && (
                                  <span className="ml-1 text-xs text-slate-500 line-through">
                                    ₹{template.basePrice}
                                  </span>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    openVideoModal(template.videoUrl)
                                  }
                                  className="flex-1 text-xs py-2 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                                <Button
                                  size="sm"
                                  disabled={isInCart(template._id)}
                                  onClick={() => handleAddToCart(template)}
                                  className="flex-1 text-xs py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg"
                                >
                                  {isInCart(template._id)
                                    ? "In Cart"
                                    : "Add to Cart"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

            {/* Enhanced Folder content (only shown when folder is selected) */}
            {params.get("folderId") && (
              <div className="space-y-8">
                {/* Enhanced Header with Gradient Background */}
                <div className="bg-gradient-to-r from-blue-50 via-white to-purple-50 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-blue-200/50 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-purple-100/20"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">
                          Categories /{" "}
                          {path[path.length - 1]?.name || "Unknown"}
                        </h1>
                        <p className="text-slate-600 text-lg">
                          Explore video templates in this category
                        </p>
                      </div>
                      <Button
                        onClick={() => navigateToFolder("")}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6 py-3 font-semibold"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Categories
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Enhanced Search Bar with Filter */}
                <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-slate-200/50 animate-fade-in">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Search videos in this category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/80 border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500 rounded-xl pl-4 pr-12 h-12"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Filter className="h-5 w-5 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Breadcrumb Navigation */}
                {path.length > 1 && (
                  <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-4 border border-slate-200 mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateToFolder("")}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <Home className="h-4 w-4 mr-1" />
                        Home
                      </Button>
                      {path.slice(1).map((folder, index) => (
                        <React.Fragment key={folder._id}>
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigateToFolder(folder._id)}
                            className="text-slate-600 hover:text-slate-800 p-1"
                          >
                            {folder.name}
                          </Button>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-folders */}
                {filteredFolders.length > 0 && (
                  <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                      <FolderOpen className="h-6 w-6 mr-2 text-blue-600" />
                      {path.length > 1 ? "Sub-categories" : "All Categories"}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {filteredFolders.map((folder) => (
                        <div
                          key={folder._id}
                          className="group p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-lg text-left hover:bg-white/90 transform hover:-translate-y-1"
                        >
                          <div className="flex flex-col items-center text-center">
                            {/* Clickable area for navigation */}
                            <div
                              onClick={() => navigateToFolder(folder._id)}
                              className="cursor-pointer w-full"
                            >
                              <div className="h-16 w-16 rounded-2xl overflow-hidden mb-4 group-hover:scale-110 transition-all duration-300">
                                {folder.coverPhotoUrl ? (
                                  <img
                                    src={folder.coverPhotoUrl}
                                    alt={folder.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : folder.thumbnailUrl ? (
                                  <img
                                    src={folder.thumbnailUrl}
                                    alt={folder.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center text-blue-600 group-hover:from-blue-200 group-hover:to-cyan-200 transition-all duration-300">
                                    <FolderOpen className="h-8 w-8" />
                                  </div>
                                )}
                              </div>
                              <span className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors text-lg">
                                {folder.name}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No sub-folders message */}
                {filteredFolders.length === 0 && path.length > 1 && (
                  <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-slate-200 text-center">
                    <FolderOpen className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">
                      No sub-categories found
                    </h3>
                    <p className="text-slate-500 mb-4">
                      This folder doesn't contain any sub-categories.
                    </p>
                    <Button
                      onClick={() => navigateToFolder("")}
                      variant="outline"
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Back to All Categories
                    </Button>
                  </div>
                )}

                {/* Premium Video Grid */}
                {filteredTemplates.length > 0 && (
                  <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-slate-200/50 animate-scale-in">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                        <Video className="h-6 w-6 mr-3 text-blue-600" />
                        Videos ({filteredTemplates.length})
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                      {filteredTemplates.map((template, index) => (
                        <div
                          key={template._id}
                          className="group bg-white/80 backdrop-blur-lg rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-3 hover:scale-105 hover:bg-white/95 animate-fade-in"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          {/* Video Thumbnail with Hover Play */}
                          <div className="relative aspect-video bg-gradient-to-br from-slate-100 to-slate-200 group overflow-hidden video-container">
                            {template.videoUrl ? (
                              <>
                                <video
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 cursor-pointer"
                                  src={template.videoUrl}
                                  muted
                                  loop
                                  playsInline
                                  preload="metadata"
                                  onMouseEnter={(e) => e.currentTarget.play()}
                                  onMouseLeave={(e) => e.currentTarget.pause()}
                                  onClick={() =>
                                    openVideoModal(template.videoUrl)
                                  }
                                />
                                {/* Play Overlay */}
                                <div
                                  className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer play-overlay"
                                  onClick={() =>
                                    openVideoModal(template.videoUrl)
                                  }
                                >
                                  <div className="bg-white/90 backdrop-blur-lg rounded-full p-3 shadow-xl hover:scale-110 transition-transform duration-200">
                                    <Play className="h-6 w-6 text-blue-600 ml-1" />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                <div className="text-center">
                                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-3 shadow-lg">
                                    <Video className="h-8 w-8 text-blue-600" />
                                  </div>
                                  <span className="text-slate-500 text-sm font-medium">
                                    No preview
                                  </span>
                                </div>
                              </div>
                            )}
                            {/* Video Template Badge */}
                            <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-lg text-white text-xs px-3 py-1.5 rounded-full font-medium">
                              Video Template
                            </div>
                          </div>

                          {/* Card Content */}
                          <div className="p-6">
                            <h3 className="font-bold text-slate-900 mb-3 line-clamp-2 text-lg group-hover:text-blue-700 transition-colors">
                              {template.title}
                            </h3>

                            {/* Price Section */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-2">
                                <span className="text-2xl font-bold text-slate-900">
                                  ₹
                                  {template.discountPrice || template.basePrice}
                                </span>
                                {template.discountPrice && (
                                  <span className="text-sm text-slate-500 line-through">
                                    ₹{template.basePrice}
                                  </span>
                                )}
                              </div>
                              {template.discountPrice && (
                                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                                  SALE
                                </span>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-2">
                              <Button
                                onClick={() =>
                                  openVideoModal(template.videoUrl)
                                }
                                variant="outline"
                                className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                              <Button
                                disabled={isInCart(template._id)}
                                onClick={() => handleAddToCart(template)}
                                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl py-3 font-semibold"
                              >
                                {isInCart(template._id) ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    In Cart
                                  </>
                                ) : (
                                  <>
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    Add to Cart
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Enhanced Empty State */}
                {filteredFolders.length === 0 &&
                  filteredTemplates.length === 0 && (
                    <div className="bg-gradient-to-r from-slate-50 to-blue-50 backdrop-blur-lg rounded-2xl shadow-xl p-16 text-center border border-slate-200/50 animate-fade-in">
                      <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-8 shadow-lg">
                        <FolderOpen className="h-12 w-12 text-blue-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-4">
                        No Content Found
                      </h3>
                      <p className="text-slate-600 text-lg mb-6">
                        This category doesn't have any content yet, or your
                        search didn't match any items.
                      </p>
                      <Button
                        onClick={() => setSearchTerm("")}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        Clear Search
                      </Button>
                    </div>
                  )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Video Modal */}
      <Dialog
        open={!!selectedVideo}
        onOpenChange={() => setSelectedVideo(null)}
      >
        <DialogContent className="max-w-4xl w-full bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Video Preview</DialogTitle>
          </DialogHeader>
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden video-modal">
            {selectedVideo && (
              <video
                className="w-full h-full object-contain"
                src={selectedVideo}
                controls
                autoPlay
                muted
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      <Dialog open={!!selectedQR} onOpenChange={() => setSelectedQR(null)}>
        <DialogContent className="max-w-md w-full bg-white backdrop-blur-lg border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900">
              {selectedQR?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center p-6">
            {selectedQR && (
              <>
                <div className="bg-white p-4 rounded-lg mb-4">
                  <img
                    src={selectedQR.url}
                    alt={`QR Code for ${selectedQR.title}`}
                    className="w-64 h-64 mx-auto"
                  />
                </div>
                <p className="text-slate-700 text-center text-sm">
                  Scan this QR code to access your template
                </p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
