import { Link, Outlet } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { Bell, Home, MessageCircle, PlusSquare } from "lucide-react";

// const SIDEBAR_WIDTH = "244px";

const UserFeedLayout = () => {
  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-15 h-screen w-[244px] border-r border-border/40 px-3 py-8 bg-background z-20">
        <nav className="space-y-1">
          <Link
            to="/"
            className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-muted"
          >
            <Home className="w-7 h-7" />
            <span className="font-semibold">Home</span>
          </Link>

          <Link
            to="#"
            className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-muted"
          >
            <MessageCircle className="w-7 h-7" />
            <span>Messages</span>
          </Link>

          <Link
            to="#"
            className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-muted"
          >
            <Bell className="w-7 h-7" />
            <span>Notifications</span>
          </Link>

          <Link
            to="/user-feed/create-post"
            className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-muted"
          >
            <PlusSquare className="w-7 h-7" />
            <span>Create</span>
          </Link>

          <Link
            to="/user-feed/create-user-profile"
            className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-muted"
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

      {/* Main Content */}
      <main className="lg:ml-[244px] min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default UserFeedLayout;
