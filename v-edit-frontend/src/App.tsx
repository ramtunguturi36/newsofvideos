import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Dashboard from "./pages/admin/Dashboard";
import DashboardHome from "./pages/admin/components/DashboardHome";
import TemplatesManager from "./pages/admin/components/TemplatesManager";
import PictureTemplatesManager from "./pages/admin/components/PictureTemplatesManager";
import VideoContentManager from "./pages/admin/components/VideoContentManager";
import AudioContentManager from "./pages/admin/components/AudioContentManager";
import CouponsManager from "./pages/admin/components/CouponsManager";
import UsersManager from "./pages/admin/components/UsersManager";
import AnalyticsDashboard from "./pages/admin/components/AnalyticsDashboard";
import AdminSettings from "./pages/admin/components/AdminSettings";
import UserLayout from "./pages/user/UserLayout";
import UserDashboard from "./pages/user/UserDashboard";
import Orders from "./pages/user/Orders";
import Settings from "./pages/user/Settings";
import MyPurchases from "./pages/user/MyPurchases";
import PurchasedTemplates from "./pages/user/PurchasedTemplates";
import PurchasedFolders from "./pages/user/PurchasedFolders";
import MyPictureTemplates from "./pages/user/MyPictureTemplates";
import MyPictureFolders from "./pages/user/MyPictureFolders";
import MyVideoFolders from "./pages/user/MyVideoFolders";
import MyAudioFolders from "./pages/user/MyAudioFolders";
import MyVideoContent from "./pages/user/MyVideoContent";
import MyAudioContent from "./pages/user/MyAudioContent";
import VideoTemplatesBrowse from "./pages/VideoTemplatesBrowse";
import PictureFolderMarketplace from "./pages/PictureFolderMarketplace";
import VideoFolderMarketplace from "./pages/VideoFolderMarketplace";
import AudioFolderMarketplace from "./pages/AudioFolderMarketplace";
import PicturesBrowse from "./pages/PicturesBrowse";
import VideoContentBrowse from "./pages/VideoContentBrowse";
import AudioBrowse from "./pages/AudioBrowse";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PaymentSuccess from "./pages/PaymentSuccess";
import Contact from "./pages/Contact";
import { Toaster } from "sonner";

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Admin Route Component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin } = useAuth();
  const location = useLocation();

  if (!isAdmin) {
    return <Navigate to="/user/dashboard" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Toaster
            position="top-right"
            richColors
            toastOptions={{
              style: {
                marginTop: "80px",
              },
            }}
          />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/folders" element={<VideoTemplatesBrowse />} />
            <Route
              path="/picture-folders"
              element={<PictureFolderMarketplace />}
            />
            <Route path="/picture-templates" element={<PicturesBrowse />} />
            <Route path="/video-folders" element={<VideoFolderMarketplace />} />
            <Route path="/video-content" element={<VideoContentBrowse />} />
            <Route path="/audio-folders" element={<AudioFolderMarketplace />} />
            <Route path="/audio-content" element={<AudioBrowse />} />
            <Route path="/login" element={<Login />} />
            <Route path="/login/admin" element={<AdminLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/contact" element={<Contact />} />

            {/* User routes */}
            <Route
              path="/user"
              element={
                <ProtectedRoute>
                  <UserLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="explorer" element={<div>Template Explorer</div>} />
              <Route path="orders" element={<Orders />} />
              <Route path="my-purchases" element={<MyPurchases />} />
              <Route path="purchased" element={<PurchasedTemplates />} />
              <Route path="folders" element={<PurchasedFolders />} />
              <Route
                path="picture-templates"
                element={<MyPictureTemplates />}
              />
              <Route path="picture-folders" element={<MyPictureFolders />} />
              <Route path="video-folders" element={<MyVideoFolders />} />
              <Route path="video-content" element={<MyVideoContent />} />
              <Route path="audio-folders" element={<MyAudioFolders />} />
              <Route path="audio-content" element={<MyAudioContent />} />
              <Route path="settings/*" element={<Settings />} />
            </Route>

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <Dashboard />
                  </AdminRoute>
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="templates" element={<TemplatesManager />} />
              <Route
                path="picture-templates"
                element={<PictureTemplatesManager />}
              />
              <Route path="video-content" element={<VideoContentManager />} />
              <Route path="audio-content" element={<AudioContentManager />} />
              <Route path="coupons" element={<CouponsManager />} />
              <Route path="users" element={<UsersManager />} />
              <Route path="analytics" element={<AnalyticsDashboard />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
