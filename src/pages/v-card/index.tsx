import React, { useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import DummyImage from "@/assets/dummy_image.webp";
import { getUserProfileImage } from "@/lib/utils";
import logo from "@/assets/logo.webp";

const VCard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [isHovered, setIsHovered] = useState(false);

  const profileImg = user?.profileImage
    ? getUserProfileImage(user.imageBaseUrl, user.profileImage)
    : DummyImage;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 bg-gray-100">
      {/* Business Card */}
      <div
        className="relative w-full max-w-[500px]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="relative bg-white rounded-2xl overflow-hidden border border-gray-200 transition-all duration-300"
          style={{
            boxShadow: isHovered
              ? "0 20px 60px rgba(0,0,0,0.15)"
              : "0 8px 30px rgba(0,0,0,0.10)",
            transform: isHovered ? "scale(1.01)" : "scale(1)",
          }}
        >
          {/* SVG Curved Decorative Lines — top right area */}
          <svg
            className="absolute top-0 right-0 w-full h-full"
            viewBox="0 0 700 380"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
            style={{ pointerEvents: "none" }}
          >
            <ellipse
              cx="650"
              cy="80"
              rx="260"
              ry="220"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="1.6"
              opacity="0.9"
            />
            <ellipse
              cx="680"
              cy="100"
              rx="310"
              ry="270"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="1.3"
              opacity="0.7"
            />
            <ellipse
              cx="710"
              cy="60"
              rx="360"
              ry="320"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="1"
              opacity="0.55"
            />
          </svg>

          {/* Card Content */}
          <div
            className="relative z-10 p-4 md:p-6"
            style={{ minHeight: "170px" }}
          >
            {/* Top Row: Profile photo (left) + Logo (right) */}
            <div className="flex justify-between items-start mb-4">
              {/* Profile Photo */}
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                <img
                  src={profileImg}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Company Logo — top right, fixed height, natural width */}
              {user?.company && (
                <div className="flex items-start">
                  <img
                    src={logo}
                    alt={user.company}
                    className="h-7 w-auto object-contain"
                  />
                </div>
              )}
            </div>

            {/* Name — font-bold (reduced from font-black), text-2xl/3xl */}
            <h1 className="text-lg md:text-xl font-bold text-gray-900 mb-1 uppercase tracking-tight leading-none">
              {user?.first_name || "Guest"} {user?.last_name}
            </h1>

            {/* Designation */}
            {user?.designation && (
              <p
                className="text-primary font-semibold uppercase tracking-widest mb-1"
                style={{ fontSize: "0.85rem", letterSpacing: "0.12em" }}
              >
                {user.designation}
              </p>
            )}

            {/* Company (below designation, subtle) */}
            {user?.company && (
              <p className="text-gray-500 capitalize text-sm mb-8">
                {user.company}
              </p>
            )}

            {/* Contact Details */}
            <div className="space-y-1 mt-3">
              <p className="text-gray-800 text-sm md:text-base font-medium">
                {user?.emailId || "guest@example.com"}
              </p>
              <p className="text-gray-800 text-sm md:text-base font-medium">
                {user?.mobileNumber || "Not Available"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VCard;
