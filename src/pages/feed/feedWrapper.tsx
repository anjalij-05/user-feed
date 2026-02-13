import { useOutletContext } from "react-router-dom";
import Feed from "@/pages/feed/feed";
import type { Post } from "@/types/post";

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
