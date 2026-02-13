import React, { useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import DummyImage from "@/assets/dummy_image.webp";
import { getUserProfileImage } from "@/lib/utils";
import { Phone, Mail, Sparkles } from "lucide-react";

const VCard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [isHovered, setIsHovered] = useState(false);

  const profileImg = user?.profileImage
    ? getUserProfileImage(user.imageBaseUrl, user.profileImage)
    : DummyImage;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-50 relative overflow-hidden">
      {/* Animated floating shapes in background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-300/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-fuchsia-300/20 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      {/* Business Card Container */}
      <div 
        className="relative w-full max-w-[900px] md:max-w-[500px] lg:max-w-[550px]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Glow effect on hover */}
        <div 
          className="absolute -inset-1 bg-gradient-to-r from-purple-400 via-violet-500 to-fuchsia-500 rounded-2xl opacity-0 blur-xl transition-all duration-500"
          style={{ opacity: isHovered ? 0.6 : 0 }}
        ></div>

        {/* Card - Responsive layout */}
        <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-purple-200 transition-transform duration-300 hover:scale-[1.02]">
          {/* Decorative corner elements */}
          <div className="absolute top-0 left-0 w-20 h-20 overflow-hidden">
            <div className="absolute -top-10 -left-10 w-20 h-20 bg-gradient-to-br from-purple-400/30 to-transparent rounded-full"></div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden">
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-bl from-violet-400/30 to-transparent rounded-full"></div>
          </div>

          {/* Purple geometric accent lines - animated */}
          <div className="absolute top-0 right-0 w-64 h-64 opacity-40 transition-opacity duration-500" style={{ opacity: isHovered ? 0.6 : 0.4 }}>
            <div className="absolute top-12 right-8 w-40 h-0.5 bg-gradient-to-l from-purple-500 to-transparent rotate-45 origin-right transition-all duration-500" style={{ width: isHovered ? '200px' : '160px' }}></div>
            <div className="absolute top-20 right-0 w-48 h-0.5 bg-gradient-to-l from-violet-600 to-transparent rotate-45 origin-right transition-all duration-500" style={{ width: isHovered ? '220px' : '192px' }}></div>
            <div className="absolute top-28 right-[-20px] w-40 h-0.5 bg-gradient-to-l from-fuchsia-500 to-transparent rotate-45 origin-right transition-all duration-500" style={{ width: isHovered ? '180px' : '160px' }}></div>
          </div>

          {/* Sparkle effect */}
          <div className="absolute top-4 right-4 text-purple-400/60 animate-pulse">
            <Sparkles className="w-5 h-5" />
          </div>

          {/* Responsive Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
            {/* Left section - Profile & Name */}
            <div className="md:col-span-2 flex flex-col justify-center items-center px-6 py-8 md:py-10 bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-50 relative">
              {/* Decorative dots pattern */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `radial-gradient(circle, rgba(139,92,246,0.3) 1px, transparent 1px)`,
                backgroundSize: '20px 20px'
              }}></div>

              {/* Profile image with animated purple border */}
              <div className="relative mb-5 group">
                <div className="absolute -inset-1 bg-gradient-to-br from-purple-400 via-violet-500 to-fuchsia-600 rounded-full blur-md group-hover:blur-lg transition-all duration-300 animate-spin-slow"></div>
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-purple-500 via-violet-600 to-fuchsia-600 rounded-full"></div>
                  <img
                    src={profileImg}
                    alt="Profile"
                    className="relative w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-white bg-white shadow-lg transform transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>

              {/* Name with gradient */}
              <h1 className="text-2xl md:text-2xl lg:text-3xl font-bold text-center mb-2 capitalize bg-gradient-to-r from-purple-700 via-violet-600 to-fuchsia-700 bg-clip-text text-transparent leading-tight animate-gradient"
                // style={{ fontFamily: "'Cinzel', serif" }}
              >
                {user?.first_name || "Guest"} {user?.last_name || ""}
              </h1>

              {/* Position badge */}
              {user?.designation && (
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-100 to-violet-100 border border-purple-300/50 mb-2">
                  <p className="text-xs text-purple-700 uppercase tracking-widest font-semibold capitalize" style={{ fontSize: '10px' }}>
                    {user.designation}
                  </p>
                </div>
              )}

              {/* Company with icon */}
              {user?.company && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                  <p className="text-sm text-gray-600 capitalize font-medium">
                    {user.company}
                  </p>
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                </div>
              )}

              {/* Decorative line */}
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent mt-4"></div>
            </div>

            {/* Right section - Contact Details */}
            <div className="md:col-span-3 flex flex-col justify-center px-6 md:px-8 py-8 md:py-10 bg-white space-y-5 relative">
              {/* Contact items with hover animations */}
              <div className="space-y-4">
                {/* Email */}
                <div className="group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-violet-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                  <div className="relative flex items-start gap-4 p-3 rounded-xl transition-all duration-300 border border-transparent group-hover:border-purple-200">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg group-hover:shadow-purple-300 transition-all duration-300 group-hover:scale-110">
                        <Mail className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold" style={{ fontSize: '9px' }}>Email Address</p>
                      <p className="text-sm md:text-base text-gray-800 break-all font-medium">
                        {user?.emailId || "guest@example.com"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-50 to-fuchsia-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                  <div className="relative flex items-start gap-4 p-3 rounded-xl transition-all duration-300 border border-transparent group-hover:border-purple-200">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg group-hover:shadow-violet-300 transition-all duration-300 group-hover:scale-110">
                        <Phone className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold" style={{ fontSize: '9px' }}>Phone Number</p>
                      <p className="text-sm md:text-base text-gray-800 font-medium">
                        {user?.mobileNumber || "Not Available"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom decorative element with animation */}
              <div className="pt-4 mt-auto">
                <div className="h-px bg-gradient-to-r from-purple-300 via-violet-400 to-transparent relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom decorative corner */}
          <div className="absolute bottom-0 right-0 w-24 h-24 overflow-hidden">
            <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-gradient-to-tl from-purple-400/30 to-transparent rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Custom font import */}
      <link
        href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&display=swap"
        rel="stylesheet"
      />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 30px) scale(1.1); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, 20px) scale(1.05); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 12s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 6s linear infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default VCard;