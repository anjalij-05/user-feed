import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  // Bookmark,
  MoreHorizontal,
  Flag,
  Search,
  Check,
  Smile,
  TrendingUp,
  Sparkles,
  UserPlus,
  Trash2,
  Edit,
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
import type { Post, Comment } from "@/types/post";
import { defaultPosts } from "@/components/defaultPosts";

interface FeedCardProps {
  post: Post;
}

export const FeedCard = ({ post }: FeedCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  // const [isBookmarked, setIsBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [commentsList, setCommentsList] = useState<Comment[]>(
    post.defaultComments || [],
  );
  const [showAllComments, setShowAllComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [shareCount, setShareCount] = useState(post.shares || 0);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedPeople, setSelectedPeople] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFullContent, setShowFullContent] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [likedComments, setLikedComments] = useState<number[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showRipple, setShowRipple] = useState<string | null>(null);

  // Check if this is the current user's post
  const isOwnPost = post.name === "Azwedo Drdr";

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

  // Determine which comments to display
  const displayedComments = showAllComments
    ? commentsList
    : commentsList.slice(0, 2);

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    if (newLikedState) {
      setShowLikeAnimation(true);
      setShowRipple("like");
      setTimeout(() => {
        setShowLikeAnimation(false);
        setShowRipple(null);
      }, 1400);
    }
  };

  const handleImageDoubleTap = () => {
    if (!isLiked) {
      handleLike();
    }
  };

  const handleCommentClick = () => {
    setShowComments(!showComments);
    setShowRipple("comment");
    setTimeout(() => setShowRipple(null), 600);
  };

  const handleShareClick = () => {
    setShowShareDialog(true);
    setShowRipple("share");
    setTimeout(() => setShowRipple(null), 600);
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

  const handleImageChange = (newIndex: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex(newIndex);
      setIsTransitioning(false);
    }, 150);
  };

  return (
    <>
      <style>
        {`
          @keyframes heartPop {
            0% {
              transform: scale(0) rotate(-10deg);
              opacity: 0;
            }
            20% {
              transform: scale(1.3) rotate(5deg);
              opacity: 1;
            }
            40% {
              transform: scale(1.15) rotate(-3deg);
              opacity: 1;
            }
            60% {
              transform: scale(1.25) rotate(0deg);
              opacity: 1;
            }
            80% {
              transform: scale(1.6) rotate(0deg);
              opacity: 0.6;
            }
            100% {
              transform: scale(2.2) rotate(0deg);
              opacity: 0;
            }
          }

          @keyframes heartBounce {
            0%, 100% {
              transform: scale(1);
            }
            25% {
              transform: scale(1.3);
            }
            50% {
              transform: scale(0.9);
            }
            75% {
              transform: scale(1.1);
            }
          }

          @keyframes heartGlow {
            0%, 100% {
              filter: drop-shadow(0 0 10px rgba(239, 68, 68, 0.3));
            }
            50% {
              filter: drop-shadow(0 0 30px rgba(239, 68, 68, 0.8));
            }
          }

          @keyframes float {
            0%, 100% { 
              transform: translateY(0px);
            }
            50% { 
              transform: translateY(-8px);
            }
          }

          @keyframes ripple {
            0% {
              transform: scale(1);
              opacity: 0.6;
            }
            100% {
              transform: scale(1.8);
              opacity: 0;
            }
          }

          .floating-bubble {
            animation: float 3s ease-in-out infinite;
          }

          .floating-bubble:nth-child(1) { 
            animation-delay: 0s; 
          }
          
          .floating-bubble:nth-child(2) { 
            animation-delay: 0.4s; 
          }
          
          .floating-bubble:nth-child(3) { 
            animation-delay: 0.8s; 
          }

          .ripple-effect::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 50%;
            background: currentColor;
            opacity: 0;
            animation: ripple 0.6s ease-out;
          }
        `}
      </style>
      <div className="bg-white border border-slate-200 rounded-2xl mb-6 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-11 h-11 ring-2 ring-white shadow-md cursor-pointer hover:ring-primary transition-all">
              <AvatarImage
                src={post.avatar}
                alt={post.name}
                className="object-cover"
              />

              <AvatarFallback className="bg-gradient-to-br from-indigo500 to-purple-600 text-white font-semibold">
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
              <button className="text-slate-600 cursor-pointer hover:bg-slate-100 rounded-full p-2 transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              {isOwnPost ? (
                <>
                  {/* Options for own posts */}
                  <DropdownMenuItem className="cursor-pointer text-primary focus:text-primary">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Post
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Post
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  {/* Options for others' posts */}
                  <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                    <Flag className="w-4 h-4 mr-2" />
                    Report
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer text-primary focus:text-primary">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Follow
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div
          className="relative bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden"
          onDoubleClick={handleImageDoubleTap}
        >
          {allImages.length > 0 && (
            <>
              {/* Render video or image based on mediaType */}
              {post.mediaType === "video" && currentImageIndex === 0 ? (
                <video
                  key={currentImageIndex}
                  src={allImages[currentImageIndex]}
                  controls
                  className={`w-full max-h-[600px] object-contain bg-black select-none transition-all duration-500 ease-in-out ${
                    isTransitioning
                      ? "opacity-0 scale-95"
                      : "opacity-110 scale-100"
                  }`}
                />
              ) : (
                <img
                  key={currentImageIndex}
                  src={allImages[currentImageIndex]}
                  alt="Post content"
                  className={`w-full max-h-[600px] object-contain select-none transition-all duration-500 ease-in-out ${
                    isTransitioning
                      ? "opacity-0 scale-95"
                      : "opacity-100 scale-100"
                  }`}
                />
              )}

              {showLikeAnimation && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <Heart
                    className="w-32 h-32 sm:w-40 sm:h-40 text-red-500 fill-red-500"
                    style={{
                      animation:
                        "heartPop 1.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, heartGlow 1.4s ease-in-out forwards",
                    }}
                  />
                </div>
              )}

              {allImages.length > 1 && (
                <>
                  {/* Clickable Dots Navigation */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/40 backdrop-blur-sm px-3 py-2 rounded-full">
                    {allImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleImageChange(idx)}
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer hover:bg-white ${
                          idx === currentImageIndex
                            ? "bg-white w-8"
                            : "bg-white/60 w-2 hover:w-4"
                        }`}
                        aria-label={`Go to image ${idx + 1}`}
                      />
                    ))}
                  </div>

                  {currentImageIndex > 0 && (
                    <button
                      onClick={() => handleImageChange(currentImageIndex - 1)}
                      className="absolute left-3 cursor-pointer top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110"
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
                      onClick={() => handleImageChange(currentImageIndex + 1)}
                      className="absolute right-3 cursor-pointer top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110"
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

        {/* Floating Bubble Action Buttons */}
        <div className="flex items-center justify-center gap-8 px-4 py-6">
          {/* Like Button - Floating Bubble */}
          <button
            onClick={handleLike}
            className="floating-bubble group relative"
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 group-hover:scale-125 ${
                isLiked
                  ? "bg-gradient-to-br from-red-400 to-pink-500 group-hover:shadow-red-300"
                  : "bg-gradient-to-br from-red-300 to-pink-400 group-hover:shadow-red-200"
              } ${showRipple === "like" ? "ripple-effect" : ""}`}
            >
              <Heart
                className={`w-8 h-8 text-white transition-all duration-300 ${
                  isLiked ? "fill-white scale-110" : ""
                }`}
              />
            </div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {likeCount.toLocaleString()}
            </div>
          </button>

          {/* Comment Button - Floating Bubble */}
          <button
            onClick={handleCommentClick}
            className="floating-bubble group relative"
          >
            <div
              className={`w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-xl transition-all duration-300 group-hover:scale-125 group-hover:shadow-blue-300 ${showRipple === "comment" ? "ripple-effect" : ""}`}
            >
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {commentsList.length}{" "}
              {commentsList.length === 1 ? "comment" : "comments"}
            </div>
          </button>

          {/* Share Button - Floating Bubble */}
          <button
            onClick={handleShareClick}
            className="floating-bubble group relative"
          >
            <div
              className={`w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shadow-xl transition-all duration-300 group-hover:scale-125 group-hover:shadow-purple-300 ${showRipple === "share" ? "ripple-effect" : ""}`}
            >
              <Send className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Share
            </div>
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

        {showComments && commentsList.length > 0 && (
          <div className="px-4 pb-3 space-y-4 max-h-96 overflow-y-auto">
            {displayedComments.map((comment) => (
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

            {/* View all comments button */}
            {commentsList.length > 2 && !showAllComments && (
              <button
                onClick={() => setShowAllComments(true)}
                className="w-full text-sm text-slate-500 cursor-pointer hover:text-slate-700 transition-colors font-medium py-2"
              >
                View all comments
              </button>
            )}

            {/* Show less button */}
            {showAllComments && commentsList.length > 2 && (
              <button
                onClick={() => setShowAllComments(false)}
                className="w-full text-sm text-slate-500 hover:text-slate-700 transition-colors font-medium py-2"
              >
                Show less
              </button>
            )}
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
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-primary text-white font-semibold">
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
  const allPosts = [...userPosts, ...defaultPosts];
  const [feedSearchQuery, setFeedSearchQuery] = useState("");

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
  ];

  const [followedUsers, setFollowedUsers] = useState<number[]>([]);

  const handleFollow = (userId: number) => {
    setFollowedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  // Filter posts based on search query
  const filteredPosts = allPosts.filter((post) => {
    const searchLower = feedSearchQuery.toLowerCase();
    return (
      post.name.toLowerCase().includes(searchLower) ||
      post.content.toLowerCase().includes(searchLower) ||
      post.title.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-[1400px] mx-auto pt-6 sm:pt-8 px-3 sm:px-6">
        <div className="flex gap-8 justify-center">
          <main className="w-full max-w-[620px]">
            {/* Search Bar */}
            <div className="mb-6 sticky top-0 z-10 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 pt-2 pb-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={feedSearchQuery}
                  onChange={(e) => setFeedSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-6 bg-white border-slate-200 rounded-2xl shadow-sm focus-visible:ring-2 focus-visible:ring-primary placeholder:text-slate-400 text-sm"
                />
                {feedSearchQuery && (
                  <button
                    onClick={() => setFeedSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
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
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-0">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <FeedCard key={post.id} post={post} />
                ))
              ) : (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-700 mb-2">
                    No posts found
                  </h3>
                  <p className="text-sm text-slate-500">
                    Try searching for something else
                  </p>
                </div>
              )}
            </div>

            {/* MOBILE ONLY: Suggested Users Carousel */}
            {filteredPosts.length > 0 && (
              <div className="xl:hidden mt-6 mb-20">
                <h3 className="px-3 pb-3 font-bold text-sm text-slate-700">
                  Suggested for you
                </h3>

                <div className="flex gap-4 overflow-x-auto px-3 pb-4">
                  {suggestedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="min-w-[140px] bg-white border rounded-xl p-4 text-center shadow-sm"
                    >
                      <Avatar className="w-14 h-14 mx-auto mb-2">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.name[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Link to={`/user-post-profile/${user.id}`}>
                        {" "}
                        <p className="text-sm font-bold truncate">
                          {user.name}
                        </p>
                      </Link>
                      <p className="text-xs text-slate-500 truncate">
                        {user.subtitle}
                      </p>

                      <button
                        onClick={() => handleFollow(user.id)}
                        className="mt-2 text-xs font-bold text-primary"
                      >
                        {followedUsers.includes(user.id)
                          ? "Following"
                          : "Follow"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredPosts.length > 0 && (
              <div className="mt-12 mb-10 text-center">
                <div className="inline-flex items-center gap-2 bg-white rounded-full px-6 py-3 shadow-sm border border-slate-200">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <p className="text-sm font-medium text-slate-600">
                    You're all caught up!
                  </p>
                </div>
              </div>
            )}
          </main>

          {/* DESKTOP ONLY: Suggested Users Sidebar */}
          <aside className="hidden xl:block w-[320px] shrink-0 sticky top-6 self-start">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 cursor-pointer ring-2 ring-white shadow-md hover:ring-primary transition-all">
                    <AvatarImage
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-primary-600 text-white font-bold">
                      AZ
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <Link to={`/user-feed/create-user-profile`}>
                      <p className="font-bold text-sm cursor-pointer hover:text-primary transition-colors">
                        azwedo_drdr
                      </p>
                    </Link>
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
