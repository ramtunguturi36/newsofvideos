import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Home,
  ChevronRight,
  Package,
  ShoppingBag,
  ArrowLeft,
} from "lucide-react";
import { motion } from "framer-motion";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface MarketplaceHeaderProps {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  gradient: string;
  breadcrumbs?: BreadcrumbItem[];
  showQuickLinks?: boolean;
}

export default function MarketplaceHeader({
  icon: IconComponent,
  title,
  subtitle,
  gradient,
  breadcrumbs = [],
  showQuickLinks = true,
}: MarketplaceHeaderProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className={`bg-gradient-to-r ${gradient} rounded-3xl p-6 md:p-8 shadow-2xl text-white relative overflow-hidden`}>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

        <div className="relative z-10">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-between mb-6">
            <nav className="flex items-center space-x-2 text-sm">
              <Link
                to="/user/dashboard"
                className="flex items-center space-x-1 hover:bg-white/20 rounded-lg px-3 py-2 transition-colors"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  <ChevronRight className="h-4 w-4 opacity-60" />
                  {crumb.href ? (
                    <Link
                      to={crumb.href}
                      className="hover:bg-white/20 rounded-lg px-3 py-2 transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="bg-white/20 rounded-lg px-3 py-2 font-medium">
                      {crumb.label}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </nav>

            {/* Mobile back button */}
            <Button
              onClick={() => navigate("/user/dashboard")}
              variant="ghost"
              size="sm"
              className="sm:hidden text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Title Section */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <IconComponent className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-1">
                  {title}
                </h1>
                <p className="text-white/90 text-base md:text-lg">
                  {subtitle}
                </p>
              </div>
            </div>

            {/* Quick Action Links */}
            {showQuickLinks && (
              <div className="flex flex-wrap gap-2">
                <Link to="/user/my-purchases">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm rounded-full"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">My Purchases</span>
                  </Button>
                </Link>
                <Link to="/user/orders">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm rounded-full"
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Orders</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Navigation Dots (visual indicator) */}
          <div className="flex items-center space-x-2 mt-6">
            <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
            <div className="h-1 w-1 bg-white/60 rounded-full"></div>
            <div className="h-1 w-1 bg-white/40 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Category Tags / Info Bar */}
      <div className="mt-4 flex items-center justify-between bg-white rounded-2xl p-4 shadow-lg border-2 border-slate-100">
        <div className="flex items-center space-x-4 text-sm text-slate-600">
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${gradient}`}></div>
            <span className="font-medium">Browse & Purchase</span>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <span className="text-slate-400">•</span>
            <span>Instant access after purchase</span>
          </div>
        </div>
        <div className="text-xs text-slate-500 hidden sm:block">
          Need help? Check our <Link to="#" className="text-purple-600 hover:underline">guide</Link>
        </div>
      </div>
    </motion.div>
  );
}
