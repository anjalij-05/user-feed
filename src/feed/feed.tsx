import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Flag,
  UserMinus,
  ExternalLink,
  Search,
  Check,
  Smile,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";

interface Comment {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
}

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

interface FeedCardProps {
  post: Post;
}

const FeedCard = ({ post }: FeedCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentsList, setCommentsList] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [shareCount, setShareCount] = useState(post.shares || 0);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedPeople, setSelectedPeople] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFullContent, setShowFullContent] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [likedComments, setLikedComments] = useState<number[]>([]);

  const connectedPeople = [
    {
      id: 1,
      name: "Sarah Chen",
      role: "Product Manager at TechCorp",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    {
      id: 2,
      name: "Marcus Rodriguez",
      role: "Senior Developer",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
    {
      id: 3,
      name: "Amit Patel",
      role: "UX Director",
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
    },
  ];

  const filteredPeople = connectedPeople.filter((person) =>
    person.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const allImages = post.image
    ? [post.image, ...(post.images || [])]
    : post.images || [];

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    if (newLikedState) {
      setShowLikeAnimation(true);
      setTimeout(() => setShowLikeAnimation(false), 1000);
    }
  };

  const handleImageDoubleTap = () => {
    if (!isLiked) {
      handleLike();
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      const comment: Comment = {
        id: commentsList.length + 1,
        userId: 999,
        userName: "you",
        userAvatar:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
        content: newComment,
        timestamp: "now",
        likes: 0,
      };
      setCommentsList([...commentsList, comment]);
      setNewComment("");
    }
  };

  const handleCommentLike = (commentId: number) => {
    if (likedComments.includes(commentId)) {
      setLikedComments(likedComments.filter((id) => id !== commentId));
    } else {
      setLikedComments([...likedComments, commentId]);
    }
  };

  const togglePersonSelection = (personId: number) => {
    setSelectedPeople((prev) =>
      prev.includes(personId)
        ? prev.filter((id) => id !== personId)
        : [...prev, personId],
    );
  };

  const handleSendShare = () => {
    if (selectedPeople.length > 0) {
      setShareCount(shareCount + selectedPeople.length);
      setShowShareDialog(false);
      setSelectedPeople([]);
      setSearchQuery("");
    }
  };

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-2xl mb-6 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-11 h-11 ring-2 ring-white shadow-md cursor-pointer hover:ring-primary transition-all">
              <AvatarImage
                src={post.avatar}
                alt={post.name}
                className="object-cover"
              />

              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {post.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col">
              <Link to={`/user-post-profile/${post.id}`}>
                <h3 className="font-bold text-sm hover:text-primary cursor-pointer transition-colors">
                  {post.name.toLowerCase().replace(/\s+/g, "_")}
                </h3>
              </Link>
              <p className="text-xs text-slate-500">{post.timestamp}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-slate-600 hover:bg-slate-100 rounded-full p-2 transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                <Flag className="w-4 h-4 mr-2" />
                Report
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                <UserMinus className="w-4 h-4 mr-2" />
                Unfollow
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Go to post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div
          className="relative bg-gradient-to-br from-slate-100 to-slate-50"
          onDoubleClick={handleImageDoubleTap}
        >
          {allImages.length > 0 && (
            <>
              {/* Render video or image based on mediaType */}
              {post.mediaType === "video" && currentImageIndex === 0 ? (
                <video
                  src={allImages[currentImageIndex]}
                  controls
                  className="w-full max-h-[600px] object-contain bg-black select-none"
                />
              ) : (
                <img
                  src={allImages[currentImageIndex]}
                  alt="Post content"
                  className="w-full max-h-[600px] object-contain select-none"
                />
              )}

              {showLikeAnimation && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in zoom-in-50 fade-in duration-300">
                  <Heart className="w-28 h-28 sm:w-36 sm:h-36 text-red-500 fill-red-500 drop-shadow-2xl" />
                </div>
              )}

              {allImages.length > 1 && (
                <>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/40 backdrop-blur-sm px-3 py-2 rounded-full">
                    {allImages.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          idx === currentImageIndex
                            ? "bg-white w-8"
                            : "bg-white/60 w-2"
                        }`}
                      />
                    ))}
                  </div>

                  {currentImageIndex > 0 && (
                    <button
                      onClick={() =>
                        setCurrentImageIndex(currentImageIndex - 1)
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                  )}

                  {currentImageIndex < allImages.length - 1 && (
                    <button
                      onClick={() =>
                        setCurrentImageIndex(currentImageIndex + 1)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  )}
                </>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-5">
            <button
              onClick={handleLike}
              className={`transition-all duration-200 hover:scale-110 active:scale-95 ${
                isLiked ? "text-red-500" : "text-slate-700 hover:text-red-500"
              }`}
            >
              <Heart className={`w-7 h-7 ${isLiked ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="text-slate-700 hover:text-primary transition-all duration-200 hover:scale-110 active:scale-95"
            >
              <MessageCircle className="w-7 h-7" />
            </button>
            <button
              onClick={() => setShowShareDialog(true)}
              className="text-slate-700 hover:text-green-500 transition-all duration-200 hover:scale-110 active:scale-95"
            >
              <Send className="w-7 h-7" />
            </button>
          </div>
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`transition-all duration-200 hover:scale-110 active:scale-95 ${
              isBookmarked
                ? "text-amber-500"
                : "text-slate-700 hover:text-amber-500"
            }`}
          >
            <Bookmark
              className={`w-7 h-7 ${isBookmarked ? "fill-current" : ""}`}
            />
          </button>
        </div>

        <div className="px-4 pb-2">
          <button className="font-bold text-sm hover:text-slate-600 transition-colors">
            {likeCount.toLocaleString()} likes
          </button>
        </div>

        <div className="px-4 pb-3">
          <div className="text-sm">
            <span className="font-bold mr-2 text-slate-900">
              {post.name.toLowerCase().replace(/\s+/g, "_")}
            </span>
            <span
              className={`text-slate-700 ${!showFullContent && post.content.length > 100 ? "line-clamp-2" : ""}`}
            >
              {post.content}
            </span>
            {post.content.length > 100 && (
              <button
                onClick={() => setShowFullContent(!showFullContent)}
                className="text-slate-500 ml-1 hover:text-slate-700 font-medium"
              >
                {showFullContent ? "less" : "more"}
              </button>
            )}
          </div>
        </div>

        {commentsList.length > 0 && !showComments && (
          <button
            onClick={() => setShowComments(true)}
            className="px-4 pb-3 text-sm text-slate-500 hover:text-slate-700 transition-colors font-medium"
          >
            View all {commentsList.length} comments
          </button>
        )}

        {showComments && commentsList.length > 0 && (
          <div className="px-4 pb-3 space-y-4 max-h-96 overflow-y-auto">
            {commentsList.map((comment) => (
              <div key={comment.id} className="flex gap-3 group">
                <Avatar className="w-9 h-9 shrink-0 ring-2 ring-white">
                  <AvatarImage
                    src={comment.userAvatar}
                    alt={comment.userName}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-200 to-purple-200 text-xs font-semibold">
                    {comment.userName[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm bg-slate-50 rounded-2xl px-4 py-2.5">
                    <span className="font-bold mr-2 text-slate-900">
                      {comment.userName}
                    </span>
                    <span className="text-slate-700">{comment.content}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 px-2">
                    <span className="text-xs text-slate-500 font-medium">
                      {comment.timestamp}
                    </span>
                    {comment.likes > 0 && (
                      <span className="text-xs text-slate-600 font-semibold">
                        {comment.likes} {comment.likes === 1 ? "like" : "likes"}
                      </span>
                    )}
                    <button className="text-xs text-slate-600 font-semibold hover:text-slate-900">
                      Reply
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => handleCommentLike(comment.id)}
                  className="shrink-0 mt-2"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      likedComments.includes(comment.id)
                        ? "fill-red-500 text-red-500"
                        : "text-slate-400 hover:text-red-500"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="px-4 py-4 border-t border-slate-100">
          <form
            onSubmit={handleCommentSubmit}
            className="flex items-center gap-3"
          >
            <button
              type="button"
              className="text-slate-500 hover:text-slate-700 transition-colors"
            >
              <Smile className="w-6 h-6" />
            </button>
            <Input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 border-0 bg-slate-50 rounded-full px-4 text-sm focus-visible:ring-2 focus-visible:ring-primary placeholder:text-slate-400"
            />
            {newComment.trim() && (
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="text-primary cursor-pointer hover:text-primary font-bold px-3 h-auto hover:bg-blue-50 rounded-full"
              >
                Post
              </Button>
            )}
          </form>
        </div>
      </div>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Share</DialogTitle>
            <DialogDescription>Send this post to people</DialogDescription>
          </DialogHeader>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-50 border-slate-200 rounded-xl"
            />
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
            {filteredPeople.map((person) => (
              <div
                key={person.id}
                onClick={() => togglePersonSelection(person.id)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  selectedPeople.includes(person.id)
                    ? "bg-blue-50 ring-2 ring-primary"
                    : "hover:bg-slate-50"
                }`}
              >
                <Avatar className="w-12 h-12 ring-2 ring-white shadow-sm">
                  <AvatarImage
                    src={person.avatar}
                    alt={person.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-primary text-white font-semibold">
                    {person.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate text-slate-900">
                    {person.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {person.role}
                  </p>
                </div>
                {selectedPeople.includes(person.id) && (
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-md">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4 gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowShareDialog(false);
                setSelectedPeople([]);
                setSearchQuery("");
              }}
              className="flex-1 rounded-xl border-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendShare}
              disabled={selectedPeople.length === 0}
              className="flex-1 bg-gradient-to-r from-primary to-primary hover:from-primary hover:to-primary rounded-xl shadow-md"
            >
              Send ({selectedPeople.length})
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

interface FeedProps {
  userPosts: Post[];
}

const Feed = ({ userPosts }: FeedProps) => {
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

  const allPosts = [...userPosts, ...defaultPosts];

  const suggestedUsers = [
    {
      id: 1,
      name: "alex_anyways18",
      subtitle: "Suggested for you",
      avatar:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop",
    },
    {
      id: 2,
      name: "chantalflowergirl",
      subtitle: "Follows you",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    },
    {
      id: 3,
      name: "gwangui77",
      subtitle: "Followed by misaka_sonigo + 8 more",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    },
    {
      id: 4,
      name: "misika_soniga",
      subtitle: "Follows you",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
    },
    {
      id: 5,
      name: "pierre_thecomet",
      subtitle: "Followed by misika_soniga + 6 more",
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
    },
  ];

  const [followedUsers, setFollowedUsers] = useState<number[]>([]);

  const handleFollow = (userId: number) => {
    setFollowedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-[1400px] mx-auto pt-6 sm:pt-8 px-3 sm:px-6">
        <div className="flex gap-8 justify-center">
          <main className="w-full max-w-[620px]">
            <div className="space-y-0">
              {allPosts.map((post) => (
                <FeedCard key={post.id} post={post} />
              ))}
            </div>

            <div className="mt-12 mb-10 text-center">
              <div className="inline-flex items-center gap-2 bg-white rounded-full px-6 py-3 shadow-sm border border-slate-200">
                <Sparkles className="w-5 h-5 text-primary" />
                <p className="text-sm font-medium text-slate-600">
                  You're all caught up!
                </p>
              </div>
            </div>
          </main>

          <aside className="hidden xl:block w-[320px] shrink-0 sticky top-6 self-start">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 cursor-pointer ring-2 ring-white shadow-md hover:ring-primary transition-all">
                    <AvatarImage
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                      AZ
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="font-bold text-sm cursor-pointer hover:text-primary transition-colors">
                      azwedo_drdr
                    </p>
                    <p className="text-xs text-slate-500">@azwedo</p>
                  </div>
                </div>
                <button className="text-xs font-bold text-primary hover:text-primary-700 transition-colors">
                  Switch
                </button>
              </div>

              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <p className="text-sm font-bold text-slate-700">
                    Suggestions For You
                  </p>
                </div>
                <button className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors">
                  See All
                </button>
              </div>

              <div className="space-y-4">
                {suggestedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-11 h-11 cursor-pointer ring-2 ring-white shadow-sm group-hover:ring-primary transition-all">
                        <AvatarImage
                          src={user.avatar}
                          alt={user.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-200 to-purple-200 font-semibold">
                          {user.name[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <Link to={`/user-post-profile/${user.id}`}>
                          <p className="font-bold text-sm cursor-pointer hover:text-primary transition-colors">
                            {user.name}
                          </p>
                        </Link>

                        <p className="text-xs text-slate-500">
                          {user.subtitle}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleFollow(user.id)}
                      className={`text-xs font-bold transition-all rounded-lg px-3 py-1.5 ${
                        followedUsers.includes(user.id)
                          ? "text-slate-600 hover:text-slate-900"
                          : "text-primary hover:text-primary-700 hover:bg-primary-50"
                      }`}
                    >
                      {followedUsers.includes(user.id) ? "Following" : "Follow"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Feed;
