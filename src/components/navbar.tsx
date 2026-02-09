import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bell,
  Home,
  MessageCircle,
  PlusSquare,
  Trophy,
  User,
  UserPlus,
} from "lucide-react";
import Logo from "@/assets/logo.webp";

export default function Navbar() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/nearby-users", icon: User, label: "People" },
    { to: "/events", icon: Trophy, label: "Events" },
    { to: "/chats", icon: MessageCircle, label: "Chats" },
    { to: "/connects", icon: UserPlus, label: "Connections" },
    { to: "/updates", icon: Bell, label: "Notifications" },
    { to: "/user-feed/create-post", icon: PlusSquare, label: "Create" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-[244px] border-r border-border/40 px-3 py-8 bg-background z-20">
        <Link to="/" className="inline-block">
          <img
            width={152}
            height={69}
            src={Logo}
            alt="logo"
            className="w-32 h-auto"
          />
        </Link>

        <nav className="space-y-1 mt-10">
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
              <item.icon className="w-5 h-5" />
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
            <span> My Profile</span>
          </Link>
        </nav>
      </aside>

      {/* Mobile Top Header - Just Logo */}
      <div className="lg:hidden">
        <Link to="/" className="inline-block">
          <img
            width={152}
            height={69}
            src={Logo}
            alt="logo"
            className="w-24 h-auto"
          />
        </Link>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border/40 z-30 px-1 py-1">
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
                className={`w-5 h-5 ${
                  isActive(item.to) ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}