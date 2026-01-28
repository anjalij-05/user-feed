import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { FeedCard } from "@/feed/feed";

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

interface PostDetailViewProps {
  userPosts: Post[];
}

const PostDetailView = ({ userPosts }: PostDetailViewProps) => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();

  // console.log("PostDetailView - postId:", postId);
  // console.log("PostDetailView - userPosts:", userPosts);

  if (!userPosts || userPosts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-slate-600 mb-4">No posts available</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Find the clicked post to identify which user's posts to show
  const clickedPost = userPosts.find((p) => p.id.toString() === postId);

  if (!clickedPost) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-slate-600 mb-4">Post not found</p>
          <p className="text-sm text-slate-500 mb-4">
            Looking for post ID: {postId}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ✅ Get ALL posts from this user (filter by name)
  const userSpecificPosts = userPosts.filter(
    (p) => p.name === clickedPost.name,
  );
  const username = clickedPost.name.toLowerCase().replace(/\s+/g, "_");

  // console.log("PostDetailView - showing posts from:", clickedPost.name);
  // console.log(
  //   "PostDetailView - total posts to show:",
  //   userSpecificPosts.length,
  // );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-[620px] mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-slate-700" />
          </button>
          <h1 className="font-bold text-lg text-slate-900">
            {username}'s Posts
          </h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Scrollable Posts Feed - Shows ALL user posts */}
      <div className="max-w-[620px] mx-auto px-3 sm:px-6 pt-6 pb-10">
        <div className="space-y-0">
          {userSpecificPosts.map((post) => (
            <FeedCard key={post.id} post={post} />
          ))}
        </div>

        {/* End Indicator */}
        <div className="mt-12 mb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-6 py-3 shadow-sm border border-slate-200">
            <Sparkles className="w-5 h-5 text-primary" />
            <p className="text-sm font-medium text-slate-600">
              You've seen all posts from {username}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailView;
