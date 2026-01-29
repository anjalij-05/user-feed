import { Link, Outlet, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Home, MessageCircle, PlusSquare } from "lucide-react";
import Navbar from "@/components/navbar";

interface Post {
  id: number;
  name: string;
  role: string;
  timestamp: string;
  avatar: string;
  image?: string;
  mediaType?: "image" | "video";
  title: string;
  content: string;
  images?: string[];
  likes: number;
  comments: number;
  shares?: number;
}

interface UserFeedLayoutProps {
  userPosts: Post[];
  onPostCreated: (post: Post) => void;
}

const UserFeedLayout = ({ userPosts, onPostCreated }: UserFeedLayoutProps) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "#", icon: MessageCircle, label: "Messages" },
    { to: "#", icon: Bell, label: "Notifications" },
    { to: "/user-feed/create-post", icon: PlusSquare, label: "Create" },
  ];

  return (
    <div className="min-h-screen pb-16 lg:pb-0">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-[244px] border-r border-border/40 px-3 py-8 bg-background z-20">
      <Navbar />
        <nav className="space-y-2 mt-10">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-4 px-3 py-3 rounded-lg transition-colors ${
                isActive(item.to)
                  ? "bg-primary/10 text-primary font-semibold"
                  : "hover:bg-muted"
              }`}
            >
              <item.icon className="w-7 h-7" />
              <span>{item.label}</span>
            </Link>
          ))}

          <Link
            to="/user-feed/create-user-profile"
            className={`flex items-center gap-4 px-3 py-3 rounded-lg transition-colors ${
              isActive("/user-feed/create-user-profile")
                ? "bg-primary/10 text-primary font-semibold"
                : "hover:bg-muted"
            }`}
          >
            <Avatar className="w-7 h-7">
              <AvatarImage
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                className="object-cover"
              />
              <AvatarFallback>AZ</AvatarFallback>
            </Avatar>
            <span>Profile</span>
          </Link>
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border/40 z-30 px-2 py-2">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                isActive(item.to)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon
                className={`w-6 h-6 ${
                  isActive(item.to) ? "fill-primary/20" : ""
                }`}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}

          <Link
            to="/user-feed/create-user-profile"
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              isActive("/user-feed/create-user-profile")
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Avatar className="w-6 h-6">
              <AvatarImage
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                className="object-cover"
              />
              <AvatarFallback className="text-xs">AZ</AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium">Profile</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="lg:ml-[244px] min-h-screen">
        <Outlet context={{ userPosts, onPostCreated }} />
      </main>
    </div>
  );
};

export default UserFeedLayout;
