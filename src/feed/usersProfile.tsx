import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
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

interface UserPostProfileProps {
  allPosts: Post[];
}

export default function UserPostProfile({ allPosts }: UserPostProfileProps) {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("posts");
  const [isFollowing, setIsFollowing] = useState(false);

  // console.log("UserPostProfile - userId from URL:", userId);
  // console.log("UserPostProfile - allPosts:", allPosts);

  // Find the user based on post ID or username
  // When clicking from feed, userId will be the post.id
  const clickedPost = allPosts.find((p) => p.id.toString() === userId);
  
  // console.log("UserPostProfile - clickedPost:", clickedPost);

  if (!clickedPost) {
    return (
      <div className="max-w-4xl mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">User not found</h2>
          <p className="text-gray-600 mb-4">
            Looking for user ID: {userId}
          </p>
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

  // Get all posts from this user
  const userPosts = allPosts.filter((p) => p.name === clickedPost.name);
  const username = clickedPost.name.toLowerCase().replace(/\s+/g, "_");

  console.log("UserPostProfile - userPosts:", userPosts);

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="border-b p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{username}</h1>
            <svg
              className="w-5 h-5 text-primary"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2L9.19 8.63L2 9.24L7.46 14.03L5.82 21L12 17.27L18.18 21L16.54 14.03L22 9.24L14.81 8.63L12 2Z" />
            </svg>
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
            src={clickedPost.avatar}
            alt={clickedPost.name}
            className="w-20 h-20 rounded-full object-cover ring-2 ring-white shadow-lg"
          />

          <div className="flex-1">
            <div className="flex gap-8 mb-4">
              <div className="text-center">
                <div className="font-semibold text-lg">{userPosts.length}</div>
                <div className="text-gray-600 text-sm">posts</div>
              </div>
              <div className="text-center cursor-pointer hover:text-gray-600 transition-colors">
                <div className="font-semibold text-lg">
                  {(clickedPost.likes * 10).toLocaleString()}
                </div>
                <div className="text-gray-600 text-sm">followers</div>
              </div>
              <div className="text-center cursor-pointer hover:text-gray-600 transition-colors">
                <div className="font-semibold text-lg">
                  {(clickedPost.comments * 8).toLocaleString()}
                </div>
                <div className="text-gray-600 text-sm">following</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="font-semibold mb-1">{clickedPost.name}</div>
          <div className="text-sm text-gray-700">{clickedPost.role}</div>
          <div className="text-sm text-gray-600 mt-2">
            ✨ {clickedPost.content.substring(0, 100)}
            {clickedPost.content.length > 100 ? "..." : ""}
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
        <div>
          {userPosts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Grid className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No posts yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {userPosts.map((post) => {
                const postImage = post.image || post.images?.[0];
                return (
                  <Link
                    key={post.id}
                    to={`/post/${post.id}`}
                    className="relative aspect-square group cursor-pointer"
                  >
                    {post.mediaType === "video" ? (
                      <video
                        src={postImage}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <img
                        src={postImage}
                        alt={`Post by ${post.name}`}
                        className="w-full h-full object-cover"
                      />
                    )}

                    {post.mediaType === "video" && (
                      <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1">
                        <Film className="w-4 h-4 text-white" />
                      </div>
                    )}

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
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "reels" && (
        <div>
          {userPosts.filter((p) => p.mediaType === "video").length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Film className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No videos yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {userPosts
                .filter((p) => p.mediaType === "video")
                .map((post) => {
                  const postImage = post.image || post.images?.[0];
                  return (
                    <Link
                      key={post.id}
                      to={`/post/${post.id}`}
                      className="relative aspect-square group cursor-pointer"
                    >
                      <video
                        src={postImage}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                      />
                      <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1">
                        <Film className="w-4 h-4 text-white" />
                      </div>
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
                    </Link>
                  );
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}