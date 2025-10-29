import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Database,
  Users,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AdminSettings = () => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showConfirmUsersModal, setShowConfirmUsersModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [confirmUsersText, setConfirmUsersText] = useState("");
  const [isClearing, setIsClearing] = useState(false);
  const [isClearingUsers, setIsClearingUsers] = useState(false);

  const handleClearPurchases = async () => {
    if (confirmText !== "CLEAR ALL PURCHASES") {
      toast.error("Please type the confirmation text correctly");
      return;
    }

    setIsClearing(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${API_URL}/api/admin/purchases/clear-all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      toast.success(
        `✅ Successfully cleared ${response.data.deletedCount} purchase records!`,
      );
      setShowConfirmModal(false);
      setConfirmText("");
    } catch (error: any) {
      console.error("Error clearing purchases:", error);
      toast.error(error.response?.data?.message || "Failed to clear purchases");
    } finally {
      setIsClearing(false);
    }
  };

  const handleClearUsers = async () => {
    if (confirmUsersText !== "CLEAR ALL USERS") {
      toast.error("Please type the confirmation text correctly");
      return;
    }

    setIsClearingUsers(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${API_URL}/api/admin/users/clear-all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      toast.success(
        `✅ Successfully cleared ${response.data.deletedCount} user accounts!`,
      );
      setShowConfirmUsersModal(false);
      setConfirmUsersText("");
    } catch (error: any) {
      console.error("Error clearing users:", error);
      toast.error(error.response?.data?.message || "Failed to clear users");
    } finally {
      setIsClearingUsers(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
          <Settings className="h-7 w-7 sm:h-8 sm:w-8 mr-3 text-indigo-600" />
          Admin Settings
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage system settings and data operations
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 p-6 rounded-lg border border-blue-200"
        >
          <div className="flex items-center mb-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <Database className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Database Operations
          </h3>
          <p className="text-sm text-gray-600">
            Manage and maintain your database records
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-green-50 p-6 rounded-lg border border-green-200"
        >
          <div className="flex items-center mb-3">
            <div className="bg-green-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            User Data Safe
          </h3>
          <p className="text-sm text-gray-600">
            All user accounts remain intact and unaffected
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-amber-50 p-6 rounded-lg border border-amber-200"
        >
          <div className="flex items-center mb-3">
            <div className="bg-amber-100 p-3 rounded-full">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Use with Caution
          </h3>
          <p className="text-sm text-gray-600">
            These operations cannot be undone
          </p>
        </motion.div>
      </div>

      {/* Clear Purchases Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-red-50 border-b border-red-200 p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-semibold text-red-900">
                Danger Zone
              </h3>
              <p className="mt-1 text-sm text-red-700">
                Irreversible operations that affect your system data
              </p>
            </div>
          </div>
        </div>

        {/* Clear Users Section */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-red-50 border-b border-red-200 p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-semibold text-red-900">
                  User Management - Danger Zone
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  Clear all registered user accounts (Admin accounts are safe)
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <Users className="h-5 w-5 text-gray-500 mr-2" />
                  <h4 className="text-lg font-semibold text-gray-900">
                    Clear All Registered Users
                  </h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Remove all registered user accounts from the database. This
                  will delete user profiles and registration data.
                </p>
                <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    What will be cleared:
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1 ml-4 list-disc">
                    <li>All user accounts (role: user)</li>
                    <li>User profiles and registration data</li>
                    <li>User login credentials</li>
                    <li>User settings and preferences</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-3 rounded-md border border-green-200 mt-2">
                  <p className="text-xs font-medium text-green-700 mb-2">
                    What will be preserved:
                  </p>
                  <ul className="text-xs text-green-600 space-y-1 ml-4 list-disc">
                    <li>Admin accounts (safe from deletion)</li>
                    <li>Templates and content files</li>
                    <li>Product catalogs</li>
                    <li>System settings</li>
                  </ul>
                </div>
                <div className="bg-amber-50 p-3 rounded-md border border-amber-200 mt-2">
                  <p className="text-xs font-medium text-amber-700 mb-2">
                    ⚠️ Note:
                  </p>
                  <p className="text-xs text-amber-600">
                    Purchase history will remain in database. Clear purchases
                    separately if needed.
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <Button
                  onClick={() => setShowConfirmUsersModal(true)}
                  variant="destructive"
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Users
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <ShoppingCart className="h-5 w-5 text-gray-500 mr-2" />
                <h4 className="text-lg font-semibold text-gray-900">
                  Clear All Purchase Records
                </h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Remove all purchase history and statistics from the database.
                This will reset your revenue analytics and purchase data.
              </p>
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <p className="text-xs font-medium text-gray-700 mb-2">
                  What will be cleared:
                </p>
                <ul className="text-xs text-gray-600 space-y-1 ml-4 list-disc">
                  <li>All purchase orders and transactions</li>
                  <li>Revenue statistics and analytics</li>
                  <li>Purchase history for all users</li>
                  <li>Downloaded content access records</li>
                </ul>
              </div>
              <div className="bg-green-50 p-3 rounded-md border border-green-200 mt-2">
                <p className="text-xs font-medium text-green-700 mb-2">
                  What will be preserved:
                </p>
                <ul className="text-xs text-green-600 space-y-1 ml-4 list-disc">
                  <li>All user accounts and profiles</li>
                  <li>User registration data</li>
                  <li>Templates and content files</li>
                  <li>Admin accounts and settings</li>
                </ul>
              </div>
            </div>
            <div className="flex-shrink-0">
              <Button
                onClick={() => setShowConfirmModal(true)}
                variant="destructive"
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Purchases
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-lg w-full"
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="ml-3 text-xl font-bold text-gray-900">
                  Confirm Clear All Purchases
                </h3>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800 font-medium mb-2">
                  ⚠️ This action cannot be undone!
                </p>
                <p className="text-sm text-red-700">
                  You are about to permanently delete all purchase records from
                  the database. This will:
                </p>
                <ul className="text-sm text-red-700 mt-2 ml-4 list-disc space-y-1">
                  <li>Remove all purchase history</li>
                  <li>Reset all revenue statistics to zero</li>
                  <li>Clear all user purchase records</li>
                  <li>Remove download access history</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-800 font-medium mb-2">
                  ✅ User accounts will NOT be affected
                </p>
                <p className="text-sm text-green-700">
                  All user accounts, profiles, and registration data will remain
                  intact. Only purchase-related data will be cleared.
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type{" "}
                  <span className="font-bold text-red-600">
                    CLEAR ALL PURCHASES
                  </span>{" "}
                  to confirm:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type here..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  disabled={isClearing}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setConfirmText("");
                  }}
                  variant="outline"
                  disabled={isClearing}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleClearPurchases}
                  disabled={confirmText !== "CLEAR ALL PURCHASES" || isClearing}
                  className="bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isClearing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Clearing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Yes, Clear All Purchases
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Confirmation Modal for Clearing Users */}
      {showConfirmUsersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-lg w-full"
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="ml-3 text-xl font-bold text-gray-900">
                  Confirm Clear All Users
                </h3>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800 font-medium mb-2">
                  ⚠️ This action cannot be undone!
                </p>
                <p className="text-sm text-red-700">
                  You are about to permanently delete all registered user
                  accounts from the database. This will:
                </p>
                <ul className="text-sm text-red-700 mt-2 ml-4 list-disc space-y-1">
                  <li>Remove all user accounts (except admins)</li>
                  <li>Delete user profiles and login credentials</li>
                  <li>Clear user settings and preferences</li>
                  <li>Remove user registration data</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-800 font-medium mb-2">
                  ✅ Admin accounts are SAFE
                </p>
                <p className="text-sm text-green-700">
                  All admin accounts will be preserved. Only user accounts with
                  role="user" will be deleted.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-amber-800 font-medium mb-2">
                  📝 Note about purchases
                </p>
                <p className="text-sm text-amber-700">
                  Purchase records will remain in the database. If you want to
                  clear those as well, use the "Clear All Purchases" option
                  separately.
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type{" "}
                  <span className="font-bold text-red-600">
                    CLEAR ALL USERS
                  </span>{" "}
                  to confirm:
                </label>
                <input
                  type="text"
                  value={confirmUsersText}
                  onChange={(e) => setConfirmUsersText(e.target.value)}
                  placeholder="Type here..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  disabled={isClearingUsers}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  onClick={() => {
                    setShowConfirmUsersModal(false);
                    setConfirmUsersText("");
                  }}
                  variant="outline"
                  disabled={isClearingUsers}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleClearUsers}
                  disabled={
                    confirmUsersText !== "CLEAR ALL USERS" || isClearingUsers
                  }
                  className="bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isClearingUsers ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Clearing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Yes, Clear All Users
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Additional Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">
              Why would you need this?
            </h4>
            <ul className="text-sm text-blue-700 space-y-1 ml-4 list-disc">
              <li>Testing the system with fresh data</li>
              <li>Starting a new business period or season</li>
              <li>Cleaning up test purchases before going live</li>
              <li>Resetting analytics for a new marketing campaign</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
