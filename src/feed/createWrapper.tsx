import { useOutletContext } from "react-router-dom";
import CreatePost from "@/feed/createPost";

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

const CreatePostWrapper = () => {
  const { onPostCreated } = useOutletContext<OutletContext>();

  console.log("CreatePostWrapper - onPostCreated function:", onPostCreated);

  return <CreatePost onPostCreated={onPostCreated} />;
};

export default CreatePostWrapper;