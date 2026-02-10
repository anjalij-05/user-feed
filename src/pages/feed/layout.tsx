import { Link, Outlet } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/navbar";
import { useAppSelector } from "@/redux/hooks";
import { getUserProfileImage } from "@/lib/utils";
import DummyImage from "@/assets/dummy_image.webp";
import type { Post } from "@/types/post";

interface UserFeedLayoutProps {
  userPosts: Post[];
  onPostCreated: (post: Post) => void;
}

const UserFeedLayout = ({ userPosts, onPostCreated }: UserFeedLayoutProps) => {
  const { user } = useAppSelector((state) => state.auth);

  const userAvatar = user?.profileImage
    ? getUserProfileImage(user?.imageBaseUrl, user?.profileImage)
    : DummyImage;

  return (
    <div className="min-h-screen pb-16 lg:pb-0">
      {/* Mobile Top Navbar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-background border-b border-border/40 z-30 px-4 py-3">
        <div className="flex items-center justify-between">
          <Navbar />
          <Link to="/user-feed/create-user-profile">
            <Avatar className="w-8 h-8">
              <AvatarImage src={userAvatar} className="object-cover" />
              <AvatarFallback>
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>

      {/* Desktop Sidebar & Mobile Bottom Nav (now in Navbar component) */}
      <Navbar />

      {/* Main Content */}
      <main className="lg:ml-[244px] pt-16 lg:pt-0 min-h-screen">
        <Outlet context={{ userPosts, onPostCreated }} />
      </main>
    </div>
  );
};

export default UserFeedLayout;
