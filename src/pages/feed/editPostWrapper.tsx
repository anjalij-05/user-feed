import { useOutletContext } from "react-router-dom";
import EditPost from "@/pages/feed/editPost";
import type { Post } from "@/types/post";

interface OutletContext {
  userPosts: Post[];
  onPostCreated: (post: Post) => void;
  onPostUpdated: (post: Post) => void;
}

const EditPostWrapper = () => {
  const { onPostUpdated } = useOutletContext<OutletContext>();
  return <EditPost onPostUpdated={onPostUpdated} />;
};

export default EditPostWrapper;
