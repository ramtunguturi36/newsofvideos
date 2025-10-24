import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Home, ChevronRight, ArrowLeft, Search } from "lucide-react";
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
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}

export default function MarketplaceHeader({
  icon: IconComponent,
  title,
  subtitle,
  gradient,
  breadcrumbs = [],
  searchTerm = "",
  onSearchChange,
  searchPlaceholder = "Search...",
}: MarketplaceHeaderProps) {
  const navigate = useNavigate();
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div
        className={`bg-gradient-to-r ${gradient} rounded-3xl p-6 md:p-8 shadow-2xl text-white relative overflow-hidden`}
      >
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
                <h1 className="text-3xl md:text-4xl font-bold mb-1">{title}</h1>
                <p className="text-white/90 text-base md:text-lg">{subtitle}</p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6">
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={localSearchTerm}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-3 bg-white/95 backdrop-blur-sm border-2 border-white/30 rounded-xl text-slate-900 placeholder:text-slate-500 focus:border-white focus:ring-2 focus:ring-white/50 shadow-lg"
              />
            </div>
          </div>

          {/* Navigation Dots (visual indicator) */}
          <div className="flex items-center space-x-2 mt-4">
            <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
            <div className="h-1 w-1 bg-white/60 rounded-full"></div>
            <div className="h-1 w-1 bg-white/40 rounded-full"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
