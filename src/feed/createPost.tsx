import { useState, useRef } from "react";
import {
  ArrowLeft,
  Upload,
  X,
  Loader2,
  // Check,
  Image,
  Video,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";

interface CreatePostProps {
  onPostCreated: (post: {
    id: number;
    name: string;
    role: string;
    timestamp: string;
    avatar: string;
    image?: string;
    mediaType?: "image" | "video";
    title: string;
    content: string;
    likes: number;
    comments: number;
    shares?: number;
  }) => void;
}

const CreatePost = ({ onPostCreated }: CreatePostProps) => {
  const navigate = useNavigate();
  const [uploadedMedia, setUploadedMedia] = useState<File | null>(null);
  const [uploadedMediaPreview, setUploadedMediaPreview] = useState<string>("");
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [postTitle, setPostTitle] = useState("");
  const [postDescription, setPostDescription] = useState("");
  const [selectedBackgroundImage, setSelectedBackgroundImage] =
    useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "background">("upload");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [showPermission, setShowPermission] = useState(false);
  const [pendingMediaType, setPendingMediaType] = useState<
    "image" | "video" | null
  >(null);

  // const backgroundImages = [
  //   "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=600&fit=crop",
  //   "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&h=600&fit=crop",
  //   "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&h=600&fit=crop",
  //   "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800&h=600&fit=crop",
  //   "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop",
  //   "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=600&fit=crop",
  // ];

  const handleMediaUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "video",
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedMedia(file);
      setUploadedMediaPreview(URL.createObjectURL(file));
      setMediaType(type);
      setSelectedBackgroundImage("");
    }
  };

  // const handleBackgroundSelect = (imageUrl: string) => {
  //   setSelectedBackgroundImage(imageUrl);
  //   setUploadedMedia(null);
  //   setUploadedMediaPreview("");
  //   setMediaType("image");
  // };

  const clearMedia = () => {
    setUploadedMedia(null);
    setUploadedMediaPreview("");
    setMediaType(null);
    setSelectedBackgroundImage("");
  };

  const handlePostSubmit = async () => {
    setIsUploading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newPost = {
      id: Date.now(),
      name: "Azwedo Drdr", // Current user's name
      role: "Content Creator", // Current user's role
      timestamp: "Just now",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop", // Current user's avatar
      image: uploadedMediaPreview || selectedBackgroundImage,
      mediaType: (mediaType || "image") as "image" | "video",
      title: postTitle,
      content: postDescription,
      likes: 0,
      comments: 0,
      shares: 0,
    };

    onPostCreated(newPost);
    setIsUploading(false);

    // Reset form
    setPostTitle("");
    setPostDescription("");
    clearMedia();

    // Navigate back to feed
    navigate("/");
  };

  const canPost =
    postTitle.trim() &&
    postDescription.trim() &&
    (uploadedMedia || selectedBackgroundImage);
  const hasMedia = uploadedMediaPreview || selectedBackgroundImage;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-slate-100 -ml-2"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Create Post
              </h1>
            </div>
            <Button
              onClick={handlePostSubmit}
              disabled={isUploading || !canPost}
              className="bg-gradient-to-r cursor-pointer from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:shadow-none"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Posting...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : (
                "Post"
              )}
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
            <div className="p-6">
              <label className="text-sm font-semibold mb-4 block text-slate-700">
                Media <span className="text-red-500">*</span>
              </label>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab("upload")}
                  className={`flex-1 py-2 px-4 rounded-lg cursor-pointer font-medium text-sm transition-all ${
                    activeTab === "upload"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  Upload
                </button>
                {/* <button
                  onClick={() => setActiveTab("background")}
                  className={`flex-1 py-2 px-4 rounded-lg cursor-pointer font-medium text-sm transition-all ${
                    activeTab === "background"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Image className="w-4 h-4 inline mr-2" />
                  Backgrounds
                </button> */}
              </div>

              {activeTab === "upload" && (
                <>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleMediaUpload(e, "image")}
                    className="hidden"
                  />
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleMediaUpload(e, "video")}
                    className="hidden"
                  />

                  {uploadedMediaPreview ? (
                    <div className="relative rounded-xl overflow-hidden group bg-gradient-to-br from-slate-100 to-slate-50">
                      {mediaType === "image" ? (
                        <img
                          src={uploadedMediaPreview}
                          alt="Preview"
                          className="w-full max-h-[600px] object-contain"
                        />
                      ) : (
                        <video
                          src={uploadedMediaPreview}
                          controls
                          className="w-full max-h-[600px] object-contain bg-black"
                        />
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={clearMedia}
                        className="absolute top-3 right-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          setPendingMediaType("image");
                          setShowPermission(true);
                        }}
                        className="group relative border-2 border-dashed border-slate-300 rounded-xl p-8 hover:border-blue-500 hover:bg-blue-50/50 transition-all"
                      >
                        <div className="flex flex-col items-center cursor-pointer gap-3 text-center">
                          <div className="p-4 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                            <Image className="w-8 h-8 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-700">
                              Upload Image
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              JPG, PNG, GIF up to 10MB
                            </p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setPendingMediaType("video");
                          setShowPermission(true);
                        }}
                        className="group relative border-2 border-dashed border-slate-300 rounded-xl p-8 hover:border-purple-500 hover:bg-purple-50/50 transition-all"
                      >
                        <div className="flex flex-col items-center cursor-pointer gap-3 text-center">
                          <div className="p-4 rounded-full bg-purple-100 group-hover:bg-purple-200 transition-colors">
                            <Video className="w-8 h-8 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-700">
                              Upload Video
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              MP4, MOV, AVI up to 100MB
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* {activeTab === "background" && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {backgroundImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleBackgroundSelect(img)}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all aspect-video group ${
                        selectedBackgroundImage === img
                          ? "border-primary ring-4 ring-primary/20 scale-95"
                          : "border-slate-200 hover:border-primary hover:scale-95"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Background ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {selectedBackgroundImage === img && (
                        <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                          <div className="p-2 bg-white rounded-full shadow-lg">
                            <Check className="w-5 h-5 text-primary" />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )} */}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
            <label className="text-sm font-semibold mb-3 block text-slate-700">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Give your post an engaging title..."
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              className="text-lg font-medium border-slate-300 focus:border-primary focus:ring-primary/20"
              maxLength={100}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-slate-500">
                Make it catchy and descriptive
              </p>
              <p
                className={`text-xs font-medium ${postTitle.length > 90 ? "text-red-500" : "text-slate-500"}`}
              >
                {postTitle.length}/100
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
            <label className="text-sm font-semibold mb-3 block text-slate-700">
              Description <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="Share your thoughts, story, or message..."
              value={postDescription}
              onChange={(e) => setPostDescription(e.target.value)}
              rows={6}
              className="resize-none border-slate-300 focus:border-primary focus:ring-primary/20"
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-slate-500">Express yourself freely</p>
              <p
                className={`text-xs font-medium ${postDescription.length > 450 ? "text-red-500" : "text-slate-500"}`}
              >
                {postDescription.length}/500
              </p>
            </div>
          </div>

          {hasMedia && postTitle && (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
              <h3 className="text-sm font-semibold mb-3 text-slate-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Preview
              </h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-gradient-to-br from-slate-100 to-slate-50">
                  {uploadedMediaPreview ? (
                    mediaType === "image" ? (
                      <img
                        src={uploadedMediaPreview}
                        alt="Preview"
                        className="w-full max-h-[600px] object-contain"
                      />
                    ) : (
                      <video
                        src={uploadedMediaPreview}
                        className="w-full max-h-[600px] object-contain bg-black"
                      />
                    )
                  ) : selectedBackgroundImage ? (
                    <img
                      src={selectedBackgroundImage}
                      alt="Preview"
                      className="w-full max-h-[600px] object-contain"
                    />
                  ) : null}
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-slate-900 mb-1">{postTitle}</h4>
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {postDescription}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {showPermission && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center space-y-4">
            <h2 className="text-lg font-bold">Allow access to media</h2>
            <p className="text-sm text-slate-600">
              This allows you to upload{" "}
              {pendingMediaType === "image" ? "photos" : "videos"} from your
              device.
            </p>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowPermission(false);
                  setPendingMediaType(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                onClick={() => {
                  setShowPermission(false);
                  if (pendingMediaType === "image") {
                    imageInputRef.current?.click();
                  } else if (pendingMediaType === "video") {
                    videoInputRef.current?.click();
                  }
                  setPendingMediaType(null);
                }}
              >
                Allow
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePost;
