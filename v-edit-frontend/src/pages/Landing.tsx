import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Video,
  Image,
  Film,
  Music,
  Package,
  ShoppingCart,
  Download,
  Sparkles,
  Shield,
  CheckCircle,
  Zap,
  Clock,
  Star,
  Gift,
  FolderOpen,
  Play,
  Headphones,
  ImageIcon,
  TrendingUp,
  Users,
  Award,
  Search,
  Lock,
  CreditCard,
} from "lucide-react";
import Footer from "@/components/Footer";

const categories = [
  {
    icon: Video,
    title: "Video Templates",
    description:
      "Professional video templates with QR codes for seamless integration",
    gradient: "from-blue-500 to-cyan-500",
    features: ["QR Code Integration", "HD Quality", "Easy Customization"],
    color: "blue",
  },
  {
    icon: Image,
    title: "Picture Templates",
    description: "Stunning graphics, illustrations, and photography templates",
    gradient: "from-purple-500 to-pink-500",
    features: ["High Resolution", "Multiple Formats", "Instant Download"],
    color: "purple",
  },
  {
    icon: Film,
    title: "Video Content",
    description: "Ready-to-use standalone video files for any project",
    gradient: "from-green-500 to-teal-500",
    features: ["4K Quality", "Various Categories", "Royalty Free"],
    color: "green",
  },
  {
    icon: Music,
    title: "Audio Content",
    description:
      "Premium music tracks and sound effects for your creative projects",
    gradient: "from-orange-500 to-amber-500",
    features: ["Professional Quality", "Multiple Genres", "Royalty Free"],
    color: "orange",
  },
];

const features = [
  {
    icon: <Package className="w-8 h-8" />,
    title: "Bundle Deals",
    description:
      "Save big with complete collection bundles or buy items individually",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: <Download className="w-8 h-8" />,
    title: "Instant Downloads",
    description:
      "Get immediate access to your purchases with high-speed downloads",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: <FolderOpen className="w-8 h-8" />,
    title: "Organized Collections",
    description: "Browse organized categories and folders for easy discovery",
    gradient: "from-green-500 to-teal-500",
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Secure Payments",
    description: "Safe and secure transactions with Razorpay integration",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    icon: <Search className="w-8 h-8" />,
    title: "Smart Search",
    description: "Find exactly what you need with powerful search and filters",
    gradient: "from-red-500 to-pink-500",
  },
  {
    icon: <Lock className="w-8 h-8" />,
    title: "Lifetime Access",
    description: "Download your purchases anytime from your personal library",
    gradient: "from-indigo-500 to-purple-500",
  },
];

const stats = [
  { number: "1000+", label: "Digital Assets", icon: Package },
  { number: "500+", label: "Happy Customers", icon: Users },
  { number: "4.9/5", label: "Average Rating", icon: Star },
  { number: "24/7", label: "Support Available", icon: Clock },
];

const howItWorks = [
  {
    step: "1",
    title: "Browse Collections",
    description:
      "Explore our vast library of video templates, pictures, videos, and audio",
    icon: Search,
  },
  {
    step: "2",
    title: "Add to Cart",
    description:
      "Select individual items or save with complete bundle collections",
    icon: ShoppingCart,
  },
  {
    step: "3",
    title: "Secure Checkout",
    description:
      "Complete your purchase with secure Razorpay payment processing",
    icon: CreditCard,
  },
  {
    step: "4",
    title: "Instant Download",
    description:
      "Get immediate access and download your assets in high quality",
    icon: Download,
  },
];

const testimonials = [
  {
    name: "Rajesh Kumar",
    role: "Content Creator",
    content:
      "Amazing marketplace! The video templates with QR codes saved me hours of work. High quality and affordable pricing.",
    rating: 5,
    avatar: "RK",
  },
  {
    name: "Priya Sharma",
    role: "Graphic Designer",
    content:
      "The picture templates are absolutely stunning. Great variety and instant downloads make this my go-to resource.",
    rating: 5,
    avatar: "PS",
  },
  {
    name: "Arjun Patel",
    role: "Video Producer",
    content:
      "Bundle deals are incredible value! Got an entire collection of video content at a fraction of the cost.",
    rating: 5,
    avatar: "AP",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />

          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Navigation */}
        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">V-Edit</span>
              </Link>

              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/10"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                    Get Started
                  </Button>
                </Link>
                <Link to="/login/admin">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                  >
                    <Shield className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8"
            >
              <Sparkles className="w-4 h-4 text-yellow-400 mr-2" />
              <span className="text-sm font-medium text-white">
                Premium Digital Marketplace
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6"
            >
              Your Creative Assets
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Marketplace
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 max-w-3xl mx-auto text-xl md:text-2xl text-gray-300 leading-relaxed"
            >
              Discover premium video templates, pictures, video content, and
              audio tracks. Register now to access our exclusive marketplace and
              start browsing collections.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/register" className="w-full sm:w-auto group">
                <Button className="w-full sm:w-auto px-8 py-6 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all duration-300 transform hover:scale-105 shadow-2xl">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto px-8 py-6 text-lg font-semibold border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
                >
                  Sign In to Browse
                </Button>
              </Link>
            </motion.div>

            {/* Information Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 text-center"
            >
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm">
                <Lock className="w-4 h-4 mr-2" />
                Login required to access marketplace
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="flex items-center justify-center mb-3">
                  <stat.icon className="w-8 h-8 text-white/80" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-lg text-white/80">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4"
            >
              Explore Our{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Collections
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="max-w-3xl text-xl text-slate-600 mx-auto"
            >
              Explore what's available in our curated marketplace of premium
              digital assets
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-slate-100 overflow-hidden cursor-default">
                  {/* Background Gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                  />

                  <div className="relative">
                    {/* Icon */}
                    <div
                      className={`inline-flex items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-br ${category.gradient} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <category.icon className="h-8 w-8" />
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-slate-700 transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-slate-600 mb-6 leading-relaxed">
                      {category.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-2 mb-6">
                      {category.features.map((feature) => (
                        <div
                          key={feature}
                          className="flex items-center text-sm text-slate-600"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>

                    {/* Info Badge */}
                    <div className="flex items-center text-sm font-medium text-slate-500">
                      <Lock className="mr-2 h-4 w-4" />
                      Available after login
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bundle Deal CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Link to="/register">
              <Button className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-xl">
                <Gift className="w-5 h-5 mr-2" />
                Register Now - Save up to 50% with Bundles!
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4"
            >
              How It{" "}
              <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                Works
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="max-w-3xl text-xl text-slate-600 mx-auto"
            >
              Get your creative assets in 4 simple steps
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Connector Line */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-purple-200 -ml-4" />
                )}

                <div className="text-center relative z-10">
                  {/* Step Number */}
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl font-bold mb-6 shadow-lg">
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div className="flex items-center justify-center mb-4">
                    <step.icon className="h-8 w-8 text-slate-400" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-slate-600">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4"
            >
              Why Choose{" "}
              <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                V-Edit
              </span>
              ?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="max-w-3xl text-xl text-slate-600 mx-auto"
            >
              Your trusted marketplace for premium digital creative assets
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:border-slate-200"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}
                />
                <div
                  className={`relative flex items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-br ${feature.gradient} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-slate-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4"
            >
              What Our{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Customers Say
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="max-w-2xl text-xl text-slate-600 mx-auto"
            >
              Join thousands of satisfied creators who trust V-Edit
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-slate-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100"
              >
                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-slate-600 mb-6 italic leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-slate-500">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-8">
              <TrendingUp className="w-4 h-4 text-white mr-2" />
              <span className="text-sm font-medium text-white">
                Join 500+ Happy Customers Today
              </span>
            </div>

            <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
              Ready to Elevate Your
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                Creative Projects?
              </span>
            </h2>
            <p className="mt-6 max-w-3xl mx-auto text-xl text-white/90 leading-relaxed">
              Start browsing our premium collection of video templates,
              pictures, video content, and audio. Instant downloads, lifetime
              access, and amazing bundle deals await!
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto group">
                <Button className="w-full sm:w-auto px-10 py-6 text-lg font-semibold bg-white text-purple-600 hover:bg-slate-50 transition-all duration-300 transform hover:scale-105 shadow-2xl">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto px-10 py-6 text-lg font-semibold border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
                >
                  <Lock className="mr-2 h-5 w-5" />
                  Sign In to Access
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
