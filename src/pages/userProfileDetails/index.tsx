import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchProfileDetails,
  fetchPublicProfileById,
} from "@/app-api/nearbyProfiles";
import DummyImage from "@/assets/dummy_image.webp";
import { getUserProfileImage } from "@/lib/utils";
import { Helmet } from "react-helmet-async";
import {
  Bookmark,
  EllipsisVertical,
  MapPin,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  UserX,
  Clock,
  MessageCircle,
  UserCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import LinkedinImage from "@/assets/linkedin.webp";
import TwitterLogo from "@/assets/twitter.webp";
import { Button } from "@/components/ui/button";
import {
  sendConnectionRequest,
  cancelConnectionRequest,
  getMyConnections,
  checkConnectionStatus,
  removeConnection,
  connectionRequestStatusUpdate,
} from "@/app-api/connections";
import { fetchBookmarkedList, toggleBookmark } from "@/app-api/bookmark";
import { toast } from "sonner";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { viewProfileNotify } from "@/app-api/notificationFilterList";
import { removeNotification } from "@/redux/slices/notification";
import { fetchCompanyMemberTls, fetchTlsScore } from "@/app-api/tls";
import { fetchCompanies } from "@/app-api/company";
import {
  fetchUserAttendedEvents,
  type AttendedEvent,
} from "@/app-api/attendedEvents";
import { blockUser, unblockUser } from "@/app-api/user";
import TlsImage from "@/assets/tlsImage.webp";
import { domain } from "@/constants";
import PremiumLogo from "@/assets/premium.webp";
import ImageDialog from "@/components/imageDialogBox";
import PremiumDialog from "@/components/premiumDialog";
import axios from "axios";
import type { Event } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

const FALLBACK_LAT = 28.6139;
const FALLBACK_LNG = 77.209;

// Attended Event Card Component
const AttendedEventCard = ({
  event,
  onImageError,
}: {
  event: AttendedEvent;
  onImageError?: (eventId: string) => void;
}) => {
  const navigate = useNavigate();

  if (!event.eventImageUrl || event.eventImageUrl.trim() === "") {
    return null;
  }

  const eventImageUrl = `${domain}/${event.eventImageUrl}`;

  const handleClick = async () => {
    try {
      const response = await axios.get(`${domain}/api/all_events`);
      const filteredEvent = response.data.data.filter(
        (e: Event) => e.uuid === event.eventUUID,
      )[0];
      if (filteredEvent) {
        navigate(`/events/${filteredEvent.slug}`);
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
    }
  };

  const handleImageError = () => {
    if (onImageError) {
      onImageError(event.eventUUID || event._id || "");
    }
  };

  return (
    <div
      className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200 h-48 sm:h-56 cursor-pointer"
      onClick={handleClick}
    >
      <img
        src={eventImageUrl}
        alt={event.eventTitle}
        className="w-full h-full object-cover"
        onError={handleImageError}
      />
      <div className="absolute inset-0 bg-linear-to-t from-black via-black/70 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
        <h4 className="font-bold text-white text-xs sm:text-sm mb-1 line-clamp-2">
          {event.eventTitle}
        </h4>
        <p className="text-white/90 text-xs capitalize">as {event.status}</p>
        {event.awardWinner && (
          <div className="mt-1">
            <span className="bg-yellow-500 text-white px-2 py-0.5 rounded text-xs font-medium">
              Winner
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const factorLabels: Record<string, string> = {
  yourTotalExperience: "Your Total Experience",
  yourCurrentJob: "Your Current Job",
  eventYouAttend: "Events You Attended",
  yourEducation: "Your Education",
  mediaPresence: "Media Presence",
  others: "Others",
};

const parseUserImages = (
  imagesData: string | string[] | undefined,
): string[] => {
  if (!imagesData) return [];
  if (Array.isArray(imagesData)) return imagesData;

  try {
    const parsed = JSON.parse(imagesData);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item: any) => {
          if (typeof item === "object" && item.Image) {
            return item.Image;
          }
          return item;
        })
        .filter(Boolean);
    }
    return [];
  } catch (error) {
    console.error("Failed to parse images:", error);
    return [];
  }
};

// Loading Skeleton
const ProfileLoadingSkeleton = () => {
  return (
    <div className="max-w-3xl mx-auto overflow-hidden bg-muted rounded-2xl shadow my-3 sm:my-6 animate-pulse">
      <div className="relative w-full h-48 sm:h-64 md:h-72 lg:h-80 bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 bg-size-[200%_100%] animate-shimmer">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-gray-900/20" />
      </div>
      <div className="relative px-3 sm:px-4 md:px-6 pb-4 sm:pb-6">
        <div className="relative flex flex-col items-center -mt-12 sm:-mt-16 md:-mt-20">
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full border-3 sm:border-4 border-white bg-linear-to-br from-gray-300 to-gray-400 shadow-xl" />
          </div>
        </div>
      </div>
      <div className="flex justify-center items-center mt-2 gap-1 px-3">
        <div className="w-4 h-4 rounded bg-gray-300" />
        <div className="w-24 h-4 rounded bg-gray-300" />
      </div>
      <div className="mt-3 sm:mt-4 px-3 sm:px-4 md:px-6 pb-4 sm:pb-6 text-center space-y-3">
        <div className="flex justify-center">
          <div className="w-48 h-8 rounded bg-gray-300" />
        </div>
        <div className="flex justify-center">
          <div className="w-36 h-5 rounded bg-gray-300" />
        </div>
        <div className="space-y-2 mt-4">
          <div className="flex justify-center">
            <div className="w-56 h-5 rounded bg-gray-300" />
          </div>
          <div className="flex justify-center">
            <div className="w-44 h-5 rounded bg-gray-300" />
          </div>
          <div className="flex justify-center">
            <div className="w-52 h-5 rounded bg-gray-300" />
          </div>
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <div className="w-28 h-10 rounded-2xl bg-gray-300" />
          <div className="w-28 h-10 rounded-2xl bg-gray-300" />
        </div>
        <div className="mt-6 flex justify-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-300" />
          <div className="w-10 h-10 rounded-full bg-gray-300" />
        </div>
      </div>
      <div className="text-center pb-6">
        <p className="text-gray-500 text-sm animate-pulse">
          Loading profile...
        </p>
      </div>
    </div>
  );
};

const ProfileDetails: React.FC = () => {
  const slug = useParams<{ id: string }>();
  const id = slug.id?.split("-")[2];
  const navigate = useNavigate();
  const { user, token } = useAppSelector((s) => s.auth);
  const { nearbyProfiles, publicProfiles } = useAppSelector(
    (s) => s.nearByProfiles,
  );

  const { bookmarked, connectionIdData, connectionsList, connectionRequests } =
    useAppSelector((s) => s.connection);

  const { list } = useAppSelector((s) => s.notification);
  const { score, factorGroup } = useAppSelector((s) => s.tls);
  const { blockedUsers, loading: blockLoading } = useAppSelector(
    (s) => s.blockUser,
  );
  const dispatch = useAppDispatch();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [attendedEvents, setAttendedEvents] = useState<AttendedEvent[]>([]);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);

  const isBookmarked = bookmarked.some((u) => u._id === id);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showReportBlock, setShowReportBlock] = useState(false);
  const [reportBlockAction, setReportBlockAction] = useState<
    "block" | "concern" | "profile" | null
  >(null);
  const [selectedReason, setSelectedReason] = useState("");

  const isBlocked = id ? blockedUsers.includes(id) : false;
  const [showTlsDialog, setShowTlsDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");
  const [showCompanyMembersDialog, setShowCompanyMembersDialog] =
    useState(false);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showEmailState, setShowEmailState] = useState(false);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [failedEventImages, setFailedEventImages] = useState<string[]>([]);

  const [isPremiumOpen, setIsPremiumOpen] = useState(false);
  const handleOpenPremium = () => {
    setIsPremiumOpen(true);
    setShowTlsDialog(false);
  };
  const handleClosePremium = () => setIsPremiumOpen(false);

  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false);
  const [bookmarkNote, setBookmarkNote] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const {
    companyMembers,
    loading: companyTlsLoading,
    error: companyError,
  } = useAppSelector((s) => s.tls);

  const isLoggedInUserPremium = user?.role?.toLowerCase() === "premium";

  const { connected, isFriend, shouldFetchConnection } = useMemo(() => {
    if (!token || !user?._id || !id) {
      return {
        connected: false,
        isFriend: false,
        shouldFetchConnection: false,
      };
    }

    const isConnected = connectionIdData.some(
      (conn: any) => conn.userId === id || conn._id === id,
    );

    if (isConnected) {
      return { connected: false, isFriend: true, shouldFetchConnection: false };
    }

    const hasPendingRequest = connectionRequests.some(
      (req: any) =>
        req.request_user_id === user._id &&
        req.receive_user_id === id &&
        req.status === 1,
    );

    const shouldFetch =
      connectionIdData.length === 0 && connectionRequests.length === 0;

    return {
      connected: hasPendingRequest,
      isFriend: false,
      shouldFetchConnection: shouldFetch,
    };
  }, [token, user?._id, id, connectionIdData, connectionRequests]);

  const coverImages = useMemo(() => {
    const parsedImages = parseUserImages(profile?.images);
    if (parsedImages.length > 0) return parsedImages;
    if (profile?.profileImage) return [profile.profileImage];
    return [];
  }, [profile?.images, profile?.profileImage]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) nextImage();
    if (touchStart - touchEnd < -75) prevImage();
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === coverImages.length - 1 ? 0 : prev + 1,
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? coverImages.length - 1 : prev - 1,
    );
  };

  const handleEventImageError = (eventId: string) => {
    setFailedEventImages((prev) => [...prev, eventId]);
  };

  const eventsWithImages = useMemo(() => {
    const filtered = attendedEvents.filter((event) => {
      const eventId = event.eventUUID || event._id || "";
      const hasImageUrl =
        event.eventImageUrl &&
        typeof event.eventImageUrl === "string" &&
        event.eventImageUrl.trim() !== "";
      const imageNotFailed = !failedEventImages.includes(eventId);
      return hasImageUrl && imageNotFailed;
    });

    const uniqueEvents = filtered.reduce((acc: any[], current) => {
      const eventId = current.eventUUID || current._id;
      const isDuplicate = acc.some(
        (event) => (event.eventUUID || event._id) === eventId,
      );
      if (!isDuplicate) acc.push(current);
      return acc;
    }, []);

    return uniqueEvents.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      if (a.createdAt) return -1;
      if (b.createdAt) return 1;
      return 0;
    });
  }, [attendedEvents, failedEventImages]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [coverImages]);

  const handleTlsClick = () => setShowTlsDialog(true);

  const handleProfileImageClick = () => {
    const profileImg = profile?.profileImage;
    const imageUrl = profileImg
      ? getUserProfileImage(user?.imageBaseUrl || "", profileImg)
      : DummyImage;
    setSelectedImageUrl(imageUrl);
    setShowImageDialog(true);
  };

  const getPosition = async () =>
    new Promise<GeolocationPosition>((resolve) => {
      navigator.geolocation.getCurrentPosition(resolve, () => {
        resolve({
          coords: {
            latitude: FALLBACK_LAT,
            longitude: FALLBACK_LNG,
            accuracy: 0,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        } as GeolocationPosition);
      });
    });

  const sendProfileView = useCallback(async () => {
    if (!token || !user?._id || !id || user._id === id) return;
    try {
      await dispatch(
        viewProfileNotify({ token, loggedInUserId: user._id, toUserId: id }),
      ).unwrap();
    } catch (err) {
      console.error("Failed to send profile view notification", err);
    }
  }, [dispatch, token, user?._id, id]);

  const refreshConnectionData = useCallback(async () => {
    if (!token || !user?._id) return;
    try {
      const pos = await getPosition();
      await Promise.all([
        dispatch(checkConnectionStatus({ token, userId: user._id })).unwrap(),
        dispatch(
          getMyConnections({
            token,
            userId: user._id,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            distance: 50,
          }),
        ).unwrap(),
      ]);
    } catch (err: any) {
      console.error("refreshConnectionData error:", err);
    }
  }, [token, user?._id, dispatch]);

  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoading(true);
      try {
        let details = null;

        if (token && user?._id) {
          const pos = await getPosition();
          const data = await fetchProfileDetails(
            token,
            user._id,
            id,
            pos.coords.latitude,
            pos.coords.longitude,
            50,
          );
          details = data?.result?.details || null;
        } else {
          details =
            nearbyProfiles.find((p) => p._id === id) ||
            publicProfiles.find((p) => p._id === id) ||
            null;

          if (!details) {
            try {
              const response = await fetchPublicProfileById(id);
              details =
                response?.result?.profile ||
                response?.profile ||
                response?.data?.profile ||
                response?.data ||
                null;

              if (!details) {
                toast.error("Profile not found");
                setLoading(false);
                return;
              }
            } catch (err: any) {
              console.error("Error fetching profile:", err);
              toast.error("Failed to load profile");
              setLoading(false);
              return;
            }
          }
        }

        setProfile(details);

        const mobileNumber = details?.mobileNumber || details?.mobile_number;
        if (mobileNumber) {
          dispatch(fetchTlsScore({ mobileNumber }));
        }

        if (token && user?._id) {
          if (mobileNumber) {
            setEventsLoading(true);
            try {
              const events = await fetchUserAttendedEvents(mobileNumber);
              setAttendedEvents(events);
            } catch (err) {
              console.error("Failed to fetch attended events:", err);
            } finally {
              setEventsLoading(false);
            }
          }
          sendProfileView();
        }
      } catch (err: any) {
        toast.error("Failed to fetch profile details", {
          description: err?.message,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [
    id,
    token,
    user,
    dispatch,
    sendProfileView,
    nearbyProfiles,
    publicProfiles,
  ]);

  useEffect(() => {
    if (token && user?._id && shouldFetchConnection) {
      refreshConnectionData();
    }
  }, [token, user?._id, shouldFetchConnection, refreshConnectionData]);

  const pendingRequest = useMemo(() => {
    return list.find(
      (n: any) =>
        n.from_user_id === id && JSON.parse(n.data || "{}").Type === "1",
    );
  }, [list, id]);

  const handleCompanyClick = async () => {
    const companyName = profile?.company || profile?.companyName;
    if (!companyName) {
      toast.info("No company information available");
      return;
    }
    const encodedName = encodeURIComponent(companyName.trim());
    if (token && user?._id) {
      await dispatch(fetchCompanies(companyName.trim())).unwrap();
    }
    navigate(`/company/${encodedName}`);
  };

  const handleConnect = async () => {
    if (!token || !user?._id || !id) return;
    setLoadingAction(true);
    try {
      const res = await sendConnectionRequest(token, user._id, id);
      if (res?.status) {
        toast.success(res?.message || "Request sent!");
        await refreshConnectionData();
      } else {
        toast.error(res?.message || "Request failed");
      }
    } catch (err: any) {
      toast.error("Something went wrong", { description: err?.message });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCancel = async () => {
    if (!token || !user?._id || !id) return;
    setLoadingAction(true);
    try {
      const pendingReq = connectionRequests.find(
        (r: any) =>
          r.request_user_id === user._id &&
          r.receive_user_id === id &&
          r.status === 1,
      );

      if (!pendingReq) {
        toast.error("No pending request found to cancel.");
        setLoadingAction(false);
        await refreshConnectionData();
        return;
      }

      const cancelRes = await cancelConnectionRequest(
        token,
        user._id,
        pendingReq.receive_user_id,
      );

      if (cancelRes?.status) {
        toast.success(cancelRes?.message || "Cancelled");
        await refreshConnectionData();
      } else {
        toast.error(cancelRes?.message || "Cancel failed");
      }
    } catch (err: any) {
      toast.error("Something went wrong", { description: err?.message });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRemoveConnection = async () => {
    if (!token || !user?._id || !id) return;
    setLoadingAction(true);
    try {
      const connectionRecord = connectionsList.find(
        (c: any) =>
          (c.from_user_id === user._id && c.to_user_id === id) ||
          (c.from_user_id === id && c.to_user_id === user._id),
      );

      if (!connectionRecord) {
        toast.error("No connection record found.");
        setLoadingAction(false);
        return;
      }

      const connectionId = connectionRecord._id;
      const res = await dispatch(
        removeConnection({ token, userId: user._id, connectionId }),
      ).unwrap();

      if (res?.status) {
        toast.success(res?.message || "Connection removed.");
        await refreshConnectionData();
      } else {
        toast.error(res?.message || "Failed to remove connection.");
      }
    } catch (err: any) {
      toast.error("Failed to remove connection", { description: err?.message });
    } finally {
      setLoadingAction(false);
      setShowConfirm(false);
    }
  };

  const handleBookmarkClick = () => {
    if (!token || !user?._id || !id) return;
    if (isBookmarked) {
      handleRemoveBookmark();
    } else {
      setShowBookmarkDialog(true);
    }
  };

  const handleSaveBookmark = async () => {
    if (!token || !user?._id || !id) return;
    setLoadingAction(true);
    try {
      const res = await dispatch(
        toggleBookmark({
          token,
          loggedInUserId: user._id,
          targetUserId: id,
          status: "1",
          note: bookmarkNote.trim() || undefined,
        }),
      ).unwrap();

      if (res?.status) {
        toast.success(res?.message || "Bookmarked successfully");
        await dispatch(
          fetchBookmarkedList({
            token,
            userId: user._id,
            latitude: FALLBACK_LAT,
            longitude: FALLBACK_LNG,
            distance: 50,
          }),
        );
        setShowBookmarkDialog(false);
        setBookmarkNote("");
      } else {
        toast.error(res?.message || "Failed to bookmark");
      }
    } catch (err: any) {
      toast.error("Error bookmarking user", { description: err?.message });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRemoveBookmark = async () => {
    if (!token || !user?._id || !id) return;
    setLoadingAction(true);
    try {
      const res = await dispatch(
        toggleBookmark({
          token,
          loggedInUserId: user._id,
          targetUserId: id,
          status: "0",
        }),
      ).unwrap();

      if (res?.status) {
        toast.success(res?.message || "Bookmark removed successfully");
        await dispatch(
          fetchBookmarkedList({
            token,
            userId: user._id,
            latitude: FALLBACK_LAT,
            longitude: FALLBACK_LNG,
            distance: 50,
          }),
        );
        setBookmarkNote("");
      } else {
        toast.error(res?.message || "Failed to remove bookmark");
      }
    } catch (err: any) {
      toast.error("Error removing bookmark", { description: err?.message });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!pendingRequest || !token || !user?._id) return;
    const requestId = JSON.parse(pendingRequest.data)?.RequestId;
    if (!requestId) return toast.error("Invalid request");

    try {
      await dispatch(
        connectionRequestStatusUpdate({
          token,
          userId: user._id,
          connectionReqId: requestId,
          notificationId: pendingRequest._id,
          status: "1",
        }),
      ).unwrap();
      dispatch(removeNotification(pendingRequest._id));
      toast.success("Request accepted!");
      await refreshConnectionData();
    } catch (err: any) {
      toast.error("Failed to accept request", { description: err.message });
    }
  };

  const handleRejectRequest = async () => {
    if (!pendingRequest || !token || !user?._id) return;
    const requestId = JSON.parse(pendingRequest.data)?.RequestId;
    if (!requestId) return toast.error("Invalid request");

    try {
      await dispatch(
        connectionRequestStatusUpdate({
          token,
          userId: user._id,
          connectionReqId: requestId,
          notificationId: pendingRequest._id,
          status: "2",
        }),
      ).unwrap();
      dispatch(removeNotification(pendingRequest._id));
      toast.success("Request rejected!");
      await refreshConnectionData();
    } catch (err: any) {
      toast.error("Failed to reject request", { description: err.message });
    }
  };

  const handleBlockUser = async () => {
    if (!token || !user?._id || !id) return;
    try {
      await dispatch(
        blockUser({ token, userId: user._id, blockUserId: id }),
      ).unwrap();
      toast.success("User blocked successfully");
      setShowReportBlock(false);
      setReportBlockAction(null);
    } catch (err: any) {
      toast.error("Error blocking user", { description: err });
    }
  };

  const handleUnblockUser = async () => {
    if (!token || !user?._id || !id) return;
    try {
      await dispatch(
        unblockUser({ token, userId: user._id, unblockUserId: id }),
      ).unwrap();
      toast.success("User unblocked successfully");
    } catch (err: any) {
      toast.error("Error unblocking user", { description: err });
    }
  };

  const handleReportConcern = async () => {
    if (!token || !user?._id || !id || !selectedReason) {
      toast.error("Please select a reason");
      return;
    }
    setLoadingAction(true);
    try {
      const formData = new FormData();
      formData.append("user_id", user._id);
      formData.append("blocker_user_id", id);
      formData.append("reason", selectedReason);
      formData.append("status", "0");
      formData.append("type", "2");

      const response = await fetch(`${domain}/mapping/api/block-app-user`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (data.status || response.ok) {
        toast.success("Report submitted successfully");
        setShowReportBlock(false);
        setReportBlockAction(null);
        setSelectedReason("");
      } else {
        toast.error(data.message || "Failed to submit report");
      }
    } catch (err: any) {
      toast.error("Error submitting report", { description: err?.message });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleReportProfile = async () => {
    if (!token || !user?._id || !id || !selectedReason) {
      toast.error("Please select a reason");
      return;
    }
    setLoadingAction(true);
    try {
      const formData = new FormData();
      formData.append("user_id", user._id);
      formData.append("blocker_user_id", id);
      formData.append("reason", selectedReason);
      formData.append("status", "0");
      formData.append("type", "2");

      const response = await fetch(`${domain}/mapping/api/block-app-user`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (data.status || response.ok) {
        toast.success("Profile report submitted successfully");
        setShowReportBlock(false);
        setReportBlockAction(null);
        setSelectedReason("");
      } else {
        toast.error(data.message || "Failed to submit report");
      }
    } catch (err: any) {
      toast.error("Error submitting report", { description: err?.message });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleFetchCompanyMembers = async (companyName: string) => {
    if (!companyName) {
      toast.error("Company name is required");
      return;
    }
    setCompanyLoading(true);
    try {
      await dispatch(fetchCompanyMemberTls({ company: companyName })).unwrap();
      setShowCompanyMembersDialog(true);
      toast.success("Company members loaded successfully");
    } catch (err: any) {
      toast.error("Error fetching company members", {
        description: err?.message || "Please try again",
      });
    } finally {
      setCompanyLoading(false);
    }
  };

  const renderActionButtons = () => {
    if (!token || !user?._id) {
      return (
        <Button onClick={() => navigate("/user-login")}>Login to View</Button>
      );
    }

    if (user._id === id) return null;

    if (pendingRequest) {
      return (
        <>
          <Button
            onClick={handleRejectRequest}
            className="bg-white border border-red-500 text-red-500 hover:bg-red-50 p-3 rounded-full"
            title="Reject Request"
          >
            <UserX className="w-5 h-5" />
          </Button>
          <Button
            onClick={handleAcceptRequest}
            className="bg-klout-primary text-white hover:bg-klout-primary-dark p-3 rounded-full"
            title="Accept Request"
          >
            <UserCheck className="w-5 h-5" />
          </Button>
        </>
      );
    }

    if (isFriend) {
      return (
        <>
          <Button
            disabled
            className="p-5 bg-green-600 text-white cursor-default rounded-full"
            title="Connected"
          >
            <UserCheck className="w-8 h-8" />
          </Button>
          <Link to={`/chat/${user?._id}_${id}`}>
            <Button
              className="p-5 bg-klout-primary hover:bg-klout-primary-dark hover:scale-110 text-white cursor-pointer rounded-full"
              title="Chat"
            >
              <MessageCircle className="w-8 h-8" />
            </Button>
          </Link>
        </>
      );
    }

    if (isLoggedInUserPremium) {
      if (connected) {
        return (
          <>
            <Button
              disabled
              className="p-3 bg-yellow-500 text-white rounded-full"
              title="Pending"
            >
              <Clock className="w-5 h-5" />
            </Button>
            <Button
              onClick={handleCancel}
              disabled={loadingAction}
              className="p-3 bg-red-500 text-white rounded-full"
              title="Cancel Request"
            >
              <UserX className="w-5 h-5" />
            </Button>
            <Link to={`/chat/${user?._id}_${id}`}>
              <Button
                className="p-3 bg-klout-primary hover:bg-klout-primary-dark hover:scale-110 text-white cursor-pointer rounded-full"
                title="Chat"
              >
                <MessageCircle className="w-5 h-5" />
              </Button>
            </Link>
          </>
        );
      }

      return (
        <>
          <Button
            onClick={handleConnect}
            disabled={loadingAction}
            className="p-3 bg-klout-primary text-white rounded-full"
            title="Connect"
          >
            <UserPlus className="w-5 h-5" />
          </Button>
          <Link to={`/chat/${user?._id}_${id}`}>
            <Button
              className="p-3 bg-green-600 hover:bg-green-700 hover:scale-110 text-white cursor-pointer rounded-full"
              title="Chat"
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
          </Link>
        </>
      );
    }

    if (connected) {
      return (
        <>
          <Button
            disabled
            className="p-3 bg-yellow-500 text-white rounded-full"
            title="Pending"
          >
            <Clock className="w-5 h-5" />
          </Button>
          <Button
            onClick={handleCancel}
            disabled={loadingAction}
            className="p-3 bg-red-500 text-white rounded-full"
            title="Cancel Request"
          >
            <UserX className="w-5 h-5" />
          </Button>
        </>
      );
    }

    return (
      <Button
        onClick={handleConnect}
        disabled={loadingAction}
        className="p-3 bg-klout-primary text-white rounded-full"
        title="Connect"
      >
        <UserPlus className="w-5 h-5" />
      </Button>
    );
  };

  const maskEmail = (email: any) => {
    if (!email) return "";
    const [name, domain] = email.split("@");
    return name[0] + "****@" + domain;
  };

  const firstName = profile?.firstName || profile?.first_name || "";
  const lastName = profile?.lastName || profile?.last_name || "";
  const designation = profile?.designation || "";
  const jobFunction = profile?.jobFunction || profile?.job_function || "";
  const experience = profile?.experience || "0";
  const company = profile?.company || profile?.companyName || "";
  const city = profile?.city || "";
  const aboutMe = profile?.aboutMe || profile?.about_me || "";
  const role = profile?.role || "";
  const linkedinUrl =
    profile?.linkedinProfileUrl || profile?.linkedin_profile_url || "";
  const xUrl = profile?.xProfileUrl || profile?.x_profile_url || "";

  const capitalizeWords = (str: string) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const pageTitle = useMemo(() => {
    if (profile) {
      const fullName = `${firstName} ${lastName}`.trim();
      const capitalizedName = fullName ? capitalizeWords(fullName) : "";
      const capitalizedCompany = company ? capitalizeWords(company) : "";

      if (capitalizedName && capitalizedCompany) {
        return `${capitalizedName}, ${capitalizedCompany} | Klout Club`;
      } else if (capitalizedName) {
        return `${capitalizedName} | Klout Club`;
      } else if (capitalizedCompany) {
        return `${capitalizedCompany} | Klout Club`;
      }
    }
    return "Profile | Klout Club";
  }, [firstName, lastName, company, profile]);

  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  if (loading) return <ProfileLoadingSkeleton />;

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen px-4">
        <div className="text-center">
          <p className="text-lg sm:text-xl text-gray-600 mb-4">
            Profile not found
          </p>
          <Button
            onClick={() => navigate(-1)}
            className="bg-klout-primary text-white"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      {/*
        KEY FIX: The outer card wrapper must NOT have overflow-hidden,
        because backdrop-filter on child elements creates a new stacking
        context that traps portals (DropdownMenuContent) even when they
        render in document.body. We use rounded corners only on the card
        edges via a separate visual wrapper instead.
      */}
      <div className="max-w-3xl mx-auto bg-muted rounded-2xl shadow my-3 sm:my-6 relative">
        {/* Cover Image — uses its own overflow-hidden to clip the image to the card corners */}
        <div
          className="relative w-full h-48 sm:h-64 md:h-72 lg:h-80 overflow-hidden rounded-t-2xl bg-gray-200"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {coverImages.length > 0 ? (
            <img
              src={getUserProfileImage(
                user?.imageBaseUrl as string,
                coverImages[currentImageIndex],
              )}
              alt={`Cover ${currentImageIndex + 1}`}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = DummyImage;
              }}
            />
          ) : (
            <img
              src={DummyImage}
              alt="Default Cover"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          <div className="absolute inset-0 bg-linear-to-b from-primary/10 via-transparent to-primary/40 pointer-events-none" />

          {/* Navigation Arrows — these stay inside since they don't need portals */}
          {coverImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 sm:p-2 rounded-full shadow-lg hover:bg-white transition-all z-10 hidden sm:block"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 sm:p-2 rounded-full shadow-lg hover:bg-white transition-all z-10 hidden sm:block"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              </button>
            </>
          )}

          {/* Dot Indicators */}
          {coverImages.length > 1 && (
            <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 flex gap-1.5 sm:gap-2 z-10">
              {coverImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentImageIndex
                      ? "w-6 sm:w-8 h-1.5 sm:h-2 bg-white"
                      : "w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/50 hover:bg-white/75"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/*
          CRITICAL FIX: Bookmark + Dropdown are rendered OUTSIDE the
          overflow-hidden cover div and OUTSIDE any backdrop-filter context.
          They sit on the outer card (position:relative) so they visually
          overlap the cover image, but no clipping or stacking context
          interferes with the DropdownMenuContent portal.
        */}
        {token && user?._id && user._id !== id && (
          <>
            {/* Bookmark button — overlays top-left of cover */}
            <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-20">
              <Button
                onClick={handleBookmarkClick}
                disabled={loadingAction}
                variant="outline"
                size="icon"
                className="p-1.5 sm:p-2 cursor-pointer bg-white/90 hover:bg-white border-0 shadow-sm"
              >
                <Bookmark
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    isBookmarked
                      ? "text-klout-primary fill-klout-primary"
                      : "text-gray-700"
                  }`}
                />
              </Button>
            </div>

            {/* Custom dropdown — plain HTML, no Radix portal, no stacking context issues */}
            <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-[999]">
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-white/90 hover:bg-white shadow-sm cursor-pointer"
                  type="button"
                >
                  <EllipsisVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                </button>

                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-[998]"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-48 sm:w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-[999]">
                      {!isBlocked ? (
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setShowReportBlock(true);
                            setMenuOpen(false);
                          }}
                        >
                          Report / Block
                        </button>
                      ) : (
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer disabled:opacity-50"
                          onClick={() => {
                            handleUnblockUser();
                            setMenuOpen(false);
                          }}
                          disabled={blockLoading}
                        >
                          {blockLoading ? "Unblocking..." : "Unblock User"}
                        </button>
                      )}
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setShowContactInfo(true);
                          setMenuOpen(false);
                        }}
                      >
                        Contact Info
                      </button>
                      {isFriend && (
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setShowConfirm(true);
                            setMenuOpen(false);
                          }}
                        >
                          Remove Connection
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {/* Profile Image + TLS Badge */}
        <div className="relative px-3 sm:px-4 md:px-6 pb-4 sm:pb-6">
          <div className="relative flex flex-col items-center -mt-12 sm:-mt-16 md:-mt-20">
            <div className="relative">
              <div
                className="relative cursor-pointer w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full border-3 sm:border-4 border-white overflow-hidden shadow-xl bg-white flex items-center justify-center"
                onClick={handleProfileImageClick}
              >
                {user ? (
                  <img
                    src={getUserProfileImage(
                      user?.imageBaseUrl as string,
                      profile.profileImage,
                    )}
                    alt={`${profile.first_name} ${profile.last_name}`}
                    className="w-full h-full object-cover rounded-full"
                    loading="lazy"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProfileImageClick();
                    }}
                  />
                ) : (
                  <div
                    className="w-full h-full rounded-full bg-primary flex items-center justify-center text-white font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl border border-gray-200"
                    title={`${profile.firstName} ${profile.lastName}`}
                  >
                    {`${profile.first_name?.charAt(0) || ""}${
                      profile.last_name?.charAt(0) || ""
                    }`.toUpperCase()}
                  </div>
                )}
              </div>

              {/* TLS Score Badge */}
              {score && (
                <div
                  className="absolute -right-2/3 top-1/2 bottom-1/2 cursor-pointer hover:scale-105 transition-transform z-10"
                  onClick={handleTlsClick}
                >
                  <div className="relative w-16 h-12 md:w-18 md:h-14 lg:w-24 lg:h-16">
                    <img
                      src={TlsImage}
                      alt="TLS"
                      className="w-full h-full object-contain drop-shadow-xl"
                      loading="lazy"
                    />
                    <span className="absolute inset-0 right-1 flex items-center justify-end pr-1 sm:pr-1.5 md:pr-2 lg:pr-3 text-white font-semibold text-xs sm:text-sm md:text-base lg:text-lg">
                      {score}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Location */}
        <p className="flex justify-center items-center text-foreground mt-2 gap-1 text-sm sm:text-base px-3">
          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          {city || "No location"}
        </p>

        {/* Profile Info */}
        <div className="mt-3 sm:mt-4 px-3 sm:px-4 md:px-6 pb-4 sm:pb-6 text-center">
          <div className="gap-1 sm:gap-2 flex justify-center items-center space-x-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold capitalize items-center flex text-gray-900 dark:text-gray-100">
              {firstName} {lastName}
            </h1>
            {role?.toLowerCase() === "premium" && (
              <img
                src={PremiumLogo}
                alt="Premium User"
                title="Premium Member"
                className="w-4 h-5 sm:w-5 sm:h-6"
                width={24}
                height={24}
              />
            )}
          </div>

          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 capitalize">
            {designation || "N/A"}
          </p>

          <div className="mt-2 space-y-1 text-sm sm:text-base text-gray-700 dark:text-gray-300 capitalize">
            {jobFunction && (
              <p>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  Responsibility:
                </span>{" "}
                {jobFunction}
              </p>
            )}
            <p>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                Experience:
              </span>{" "}
              {experience} years
            </p>
            <p className="wrap-break-words">
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                Company:
              </span>{" "}
              {company ? (
                <button
                  onClick={handleCompanyClick}
                  className="text-klout-primary dark:text-klout-primary capitalize cursor-pointer hover:underline inline-flex items-center gap-1 ml-1"
                >
                  {company}
                </button>
              ) : (
                <span className="text-gray-700 dark:text-gray-400">N/A</span>
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 sm:mt-6 flex flex-wrap justify-center gap-2 sm:gap-3">
            {renderActionButtons()}
          </div>

          {/* Social Links */}
          {(linkedinUrl || xUrl) && (
            <div className="mt-4 sm:mt-6 flex justify-center items-center gap-3 sm:gap-4">
              {linkedinUrl && (
                <a
                  className="inline-flex items-center gap-2 hover:scale-110 transition-transform"
                  target="_blank"
                  rel="noreferrer"
                  href={
                    linkedinUrl.startsWith("http")
                      ? linkedinUrl
                      : `https://www.linkedin.com/in/${linkedinUrl}`
                  }
                >
                  <img
                    src={LinkedinImage}
                    alt="LinkedIn Profile"
                    width={32}
                    height={32}
                    className="w-8 h-8 sm:w-10 sm:h-10 hover:opacity-80 transition-opacity"
                  />
                </a>
              )}
              {xUrl && (
                <a
                  className="inline-flex items-center gap-2 hover:scale-110 transition-transform"
                  target="_blank"
                  rel="noreferrer"
                  href={
                    xUrl.startsWith("http") ? xUrl : `https://x.com/${xUrl}`
                  }
                >
                  <img
                    src={TwitterLogo}
                    alt="X/Twitter Profile"
                    width={32}
                    height={32}
                    className="w-8 h-8 sm:w-10 sm:h-10 hover:opacity-80 transition-opacity"
                  />
                </a>
              )}
            </div>
          )}

          {/* About Me */}
          {token && user?._id && aboutMe && (
            <div className="mt-4 sm:mt-6 text-left md:text-center">
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                Overview
              </h3>
              <p className="text-sm sm:text-base text-foreground leading-relaxed">
                {aboutMe}
              </p>
            </div>
          )}

          {/* Attended Events */}
          {token && user?._id && (
            <>
              {eventsLoading ? (
                <div className="mt-6 sm:mt-8 text-center py-4 sm:py-6">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-klout-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    Loading events...
                  </p>
                </div>
              ) : eventsWithImages.length > 0 ? (
                <div className="mt-6 sm:mt-8 text-left">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                      Attended Events
                    </h3>
                    {eventsWithImages.length > 4 && (
                      <Button
                        onClick={() => setShowAllEvents(!showAllEvents)}
                        variant="ghost"
                        className="text-klout-primary hover:text-klout-primary-dark hover:bg-klout-primary/10 text-xs sm:text-sm font-medium flex items-center gap-1"
                      >
                        {showAllEvents ? (
                          <>
                            Show Less
                            <ChevronUp className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            View All
                            <ChevronDown className="w-4 h-4" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {(showAllEvents
                      ? eventsWithImages
                      : eventsWithImages.slice(0, 4)
                    ).map((event) => (
                      <AttendedEventCard
                        key={event.eventUUID || event._id}
                        event={event}
                        onImageError={handleEventImageError}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          )}

          {/* Dialogs */}
          <ImageDialog
            isOpen={showImageDialog}
            imageUrl={selectedImageUrl}
            onClose={() => setShowImageDialog(false)}
          />

          {token && user?._id && (
            <>
              {/* Remove Connection Dialog */}
              <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent className="max-w-sm sm:max-w-md mx-4">
                  <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl">
                      Remove Connection
                    </DialogTitle>
                  </DialogHeader>
                  <p className="text-sm sm:text-base">
                    Are you sure you want to remove this connection?
                  </p>
                  <DialogFooter className="mt-4 flex flex-col sm:flex-row justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowConfirm(false)}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleRemoveConnection}
                      disabled={loadingAction}
                      className="bg-red-600 text-white w-full sm:w-auto"
                    >
                      {loadingAction ? "Removing..." : "Remove"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Report/Block Dialog */}
              <Dialog open={showReportBlock} onOpenChange={setShowReportBlock}>
                <DialogContent className="max-w-sm sm:max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl">
                      Report or Block
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                      {reportBlockAction === null && "Select an Action"}
                      {reportBlockAction === "block" &&
                        `Block ${firstName} ${lastName}`}
                      {reportBlockAction === "concern" && "Report Concern"}
                      {reportBlockAction === "profile" && "Report Profile"}
                    </DialogDescription>
                  </DialogHeader>

                  {reportBlockAction === null && (
                    <div className="space-y-2">
                      <button
                        onClick={() => setReportBlockAction("block")}
                        className="w-full text-left p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between text-sm sm:text-base"
                      >
                        <span className="font-medium">
                          Block {firstName} {lastName}
                        </span>
                        <span className="text-gray-400">→</span>
                      </button>
                      <button
                        onClick={() => setReportBlockAction("concern")}
                        className="w-full text-left p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between text-sm sm:text-base"
                      >
                        <span className="font-medium">Report concern</span>
                        <span className="text-gray-400">→</span>
                      </button>
                      <button
                        onClick={() => setReportBlockAction("profile")}
                        className="w-full text-left p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between text-sm sm:text-base"
                      >
                        <span className="font-medium">Report profile</span>
                        <span className="text-gray-400">→</span>
                      </button>
                    </div>
                  )}

                  {reportBlockAction === "block" && (
                    <div className="space-y-4">
                      <p className="text-xs sm:text-sm text-gray-600">
                        Are you sure you want to block this user? They won't be
                        able to see your profile or contact you.
                      </p>
                      <DialogFooter className="flex flex-col sm:flex-row gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setReportBlockAction(null)}
                          className="w-full sm:w-auto"
                        >
                          Back
                        </Button>
                        <Button
                          onClick={handleBlockUser}
                          disabled={blockLoading}
                          className="bg-red-600 text-white hover:bg-red-700 w-full sm:w-auto"
                        >
                          {blockLoading ? "Blocking..." : "Block User"}
                        </Button>
                      </DialogFooter>
                    </div>
                  )}

                  {reportBlockAction === "concern" && (
                    <div className="space-y-4">
                      <RadioGroup
                        value={selectedReason}
                        onValueChange={setSelectedReason}
                        className="space-y-2"
                      >
                        {[
                          "Fraud or scam",
                          "Misinformation",
                          "Harassment",
                          "Dangerous or extremist organizations",
                          "Threat or violence",
                          "Self-harm",
                          "Hateful speech",
                          "Graphic content",
                          "Sexual content",
                          "Child exploitation",
                          "Illegal goods and services",
                          "Infringement",
                        ].map((reason) => (
                          <div
                            key={reason}
                            className="flex items-center space-x-2"
                          >
                            <RadioGroupItem value={reason} id={reason} />
                            <Label
                              htmlFor={reason}
                              className="text-xs sm:text-sm cursor-pointer"
                            >
                              {reason}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                      <DialogFooter className="flex flex-col sm:flex-row gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setReportBlockAction(null);
                            setSelectedReason("");
                          }}
                          className="w-full sm:w-auto"
                        >
                          Back
                        </Button>
                        <Button
                          onClick={handleReportConcern}
                          disabled={loadingAction || !selectedReason}
                          className="bg-red-600 text-white hover:bg-red-700 w-full sm:w-auto"
                        >
                          {loadingAction ? "Reporting..." : "Report"}
                        </Button>
                      </DialogFooter>
                    </div>
                  )}

                  {reportBlockAction === "profile" && (
                    <div className="space-y-4">
                      <RadioGroup
                        value={selectedReason}
                        onValueChange={setSelectedReason}
                        className="space-y-2"
                      >
                        {[
                          "This person is impersonating someone else",
                          "This account is not a real person",
                        ].map((reason) => (
                          <div
                            key={reason}
                            className="flex items-center space-x-2"
                          >
                            <RadioGroupItem value={reason} id={reason} />
                            <Label
                              htmlFor={reason}
                              className="text-xs sm:text-sm cursor-pointer"
                            >
                              {reason}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                      <DialogFooter className="flex flex-col sm:flex-row gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setReportBlockAction(null);
                            setSelectedReason("");
                          }}
                          className="w-full sm:w-auto"
                        >
                          Back
                        </Button>
                        <Button
                          onClick={handleReportProfile}
                          disabled={loadingAction || !selectedReason}
                          className="bg-red-600 text-white hover:bg-red-700 w-full sm:w-auto"
                        >
                          {loadingAction ? "Reporting..." : "Report"}
                        </Button>
                      </DialogFooter>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {/* Contact Info Dialog */}
              <Dialog open={showContactInfo} onOpenChange={setShowContactInfo}>
                <DialogContent className="max-w-sm sm:max-w-md mx-4">
                  <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl font-semibold">
                      {firstName} {lastName}
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    {!profile?.showEmail && !profile?.showMobile ? (
                      <p className="text-center text-red-600 font-medium py-6">
                        User has hidden their contact details.
                      </p>
                    ) : !isLoggedInUserPremium ? (
                      <p className="text-center text-primary font-medium py-6">
                        Only premium users can view contact info.
                      </p>
                    ) : (
                      <div className="pb-4 border-b">
                        <h3 className="text-base font-semibold mb-4 text-gray-800">
                          Overview
                        </h3>

                        {profile?.showMobile && (
                          <div className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg
                                  className="w-5 h-5 text-gray-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                  />
                                </svg>
                              </div>
                              <span className="text-sm text-gray-700">
                                {showPhone
                                  ? profile?.mobileNumber
                                  : `••••••${String(profile?.mobileNumber).slice(-4)}`}
                              </span>
                            </div>
                            <button
                              className="p-2 hover:bg-gray-100 rounded-full"
                              onClick={() => setShowPhone(!showPhone)}
                            >
                              {showPhone ? (
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7-3.732 7-9.542 7S3.732 16.057 2.458 12z"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.48 0-8.27-2.94-9.54-7a9.97 9.97 0 011.56-3.03m5.86.9a3 3 0 114.24 4.24M9.88 9.88L3 3m0 0l3.59 3.59M3 3l3.59 3.59m0 0A9.95 9.95 0 0112 5c4.48 0 8.27 2.94 9.54 7a10.03 10.03 0 01-4.13 5.41m0 0L21 21"
                                  />
                                </svg>
                              )}
                            </button>
                          </div>
                        )}

                        {profile?.showEmail && (
                          <div className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg
                                  className="w-5 h-5 text-gray-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 12H8m8 0a4 4 0 110 8H8a4 4 0 110-8m8 0V6a4 4 0 10-8 0v6"
                                  />
                                </svg>
                              </div>
                              <span className="text-sm text-gray-700">
                                {showEmailState
                                  ? profile?.emailId
                                  : maskEmail(profile?.emailId)}
                              </span>
                            </div>
                            <button
                              className="p-2 hover:bg-gray-100 rounded-full"
                              onClick={() => setShowEmailState(!showEmailState)}
                            >
                              {showEmailState ? (
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7-3.732 7-9.542 7S3.732 16.057 2.458 12z"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.48 0-8.27-2.94-9.54-7a9.97 9.97 0 011.56-3.03m5.86.9a3 3 0 114.24 4.24M9.88 9.88L3 3m0 0l3.59 3.59m0 0A9.95 9.95 0 0112 5c4.48 0 8.27 2.94 9.54 7a10.03 10.03 0 01-4.13 5.41m0 0L21 21"
                                  />
                                </svg>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Bookmark Dialog */}
              <Dialog
                open={showBookmarkDialog}
                onOpenChange={setShowBookmarkDialog}
              >
                <DialogContent className="max-w-md mx-4">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                      Bookmark Profile
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600">
                      Add a note to remember why you bookmarked{" "}
                      <span className="font-semibold">
                        {profile.firstName} {profile.lastName}
                      </span>
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <label
                      htmlFor="bookmark-note"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Note (Optional)
                    </label>
                    <Textarea
                      id="bookmark-note"
                      placeholder="e.g., Great connection for future collaboration, Expert in AI/ML, Met at tech conference..."
                      value={bookmarkNote}
                      onChange={(e) => setBookmarkNote(e.target.value)}
                      className="w-full min-h-[100px] resize-none"
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {bookmarkNote.length}/500 characters
                    </p>
                  </div>
                  <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowBookmarkDialog(false);
                        setBookmarkNote("");
                      }}
                      className="w-full sm:w-auto"
                      disabled={loadingAction}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveBookmark}
                      disabled={loadingAction}
                      className="bg-blue-600 text-white hover:bg-blue-700 w-full sm:w-auto cursor-pointer"
                    >
                      {loadingAction ? (
                        <span className="flex items-center gap-2">
                          <svg
                            className="animate-spin h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Saving...
                        </span>
                      ) : (
                        "Save Bookmark"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* TLS Dialog */}
              <Dialog open={showTlsDialog} onOpenChange={setShowTlsDialog}>
                <DialogContent className="max-w-sm sm:max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                  {isLoggedInUserPremium ? (
                    <div className="text-center">
                      <div className="relative inline-block">
                        <img
                          src={TlsImage}
                          alt="TLS"
                          className="w-24 h-24 sm:w-32 sm:h-32 object-contain"
                        />
                        <span className="absolute inset-y-0 right-4 sm:right-6 top-1.5 sm:top-2 flex items-center text-white font-semibold text-lg sm:text-xl">
                          {score}
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">
                        Thought Leadership Score
                      </h2>

                      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                        {Object.entries(factorGroup).map(([key, value]) => {
                          const percentage =
                            score && score > 0
                              ? Math.round((value / score) * 100)
                              : 0;
                          const circumference = 251.2;
                          const offset = circumference * (1 - percentage / 100);
                          return (
                            <div
                              key={key}
                              className="p-3 sm:p-4 border rounded-lg"
                            >
                              <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-2">
                                <svg className="w-20 h-20 sm:w-24 sm:h-24 transform -rotate-90">
                                  <circle
                                    cx="40"
                                    cy="40"
                                    r="32"
                                    stroke="#E5E7EB"
                                    strokeWidth="6"
                                    fill="none"
                                    className="sm:hidden"
                                  />
                                  <circle
                                    cx="48"
                                    cy="48"
                                    r="40"
                                    stroke="#E5E7EB"
                                    strokeWidth="8"
                                    fill="none"
                                    className="hidden sm:block"
                                  />
                                  {percentage > 0 && (
                                    <>
                                      <circle
                                        cx="40"
                                        cy="40"
                                        r="32"
                                        stroke="#3B82F6"
                                        strokeWidth="6"
                                        fill="none"
                                        strokeDasharray={circumference * 0.8}
                                        strokeDashoffset={offset * 0.8}
                                        strokeLinecap="round"
                                        className="sm:hidden"
                                      />
                                      <circle
                                        cx="48"
                                        cy="48"
                                        r="40"
                                        stroke="#3B82F6"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={offset}
                                        strokeLinecap="round"
                                        className="hidden sm:block"
                                      />
                                    </>
                                  )}
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-lg sm:text-xl font-bold">
                                    {percentage}%
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs sm:text-sm text-gray-600">
                                {factorLabels[key] || key}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                        <div className="text-left">
                          <p className="text-xs sm:text-sm font-semibold mb-2">
                            Top Thought Leaders In:
                          </p>
                          <Button
                            className="w-full capitalize bg-primary hover:bg-primary-700 text-white cursor-pointer text-sm"
                            onClick={() => {
                              handleFetchCompanyMembers(company);
                              navigate(`/company/${company}/employees`);
                            }}
                            disabled={companyLoading || !company}
                          >
                            {companyLoading ? "Loading..." : company || "N/A"}
                          </Button>
                        </div>
                        <Button
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white cursor-pointer text-sm"
                          onClick={() =>
                            navigate(
                              `/compare-leadership-scores?user1=${user?._id}&user2=${id}`,
                            )
                          }
                        >
                          Compare your TLS
                        </Button>
                        <p className="text-xs text-gray-500">
                          Compare yourself with your connections
                        </p>
                      </div>

                      <div className="text-left bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <h3 className="font-bold mb-2 sm:mb-3 text-sm sm:text-base">
                          Improve your Thought Leadership Score:
                        </h3>
                        <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-700">
                          <li>• Update your complete profile</li>
                          <li>• Add a professional photo</li>
                          <li>
                            • When you attend events ask the organiser to update
                            your role whether a delegate, panelist/speaker, or
                            award winner.
                          </li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <img
                        src={TlsImage}
                        alt="TLS"
                        className="mx-auto w-16 h-16 sm:w-20 sm:h-20 mb-3 sm:mb-4"
                      />
                      <h2 className="font-bold mb-2 text-base sm:text-lg">
                        Thought Leadership Score
                      </h2>
                      <p className="text-gray-600 mb-3 sm:mb-4 text-xs sm:text-sm">
                        The Thought Leadership Score is a dynamic metric that
                        evaluates your professional influence and visibility
                        within your industry. It considers multiple dimensions
                        to provide a holistic view of your thought leadership
                        presence.
                      </p>
                      <p className="mb-3 sm:mb-4 font-bold text-xs sm:text-sm">
                        Upgrade to Klout Club Premium to understand how this
                        Thought Leadership Score was calculated and how you can
                        improve it further. Not only that, users get the option
                        to search in a wider radius and find business
                        professionals around them. Premium users also get access
                        to connect and reach out to other business professionals
                        directly.
                      </p>
                      <Button
                        onClick={handleOpenPremium}
                        className="bg-orange-500 cursor-pointer hover:bg-orange-600 hover:scale-105 text-white w-full text-sm"
                      >
                        Klout Club Premium
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              <PremiumDialog
                isOpen={isPremiumOpen}
                onClose={handleClosePremium}
                user={user}
                token={token || ""}
              />

              {/* Company Members Dialog */}
              <Dialog
                open={showCompanyMembersDialog}
                onOpenChange={setShowCompanyMembersDialog}
              >
                <DialogContent className="max-w-sm sm:max-w-4xl mx-4 max-h-[85vh] overflow-y-auto">
                  {companyTlsLoading ? (
                    <div className="flex justify-center items-center py-12 sm:py-16">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-klout-primary border-t-transparent rounded-full animate-spin"></div>
                      <p className="ml-3 sm:ml-4 text-gray-600 text-base sm:text-lg">
                        Loading members...
                      </p>
                    </div>
                  ) : companyError ? (
                    <div className="text-center py-8 sm:py-12 bg-red-50 rounded-lg">
                      <p className="text-red-600 font-semibold text-base sm:text-lg mb-2">
                        Error Loading Members
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {companyError}
                      </p>
                    </div>
                  ) : companyMembers && companyMembers.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {companyMembers.map((member: any) => (
                        <div
                          key={member._id}
                          className="border rounded-xl p-3 sm:p-5 mb-2 sm:mb-3 cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-klout-primary/50 bg-linear-to-r from-white to-primary-50/30"
                          onClick={() => {
                            setShowCompanyMembersDialog(false);
                            setShowReportBlock(false);
                            setShowTlsDialog(false);
                            navigate(`/profile/${member._id}`);
                          }}
                        >
                          <div className="flex items-start justify-between gap-3 sm:gap-4">
                            <div className="flex items-start gap-3 sm:gap-4 flex-1">
                              <div className="shrink-0">
                                <Avatar className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-3 border-klout-primary/20 shadow-md">
                                  <AvatarImage
                                    src={
                                      member.profileImage
                                        ? getUserProfileImage(
                                            user?.imageBaseUrl || "",
                                            member.profileImage,
                                          )
                                        : DummyImage
                                    }
                                    alt={`${member.first_name} ${member.last_name}`}
                                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-3 border-klout-primary/20 shadow-md"
                                    onError={(e: any) => {
                                      e.currentTarget.src = DummyImage;
                                    }}
                                  />
                                  <AvatarFallback className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm sm:text-base">
                                    <img
                                      src={DummyImage}
                                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-3 border-klout-primary/20 shadow-md"
                                    />
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                                  <h3 className="text-sm sm:text-lg font-semibold capitalize text-gray-900 hover:text-klout-primary truncate cursor-pointer">
                                    {member.first_name} {member.last_name}
                                  </h3>
                                  {member.role?.toLowerCase() === "premium" && (
                                    <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full">
                                      Premium
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs sm:text-sm font-semibold capitalize text-gray-600 mb-1">
                                  {member.designation ||
                                    member.jobFunction ||
                                    "Professional"}
                                </p>
                              </div>
                              <div className="flex flex-col items-center gap-2">
                                {member.score !== undefined && (
                                  <div className="relative w-12 h-9 sm:w-16 sm:h-12">
                                    <img
                                      src={TlsImage}
                                      alt="TLS"
                                      className="w-full h-full object-contain"
                                    />
                                    <span className="absolute inset-y-0 right-1 sm:right-2 top-0.5 sm:top-1 flex items-center text-white font-semibold text-xs sm:text-sm">
                                      {member.score}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 sm:py-16">
                      <p className="text-gray-600 mb-2 text-base sm:text-lg">
                        No members found
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Try searching for another company
                      </p>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfileDetails;
