import React from "react";
import {
  LayoutDashboard,
  Users,
  FileVideo,
  Settings,
  LogOut,
  Package,
  DollarSign,
  BarChart2,
  Ticket,
  Image,
  Video,
  Music,
  Menu,
  X,
} from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
};

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: "/admin",
      badge: "3",
    },
    {
      name: "Templates",
      icon: <FileVideo className="h-5 w-5" />,
      path: "/admin/templates",
      badge: "12",
    },
    {
      name: "Picture Templates",
      icon: <Image className="h-5 w-5" />,
      path: "/admin/picture-templates",
      badge: "8",
    },
    {
      name: "Video Content",
      icon: <Video className="h-5 w-5" />,
      path: "/admin/video-content",
    },
    {
      name: "Audio Content",
      icon: <Music className="h-5 w-5" />,
      path: "/admin/audio-content",
    },
    {
      name: "Coupons",
      icon: <Ticket className="h-5 w-5" />,
      path: "/admin/coupons",
    },
    {
      name: "Users",
      icon: <Users className="h-5 w-5" />,
      path: "/admin/users",
    },
    {
      name: "Analytics",
      icon: <BarChart2 className="h-5 w-5" />,
      path: "/admin/analytics",
    },
    {
      name: "Settings",
      icon: <Settings className="h-5 w-5" />,
      path: "/admin/settings",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-indigo-700 to-indigo-800 text-white transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-indigo-600">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-white flex items-center justify-center">
              <span className="text-indigo-700 font-bold">VE</span>
            </div>
            <span className="text-xl font-semibold">V-Edit Pro</span>
          </div>
          <span className="text-xs bg-indigo-600 px-2 py-1 rounded-full">
            Admin
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:bg-indigo-600 p-1 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-lg mx-2 transition-colors",
                isActive(item.path)
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-indigo-100 hover:bg-indigo-700/50",
              )}
            >
              <span className="mr-3">{item.icon}</span>
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <span className="ml-2 inline-flex items-center justify-center h-5 px-2 text-xs font-semibold rounded-full bg-indigo-500 text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-indigo-600">
          <Button
            variant="ghost"
            className="w-full justify-start text-indigo-100 hover:bg-indigo-700/50 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            <span>Sign out</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              {navItems.find((item) => isActive(item.path))?.name ||
                "Dashboard"}
            </h1>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="relative max-w-md w-full hidden sm:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm"
                />
              </div>

              <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <span className="sr-only">View notifications</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>

              <div className="relative">
                <button className="flex items-center max-w-xs rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                    A
                  </div>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
