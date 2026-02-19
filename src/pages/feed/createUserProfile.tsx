import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Grid, Film, Settings } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import DummyImage from "@/assets/dummy_image.webp";
import { getUserProfileImage } from "@/lib/utils";
import { fetchTlsScore } from "@/app-api/tls";
import { checkConnectionStatus, getMyConnections } from "@/app-api/connections";
import ImageDialog from "@/components/imageDialogBox";
import type { Post } from "@/types/post";
import type { Connection } from "@/types/post";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import TlsImage from "@/assets/tlsImage.webp";

interface ConnectionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  connections: Connection[];
}

export function ConnectionsDialog({
  isOpen,
  onClose,
  connections,
}: ConnectionsDialogProps) {
  const navigate = useNavigate();
  const { user: appUser } = useAppSelector((state) => state.auth);

  if (!isOpen) return null;

  const handleProfileClick = (connection: Connection) => {
    onClose();
    navigate(`/profile/${connection._id}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-sm mx-4 max-h-[70vh] flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="font-semibold text-base">Connections</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black transition text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 divide-y">
          {connections.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No connections yet
            </div>
          ) : (
            connections.map((connection) => (
              <div
                key={connection._id}
                onClick={() => handleProfileClick(connection)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition"
              >
                <img
                  src={
                    connection.profileImage
                      ? getUserProfileImage(
                          appUser?.imageBaseUrl as string,
                          connection.profileImage,
                        )
                      : DummyImage
                  }
                  alt={connection.first_name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm capitalize truncate">
                    {connection.first_name} {connection.last_name}
                  </p>
                  {connection.designation && (
                    <p className="text-xs text-gray-500 capitalize truncate">
                      {connection.designation}
                      {connection.company ? ` · ${connection.company}` : ""}
                    </p>
                  )}
                </div>
                <svg
                  className="w-4 h-4 text-gray-400 shrink-0"
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
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

interface UserProfileProps {
  posts: Post[];
}

export default function UserProfile({ posts }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState("posts");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [dialogOpen, setDialogOpen] = useState(false);
  // const [showFullOverview, setShowFullOverview] = useState(false);
  const [connectionsDialogOpen, setConnectionsDialogOpen] = useState(false);
  const [showTlsDialog, setShowTlsDialog] = useState(false);
  // Get user data from Redux store
  const { user, token } = useAppSelector((state) => state.auth);
  const {
    score,
    factorGroup,
    loading: tlsLoading,
  } = useAppSelector((state) => state.tls);
  const {
    connectionsList,
    userProfiles,
    loading: connectionsLoading,
  } = useAppSelector((state) => state.connection);

  // console.log("User:", user);
  // console.log("Token:", token);
  // console.log("TLS Score:", score);
  // console.log("Connections List:", connectionsList);

  // Fetch TLS score and connections on component mount
  useEffect(() => {
    console.log("=== UserProfile Mount - Starting API calls ===");

    // Fetch TLS Score if we have the required data
    if (user?.mobileNumber && token) {
      console.log("Calling fetchTlsScore with mobile:", user.mobileNumber);
      dispatch(
        fetchTlsScore({
          mobileNumber: user.mobileNumber,
        }),
      );
    } else {
      console.log("Cannot fetch TLS - missing data:", {
        hasMobile: !!user?.mobileNumber,
        hasToken: !!token,
      });
    }

    // Fetch Connections with geolocation
    if (user?._id && token) {
      // console.log("Attempting to fetch connections for user:", user._id);

      if (user?._id && token) {
        dispatch(checkConnectionStatus({ token, userId: user._id }));
      }
      // Try to get user's actual location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log("Got user location:", {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });

            dispatch(
              getMyConnections({
                token: token,
                userId: user._id,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                distance: 50,
              }),
            );
          },
          (error) => {
            console.log(
              "Geolocation error, using default location:",
              error.message,
            );
            // Fallback to default location if geolocation fails
            dispatch(
              getMyConnections({
                token: token,
                userId: user._id,
                latitude: 28.4595, // Default: Gurugram
                longitude: 77.0266,
                distance: 50,
              }),
            );
          },
          {
            timeout: 5000,
            maximumAge: 300000, // Use cached location up to 5 minutes old
          },
        );
      } else {
        console.log("Geolocation not available, using default location");
        // Fallback if geolocation is not supported
        dispatch(
          getMyConnections({
            token: token,
            userId: user._id,
            latitude: 28.4595, // Default: Gurugram
            longitude: 77.0266,
            distance: 50,
          }),
        );
      }
    } else {
      console.log("Cannot fetch connections - missing data:", {
        hasUserId: !!user?._id,
        hasToken: !!token,
      });
    }
  }, [dispatch, user?._id, user?.mobile_number, token]);

  // Dynamic profile data based on logged-in user
  const [profileData, setProfileData] = useState({
    id: user?._id || 21,
    firstName: user?.first_name || "Guest",
    lastName: user?.last_name || "User",
    companyName: user?.company || "Klout Club",
    designation: user?.designation || "Content Creator",
    overview: user?.aboutMe || "📸 Content Creator",
    posts: posts.length,
    connections: connectionsList.length || 0,
    tls: score || 0,
    profilePic: user?.profileImage
      ? getUserProfileImage(user?.imageBaseUrl, user?.profileImage)
      : DummyImage,
  });

  // Update profile data when user, score, or connectionsList changes
  useEffect(() => {
    // console.log("Updating profile data - score:", score, "connections:", connectionsList.length);

    if (user) {
      setProfileData({
        id: user._id || 21,
        firstName: user.first_name || "Guest",
        lastName: user.last_name || "User",
        designation: user.designation,
        companyName: user.company,
        overview: user.aboutMe,
        posts: posts.length,
        connections: connectionsList.length || 0,
        tls: score || 0,
        profilePic: user.profileImage
          ? getUserProfileImage(user?.imageBaseUrl, user?.profileImage)
          : DummyImage,
      });
    }
  }, [user, posts.length, score, connectionsList.length]);

  // console.log("Profile Data:", profileData);got

  // Transform posts to display format with original post data
  const displayPosts = posts.map((post) => ({
    ...post,
    media: post.image || (post.images && post.images[0]) || "",
    mediaType: post.mediaType ?? "image",
  }));

  const reelPosts = displayPosts.filter((post) => post.mediaType === "video");

  const handleShareProfile = () => {
    alert(`Profile link: kloutclub.com/${profileData.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen relative">
      {/* Header */}
      <div className="border-b p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">
            {profileData.firstName} {profileData.lastName}
          </h1>
        </div>
        <div className="flex gap-4">
          <Link to="/settings">
            <Settings className="w-6 h-6 cursor-pointer hover:text-gray-600 transition-colors" />
          </Link>
        </div>
      </div>

      {/* Profile Info */}
      <div className="p-4">
        <div className="flex items-start gap-6 mb-4">
          <div className="relative">
            <img
              src={profileData.profilePic}
              alt={`${profileData.firstName} ${profileData.lastName}`}
              className="w-20 h-20 rounded-full object-cover ring-2 ring-gray-200 cursor-pointer"
              onClick={() => setDialogOpen(true)}
            />
          </div>

          <div className="flex-1">
            <div className="flex gap-8 mb-4">
              <div className="text-center">
                <div className="font-semibold text-lg">{posts.length}</div>
                <div className="text-gray-600 text-sm">posts</div>
              </div>
              <div
                className="text-center cursor-pointer"
                onClick={() => setConnectionsDialogOpen(true)}
              >
                {" "}
                <div className="font-semibold text-lg">
                  {connectionsLoading ? (
                    <span className="text-gray-400">...</span>
                  ) : (
                    connectionsList.length.toLocaleString()
                  )}
                </div>
                <div className="text-gray-600 text-sm">connections</div>
              </div>
              <div
                className="text-center cursor-pointer"
                onClick={() => setShowTlsDialog(true)}
              >
                <div className="font-semibold text-lg">
                  {tlsLoading ? (
                    <span className="text-gray-400">...</span>
                  ) : score !== null ? (
                    score.toLocaleString()
                  ) : (
                    "N/A"
                  )}
                </div>
                <div className="text-gray-600 text-sm">tls</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="font-semibold mb-1 capitalize">
            {profileData.firstName} {profileData.lastName}
          </div>
          <div className="text-sm whitespace-pre-line capitalize">
            {profileData.designation}
          </div>
          <div className="text-sm whitespace-pre-line capitalize ">
            {profileData.companyName}
          </div>

          {/* <div className="text-sm mt-2 whitespace-pre-line">
            <p className={`${showFullOverview ? "" : "line-clamp-1"}`}>
              {profileData.overview}
            </p>

            {profileData.overview && profileData.overview.length > 80 && (
              <button
                onClick={() => setShowFullOverview(!showFullOverview)}
                className="text-gray-500 text-xs font-medium mt-1 hover:text-black transition"
              >
                {showFullOverview ? "Show less" : "more"}
              </button>
            )}
          </div> */}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate("/my-profile")}
            className="flex-1 bg-gray-200 cursor-pointer font-semibold py-1.5 rounded-lg hover:bg-gray-300 transition"
          >
            Edit profile
          </button>
          <button
            onClick={() => navigate("/my-attended-events")}
            className="flex-1 bg-gray-200 cursor-pointer font-semibold py-1.5 rounded-lg hover:bg-gray-300 transition"
          >
            Attended Events
          </button>
          <button
            onClick={() => navigate("/v-card")}
            className="flex-1 bg-gray-200 cursor-pointer font-semibold py-1.5 rounded-lg hover:bg-gray-300 transition"
          >
            V-Card
          </button>
          <button
            onClick={handleShareProfile}
            className="flex-1 bg-gray-200 cursor-pointer font-semibold py-1.5 rounded-lg hover:bg-gray-300 transition"
          >
            Share Profile
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-t flex">
        <button
          onClick={() => setActiveTab("posts")}
          className={`flex-1 py-3 cursor-pointer flex justify-center ${
            activeTab === "posts" ? "border-t-2 border-black" : "text-gray-400"
          }`}
        >
          <Grid className="w-6 h-6" />
        </button>
        <button
          onClick={() => setActiveTab("reels")}
          className={`flex-1 py-3 cursor-pointer flex justify-center ${
            activeTab === "reels" ? "border-t-2 border-black" : "text-gray-400"
          }`}
        >
          <Film className="w-6 h-6" />
        </button>
      </div>

      {/* Posts Grid */}
      {activeTab === "posts" && (
        <div className="w-full">
          {displayPosts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Grid className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No posts yet</p>
              <p className="text-sm mt-1">Share your first photo or video</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-0.5">
              {displayPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/post/${post.id}`}
                  className="relative group cursor-pointer h-[120px] md:h-[200px] w-full"
                >
                  {post.mediaType === "video" ? (
                    <video
                      src={post.media}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <img
                      src={post.media}
                      alt="Post"
                      className="w-full h-full object-cover"
                    />
                  )}

                  {post.mediaType === "video" && (
                    <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1">
                      <Film className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"></div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "reels" && (
        <div className="w-full">
          {reelPosts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Film className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No videos yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-0.5">
              {reelPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/post/${post.id}`}
                  className="relative group cursor-pointer h-[120px] md:h-[200px] w-full"
                >
                  <video
                    src={post.media}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                  />

                  {post.mediaType === "video" && (
                    <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1">
                      <Film className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition flex items-center justify-center">
                    <div className="flex gap-6 text-white font-semibold">
                      ❤️ {post.likes}
                      💬 {post.comments}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      <Dialog open={showTlsDialog} onOpenChange={setShowTlsDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <div className="text-center">
            <div className="relative inline-block">
              <img
                src={TlsImage}
                alt="TLS"
                className="w-28 h-28 object-contain"
              />
              <span className="absolute inset-y-0 right-5 top-2 flex items-center text-white font-bold text-xl">
                {score}
              </span>
            </div>
            <h2 className="text-xm font-bold mb-4 mt-2">
              Thought Leadership Score
            </h2>

            {/* TLS Breakdown Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {Object.entries(factorGroup || {}).map(([key, value]) => {
                const factorLabels: Record<string, string> = {
                  yourTotalExperience: "Your Total Experience",
                  yourCurrentJob: "Your Current Job",
                  eventYouAttend: "Events You Attended",
                  yourEducation: "Your Education",
                  mediaPresence: "Media Presence",
                  others: "Others",
                };
                const percentage =
                  score && score > 0 ? Math.round((value / score) * 100) : 0;
                const circumference = 251.2;
                const offset = circumference * (1 - percentage / 100);

                return (
                  <div key={key} className="p-4 border rounded-lg">
                    <div className="relative w-22 h-22 mx-auto mb-2">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="#E5E7EB"
                          strokeWidth="8"
                          fill="none"
                        />
                        {percentage > 0 && (
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
                          />
                        )}
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold">{percentage}%</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {factorLabels[key] || key}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mb-6">
              <div className="text-left">
                <p className="text-sm font-semibold mb-2">
                  Top Thought Leaders In:
                </p>
                <button
                  className="w-full bg-klout-primary hover:bg-klout-secondary text-white py-2 rounded-lg cursor-pointer font-medium transition"
                  onClick={() => {
                    setShowTlsDialog(false);
                    navigate(`/company/${user?.company}/employees`);
                  }}
                >
                  {user?.company || "Klout Club"}
                </button>
              </div>
              <button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg cursor-pointer font-medium transition"
                onClick={() => {
                  setShowTlsDialog(false);
                  navigate(`/compare-leadership-scores?user1=${user?._id}`);
                }}
              >
                Compare your TLS
              </button>
              <p className="text-xs text-gray-500">
                Compare yourself with your connections
              </p>
            </div>

            {/* Improvement Tips */}
            <div className="text-left bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold mb-3">
                Improve your Thought Leadership Score:
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Update your complete profile</li>
                <li>• Add a professional photo</li>
                <li>
                  • When you attend events ask the organiser to update your role
                  whether a delegate, panelist/speaker, or award winner.
                </li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConnectionsDialog
        isOpen={connectionsDialogOpen}
        onClose={() => setConnectionsDialogOpen(false)}
        connections={userProfiles}
      />

      <ImageDialog
        isOpen={dialogOpen}
        imageUrl={
          user?.profileImage
            ? getUserProfileImage(user.imageBaseUrl || "", user.profileImage)
            : DummyImage
        }
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}
