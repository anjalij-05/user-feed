import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Grid,
  Film,
  User,
  Settings,
  MoreHorizontal,
} from "lucide-react";

export default function UserPostProfile() {
  const [activeTab, setActiveTab] = useState("posts");

  const profile = {
    username: "sarah.johnson",
    name: "Sarah Johnson",
    bio: "📸 Travel & Lifestyle\n🌍 Currently in Bali\n✨ Living my best life",
    posts: 147,
    followers: 12500,
    following: 890,
    profilePic:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    isVerified: true,
  };

  const posts = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&h=400&fit=crop",
      likes: 1234,
      comments: 89,
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1682687221038-404cb8830901?w=400&h=400&fit=crop",
      likes: 2341,
      comments: 145,
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1682687221080-5cb261c645cb?w=400&h=400&fit=crop",
      likes: 3456,
      comments: 234,
    },
    {
      id: 4,
      image:
        "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=400&h=400&fit=crop",
      likes: 987,
      comments: 67,
    },
    {
      id: 5,
      image:
        "https://images.unsplash.com/photo-1682687220199-d0124f48f95b?w=400&h=400&fit=crop",
      likes: 2109,
      comments: 156,
    },
    {
      id: 6,
      image:
        "https://images.unsplash.com/photo-1682687220067-dced9a881b56?w=400&h=400&fit=crop",
      likes: 1567,
      comments: 98,
    },
    {
      id: 7,
      image:
        "https://images.unsplash.com/photo-1682687221175-fd40bbafe6ca?w=400&h=400&fit=crop",
      likes: 3210,
      comments: 201,
    },
    {
      id: 8,
      image:
        "https://images.unsplash.com/photo-1682687220777-2c60708d6889?w=400&h=400&fit=crop",
      likes: 1890,
      comments: 134,
    },
    {
      id: 9,
      image:
        "https://images.unsplash.com/photo-1682687220923-c58b9a4592ae?w=400&h=400&fit=crop",
      likes: 2567,
      comments: 178,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="border-b p-4 flex justify-between items-center">
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
        <div className="flex gap-4">
          <Settings className="w-6 h-6 cursor-pointer" />
          <MoreHorizontal className="w-6 h-6 cursor-pointer" />
        </div>
      </div>

      {/* Profile Info */}
      <div className="p-4">
        <div className="flex items-start gap-6 mb-4">
          <img
            src={profile.profilePic}
            alt={profile.name}
            className="w-20 h-20 rounded-full object-cover"
          />

          <div className="flex-1">
            <div className="flex gap-8 mb-4">
              <div className="text-center">
                <div className="font-semibold text-lg">{profile.posts}</div>
                <div className="text-gray-600 text-sm">posts</div>
              </div>
              <div className="text-center cursor-pointer">
                <div className="font-semibold text-lg">
                  {profile.followers.toLocaleString()}
                </div>
                <div className="text-gray-600 text-sm">followers</div>
              </div>
              <div className="text-center cursor-pointer">
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
          <div className="text-sm whitespace-pre-line">{profile.bio}</div>
        </div>

        <div className="flex gap-2">
          <button className="flex-1 bg-primary cursor-pointer text-white font-semibold py-1.5 rounded-lg hover:bg-primary-dark">
            Follow
          </button>
          <button className="flex-1 bg-gray-200 cursor-pointer font-semibold py-1.5 rounded-lg hover:bg-gray-300">
            Message
          </button>
          <button className="bg-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-300">
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Story Highlights - Optional */}
      <div className="px-4 pb-4 flex gap-6 overflow-x-auto">
        {["Travel", "Food", "Beach", "Sunset"].map((highlight, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5">
              <div className="w-full h-full rounded-full bg-white p-0.5">
                <div className="w-full h-full rounded-full bg-gray-200"></div>
              </div>
            </div>
            <span className="text-xs">{highlight}</span>
          </div>
        ))}
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
          className={`flex-1 py-3 flex cursor-pointer justify-center ${
            activeTab === "reels" ? "border-t-2 border-black" : "text-gray-400"
          }`}
        >
          <Film className="w-6 h-6" />
        </button>
        {/* <button
          onClick={() => setActiveTab("tagged")}
          className={`flex-1 py-3 flex justify-center ${
            activeTab === "tagged" ? "border-t-2 border-black" : "text-gray-400"
          }`}
        >
          <User className="w-6 h-6" />
        </button> */}
      </div>

      {/* Posts Grid */}
      {activeTab === "posts" && (
        <div className="grid grid-cols-3 gap-1">
          {posts.map((post) => (
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

      {/* {activeTab === "tagged" && (
        <div className="p-8 text-center text-gray-500">
          <User className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>No tagged posts yet</p>
        </div>
      )} */}
    </div>
  );
}
