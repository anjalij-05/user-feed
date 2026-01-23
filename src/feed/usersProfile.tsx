import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Grid,
  Film,
  User,
  Settings,
  MoreHorizontal,
  ArrowLeft,
} from "lucide-react";

// User data lookup function - matches the IDs from your Feed component
const getUserData = (userId: string) => {
  const users: Record<string, any> = {
    "1": {
      username: "sarah_chen",
      name: "Sarah Chen",
      bio: "📸 Product Manager at TechCorp\n🌍 Building the future\n✨ Tech enthusiast",
      posts: 147,
      followers: 12500,
      following: 890,
      profilePic:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      isVerified: true,
      userPosts: [
        {
          id: 1,
          image:
            "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=400&fit=crop",
          likes: 1247,
          comments: 89,
        },
        {
          id: 2,
          image:
            "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&h=400&fit=crop",
          likes: 2341,
          comments: 145,
        },
        {
          id: 3,
          image:
            "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=400&h=400&fit=crop",
          likes: 3456,
          comments: 234,
        },
        {
          id: 4,
          image:
            "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&h=400&fit=crop",
          likes: 987,
          comments: 67,
        },
        {
          id: 5,
          image:
            "https://images.unsplash.com/photo-1682687221038-404cb8830901?w=400&h=400&fit=crop",
          likes: 2109,
          comments: 156,
        },
        {
          id: 6,
          image:
            "https://images.unsplash.com/photo-1682687221080-5cb261c645cb?w=400&h=400&fit=crop",
          likes: 1567,
          comments: 98,
        },
      ],
    },
    "2": {
      username: "marcus_rodriguez",
      name: "Marcus Rodriguez",
      bio: "💻 Senior Developer\n🚀 Code & Coffee\n📱 Building cool stuff",
      posts: 89,
      followers: 8900,
      following: 654,
      profilePic:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      isVerified: false,
      userPosts: [
        {
          id: 1,
          image:
            "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&h=400&fit=crop",
          likes: 892,
          comments: 45,
        },
        {
          id: 2,
          image:
            "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=400&h=400&fit=crop",
          likes: 1234,
          comments: 67,
        },
        {
          id: 3,
          image:
            "https://images.unsplash.com/photo-1682687220199-d0124f48f95b?w=400&h=400&fit=crop",
          likes: 2109,
          comments: 89,
        },
      ],
    },
    "3": {
      username: "amit_patel",
      name: "Amit Patel",
      bio: "🎨 UX Director\n✨ Design thinking\n🌟 Creating experiences",
      posts: 203,
      followers: 15200,
      following: 1200,
      profilePic:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
      isVerified: true,
      userPosts: [
        {
          id: 1,
          image:
            "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=400&h=400&fit=crop",
          likes: 567,
          comments: 28,
        },
        {
          id: 2,
          image:
            "https://images.unsplash.com/photo-1682687221175-fd40bbafe6ca?w=400&h=400&fit=crop",
          likes: 3210,
          comments: 201,
        },
        {
          id: 3,
          image:
            "https://images.unsplash.com/photo-1682687220777-2c60708d6889?w=400&h=400&fit=crop",
          likes: 1890,
          comments: 134,
        },
      ],
    },
  };

  return users[userId] || null;
};

export default function UserPostProfile() {
  // Get the user ID from the URL
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("posts");
  const [isFollowing, setIsFollowing] = useState(false);

  // Get the profile data based on the ID from URL
  const profile = id ? getUserData(id) : null;

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">User not found</h2>
          <p className="text-gray-600 mb-4">This profile doesn't exist</p>
          <button
            onClick={() => navigate("/")}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go back to feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="border-b p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{profile.username}</h1>
            {profile.isVerified && (
              <svg
                className="w-5 h-5 text-primary"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2L9.19 8.63L2 9.24L7.46 14.03L5.82 21L12 17.27L18.18 21L16.54 14.03L22 9.24L14.81 8.63L12 2Z" />
              </svg>
            )}
          </div>
        </div>
        <div className="flex gap-4">
          <Settings className="w-6 h-6 cursor-pointer hover:text-gray-600 transition-colors" />
          <MoreHorizontal className="w-6 h-6 cursor-pointer hover:text-gray-600 transition-colors" />
        </div>
      </div>

      {/* Profile Info */}
      <div className="p-4">
        <div className="flex items-start gap-6 mb-4">
          <img
            src={profile.profilePic}
            alt={profile.name}
            className="w-20 h-20 rounded-full object-cover ring-2 ring-white shadow-lg"
          />

          <div className="flex-1">
            <div className="flex gap-8 mb-4">
              <div className="text-center">
                <div className="font-semibold text-lg">{profile.posts}</div>
                <div className="text-gray-600 text-sm">posts</div>
              </div>
              <div className="text-center cursor-pointer hover:text-gray-600 transition-colors">
                <div className="font-semibold text-lg">
                  {profile.followers.toLocaleString()}
                </div>
                <div className="text-gray-600 text-sm">followers</div>
              </div>
              <div className="text-center cursor-pointer hover:text-gray-600 transition-colors">
                <div className="font-semibold text-lg">
                  {profile.following.toLocaleString()}
                </div>
                <div className="text-gray-600 text-sm">following</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="font-semibold mb-1">{profile.name}</div>
          <div className="text-sm whitespace-pre-line text-gray-700">
            {profile.bio}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsFollowing(!isFollowing)}
            className={`flex-1 font-semibold py-2 rounded-lg transition-colors ${
              isFollowing
                ? "bg-gray-200 hover:bg-gray-300 text-gray-800"
                : "bg-primary text-white hover:bg-blue-700"
            }`}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
          <button className="flex-1 bg-gray-200 cursor-pointer font-semibold py-2 rounded-lg hover:bg-gray-300 transition-colors">
            Message
          </button>
          <button className="bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300 transition-colors">
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-t flex">
        <button
          onClick={() => setActiveTab("posts")}
          className={`flex-1 py-3 cursor-pointer flex justify-center transition-colors ${
            activeTab === "posts"
              ? "border-t-2 border-black"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Grid className="w-6 h-6" />
        </button>
        <button
          onClick={() => setActiveTab("reels")}
          className={`flex-1 py-3 flex cursor-pointer justify-center transition-colors ${
            activeTab === "reels"
              ? "border-t-2 border-black"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Film className="w-6 h-6" />
        </button>
      </div>

      {/* Posts Grid */}
      {activeTab === "posts" && (
        <div className="grid grid-cols-3 gap-1">
          {profile.userPosts.map((post: any) => (
            <div
              key={post.id}
              className="relative aspect-square group cursor-pointer"
            >
              <img
                src={post.image}
                alt={`Post ${post.id}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-6 text-white font-semibold">
                  <div className="flex items-center gap-2">
                    <Heart className="w-6 h-6 fill-white" />
                    <span>{post.likes.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-6 h-6 fill-white" />
                    <span>{post.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "reels" && (
        <div className="p-8 text-center text-gray-500">
          <Film className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>No reels yet</p>
        </div>
      )}
    </div>
  );
}
