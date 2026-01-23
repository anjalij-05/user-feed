import { useState, useRef } from "react";
import {
  // Heart,
  // MessageCircle,
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

interface UserProfileProps {
  posts: {
    id: number;
    image: string;
    likes: number;
    comments: number;
  }[];
}

export default function UserProfile({ posts }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState("posts");
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "Sarah",
    lastName: "Johnson",
    username: "sarah.johnson",
    bio: "📸 Travel & Lifestyle",
    gender: "female",
    posts: posts.length,
    followers: 12500,
    following: 890,
    profilePic: "...",
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

  // const posts = [
  //   {
  //     id: 1,
  //     image:
  //       "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&h=400&fit=crop",
  //     likes: 1234,
  //     comments: 89,
  //   },
  //   {
  //     id: 2,
  //     image:
  //       "https://images.unsplash.com/photo-1682687221038-404cb8830901?w=400&h=400&fit=crop",
  //     likes: 2341,
  //     comments: 145,
  //   },
  //   {
  //     id: 3,
  //     image:
  //       "https://images.unsplash.com/photo-1682687221080-5cb261c645cb?w=400&h=400&fit=crop",
  //     likes: 3456,
  //     comments: 234,
  //   },
  //   {
  //     id: 4,
  //     image:
  //       "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=400&h=400&fit=crop",
  //     likes: 987,
  //     comments: 67,
  //   },
  //   {
  //     id: 5,
  //     image:
  //       "https://images.unsplash.com/photo-1682687220199-d0124f48f95b?w=400&h=400&fit=crop",
  //     likes: 2109,
  //     comments: 156,
  //   },
  //   {
  //     id: 6,
  //     image:
  //       "https://images.unsplash.com/photo-1682687220067-dced9a881b56?w=400&h=400&fit=crop",
  //     likes: 1567,
  //     comments: 98,
  //   },
  // ];

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
                <div className="font-semibold text-lg">{profileData.posts}</div>
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

      {/* Story Highlights */}
      {/* <div className="px-4 pb-4 flex gap-6 overflow-x-auto">
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
      </div> */}

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
        <div className="grid grid-cols-3 gap-1">
          {posts.map((post) => (
            <div
              key={post.id}
              className="relative aspect-square group cursor-pointer"
            >
              <img
                src={post.image}
                alt="Post"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <div className="flex gap-6 text-white font-semibold">
                  <div className="flex items-center gap-2">❤️ {post.likes}</div>
                  <div className="flex items-center gap-2">
                    💬 {post.comments}
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
                  <div className="relative">
                    <select
                      name="gender"
                      value={editForm.gender}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none cursor-pointer transition-all pr-10"
                    >
                      <option value="">Prefer not to say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="other">Other</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
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
