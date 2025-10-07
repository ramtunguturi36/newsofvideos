import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link, Outlet, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  Image
} from 'lucide-react';
import { useCart } from "@/context/CartContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import CartDrawer from "@/components/CartDrawer";
import { Skeleton } from "@/components/ui/skeleton";
import { getHierarchy, getPictureHierarchy, backend } from "@/lib/backend";
import type { Folder, TemplateItem, PictureFolder, PictureTemplate } from "@/lib/types";
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

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

// Stats card component
function StatCard({ title, value, icon: Icon, trend, trendText, description, className = '' }: { 
  title: string; 
  value: string | number;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendText?: string;
  description?: string;
  className?: string;
}) {
  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-gray-500'
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→'
  };

  return (
    <Card className={`bg-white/80 backdrop-blur-lg border border-slate-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/90 ${className}`}>
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

// Navigation items
const navItems = [
  { 
    name: 'Dashboard', 
    icon: LayoutDashboard, 
    path: '/user/dashboard',
    description: 'Your personalized dashboard overview',
    category: 'main'
  },
  { 
    name: 'Templates', 
    icon: ShoppingBasket, 
    path: '/user/dashboard',
    description: 'Browse and manage templates',
    category: 'main'
  },
  { 
    name: 'Folder Store', 
    icon: ShoppingCart, 
    path: '/folders',
    description: 'Buy complete template collections',
    badge: 'Hot',
    category: 'main'
  },
  { 
    name: 'Picture Templates', 
    icon: Image, 
    path: '/picture-templates',
    description: 'Browse and purchase picture templates',
    badge: 'New',
    category: 'main'
  },
  { 
    name: 'Picture Folders', 
    icon: FolderIcon, 
    path: '/picture-folders',
    description: 'Browse and purchase picture collections',
    badge: 'New',
    category: 'main'
  },
  { 
    name: 'Order History', 
    icon: History, 
    path: '/user/orders',
    description: 'View your purchase history',
    badge: 'New',
    category: 'purchases'
  },
  { 
    name: 'My Purchases', 
    icon: CheckCircle, 
    path: '/user/purchased',
    description: 'Access your purchased templates',
    category: 'purchases'
  },
  { 
    name: 'My Folders', 
    icon: FolderIcon, 
    path: '/user/folders',
    description: 'Access your purchased folder collections',
    category: 'purchases'
  },
  { 
    name: 'My Picture Templates', 
    icon: Image, 
    path: '/user/picture-templates',
    description: 'Access your purchased picture templates',
    category: 'purchases'
  },
  { 
    name: 'My Picture Folders', 
    icon: FolderIcon, 
    path: '/user/picture-folders',
    description: 'Access your purchased picture folder collections',
    category: 'purchases'
  },
  { 
    name: 'Settings', 
    icon: SettingsIcon, 
    path: '/user/settings',
    description: 'Account and app settings',
    category: 'account'
  },
  { 
    name: 'Help & Support', 
    icon: HelpCircle, 
    path: '/contact',
    description: 'Get help and support',
    category: 'account'
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
  const [purchasedTemplates, setPurchasedTemplates] = useState<Set<string>>(new Set());
  
  // Picture template states
  const [pictureFolders, setPictureFolders] = useState<ExtendedPictureFolder[]>([]);
  const [pictureTemplates, setPictureTemplates] = useState<ExtendedPictureTemplate[]>([]);
  const [picturePath, setPicturePath] = useState<ExtendedPictureFolder[]>([]);
  const [purchasedPictureTemplates, setPurchasedPictureTemplates] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedQR, setSelectedQR] = useState<{ url: string; title: string } | null>(null);
  const location = useLocation();

  const openVideoModal = (videoUrl: string) => {
    setSelectedVideo(videoUrl);
  };

  const openQRModal = (qrUrl: string, title: string) => {
    setSelectedQR({ url: qrUrl, title });
  };

  // Filter templates and folders based on search term
  const filteredTemplates = templates.filter(template =>
    template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter picture templates and folders based on search term
  const filteredPictureTemplates = pictureTemplates.filter(template =>
    template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPictureFolders = pictureFolders.filter(folder =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  
  // Mock user data - replace with actual auth context
  const { user, logout } = useAuth() || { user: { name: 'John Doe', email: 'john@example.com' }, logout: () => {} };
  const { items: cartItems = [], addItem } = useCart() || {};
  
  // Load ownership data on component mount
  useEffect(() => {
    console.log('🏠 UserDashboard mounted, loading ownership data...');
    console.log('🏠 Refresh flag status:', localStorage.getItem('refreshOrders'));
    console.log('🏠 Search params:', params.toString());
    
    const loadOwnershipData = async () => {
      try {
        console.log('🔄 Fetching purchases for ownership data...');
        console.log('🔄 Making API call to /api/purchases');
        
        const response = await backend.get('/purchases');
        
        console.log('✅ Purchases API response status:', response.status);
        console.log('✅ Purchases API response data:', response.data);
        
        const purchases = response.data.purchases || [];
        console.log('✅ Purchases array length:', purchases.length);
        
        // Get all unique template IDs from purchases
        console.log('🔄 Processing purchases to extract template IDs...');
        const templateIds = Array.from(new Set(
          purchases.flatMap(purchase => {
            console.log('🔄 Processing purchase:', purchase._id);
            console.log('🔄 Purchase items:', purchase.items);
            return purchase.items
              .filter((item: any) => {
                console.log('🔄 Checking item:', item);
                console.log('🔄 Item type:', item.type);
                console.log('🔄 Item templateId:', item.templateId);
                return item.type === 'template' && item.templateId;
              })
              .map((item: any) => {
                console.log('✅ Adding template ID:', item.templateId);
                return item.templateId;
              });
          })
        ));

        // Get all unique picture template IDs from purchases
        console.log('🔄 Processing purchases to extract picture template IDs...');
        const pictureTemplateIds = Array.from(new Set(
          purchases.flatMap(purchase => {
            return purchase.items
              .filter((item: any) => {
                return item.type === 'picture-template' && item.templateId;
              })
              .map((item: any) => {
                console.log('✅ Adding picture template ID:', item.templateId);
                return item.templateId;
              });
          })
        ));
        
        console.log('✅ All purchases processed:', purchases);
        console.log('✅ Extracted template IDs from purchases:', templateIds);
        console.log('✅ Template IDs count:', templateIds.length);
        console.log('✅ Extracted picture template IDs from purchases:', pictureTemplateIds);
        console.log('✅ Picture template IDs count:', pictureTemplateIds.length);
        
        setPurchasedTemplates(new Set(templateIds));
        setPurchasedPictureTemplates(new Set(pictureTemplateIds));
        console.log('✅ Initial ownership data loaded:', templateIds);
        console.log('✅ Initial picture ownership data loaded:', pictureTemplateIds);
        
        // Check if refresh flag is set and clear it
        if (localStorage.getItem('refreshOrders') === 'true') {
          console.log('🔄 Refresh flag detected on mount, clearing it...');
          localStorage.removeItem('refreshOrders');
        }
        
        console.log('✅ Ownership data loading completed successfully');
      } catch (err) {
        console.error('❌ Error loading ownership data:', err);
        console.error('❌ Error details:', {
          message: (err as Error).message,
          stack: (err as Error).stack,
          name: (err as Error).name
        });
      }
    };

    console.log('🚀 Starting loadOwnershipData...');
    loadOwnershipData();
  }, []);

  // Listen for refresh flag from payment success
  useEffect(() => {
    console.log('Setting up refresh listener...');
    const handleStorageChange = () => {
      console.log('Storage change detected, checking refresh flag...');
      if (localStorage.getItem('refreshOrders') === 'true') {
        console.log('Refreshing ownership data after payment...');
        const refreshOwnership = async () => {
          try {
            const response = await backend.get('/purchases');
            const purchases = response.data.purchases || [];
            
            // Get all unique template IDs from purchases
            const templateIds = Array.from(new Set(
              purchases.flatMap(purchase => 
                purchase.items
                  .filter((item: any) => item.type === 'template' && item.templateId)
                  .map((item: any) => item.templateId)
              )
            ));

            // Get all unique picture template IDs from purchases
            const pictureTemplateIds = Array.from(new Set(
              purchases.flatMap(purchase => 
                purchase.items
                  .filter((item: any) => item.type === 'picture-template' && item.templateId)
                  .map((item: any) => item.templateId)
              )
            ));
            
            setPurchasedTemplates(new Set(templateIds));
            setPurchasedPictureTemplates(new Set(pictureTemplateIds));
            console.log('Ownership data refreshed:', templateIds);
            console.log('Picture ownership data refreshed:', pictureTemplateIds);
          } catch (err) {
            console.error('Error refreshing ownership data:', err);
          }
        };
        refreshOwnership();
        
        localStorage.removeItem('refreshOrders');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Load folder contents
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const folderId = params.get('folderId') || undefined;
        const data = await getHierarchy(folderId);
        
        setFolders(data.folders as ExtendedFolder[]);
        setTemplates(data.templates as ExtendedTemplateItem[]);
        setPath(data.path || [{ _id: 'root', name: 'Home', parentId: null }]);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load content');
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
        setPicturePath(data.path || [{ _id: 'root', name: 'Home', parentId: null }]);
      } catch (error) {
        console.error('Error loading picture data:', error);
      }
    };

    loadPictureData();
  }, []);

  // Check if item is in cart
  const isInCart = (id: string): boolean => {
    return cartItems?.some((item: { id: string; type: string }) => item.id === id && item.type === 'template') || false;
  };

  // Add to cart handler
  const handleAddToCart = (template: ExtendedTemplateItem) => {
    if (!addItem) return;
    
    addItem({
      id: template._id,
      type: 'template',
      title: template.title,
      price: template.discountPrice || template.basePrice,
      data: template
    });
    
    toast.success('Added to cart');
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
      navigate('/login');
      toast.success('Successfully logged out');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to log out. Please try again.');
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 text-slate-900 flex">
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMobileMenu}
          className="bg-white/90 backdrop-blur-lg border-slate-200 text-slate-700 hover:bg-white shadow-lg"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 bg-white/95 backdrop-blur-lg border-r border-slate-200 shadow-xl transform transition-transform duration-300 ease-in-out",
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0 md:static md:flex-shrink-0'
        )}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-slate-200">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              V-Edit Pro
            </h1>
            <p className="text-sm text-slate-600 mt-1">Video Template Marketplace</p>
          </div>
          
          {/* User profile */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden flex-1">
                <p className="font-semibold text-slate-900 truncate text-sm">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-600 truncate">{user?.email || 'user@example.com'}</p>
              </div>
              <button 
                onClick={() => navigate('/user/settings')} 
                className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                title="Settings"
              >
                <SettingsIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">
              {/* Main Navigation */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
                  Main
                </h4>
                <ul className="space-y-1">
                  {navItems.filter(item => item.category === 'main').map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.path}
                        onClick={closeMobileMenu}
                        className={cn(
                          'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-300',
                          location.pathname === item.path
                            ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:shadow-sm'
                        )}
                      >
                        <div className="relative">
                          <item.icon className="h-4 w-4 mr-3" />
                          {item.badge && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <span>{item.name}</span>
                          {location.pathname === item.path && (
                            <span className="h-1.5 w-1.5 rounded-full bg-white ml-2"></span>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Purchases Section */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
                  Purchases
                </h4>
                <ul className="space-y-1">
                  {navItems.filter(item => item.category === 'purchases').map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.path}
                        onClick={closeMobileMenu}
                        className={cn(
                          'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-300',
                          location.pathname === item.path
                            ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:shadow-sm'
                        )}
                      >
                        <div className="relative">
                          <item.icon className="h-4 w-4 mr-3" />
                          {item.badge && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <span>{item.name}</span>
                          {location.pathname === item.path && (
                            <span className="h-1.5 w-1.5 rounded-full bg-white ml-2"></span>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Account Section */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
                  Account
                </h4>
                <ul className="space-y-1">
                  {navItems.filter(item => item.category === 'account').map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.path}
                        onClick={closeMobileMenu}
                        className={cn(
                          'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-300',
                          location.pathname === item.path
                            ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:shadow-sm'
                        )}
                      >
                        <div className="relative">
                          <item.icon className="h-4 w-4 mr-3" />
                          {item.badge && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <span>{item.name}</span>
                          {location.pathname === item.path && (
                            <span className="h-1.5 w-1.5 rounded-full bg-white ml-2"></span>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </nav>
          
          {/* Logout button */}
          <div className="p-4 border-t border-slate-200 mt-auto">
            <button
              onClick={confirmLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing out...
                </>
              ) : (
                <>
                  <LogOut className="h-5 w-5 mr-2" />
                  Sign Out
                </>
              )}
            </button>

            {/* Logout Confirmation Dialog */}
            {showLogoutConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign out</h3>
                  <p className="text-gray-600 mb-6">Are you sure you want to sign out?</p>
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
                      {isLoggingOut ? 'Signing out...' : 'Sign out'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

        {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        {/* Top bar */}
        <header className="bg-white/90 backdrop-blur-lg border-b border-slate-200 shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900">
                {params.get('folderId') ? 'Categories' : (navItems.find(item => location.pathname === item.path)?.name || 'Dashboard')}
              </h1>
              {params.get('folderId') && (
                <div className="flex items-center text-sm text-slate-600 mt-1">
                  <Home className="h-4 w-4 mr-1" />
                  {path.map((folder, index) => (
                    <React.Fragment key={folder._id}>
                      <button
                        onClick={() => navigateToFolder(folder.parentId || '')}
                        className="hover:text-slate-900 transition-colors"
                      >
                        {folder.name}
                      </button>
                      {index < path.length - 1 && <ChevronRight className="h-4 w-4 mx-1" />}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCartOpen(true)}
                className="p-2 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 relative transition-all duration-300"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </button>
              
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center text-white font-medium">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <ChevronDown className={`h-4 w-4 text-slate-600 transition-transform ${userMenuOpen ? 'transform rotate-180' : ''}`} />
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-lg rounded-xl shadow-lg py-1 z-50 border border-slate-200">
                    <div className="px-4 py-3 border-b border-slate-200">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center text-white font-medium mr-3">
                          {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{user?.name || 'User'}</p>
                          <p className="text-xs text-slate-600 truncate">{user?.email || 'user@example.com'}</p>
                        </div>
                      </div>
                    </div>
                    <Link
                      to="/user/settings"
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Your Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
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
            {location.pathname === '/user/dashboard' && !params.get('folderId') && (
              <>
                {/* Welcome section */}
                <div className="bg-white backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-slate-200">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent mb-3">
                        Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
                      </h2>
                      <p className="text-slate-700 text-lg mb-4">Here's what's happening with your account today.</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Account Active
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          <Star className="h-3 w-3 mr-1" />
                          Pro Member
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                          <Bell className="h-3 w-3 mr-1" />
                          3 New Notifications
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-6">
                      <div className="bg-white/80 rounded-xl p-4 border border-slate-200">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-slate-900">{purchasedTemplates.size}</div>
                          <div className="text-sm text-slate-600">Templates Owned</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>





                {/* Picture Folder Store CTA */}
                <div className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 backdrop-blur-lg rounded-2xl p-6 border border-purple-200 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-4">
                        <FolderOpen className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Picture Collections</h3>
                        <p className="text-slate-600">Buy complete picture collections at discounted prices</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => navigate('/picture-folders')}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Browse Collections
                    </Button>
                  </div>
                </div>

                {/* Video Categories Section - Highlighted */}
                {filteredFolders.length > 0 && (
                  <div className="mb-8 bg-gradient-to-r from-blue-50 to-cyan-50 backdrop-blur-lg rounded-2xl p-8 border border-blue-200 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-3xl font-bold text-slate-900 flex items-center">
                        <FolderOpen className="h-8 w-8 mr-3 text-blue-600" />
                        Video Categories
                      </h2>
                      <span className="text-sm text-slate-700 bg-white/80 px-4 py-2 rounded-full border border-slate-200">
                        {filteredFolders.length} categories available
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                      {filteredFolders.map((folder) => (
                        <div
                          key={folder._id}
                          className="group p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-lg text-left hover:bg-white/90 transform hover:-translate-y-1"
                        >
                          {/* Clickable area for navigation */}
                          <div 
                            onClick={() => navigateToFolder(folder._id)}
                            className="cursor-pointer"
                          >
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center text-blue-600 mb-4 group-hover:from-blue-200 group-hover:to-cyan-200 transition-all duration-300 group-hover:scale-110">
                              <FolderOpen className="h-8 w-8" />
                            </div>
                            <h3 className="font-semibold text-slate-900 group-hover:text-blue-700 text-lg">{folder.name}</h3>
                            <p className="text-sm text-slate-600 mt-1">View templates</p>
                          </div>
                          
                                </div>
                      ))}
                    </div>
                                  </div>
                                )}

                {/* Picture Categories Section - Highlighted */}
                {filteredPictureFolders.length > 0 && (
                  <div className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 backdrop-blur-lg rounded-2xl p-8 border border-purple-200 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-3xl font-bold text-slate-900 flex items-center">
                        <Image className="h-8 w-8 mr-3 text-purple-600" />
                        Picture Categories
                      </h2>
                      <span className="text-sm text-slate-700 bg-white/80 px-4 py-2 rounded-full border border-slate-200">
                        {filteredPictureFolders.length} categories available
                      </span>
                              </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                      {filteredPictureFolders.map((folder) => (
                        <div
                          key={folder._id}
                          className="group p-6 rounded-2xl border border-slate-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-lg text-left hover:bg-white/90 transform hover:-translate-y-1"
                        >
                          {/* Clickable area for navigation */}
                          <div 
                            onClick={() => navigate('/picture-templates')}
                            className="cursor-pointer"
                          >
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center text-purple-600 mb-4 group-hover:from-purple-200 group-hover:to-pink-200 transition-all duration-300 group-hover:scale-110">
                              <Image className="h-8 w-8" />
                            </div>
                            <h3 className="font-semibold text-slate-900 group-hover:text-purple-700 text-lg">{folder.name}</h3>
                            <p className="text-sm text-slate-600 mt-1">View pictures</p>
                          </div>
                          
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Templates Grid */}
                {filteredTemplates.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                      <Video className="h-6 w-6 mr-2 text-indigo-600" />
                      Video Templates
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                      {filteredTemplates.map((template) => (
                        <div
                          key={template._id}
                          className="group bg-white/80 backdrop-blur-lg rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 overflow-hidden transform hover:-translate-y-1 hover:bg-white/90"
                        >
                          <div className="relative aspect-[4/3] bg-black overflow-hidden">
                            {template.videoUrl ? (
                              <>
                                <video
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  src={template.videoUrl}
                                  muted
                                  loop
                                  playsInline
                                  controls
                                  preload="metadata"
                                  onMouseEnter={(e) => {
                                    e.currentTarget.currentTime = 0;
                                    e.currentTarget.play();
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.pause();
                                    e.currentTarget.currentTime = 0;
                                  }}
                                />
                                <div className="absolute top-2 right-2">
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    className="bg-white/90 hover:bg-white text-gray-700 shadow-lg"
                                    onClick={() => openVideoModal(template.videoUrl)}
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                                <div className="text-center">
                                  <Video className="h-8 w-8 text-gray-400 mx-auto mb-1" />
                                  <span className="text-gray-400 text-xs">No preview</span>
                                </div>
                              </div>
                            )}
                            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                              Video
                            </div>
                          </div>
                          <div className="p-3">
                            <h3 className="font-semibold text-slate-900 mb-1 line-clamp-1 text-sm">
                              {template.title}
                            </h3>
                            <div className="mb-2">
                              <span className="text-sm font-bold text-green-400">
                                ₹{template.discountPrice || template.basePrice}
                              </span>
                              {template.discountPrice && (
                                <span className="ml-1 text-xs text-slate-500 line-through">
                                  ₹{template.basePrice}
                                </span>
                              )}
                            </div>
                            
                            {/* Action Buttons */}
                                <Button
                                  size="sm"
                              disabled={isInCart(template._id)}
                              onClick={() => handleAddToCart(template)}
                              className="w-full text-xs py-1.5"
                                >
                              {isInCart(template._id) ? 'In Cart' : 'Add to Cart'}
                                </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Picture Templates Grid */}
                {filteredPictureTemplates.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                      <Image className="h-6 w-6 mr-2 text-purple-600" />
                      Picture Templates
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                      {filteredPictureTemplates.map((template) => (
                        <div
                          key={template._id}
                          className="group bg-white/80 backdrop-blur-lg rounded-xl border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 overflow-hidden transform hover:-translate-y-1 hover:bg-white/90"
                        >
                          <div className="relative aspect-[4/3] bg-black overflow-hidden cursor-pointer"
                               onClick={() => window.open(template.previewImageUrl, '_blank')}>
                            {template.previewImageUrl ? (
                              <>
                                <img
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  src={template.previewImageUrl}
                                  alt={template.title}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="bg-white/90 rounded-full p-2 shadow-lg">
                                      <Eye className="h-4 w-4 text-gray-700" />
                              </div>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                                <div className="text-center">
                                  <Image className="h-8 w-8 text-gray-400 mx-auto mb-1" />
                                  <span className="text-gray-400 text-xs">No preview</span>
                                </div>
                              </div>
                            )}
                            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                              Picture
                            </div>
                          </div>
                          <div className="p-3">
                            <h3 className="font-semibold text-slate-900 mb-1 line-clamp-1 text-sm">
                              {template.title}
                            </h3>
                            <div className="mb-2">
                              <span className="text-sm font-bold text-green-400">
                                ₹{template.discountPrice || template.basePrice}
                              </span>
                              {template.discountPrice && (
                                <span className="ml-1 text-xs text-slate-500 line-through">
                                  ₹{template.basePrice}
                                </span>
                              )}
                            </div>
                            
                            {/* Action Buttons */}
                              <Button
                                size="sm"
                                disabled={isInCart(template._id)}
                              onClick={() => {
                                if (!addItem) return;
                                addItem({
                                  id: template._id,
                                  type: 'picture-template',
                                  title: template.title,
                                  price: template.discountPrice || template.basePrice,
                                  data: template
                                });
                                toast.success('Added to cart');
                              }}
                                className="w-full text-xs py-1.5"
                              >
                                {isInCart(template._id) ? 'In Cart' : 'Add to Cart'}
                              </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Folder content (only shown when folder is selected) */}
            {params.get('folderId') && (
              <div className="space-y-6">
                {/* Search bar for folder content */}
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-slate-200">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search videos in this category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <Button
                      onClick={() => navigateToFolder('')}
                      variant="outline"
                      className="flex items-center bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Back to Categories
                    </Button>
                  </div>
                </div>

                {/* Sub-folders */}
                {filteredFolders.length > 0 && (
                  <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                      <FolderOpen className="h-6 w-6 mr-2 text-blue-600" />
                      Sub-categories
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
                              <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center text-blue-600 mb-4 group-hover:from-blue-200 group-hover:to-cyan-200 transition-all duration-300 group-hover:scale-110">
                                <FolderOpen className="h-8 w-8" />
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

                {/* Templates in folder */}
                {filteredTemplates.length > 0 && (
                  <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                      <Video className="h-6 w-6 mr-2 text-blue-600" />
                      Videos ({filteredTemplates.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredTemplates.map((template) => (
                        <div
                          key={template._id}
                          className="group bg-white/80 backdrop-blur-lg rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 hover:bg-white/90"
                        >
                          <div className="relative aspect-video bg-gray-100 group overflow-hidden">
                            {template.videoUrl ? (
                              <>
                                <video
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  src={template.videoUrl}
                                  muted
                                  loop
                                  playsInline
                                  controls
                                  preload="metadata"
                                  onMouseEnter={(e) => e.currentTarget.play()}
                                  onMouseLeave={(e) => e.currentTarget.pause()}
                                />
                                <div className="absolute top-2 right-2">
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    className="bg-white/90 hover:bg-white text-gray-700 shadow-lg"
                                    onClick={() => openVideoModal(template.videoUrl)}
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                <div className="text-center">
                                  <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center mx-auto mb-2">
                                    <ImageIcon className="h-6 w-6 text-gray-500" />
                                  </div>
                                  <span className="text-gray-500 text-sm">No preview</span>
                                </div>
                              </div>
                            )}
                            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              Video Template
                            </div>
                          </div>
                          <div className="p-6">
                            <h4 className="font-bold text-slate-900 mb-3 line-clamp-2 text-lg">
                              {template.title}
                            </h4>
                            <p className="text-sm text-slate-700 mb-4 line-clamp-2">
                              {template.description}
                            </p>
                            <div className="mt-4 flex items-center justify-between">
                              <div>
                                <span className="text-xl font-bold text-slate-900">
                                  ₹{template.discountPrice || template.basePrice}
                                </span>
                                {template.discountPrice && (
                                  <span className="ml-2 text-sm text-slate-500 line-through">
                                    ₹{template.basePrice}
                                  </span>
                                )}
                              </div>
                              <Button
                                size="sm"
                                disabled={isInCart(template._id)}
                                onClick={() => handleAddToCart(template)}
                                className="whitespace-nowrap bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                              >
                                {isInCart(template._id) ? 'In Cart' : 'Add to Cart'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {filteredFolders.length === 0 && filteredTemplates.length === 0 && (
                  <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-12 text-center border border-slate-200">
                    <FolderOpen className="h-16 w-16 text-slate-400 mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Empty Category</h3>
                    <p className="text-slate-600 text-lg">This category doesn't have any content yet.</p>
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
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl w-full bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Video Preview</DialogTitle>
          </DialogHeader>
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
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
            <DialogTitle className="text-slate-900">{selectedQR?.title}</DialogTitle>
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