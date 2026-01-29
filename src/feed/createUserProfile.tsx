import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Grid,
  Film,
  User,
  Settings,
  MoreHorizontal,
  X,
  Camera,
  Upload,
  Check,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


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
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileData, setProfileData] = useState({
    id: 21,
    firstName: "Azwedo",
    lastName: "Drdr",
    username: "azwedo_drdr",
    bio: "📸 Content Creator",
    gender: "male",
    posts: posts.length,
    followers: 12500,
    following: 890,
    profilePic:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
    isVerified: true,
  });

  const [editForm, setEditForm] = useState({
    firstName: profileData.firstName,
    lastName: profileData.lastName,
    bio: profileData.bio,
    gender: profileData.gender,
  });

  const [tempProfilePic, setTempProfilePic] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Transform posts to display format with original post data
  const displayPosts = posts.map((post) => ({
    ...post, // Keep all original post data
    media: post.image || "", // image OR video url
    mediaType: post.mediaType ?? "image",
  }));

  const reelPosts = displayPosts.filter((post) => post.mediaType === "video");

  const handleEditProfile = () => {
    setEditForm({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      bio: profileData.bio,
      gender: profileData.gender,
    });
    setTempProfilePic("");
    setShowEditModal(true);
  };

  const handleSaveProfile = () => {
    const updatedProfile = {
      ...profileData,
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      bio: editForm.bio,
      gender: editForm.gender,
    };

    if (tempProfilePic) {
      updatedProfile.profilePic = tempProfilePic;
    }

    setProfileData(updatedProfile);
    setShowEditModal(false);
    setTempProfilePic("");
  };

  const handleShareProfile = () => {
    alert(`Profile link: instagram.com/${profileData.username}`);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = () => {
        setTimeout(() => {
          if (typeof reader.result === "string") {
            setTempProfilePic(reader.result);
          }
          setIsUploading(false);
        }, 500);
      };
      reader.readAsDataURL(file);
    }
  };

  const currentProfilePic = tempProfilePic || profileData.profilePic;

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen relative">
      {/* Header */}
      <div className="border-b p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">{profileData.username}</h1>
          {profileData.isVerified && (
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
          <Settings className="w-6 h-6 cursor-pointer hover:text-gray-600 transition-colors" />
          <MoreHorizontal className="w-6 h-6 cursor-pointer hover:text-gray-600 transition-colors" />
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
                  {profileData.followers.toLocaleString()}
                </div>
                <div className="text-gray-600 text-sm">followers</div>
              </div>
              <div className="text-center cursor-pointer">
                <div className="font-semibold text-lg">
                  {profileData.following.toLocaleString()}
                </div>
                <div className="text-gray-600 text-sm">following</div>
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
            onClick={handleEditProfile}
            className="flex-1 bg-gray-200 cursor-pointer font-semibold py-1.5 rounded-lg hover:bg-gray-300 transition"
          >
            Edit profile
          </button>
          <button
            onClick={handleShareProfile}
            className="flex-1 bg-gray-200 cursor-pointer font-semibold py-1.5 rounded-lg hover:bg-gray-300 transition"
          >
            Share profile
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
        <div>
          {displayPosts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Grid className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No posts yet</p>
              <p className="text-sm mt-1">Share your first photo or video</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {displayPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/post/${post.id}`}
                  className="relative aspect-square group cursor-pointer"
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

                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
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

      {activeTab === "reels" && (
        <div>
          {reelPosts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Film className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No videos yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {reelPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/post/${post.id}`}
                  className="relative aspect-square cursor-pointer"
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

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-white/50 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
              <h2 className="font-bold text-xl bg-gradient-to-r cursor-pointer from-indigo-600 to-primary bg-clip-text text-transparent">
                Edit Profile
              </h2>
              <div className="w-9"></div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Profile Picture Section */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative group">
                  <div className="relative">
                    <img
                      src={currentProfilePic}
                      alt="Profile"
                      className="w-28 h-28 rounded-full object-cover ring-4 ring-white shadow-lg"
                    />
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2.5 bg-gradient-to-r cursor-pointer from-indigo-500 to-primary text-white rounded-full shadow-lg hover:from-indigo-600 hover:to-primary transition-all transform hover:scale-110"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 px-6 py-2.5 bg-gradient-to-r cursor-pointer from-blue-50 to-purple-50 text-primary font-semibold rounded-full hover:from-blue-100 hover:to-purple-100 transition-all flex items-center gap-2 border border-blue-200"
                >
                  <Upload className="w-4 h-4" />
                  Upload New Picture
                </button>
                {tempProfilePic && (
                  <div className="mt-2 flex items-center gap-2 text-green-600 text-sm font-medium">
                    <Check className="w-4 h-4" />
                    Image updated (save to confirm)
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={editForm.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Enter first name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={editForm.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Enter last name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={editForm.bio}
                    onChange={handleInputChange}
                    rows={4}
                    maxLength={150}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all"
                    placeholder="Tell us about yourself..."
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      Share what makes you unique
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        editForm.bio.length > 140
                          ? "text-red-500"
                          : "text-gray-500"
                      }`}
                    >
                      {editForm.bio.length} / 150
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gender
                  </label>

                  <Select
                    value={editForm.gender}
                    onValueChange={(value) =>
                      setEditForm((prev) => ({ ...prev, gender: value }))
                    }
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:ring-2 focus:ring-primary">
                      <SelectValue placeholder="Prefer not to say" />
                    </SelectTrigger>

                    <SelectContent className="rounded-xl">
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2.5 bg-white border cursor-pointer border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r cursor-pointer from-indigo-500 to-primary text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-primary transition-all shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
