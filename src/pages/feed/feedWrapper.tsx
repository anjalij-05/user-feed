import { useOutletContext } from "react-router-dom";
import Feed from "@/pages/feed/feed";
import type { Post } from "@/types/post";

interface OutletContext {
  userPosts: Post[];
  onPostCreated: (post: Post) => void;
  onPostDeleted: (postId: number) => void; 
}

const FeedWrapper = () => {
  const { userPosts, onPostDeleted } = useOutletContext<OutletContext>();

  // console.log("FeedWrapper - userPosts:", userPosts);

  return <Feed userPosts={userPosts} onPostDeleted={onPostDeleted} />;
};

export default FeedWrapper;
