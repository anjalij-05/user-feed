import {
  GitCompareArrows,
  HandHeart,
  LayoutDashboard,
  NotebookPen,
  Trophy,
  UserCog,
  Users,
} from "lucide-react";
import DummyImage from "@/assets/dummy_image.webp";

export const UserAvatar: string = DummyImage;

export const sidebarItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    label: "All Events",
    icon: Trophy,
    path: "/all-events",
  },
  {
    label: "All Attendees",
    icon: Users,
    path: "/all-attendees",
  },
  {
    label: "Event Sponsors",
    icon: HandHeart,
    path: "/event-sponsors",
  },
  {
    label: "All Reports",
    icon: NotebookPen,
    path: "/all-reports",
  },
  {
    label: "Vendors",
    icon: UserCog,
    path: "/vendors",
  },
  {
    label: "ICP",
    icon: GitCompareArrows,
    path: "/icp",
  },
];

export const navbarLinks = [
  // For non-logged in users (guests)
  {
    label: "Home",
    path: "/",
    visibleFor: ["guest"],
  },
  {
    label: "Events",
    path: "/events",
    visibleFor: ["guest"],
  },
  {
    label: "People",
    path: "/nearby-users",
    visibleFor: ["guest"],
  },
  {
    label: "Get Started",
    type: "dropdown",
    visibleFor: ["guest"],
    items: [
      { label: "User Login", path: "/user-login" },
      { label: "Organiser Login", path: "/organiser/login" },
    ],
  },
  
  // For logged in users (app users)
  {
    label: "Home",
    path: "/nearby-users",
    visibleFor: ["user"],
  },
  {
    label: "Events",
    path: "/events",
    visibleFor: ["user"],
  },
  {
    label: "Chat",
    path: "/chats",
    visibleFor: ["user"],
  },
  {
    label: "Connections",
    path: "/connects",
    visibleFor: ["user"],
  },
  {
    label: "Updates",
    path: "/updates",
    visibleFor: ["user"],
  },
  
  // For logged in organisers
  {
    label: "Home",
    path: "/",
    visibleFor: ["organiser"],
  },
  {
    label: "Events",
    path: "/events",
    visibleFor: ["organiser"],
  },
  {
    label: "People",
    path: "/nearby-users",
    visibleFor: ["organiser"],
  },
];

export const roles: string[] = [
  "Speaker",
  "Panelist",
  "Sponsor",
  "Delegate",
  "Moderator",
  "Invitee",
  "Organiser",
];

export const domain: string = import.meta.env.VITE_API_URL;
export const appDomain: string = import.meta.env.VITE_APP_URL;
export const appUrl: string = import.meta.env.VITE_APP_URL;
export const imageBaseUrl: string = import.meta.env.VITE_IMAGE_BASE_URL;
export const googleMapsApiKey: string = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
export const token: string | null =
  JSON.parse(localStorage.getItem("klout-organiser-storage") || "{}")?.state?.token || null;
export const additionalDomain: string = import.meta.env.VITE_ADDITIONAL_URL;
export const photoBucketUrl: string = import.meta.env.VITE_PHOTO_BUCKET_URL;
export const sponsorPdfBucketUrl: string = import.meta.env.VITE_SPONSOR_PDF_BUCKET_URL;