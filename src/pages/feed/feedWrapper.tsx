import { useOutletContext } from "react-router-dom";
import Feed from "@/pages/feed/feed";

interface Post {
  id: number;
  name: string;
  role: string;
  timestamp: string;
  avatar: string;
  image?: string;
  mediaType?: "image" | "video";
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

const FeedWrapper = () => {
  const { userPosts } = useOutletContext<OutletContext>();

  // console.log("FeedWrapper - userPosts:", userPosts);

  return <Feed userPosts={userPosts} />;
};

export default FeedWrapper;
