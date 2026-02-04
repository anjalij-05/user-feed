import React, { useState, useEffect } from "react";
import { Camera, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getUserProfileImage } from "@/lib/utils";
import axios from "axios";
import { appUrl } from "@/constants";
import { updateUserProfile } from "@/app-api/user";
import { getUserProfile } from "@/app-api/auth";
import DummyImage from "@/assets/dummy_image.webp";

type UploadedImage = {
  id: string;
  file: File | null;
  preview: string;
  isDefault: boolean;
  isExisting?: boolean;
  imageKey?: string;
};

interface MultiImageUploadProps {
  onClose: () => void;
}

// Helper to parse images from the backend format
const parseImages = (imagesData: string | string[] | undefined): string[] => {
  if (!imagesData) return [];

  // If it's already an array, return it
  if (Array.isArray(imagesData)) return imagesData;

  // If it's a string, try to parse it
  try {
    const parsed = JSON.parse(imagesData);

    // Backend format: [{"Image": "path/to/image.jpg"}]
    if (Array.isArray(parsed)) {
      return parsed
        .map((item: any) => {
          // Handle both formats: {"Image": "..."} and plain strings
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

// Helper to format images for the backend
const formatImagesForBackend = (imageKeys: string[]): string => {
  // Backend expects: [{"Image": "path/to/image.jpg"}]
  const formatted = imageKeys.map((key) => ({ Image: key }));
  return JSON.stringify(formatted);
};

const MultiImageUpload: React.FC<MultiImageUploadProps> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Load existing images on mount
  useEffect(() => {
    const loadImages = () => {
      console.log("Loading images...", {
        images: user?.images,
        profileImage: user?.profileImage,
        imageBaseUrl: user?.imageBaseUrl,
      });

      // Parse images from backend format
      const parsedImages = parseImages(user?.images);
      console.log("Parsed images:", parsedImages);

      if (parsedImages.length > 0) {
        const loadedImages: UploadedImage[] = parsedImages.map(
          (imgKey: string, index: number) => {
            const imageUrl = getUserProfileImage(
              user?.imageBaseUrl || "",
              imgKey
            );
            return {
              id: `existing-${index}`,
              file: null,
              preview: imageUrl || DummyImage,
              isDefault: index === 0,
              isExisting: true,
              imageKey: imgKey,
            };
          }
        );
        setImages(loadedImages);
      } else if (user?.profileImage) {
        // Fallback to profile image
        const profileImageUrl = getUserProfileImage(
          user?.imageBaseUrl || "",
          user.profileImage
        );
        const profileImage = {
          id: "existing-0",
          file: null,
          preview: profileImageUrl || DummyImage,
          isDefault: true,
          isExisting: true,
          imageKey: user.profileImage,
        };
        setImages([profileImage]);
      } else {
        setImages([]);
      }
    };

    if (user) {
      loadImages();
    }
  }, [user?.profileImage, user?.images, user?.imageBaseUrl, user]);

  const handleFileSelect = (index: number) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];

      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error("Image size should be less than 5MB");
          return;
        }

        if (!file.type.startsWith("image/")) {
          toast.error("Please select a valid image file");
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          const newImages = [...images];
          const imageId = `img-${Date.now()}-${index}`;
          const isFirst = images.length === 0;

          if (index < images.length) {
            newImages[index] = {
              id: imageId,
              file,
              preview: event.target?.result as string,
              isDefault: newImages[index].isDefault || isFirst,
              isExisting: false,
            };
          } else {
            newImages.push({
              id: imageId,
              file,
              preview: event.target?.result as string,
              isDefault: isFirst,
              isExisting: false,
            });
          }

          setImages(newImages);
          toast.success("Image added successfully");
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const setDefaultImage = (id: string) => {
    setImages(
      images.map((img) => ({
        ...img,
        isDefault: img.id === id,
      }))
    );
    toast.success("Default cover image updated");
  };

  const removeImage = (id: string) => {
    const updatedImages = images.filter((img) => img.id !== id);

    if (
      updatedImages.length > 0 &&
      !updatedImages.some((img) => img.isDefault)
    ) {
      updatedImages[0].isDefault = true;
    }

    setImages(updatedImages);
    toast.success("Image removed");
  };

  const uploadSingleImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    const uploadRes = await axios.post(
      `${appUrl}/api/v1/upload/image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const imageKey = uploadRes.data?.key || uploadRes.data?.data?.key;

    if (!imageKey) {
      throw new Error("Upload succeeded but no image key returned");
    }

    return imageKey;
  };

  const handleSave = async () => {
    if (images.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    setIsUploading(true);

    try {
      const uploadedImageKeys: string[] = [];

      console.log("Starting upload process...", images);

      // Upload new images and keep existing ones
      for (let i = 0; i < images.length; i++) {
        const img = images[i];

        if (img.file) {
          console.log("Uploading new image...");
          const imageKey = await uploadSingleImage(img.file);
          uploadedImageKeys.push(imageKey);
        } else if (img.imageKey) {
          console.log("Keeping existing image:", img.imageKey);
          uploadedImageKeys.push(img.imageKey);
        }
      }

      // Reorder to put default image first
      const defaultIndex = images.findIndex((img) => img.isDefault);
      if (defaultIndex > 0) {
        const defaultKey = uploadedImageKeys[defaultIndex];
        uploadedImageKeys.splice(defaultIndex, 1);
        uploadedImageKeys.unshift(defaultKey);
      }

      console.log("Final cover images array:", uploadedImageKeys);

      // Format images for backend: [{"Image": "path"}]
      const formattedImages = formatImagesForBackend(uploadedImageKeys);
      console.log("Formatted for backend:", formattedImages);

      // Update user profile
      await dispatch(
        updateUserProfile({
          images: formattedImages,
        })
      ).unwrap();

      console.log("Profile updated successfully");

      // Refresh the full user profile to get updated data
      await dispatch(
        getUserProfile({
          token: token || "",
          userid: user?._id || "",
        })
      ).unwrap();

      console.log("User profile refreshed successfully");

      toast.success("Cover images updated successfully!");

      // Small delay to ensure state updates
      setTimeout(() => {
        onClose();
      }, 300);
    } catch (error: any) {
      console.error("Error uploading images:", error);
      toast.error(error.response?.data?.message || "Error uploading images");
    } finally {
      setIsUploading(false);
    }
  };

  const imageSlots = Array.from({ length: 6 }, (_, index) => {
    const image = images[index];
    return { index, image };
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Upload Images</h2>
        {/* <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          disabled={isUploading}
        >
          <X className="w-5 h-5" />
        </button> */}
      </div>

      <p className="text-center text-gray-600 text-lg mb-6 font-medium">
        Add Photos
      </p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {imageSlots.map(({ index, image }) => (
          <div
            key={index}
            className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden group cursor-pointer hover:bg-gray-300 transition-colors"
          >
            {image ? (
              <>
                <img
                  src={image.preview}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== DummyImage) {
                      console.error("Failed to load image:", image.preview);
                      target.src = DummyImage;
                    }
                  }}
                />

                {image.isDefault && (
                  <div className="absolute top-2 left-1 bg-klout-primary text-white text-xs px-1 py-1 rounded-md font-semibold shadow-md z-10">
                    Default
                  </div>
                )}

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center gap-2">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2 items-center">
                    {!image.isDefault && (
                      <button
                        onClick={() => setDefaultImage(image.id)}
                        disabled={isUploading}
                        className="bg-white text-gray-800 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-100 transition-colors shadow-md"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => removeImage(image.id)}
                      disabled={isUploading}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleFileSelect(index)}
                      disabled={isUploading}
                      className="bg-white text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors shadow-md"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <button
                onClick={() => handleFileSelect(index)}
                disabled={isUploading}
                className="w-full h-full flex items-center justify-center hover:bg-gray-300 transition-colors"
              >
                <div className="flex flex-col items-center gap-2">
                  <Camera className="w-10 h-10 text-gray-400" />
                  <span className="text-xs text-gray-500 font-medium">
                    Add Photo
                  </span>
                </div>
              </button>
            )}
          </div>
        ))}
      </div>

      <p className="text-center text-gray-500 text-sm mb-6">
        Tap to replace • First image will be your cover photo
      </p>

      <button
        onClick={handleSave}
        disabled={isUploading || images.length === 0}
        className={`w-full py-3.5 rounded-lg text-lg font-semibold transition-colors shadow-md ${
          isUploading || images.length === 0
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
        }`}
      >
        {isUploading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Uploading...
          </span>
        ) : (
          "Save"
        )}
      </button>
    </div>
  );
};

export default MultiImageUpload;
