import React from "react";
import { useAppSelector } from "@/redux/hooks";
import DummyImage from "@/assets/dummy_image.webp";
import { getUserProfileImage } from "@/lib/utils";

const VCard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  const profileImg = user?.profileImage
    ? getUserProfileImage(user.imageBaseUrl, user.profileImage)
    : DummyImage;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      {/* Centered H3 */}
      <h3 className="text-lg font-semibold mb-4 text-center">Your V-Card</h3>

      {/* Card */}
      <div className="bg-background border border-white/50 rounded-2xl shadow-lg w-full max-w-sm overflow-hidden">
        {/* Top background */}
        <div className="relative h-40">
          <img
            src={profileImg}
            alt="Background"
            className="w-full h-full object-cover blur-lg scale-110"
          />
          {/* Profile Image */}
          <div className="absolute inset-0 flex justify-center items-end -mb-16">
            <img
              src={profileImg}
              alt="Profile"
              className="rounded-full w-32 h-32 object-cover border-2 border-white shadow-md"
            />
          </div>
        </div>

        {/* Card content */}
        <div className="flex flex-col items-center mt-20 px-6 pb-6">
          <h1 className="text-2xl capitalize font-bold text-foreground">
            {user?.first_name || "Guest"} {user?.last_name || ""}
          </h1>
          <p className="capitalize text-base mt-1">{user?.designation}</p>
          <p className="capitalize text-base">{user?.company}</p>

          {/* Contact info */}
          <p className="text-foreground/60 mt-4">
            {user?.emailId || "guest@example.com"}
          </p>
          <p className="text-foreground/60">
            {user?.mobileNumber || "Not Available"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VCard;
