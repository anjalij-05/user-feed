import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Grid, Film, User, Settings } from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import DummyImage from "@/assets/dummy_image.webp";

interface Post {
  id: number;
  name: string;
  role: string;
  timestamp: string;
  avatar: string;
  image?: string;
  mediaType?: "image" | "video";
  title: string;
  content: string;
  images?: string[];
  likes: number;
  comments: number;
  shares?: number;
}

interface UserProfileProps {
  posts: Post[];
}

export default function UserProfile({ posts }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState("posts");
  const navigate = useNavigate();

  // Get user data from Redux store
  const { user } = useAppSelector((state) => state.auth);

  // Dynamic profile data based on logged-in user
  const [profileData, setProfileData] = useState({
    id: user?._id || 21,
    firstName: user?.first_name || "Guest",
    lastName: user?.last_name || "User",
    // username: user?.username || "guest_user",
    bio: user?.bio || "📸 Content Creator",
    posts: posts.length,
    connections: user?.connections?.length || 0,
    tls: user?.tls || 0,
    profilePic: user?.profileImage
      ? `${user?.imageBaseUrl}${user?.profileImage}`
      : DummyImage,
  });

  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        id: user._id || 21,
        firstName: user.first_name || "Guest",
        lastName: user.last_name || "User",
        // username: user.username || "guest_user",
        bio: user.bio || "📸 Content Creator",
        posts: posts.length,
        connections: user.connections?.length || 0,
        tls: user.tls || 0,
        profilePic: user.profileImage
          ? `${user.imageBaseUrl}${user.profileImage}`
          : DummyImage,
      });
    }
  }, [user, posts.length]);

  console.log("Profile Data:", profileData);

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
          <h1 className="text-xl font-semibold">{profileData.firstName} {profileData.lastName}</h1>
       
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
              className="w-20 h-20 rounded-full object-cover ring-2 ring-gray-200"
            />
          </div>

          <div className="flex-1">
            <div className="flex gap-8 mb-4">
              <div className="text-center">
                <div className="font-semibold text-lg">{posts.length}</div>
                <div className="text-gray-600 text-sm">posts</div>
              </div>
              <div className="text-center cursor-pointer">
                <div className="font-semibold text-lg">
                  {profileData.connections.toLocaleString()}
                </div>
                <div className="text-gray-600 text-sm">connections</div>
              </div>
              <div className="text-center cursor-pointer">
                <div className="font-semibold text-lg">
                  {profileData.tls.toLocaleString()}
                </div>
                <div className="text-gray-600 text-sm">tls</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="font-semibold mb-1">
            {profileData.firstName} {profileData.lastName}
          </div>
          <div className="text-sm whitespace-pre-line">{profileData.bio}</div>
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
          <button className="bg-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-300">
            <User className="w-5 h-5" />
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
                  className="relative group cursor-pointer h-[250px] md:h-[200px] w-full"
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
                  className="relative group cursor-pointer h-[250px] md:h-[200px] w-full"
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
    </div>
  );
}