import React, { useEffect, useState } from "react";
import DummyImage from "@/assets/dummy_image.webp";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector } from "@/redux/hooks";
import { getUserProfileImage } from "@/lib/utils";
import { User, CreditCard, Calendar, Settings } from "lucide-react";
import ImageDialog from "@/components/imageDialogBox";

const ProfileSetting: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);

  // useEffect(() => {
  //   if (!user) navigate("/user-login");
  // }, [user, navigate]);

  const profileImg = user?.profileImage
    ? getUserProfileImage(user.imageBaseUrl, user.profileImage)
    : DummyImage;

  const handleImageClick = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);

  const buttons = [
    {
      label: "Edit Profile",
      desc: "Manage your profile",
      icon: <User className="mr-3 w-5 h-5" />,
      link: "/my-profile",
    },
    {
      label: "Your V-Card",
      desc: "See your V-Card",
      icon: <CreditCard className="mr-3 w-5 h-5" />,
      link: "/v-card",
    },
    {
      label: "My Attended Events",
      desc: "See your events",
      icon: <Calendar className="mr-3 w-5 h-5" />,
      onClick: () => navigate("/my-attended-events"),
    },
    {
      label: "Settings",
      desc: "Manage your settings",
      icon: <Settings className="mr-3 w-5 h-5" />,
      onClick: () => navigate("/settings"),
    },
  ];

  return (
    <div className="flex flex-col items-center w-full bg-background px-4 py-8">
      {/* Profile Card */}
      <div className="p-6 flex flex-col items-center w-full max-w-md">
        <img
          src={profileImg}
          alt="Profile"
          className="rounded-full w-32 h-32 object-cover border-4 p-1 border-primary shadow-md cursor-pointer"
          onClick={handleImageClick}
        />
        <h1 className="text-xl sm:text-2xl font-bold mt-4 text-foreground text-center capitalize">
          {user?.first_name || "Guest User"} {user?.last_name || ""}
        </h1>

        {/* Buttons */}
        <div className="mt-8 w-full flex gap-3 flex-col">
          {buttons.map((btn, index) => {
            const content = (
              <div className="flex items-center justify-between py-4 px-4 bg-muted hover:bg-accent rounded-xl cursor-pointer transition">
                <div className="flex items-center">
                  {btn.icon}
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">
                      {btn.label}
                    </span>
                    <span className="text-muted-foreground text-sm">{btn.desc}</span>
                  </div>
                </div>
                <span className="text-muted-foreground">&rarr;</span>
              </div>
            );

            return btn.link ? (
              <Link key={index} to={btn.link}>
                {content}
              </Link>
            ) : (
              <div key={index} onClick={btn.onClick}>
                {content}
              </div>
            );
          })}
        </div>
      </div>

      {/* Image Dialog */}
      <ImageDialog
        isOpen={dialogOpen}
        imageUrl={profileImg}
        onClose={handleCloseDialog}
      />
    </div>
  );
};

export default ProfileSetting;
