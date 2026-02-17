import { useState, useRef } from "react";
import { ArrowLeft, X, Loader2, Image, Video, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useLocation } from "react-router-dom";
import type { Post } from "@/types/post";

interface EditPostProps {
  onPostUpdated: (post: Post) => void;
}

const EditPost = ({ onPostUpdated }: EditPostProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const existingPost: Post = location.state?.post;

  const [postDescription, setPostDescription] = useState(
    existingPost?.content || "",
  );
  const [imagePreviews, setImagePreviews] = useState<string[]>(() => {
    if (existingPost?.images && existingPost.images.length > 0)
      return existingPost.images;
    if (existingPost?.image) return [existingPost.image];
    return [];
  });
  const [videoPreview, setVideoPreview] = useState<string>(
    existingPost?.mediaType === "video" && existingPost?.image
      ? existingPost.image
      : "",
  );
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(
    existingPost?.mediaType || null,
  );
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showPermission, setShowPermission] = useState(false);
  const [pendingMediaType, setPendingMediaType] = useState<
    "image" | "video" | null
  >(null);
  // Track whether user explicitly cleared all media
  const [mediaCleared, setMediaCleared] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  if (!existingPost) {
    navigate("/");
    return null;
  }

  const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const previews = files.map((file) => URL.createObjectURL(file));
    setUploadedImages(files);
    setImagePreviews(previews);
    setMediaType("image");
    setVideoPreview("");
    setMediaCleared(false); // new media added, no longer cleared
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoPreview(URL.createObjectURL(file));
      setMediaType("video");
      setUploadedImages([]);
      setImagePreviews([]);
      setMediaCleared(false); // new media added
    }
  };

  const clearMedia = () => {
    setUploadedImages([]);
    setImagePreviews([]);
    setVideoPreview("");
    setMediaType(null);
    setMediaCleared(true); // user explicitly removed all media
  };

  const removeImage = (index: number) => {
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
    setUploadedImages(newImages);
    if (newPreviews.length === 0) {
      setMediaType(null);
      setMediaCleared(true); // last image removed
    }
  };

  const handlePostSubmit = async () => {
    setIsUploading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const updatedImages = mediaCleared
      ? []
      : imagePreviews.length > 0
        ? imagePreviews
        : [
            ...(existingPost.image ? [existingPost.image] : []),
            ...(existingPost.images || []),
          ];

    onPostUpdated({
      ...existingPost,
      content: postDescription,
      image: mediaCleared ? undefined : updatedImages[0],
      images: mediaCleared ? [] : updatedImages.slice(1),
      mediaType: mediaCleared
        ? undefined
        : (mediaType ?? existingPost.mediaType),
    });

    setIsUploading(false);
    navigate(-1);
  };

  const canPost =
    !!postDescription.trim() &&
    (imagePreviews.length > 0 ||
      !!videoPreview ||
      (!mediaCleared &&
        (!!existingPost?.image ||
          (existingPost?.images && existingPost.images.length > 0))));

  // hasMedia respects the cleared state
  const hasMedia =
    !mediaCleared &&
    (imagePreviews.length > 0 ||
      !!videoPreview ||
      !!existingPost?.image ||
      !!(existingPost?.images && existingPost.images.length > 0));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-slate-100 -ml-2 cursor-pointer"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Edit Post
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
                  <span className="hidden sm:inline">Saving...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-6">
          {/* Media Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
            <div className="p-6">
              <label className="text-sm font-semibold mb-4 block text-slate-700">
                Media <span className="text-red-500">*</span>
              </label>

              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesUpload}
                className="hidden"
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
              />

              {hasMedia ? (
                <div className="space-y-3">
                  {/* Image previews */}
                  {imagePreviews.length > 0 && mediaType !== "video" && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {imagePreviews.map((src, index) => (
                        <div
                          key={index}
                          className="relative rounded-xl overflow-hidden group border"
                        >
                          <img
                            src={src}
                            className="w-full h-40 object-cover"
                            alt={`preview-${index}`}
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute cursor-pointer top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                      {/* Add more images button */}
                      {/* <button
                        onClick={() => {
                          setPendingMediaType("image");
                          setShowPermission(true);
                        }}
                        className="border-2 cursor-pointer border-dashed border-slate-300 rounded-xl h-40 flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50/50 transition-all"
                      >
                        <Image className="w-6 h-6 text-slate-400" />
                        <span className="text-xs text-slate-500">Add more</span>
                      </button> */}
                    </div>
                  )}

                  {/* Video preview */}
                  {videoPreview && mediaType === "video" && (
                    <div className="relative rounded-xl overflow-hidden">
                      <video
                        src={videoPreview}
                        controls
                        className="w-full max-h-[400px] bg-black"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={clearMedia}
                        className="absolute top-3 right-3 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  {/* Remove all media button */}
                  <button
                    onClick={clearMedia}
                    className="text-xs cursor-pointer text-red-500 hover:text-red-700 font-medium underline"
                  >
                    Remove all media
                  </button>
                </div>
              ) : (
                // Upload buttons — shown when no media OR after clearing
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
                          Upload Images
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          JPG, PNG, GIF up to 10MB each
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
                        <Video className="w-8 h-8 text-purple-600" />
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
            </div>
          </div>

          {/* Description Section */}
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

          {/* Preview Section */}
          {hasMedia && (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
              <h3 className="text-sm font-semibold mb-3 text-slate-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Preview
              </h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-gradient-to-br from-slate-100 to-slate-50">
                  {imagePreviews.length > 0 && mediaType !== "video" ? (
                    <div className="grid grid-cols-2 gap-2 p-2">
                      {imagePreviews.map((src, index) => (
                        <img
                          key={index}
                          src={src}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  ) : videoPreview ? (
                    <video
                      src={videoPreview}
                      className="w-full max-h-[600px] object-contain bg-black"
                    />
                  ) : null}
                </div>
                <div className="p-4">
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {postDescription}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Permission Dialog */}
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
                className="flex-1 cursor-pointer"
                onClick={() => {
                  setShowPermission(false);
                  setPendingMediaType(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 text-white"
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

export default EditPost;
