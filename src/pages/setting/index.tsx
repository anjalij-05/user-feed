import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout, updateUser } from "@/redux/slices/auth";
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { deleteAccountAPI } from "@/app-api/auth";
import {
  fetchBlockedUsers,
  unblockUser,
  updateUserProfile,
} from "@/app-api/user";
import { getUserProfileImage } from "@/lib/utils";

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);
  const { blockedUsersList, loading: blockLoading } = useAppSelector(
    (state) => state.blockUser,
  );

  const [maxDistance, setMaxDistance] = useState(user?.maxDistance || 50);
  const [showProfileImage, setShowProfileImage] = useState(
    user?.showProfileImage ?? true,
  );
  const [showEmail, setShowEmail] = useState(user?.showEmail ?? true);
  const [showMobile, setShowMobile] = useState(user?.showMobile ?? true);
  const [getWhatsappNotifications, setGetWhatsappNotifications] = useState(
    user?.whatsAppNotifications === "true",
  );
  const [showBlockedUsers, setShowBlockedUsers] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Check if user has a profile image
  const hasProfileImage = Boolean(user?.profileImage);
  const hasEmail = Boolean(user?.emailId);
  const hasMobile = Boolean(user?.mobileNumber);

  // Update local state when user data changes
  useEffect(() => {
    if (user?.maxDistance) {
      setMaxDistance(user.maxDistance);
    }
    if (user?.showProfileImage !== undefined) {
      setShowProfileImage(user.showProfileImage);
    }
    if (user?.showEmail !== undefined) {
      setShowEmail(user.showEmail);
    }
    if (user?.showMobile !== undefined) {
      setShowMobile(user.showMobile);
    }
    if (user?.whatsAppNotifications !== undefined) {
      setGetWhatsappNotifications(user.whatsAppNotifications === "true");
    }
  }, [user]);

  const loadBlockedUsers = useCallback(async () => {
    if (!token || !user?._id) return;
    try {
      await dispatch(fetchBlockedUsers({ token, userId: user._id })).unwrap();
    } catch (error: any) {
      toast.error("Failed to fetch blocked users", {
        description: error,
      });
    }
  }, [token, user?._id, dispatch]);

  // Load blocked users when component mounts or when expanded
  useEffect(() => {
    if (showBlockedUsers && blockedUsersList.length === 0) {
      loadBlockedUsers();
    }
  }, [showBlockedUsers, blockedUsersList.length, loadBlockedUsers]);

  const handleUnblockUser = async (blockedUserId: string) => {
    if (!token || !user?._id) return;
    try {
      await dispatch(
        unblockUser({
          token,
          userId: user._id,
          unblockUserId: blockedUserId,
        }),
      ).unwrap();
      toast.success("User unblocked successfully");
    } catch (error: any) {
      toast.error("Failed to unblock user", {
        description: error,
      });
    }
  };

  const handleDistanceChange = (newDistance: number) => {
    // Cap the distance at 50km
    const cappedDistance = Math.min(newDistance, 50);
    setMaxDistance(cappedDistance);
    dispatch(updateUser({ maxDistance: cappedDistance }));
  };

  const handleProfileImageToggle = async () => {
    if (!hasProfileImage) {
      toast.error("Please upload a profile image first", {
        description:
          "You need to add a profile image before you can control its visibility",
      });
      return;
    }

    const newValue = !showProfileImage;
    setUpdating(true);

    try {
      await dispatch(
        updateUserProfile({ showProfileImage: newValue }),
      ).unwrap();

      // Update local state
      setShowProfileImage(newValue);

      // Update Redux store with the new value
      dispatch(updateUser({ showProfileImage: newValue }));

      toast.success(
        newValue
          ? "Profile image is now visible to others"
          : "Profile image is now hidden from others",
      );
    } catch (error) {
      console.error("Failed to update profile image visibility:", error);
      toast.error("Failed to update profile image visibility");
      // Revert local state on error
      setShowProfileImage(!newValue);
    } finally {
      setUpdating(false);
    }
  };

  const handleEmailToggle = async () => {
    if (!hasEmail) {
      toast.error("Please add an email to your profile first", {
        description:
          "You need to add an email before you can control its visibility",
      });
      return;
    }

    const newValue = !showEmail;
    setUpdating(true);

    try {
      await dispatch(updateUserProfile({ showEmail: newValue })).unwrap();

      // Update local state
      setShowEmail(newValue);

      // Update Redux store with the new value
      dispatch(updateUser({ showEmail: newValue }));

      toast.success(
        newValue
          ? "Email is now visible to users"
          : "Email is now hidden from others",
      );
    } catch (error) {
      console.error("Failed to update email visibility:", error);
      toast.error("Failed to update email visibility");
      // Revert local state on error
      setShowEmail(!newValue);
    } finally {
      setUpdating(false);
    }
  };

  const handleMobileToggle = async () => {
    if (!hasMobile) {
      toast.error("Please add a mobile number to your profile first", {
        description:
          "You need to add a mobile number before you can control its visibility",
      });
      return;
    }

    const newValue = !showMobile;
    setUpdating(true);

    try {
      await dispatch(updateUserProfile({ showMobile: newValue })).unwrap();

      // Update local state
      setShowMobile(newValue);

      // Update Redux store with the new value
      dispatch(updateUser({ showMobile: newValue }));

      toast.success(
        newValue
          ? "Mobile number is now visible to users"
          : "Mobile number is now hidden from others",
      );
    } catch (error) {
      console.error("Failed to update mobile visibility:", error);
      toast.error("Failed to update mobile visibility");
      // Revert local state on error
      setShowMobile(!newValue);
    } finally {
      setUpdating(false);
    }
  };

  const handleWhatsappToggle = async () => {
    const newValue = !getWhatsappNotifications;
    setUpdating(true);

    try {
      await dispatch(
        updateUserProfile({ whatsAppNotifications: newValue.toString() }),
      ).unwrap();

      // Update local state
      setGetWhatsappNotifications(newValue);

      // Update Redux store with the new value
      dispatch(updateUser({ whatsAppNotifications: newValue.toString() }));

      toast.success(
        newValue
          ? "WhatsApp notifications are now enabled"
          : "WhatsApp notifications are now disabled",
      );
    } catch (error) {
      console.error("Failed to update WhatsApp notifications:", error);
      toast.error("Failed to update WhatsApp notifications");
      // Revert local state on error
      setGetWhatsappNotifications(!newValue);
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("klout-app-token");
    dispatch(logout());
    toast.success("Logged out successfully!");
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    if (!user?._id) {
      toast.error("User not found");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone.",
    );
    if (!confirmDelete) return;

    try {
      await deleteAccountAPI(user._id);
      localStorage.removeItem("klout-app-token");
      dispatch(logout());
      toast.success("Account deleted successfully!");
      navigate("/");
    } catch (err: any) {
      toast.error("Failed to delete account: " + (err.message || err));
    }
  };

  // Calculate progress percentage (capped at 50km = 100%)
  const progressPercentage = (maxDistance / 50) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted border-b sticky top-0 z-10">
        <div className="flex items-center px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 cursor-pointer text-foreground"
            aria-label="Go back"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-foreground">
            Profile Settings
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Maximum Distance */}
        <div className="bg-muted rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <label className="text-base font-medium text-muted-foreground">
              Maximum Distance
            </label>
            <span className="text-base font-semibold text-muted-foreground">
              {maxDistance}km
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="50"
            value={maxDistance}
            onChange={(e) => handleDistanceChange(Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, oklch(0.5672 0.1910 285.8230) 0%, oklch(0.5672 0.1910 285.8230) ${progressPercentage}%, #e5e7eb ${progressPercentage}%, #e5e7eb 100%)`,
              accentColor: "oklch(0.5672 0.1910 285.8230)",
            }}
          />
          <p className="text-sm text-muted-foreground mt-2">
            Profiles within this distance will be shown on the Explore page
            (Max: 50km)
          </p>
        </div>

        {/* Privacy Settings Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <svg
              className="w-5 h-5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <h2 className="text-lg font-semibold text-foreground">
              Privacy Settings
            </h2>
          </div>
          <p className="text-sm text-muted-foreground px-2">
            Control what information others can see on your profile
          </p>
        </div>

        {/* Show Profile Image Toggle */}
        <div className="bg-muted rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-base font-medium text-muted-foreground">
              Show your profile image to others
            </span>
            <button
              onClick={handleProfileImageToggle}
              disabled={!hasProfileImage || updating}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                !hasProfileImage || updating
                  ? "bg-gray-200 cursor-not-allowed opacity-50"
                  : showProfileImage
                    ? "bg-primary"
                    : "bg-accent"
              }`}
              title={
                !hasProfileImage
                  ? "Upload a profile image to enable this feature"
                  : ""
              }
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  showProfileImage ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          {!hasProfileImage ? (
            <p className="text-sm text-amber-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Please upload a profile image first to control its visibility
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              If turned off, your profile image will not be visible on your
              public profile
            </p>
          )}
        </div>

        {/* Show Email Toggle */}
        <div className="bg-muted rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <div className="text-base font-medium text-muted-foreground mb-1">
                Show your email to users
              </div>
            </div>
            <button
              onClick={handleEmailToggle}
              disabled={!hasEmail || updating}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                !hasEmail || updating
                  ? "bg-gray-200 cursor-not-allowed opacity-50"
                  : showEmail
                    ? "bg-primary"
                    : "bg-accent"
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  showEmail ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          {!hasEmail && (
            <p className="text-sm text-amber-600 flex items-center gap-1 mt-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Please add an email first to control its visibility
            </p>
          )}
        </div>

        {/* Show Mobile Toggle */}
        <div className="bg-muted rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <div className="text-base font-medium text-muted-foreground mb-1">
                Show your mobile to others
              </div>
            </div>
            <button
              onClick={handleMobileToggle}
              disabled={!hasMobile || updating}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                !hasMobile || updating
                  ? "bg-gray-200 cursor-not-allowed opacity-50"
                  : showMobile
                    ? "bg-primary"
                    : "bg-accent"
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  showMobile ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          {!hasMobile && (
            <p className="text-sm text-amber-600 flex items-center gap-1 mt-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Please add a mobile number first to control its visibility
            </p>
          )}
        </div>

        {/* WhatsApp Notifications Toggle */}
        <div className="bg-muted rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-muted-foreground">
              Get WhatsApp notifications
            </span>
            <button
              onClick={handleWhatsappToggle}
              disabled={updating}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                updating
                  ? "bg-gray-200 cursor-not-allowed opacity-50"
                  : getWhatsappNotifications
                    ? "bg-primary"
                    : "bg-accent"
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  getWhatsappNotifications ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Receive important updates and notifications via WhatsApp
          </p>
        </div>

        {/* App Version */}
        <div className="bg-muted rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-muted-foreground">
              App Version
            </span>
            <span className="text-base text-muted-foreground">
              {user?.appVersion}
            </span>
          </div>
        </div>

        {/* Blocked Users */}
        <div className="bg-muted rounded-lg shadow-sm">
          <button
            onClick={() => {
              setShowBlockedUsers(!showBlockedUsers);
            }}
            className="w-full flex cursor-pointer items-center justify-between p-6 text-left"
          >
            <span className="text-base font-medium text-muted-foreground">
              Blocked Users
            </span>
            <svg
              className={`w-5 h-5 text-muted-foreground transition-transform ${
                showBlockedUsers ? "rotate-90" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {showBlockedUsers && (
            <div className="border-t px-6 pb-6">
              {blockLoading ? (
                <div className="py-4 text-center text-gray-500">Loading...</div>
              ) : blockedUsersList.length === 0 ? (
                <div className="py-4 text-center text-gray-500">
                  No blocked users
                </div>
              ) : (
                <div className="space-y-3 mt-4">
                  {blockedUsersList.map((blockedUser) => (
                    <div
                      key={blockedUser._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                          {blockedUser.profileImage ? (
                            <img
                              src={getUserProfileImage(
                                user?.imageBaseUrl as string,
                                blockedUser.profileImage,
                              )}
                              alt={`${blockedUser.first_name} ${blockedUser.last_name}`}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-gray-600 font-medium">
                              {blockedUser.first_name
                                ?.charAt(0)
                                .toUpperCase() || "U"}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {blockedUser.first_name} {blockedUser.last_name}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleUnblockUser(blockedUser._id)}
                        disabled={blockLoading}
                        size="sm"
                        variant="outline"
                        className="text-klout-primary hover:bg-klout-primary hover:text-white"
                      >
                        {blockLoading ? "..." : "Unblock"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="text-destructive cursor-pointer hover:text-destructive w-full h-12 rounded-xl"
        >
          Logout
        </Button>

        {/* Delete Account Button */}
        <Button
          onClick={handleDeleteAccount}
          variant="outline"
          className="w-full h-12 rounded-xl cursor-pointer text-destructive hover:text-destructive"
        >
          Delete Account
        </Button>
      </div>
    </div>
  );
};

export default Settings;
