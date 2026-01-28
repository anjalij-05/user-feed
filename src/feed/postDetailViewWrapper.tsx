import { useOutletContext } from "react-router-dom";
import PostDetailView from "@/feed/postDetail";

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

interface OutletContext {
  userPosts: Post[];
  onPostCreated: (post: Post) => void;
}

const PostDetailViewWrapper = () => {
  const { userPosts } = useOutletContext<OutletContext>();

  console.log("PostDetailViewWrapper - userPosts:", userPosts);

  // Include default posts from Feed component (MUST match Feed.tsx and UserPostProfileWrapper.tsx)
  const defaultPosts: Post[] = [
    {
      id: 1,
      name: "Sarah Chen",
      role: "Product Manager",
      timestamp: "2h",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      image:
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop",
      mediaType: "image",
      title: "TechConnect Summit",
      content:
        "Excited to be at TechConnect Summit 2025! Meeting so many amazing people in the tech industry. 🚀",
      images: [
        "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&h=600&fit=crop",
      ],
      likes: 1247,
      comments: 89,
      shares: 34,
    },
    {
      id: 2,
      name: "Marcus Rodriguez",
      role: "Senior Developer",
      timestamp: "5h",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      image:
        "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=600&fit=crop",
      mediaType: "image",
      title: "Conference Memories",
      content:
        "Looking back at some incredible moments from conferences I attended this year. 💡",
      likes: 892,
      comments: 45,
      shares: 23,
    },
    {
      id: 3,
      name: "Amit Patel",
      role: "UX Director",
      timestamp: "8h",
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
      image:
        "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&h=600&fit=crop",
      mediaType: "image",
      title: "Design Workshop",
      content:
        "Amazing workshop on user experience design patterns. Learned so much! 🎨",
      likes: 567,
      comments: 28,
      shares: 15,
    },
  ];

  // Combine user-created posts with default posts
  const allPosts = [...userPosts, ...defaultPosts];

  console.log("PostDetailViewWrapper - allPosts combined:", allPosts);
  console.log("PostDetailViewWrapper - total posts:", allPosts.length);

  return <PostDetailView userPosts={allPosts} />;
};

export default PostDetailViewWrapper;