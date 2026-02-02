import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getUserProfileImage } from "@/lib/utils";
import axios from "axios";
import { appUrl } from "@/constants";
import { updateUserProfile } from "@/app-api/user";
import { getUserProfile } from "@/app-api/auth";

interface ProfileImageUploaderProps {
  onClose?: () => void;
  context: "signup" | "profile";
  onTempSave?: (file: File) => void;
}

const ProfileImageUploader: React.FC<ProfileImageUploaderProps> = ({
  onClose,
  context,
  onTempSave,
}) => {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!selectedFile) {
      toast.error("Please select an image first");
      return;
    }

    if (context === "signup") {
      if (onTempSave) {
        onTempSave(selectedFile);
        toast.success(
          "Profile image selected! Will be saved after registration."
        );
      }
      onClose?.();
      return;
    }

    if (context === "profile") {
      try {
        setLoading(true);

        // Step 1: Upload image
        const formData = new FormData();
        formData.append("image", selectedFile);

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
        console.log("The image key is: ", imageKey);
        if (!imageKey) {
          toast.error("Upload succeeded but no image key returned");
          return;
        }

        // Step 2: Update user profile
        await dispatch(updateUserProfile({ ...user, profileImage: imageKey })).unwrap();

        // localStorage.setItem("klout-app-user", JSON.stringify(state.user));
        await dispatch(getUserProfile({token: token || "", userid: user?._id || ""})).unwrap();

        toast.success("Profile image updated successfully!");
        onClose?.();
      } catch (error: any) {
        console.error("Image upload error:", error);
        toast.error(error.response?.data?.message || "Error uploading image");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {preview ? (
        <img
          src={preview}
          alt="Preview"
          className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
        />
      ) : user?.profileImage ? (
        <img
          src={getUserProfileImage(
            (user as any)?.imageBaseUrl || "",
            user.profileImage
          )}
          alt="Current Profile"
          className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
        />
      ) : (
        <p className="text-gray-500 text-sm">No image selected</p>
      )}

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mt-4 cursor-pointer"
      />

      <div className="flex gap-4 mt-4">
        <Button
          className="bg-klout-primary cursor-pointer text-white hover:bg-klout-primary-dark"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </Button>
        <Button variant="outline" onClick={onClose} className="cursor-pointer">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default ProfileImageUploader;
