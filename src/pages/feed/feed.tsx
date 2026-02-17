import { useState, useRef, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  MoreHorizontal,
  Flag,
  Search,
  Check,
  TrendingUp,
  Sparkles,
  UserPlus,
  Trash2,
  Edit,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Smile,
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
import { useAppSelector } from "@/redux/hooks";
import { getUserProfileImage } from "@/lib/utils";
import DummyImage from "@/assets/dummy_image.webp";
import { useNavigate } from "react-router-dom";

// ─── Emoji Data ───────────────────────────────────────────────────────────────
const EMOJI_CATEGORIES = [
  {
    label: "😊",
    name: "Smileys",
    emojis: [
      "😀",
      "😃",
      "😄",
      "😁",
      "😆",
      "😅",
      "🤣",
      "😂",
      "🙂",
      "🙃",
      "😉",
      "😊",
      "😇",
      "🥰",
      "😍",
      "🤩",
      "😘",
      "😗",
      "😚",
      "😙",
      "🥲",
      "😋",
      "😛",
      "😜",
      "🤪",
      "😝",
      "🤑",
      "🤗",
      "🤭",
      "🤫",
      "🤔",
      "🤐",
      "🤨",
      "😐",
      "😑",
      "😶",
      "😏",
      "😒",
      "🙄",
      "😬",
      "🤥",
      "😌",
      "😔",
      "😪",
      "🤤",
      "😴",
      "😷",
      "🤒",
      "🤕",
      "🤢",
      "🤮",
      "🤧",
      "🥵",
      "🥶",
      "🥴",
      "😵",
      "🤯",
      "🤠",
      "🥳",
      "🥸",
      "😎",
      "🤓",
      "🧐",
      "😕",
      "😟",
      "🙁",
      "☹️",
      "😮",
      "😯",
      "😲",
      "😳",
      "🥺",
      "😦",
      "😧",
      "😨",
      "😰",
      "😥",
      "😢",
      "😭",
      "😱",
      "😖",
      "😣",
      "😞",
      "😓",
      "😩",
      "😫",
      "🥱",
      "😤",
      "😡",
      "😠",
      "🤬",
      "😈",
      "👿",
    ],
  },
  {
    label: "👍",
    name: "Gestures",
    emojis: [
      "👋",
      "🤚",
      "🖐",
      "✋",
      "🖖",
      "👌",
      "🤌",
      "🤏",
      "✌️",
      "🤞",
      "🤟",
      "🤘",
      "🤙",
      "👈",
      "👉",
      "👆",
      "🖕",
      "👇",
      "☝️",
      "👍",
      "👎",
      "✊",
      "👊",
      "🤛",
      "🤜",
      "👏",
      "🙌",
      "👐",
      "🤲",
      "🤝",
      "🙏",
      "✍️",
      "💅",
      "🤳",
      "💪",
      "🦾",
      "🦿",
      "🦵",
      "🦶",
      "👂",
      "🦻",
      "👃",
      "🫀",
      "🫁",
      "🧠",
      "🦷",
      "🦴",
      "👀",
      "👁",
      "👅",
      "👄",
    ],
  },
  {
    label: "❤️",
    name: "Hearts",
    emojis: [
      "❤️",
      "🧡",
      "💛",
      "💚",
      "💙",
      "💜",
      "🖤",
      "🤍",
      "🤎",
      "💔",
      "❣️",
      "💕",
      "💞",
      "💓",
      "💗",
      "💖",
      "💘",
      "💝",
      "💟",
      "❤️‍🔥",
      "❤️‍🩹",
      "🫶",
      "💌",
      "💋",
      "💯",
      "💢",
      "💥",
      "💫",
      "💦",
      "💨",
      "🕳",
      "💬",
      "💭",
      "💤",
    ],
  },
  {
    label: "🎉",
    name: "Celebration",
    emojis: [
      "🎉",
      "🎊",
      "🎈",
      "🎁",
      "🎀",
      "🎗",
      "🎟",
      "🎫",
      "🏆",
      "🥇",
      "🥈",
      "🥉",
      "🏅",
      "🎖",
      "🎪",
      "🤹",
      "🎭",
      "🎨",
      "🎬",
      "🎤",
      "🎧",
      "🎼",
      "🎵",
      "🎶",
      "🎷",
      "🎸",
      "🎹",
      "🎺",
      "🎻",
      "🥁",
      "🪘",
      "🎲",
      "🎯",
      "🎳",
      "🎮",
      "🕹",
      "🎰",
      "🧩",
      "🪀",
      "🪁",
      "🪃",
      "⚽",
      "🏀",
      "🏈",
      "⚾",
      "🥎",
      "🏐",
      "🏉",
      "🎾",
      "🥏",
      "🎱",
      "🏓",
      "🏸",
      "🏒",
      "🏑",
      "🥍",
      "🏏",
      "🪃",
      "🥅",
      "⛳",
      "🪁",
      "🏹",
      "🎣",
      "🤿",
      "🎽",
      "🛷",
      "🛹",
      "🪂",
    ],
  },
  {
    label: "🐶",
    name: "Animals",
    emojis: [
      "🐶",
      "🐱",
      "🐭",
      "🐹",
      "🐰",
      "🦊",
      "🐻",
      "🐼",
      "🐻‍❄️",
      "🐨",
      "🐯",
      "🦁",
      "🐮",
      "🐷",
      "🐸",
      "🐵",
      "🙈",
      "🙉",
      "🙊",
      "🐔",
      "🐧",
      "🐦",
      "🐤",
      "🦆",
      "🦅",
      "🦉",
      "🦇",
      "🐺",
      "🐗",
      "🐴",
      "🦄",
      "🐝",
      "🪱",
      "🐛",
      "🦋",
      "🐌",
      "🐞",
      "🐜",
      "🪲",
      "🦟",
      "🦗",
      "🪳",
      "🕷",
      "🦂",
      "🐢",
      "🐍",
      "🦎",
      "🦖",
      "🦕",
      "🐙",
      "🦑",
      "🦐",
      "🦞",
      "🦀",
      "🐡",
      "🐠",
      "🐟",
      "🐬",
      "🐳",
      "🐋",
      "🦈",
      "🐊",
      "🐅",
      "🐆",
      "🦓",
      "🦍",
      "🦧",
      "🦣",
      "🐘",
      "🦛",
      "🦏",
      "🐪",
      "🐫",
      "🦒",
      "🦘",
      "🦬",
      "🐃",
      "🐂",
      "🐄",
      "🐎",
      "🐖",
      "🐏",
      "🐑",
      "🦙",
      "🐐",
      "🦌",
      "🐕",
      "🐩",
      "🦮",
      "🐕‍🦺",
      "🐈",
      "🐈‍⬛",
      "🪶",
      "🐓",
      "🦃",
      "🦤",
      "🦚",
      "🦜",
      "🦢",
      "🦩",
      "🕊",
      "🐇",
      "🦝",
      "🦨",
      "🦡",
      "🦫",
      "🦦",
      "🦥",
      "🐁",
      "🐀",
      "🐿",
      "🦔",
    ],
  },
  {
    label: "🍕",
    name: "Food",
    emojis: [
      "🍕",
      "🍔",
      "🌭",
      "🍟",
      "🍿",
      "🧂",
      "🥓",
      "🥚",
      "🍳",
      "🧇",
      "🥞",
      "🧈",
      "🍞",
      "🥐",
      "🥨",
      "🥯",
      "🧀",
      "🥗",
      "🥙",
      "🥪",
      "🌮",
      "🌯",
      "🫔",
      "🥫",
      "🍝",
      "🍜",
      "🍲",
      "🍛",
      "🍣",
      "🍱",
      "🥟",
      "🦪",
      "🍤",
      "🍙",
      "🍘",
      "🍥",
      "🥮",
      "🍢",
      "🧆",
      "🥚",
      "🍡",
      "🍧",
      "🍨",
      "🍦",
      "🥧",
      "🧁",
      "🍰",
      "🎂",
      "🍮",
      "🍭",
      "🍬",
      "🍫",
      "🍿",
      "🍩",
      "🍪",
      "🌰",
      "🥜",
      "🍯",
      "🧃",
      "🥤",
      "🧋",
      "☕",
      "🍵",
      "🫖",
      "🍶",
      "🍺",
      "🍻",
      "🥂",
      "🍷",
      "🥃",
      "🍸",
      "🍹",
      "🧉",
      "🍾",
      "🧊",
    ],
  },
  {
    label: "✈️",
    name: "Travel",
    emojis: [
      "✈️",
      "🚀",
      "🛸",
      "🚁",
      "🛶",
      "⛵",
      "🚤",
      "🛥",
      "🛳",
      "⛴",
      "🚢",
      "🚂",
      "🚆",
      "🚇",
      "🚈",
      "🚉",
      "🚊",
      "🚝",
      "🚞",
      "🚋",
      "🚌",
      "🚍",
      "🚎",
      "🏎",
      "🚓",
      "🚑",
      "🚒",
      "🚐",
      "🛻",
      "🚚",
      "🚛",
      "🚜",
      "🏍",
      "🛵",
      "🚲",
      "🛴",
      "🛹",
      "🛼",
      "🚏",
      "🛣",
      "🛤",
      "⛽",
      "🚨",
      "🚥",
      "🚦",
      "🛑",
      "🚧",
      "⚓",
      "🪝",
      "⛵",
      "🛟",
      "🌍",
      "🌎",
      "🌏",
      "🗺",
      "🧭",
      "🏔",
      "⛰",
      "🌋",
      "🗻",
      "🏕",
      "🏖",
      "🏜",
      "🏝",
      "🏞",
      "🏟",
      "🏛",
      "🏗",
      "🧱",
      "🪨",
      "🪵",
      "🛖",
      "🏘",
      "🏚",
      "🏠",
      "🏡",
      "🏢",
      "🏣",
      "🏤",
      "🏥",
      "🏦",
      "🏨",
      "🏩",
      "🏪",
      "🏫",
      "🏬",
      "🏭",
      "🏯",
      "🏰",
      "💒",
      "🗼",
      "🗽",
      "⛪",
      "🕌",
      "🛕",
      "🕍",
      "⛩",
      "🕋",
    ],
  },
];

// ─── EmojiPicker Component ────────────────────────────────────────────────────
interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
  position?: "top" | "bottom";
}

const EmojiPicker = ({
  onEmojiSelect,
  onClose,
  position = "top",
}: EmojiPickerProps) => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const filteredEmojis = searchQuery.trim()
    ? EMOJI_CATEGORIES.flatMap((c) => c.emojis).filter((e) =>
        // Simple filter — just show all when searching since we don't have names per emoji
        e.includes(searchQuery),
      )
    : EMOJI_CATEGORIES[activeCategory].emojis;

  return (
    <div
      ref={pickerRef}
      className={`absolute ${position === "top" ? "bottom-full mb-2" : "top-full mt-2"} right-0 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden`}
    >
      {/* Search */}
      <div className="p-2 border-b border-slate-100">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search emoji..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Category tabs */}
      {!searchQuery && (
        <div className="flex border-b border-slate-100 overflow-x-auto scrollbar-hide">
          {EMOJI_CATEGORIES.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setActiveCategory(idx)}
              title={cat.name}
              className={`flex-shrink-0 px-3 py-2 text-base transition-colors ${
                activeCategory === idx
                  ? "bg-primary/10 border-b-2 border-primary"
                  : "hover:bg-slate-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Category label */}
      {!searchQuery && (
        <div className="px-3 pt-2 pb-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {EMOJI_CATEGORIES[activeCategory].name}
          </p>
        </div>
      )}

      {/* Emoji grid */}
      <div className="h-44 overflow-y-auto p-2">
        <div className="grid grid-cols-8 gap-0.5">
          {filteredEmojis.map((emoji, idx) => (
            <button
              key={idx}
              onClick={() => onEmojiSelect(emoji)}
              className="w-8 h-8 flex items-center justify-center text-xl rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {emoji}
            </button>
          ))}
          {filteredEmojis.length === 0 && (
            <p className="col-span-8 text-center text-xs text-slate-400 py-4">
              No emojis found
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Reply {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
}

interface CommentWithReplies extends Comment {
  replies: Reply[];
}

interface FeedCardProps {
  post: Post;
}

// ─── FeedCard ─────────────────────────────────────────────────────────────────
export const FeedCard = ({ post }: FeedCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(true);
  const [commentsList, setCommentsList] = useState<CommentWithReplies[]>(
    (post.defaultComments || []).map((c) => ({ ...c, replies: [] })),
  );
  const [showAllComments, setShowAllComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [shareCount, setShareCount] = useState(post.shares || 0);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedPeople, setSelectedPeople] = useState<number[]>([]);
  const [shareSearchQuery, setShareSearchQuery] = useState("");
  const [showFullContent, setShowFullContent] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [likedComments, setLikedComments] = useState<number[]>([]);
  const [likedReplies, setLikedReplies] = useState<number[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showRipple, setShowRipple] = useState<string | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  // Reply state
  const [replyingTo, setReplyingTo] = useState<{
    commentId: number;
    userName: string;
  } | null>(null);
  const [replyText, setReplyText] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<number[]>([]);

  // Emoji picker state
  const [showCommentEmoji, setShowCommentEmoji] = useState(false);
  const [showReplyEmoji, setShowReplyEmoji] = useState(false);

  const replyInputRef = useRef<HTMLInputElement>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);

  const { user: appUser } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const isOwnPost =
    post.name === appUser?.first_name + " " + appUser?.last_name;

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

  const filteredPeople = connectedPeople.filter((p) =>
    p.name.toLowerCase().includes(shareSearchQuery.toLowerCase()),
  );

  const allImages = post.image
    ? [post.image, ...(post.images || [])]
    : post.images || [];
  const displayedComments = showAllComments
    ? commentsList
    : commentsList.slice(0, 2);

  // Insert emoji at cursor position
  const insertEmoji = (
    emoji: string,
    value: string,
    setValue: (v: string) => void,
    inputRef: React.RefObject<HTMLInputElement | null>,
  ) => {
    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart ?? value.length;
      const end = input.selectionEnd ?? value.length;
      const newVal = value.slice(0, start) + emoji + value.slice(end);
      setValue(newVal);
      // Restore cursor after emoji
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    } else {
      setValue(value + emoji);
    }
  };

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
    if (!isLiked) handleLike();
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
    if (!newComment.trim()) return;
    const comment: CommentWithReplies = {
      id: Date.now(),
      userId: 999,
      userName:
        appUser?.first_name + " " + appUser?.last_name || "Anonymous User",
      userAvatar: getUserProfileImage(
        appUser?.imageBaseUrl as string,
        appUser?.profileImage as string,
      ),
      content: newComment,
      timestamp: "now",
      likes: 0,
      replies: [],
    };
    setCommentsList([comment, ...commentsList]);
    setNewComment("");
    setShowCommentEmoji(false);
  };

  const handleReplyClick = (commentId: number, userName: string) => {
    setReplyingTo({ commentId, userName });
    setReplyText(`@${userName} `);
    if (!expandedReplies.includes(commentId)) {
      setExpandedReplies((prev) => [...prev, commentId]);
    }
    setTimeout(() => replyInputRef.current?.focus(), 50);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyText("");
    setShowReplyEmoji(false);
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !replyingTo) return;
    const cleanContent = replyText.startsWith(`@${replyingTo.userName} `)
      ? replyText.slice(`@${replyingTo.userName} `.length)
      : replyText;
    const newReply: Reply = {
      id: Date.now(),
      userId: appUser?.id ?? 999,
      userName:
        `${appUser?.first_name ?? ""} ${appUser?.last_name ?? ""}`.trim() ||
        "Anonymous User",
      userAvatar: appUser?.profileImage
        ? getUserProfileImage(
            appUser.imageBaseUrl as string,
            appUser.profileImage,
          )
        : DummyImage,
      content: cleanContent,
      timestamp: "now",
      likes: 0,
    };
    setCommentsList((prev) =>
      prev.map((c) =>
        c.id === replyingTo.commentId
          ? { ...c, replies: [...c.replies, newReply] }
          : c,
      ),
    );
    setReplyText("");
    setReplyingTo(null);
    setShowReplyEmoji(false);
  };

  const toggleReplies = (commentId: number) => {
    setExpandedReplies((prev) =>
      prev.includes(commentId)
        ? prev.filter((id) => id !== commentId)
        : [...prev, commentId],
    );
  };

  const handleCommentLike = (commentId: number) => {
    setLikedComments((prev) =>
      prev.includes(commentId)
        ? prev.filter((id) => id !== commentId)
        : [...prev, commentId],
    );
  };

  const handleReplyLike = (replyId: number) => {
    setLikedReplies((prev) =>
      prev.includes(replyId)
        ? prev.filter((id) => id !== replyId)
        : [...prev, replyId],
    );
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
      setShareSearchQuery("");
    }
  };

  const handleImageChange = (newIndex: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex(newIndex);
      setIsTransitioning(false);
    }, 150);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    const deltaX = touchStartX - e.changedTouches[0].clientX;
    const deltaY = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(deltaY) > Math.abs(deltaX)) return;
    if (deltaX > 50 && currentImageIndex < allImages.length - 1)
      handleImageChange(currentImageIndex + 1);
    else if (deltaX < -50 && currentImageIndex > 0)
      handleImageChange(currentImageIndex - 1);
    setTouchStartX(null);
    setTouchStartY(null);
  };

  return (
    <>
      <style>{`
        @keyframes heartPop {
          0% { transform: scale(0) rotate(-10deg); opacity: 0; }
          20% { transform: scale(1.3) rotate(5deg); opacity: 1; }
          60% { transform: scale(1.25) rotate(0deg); opacity: 1; }
          100% { transform: scale(2.2) rotate(0deg); opacity: 0; }
        }
        @keyframes heartGlow {
          0%, 100% { filter: drop-shadow(0 0 10px rgba(239,68,68,0.3)); }
          50% { filter: drop-shadow(0 0 30px rgba(239,68,68,0.8)); }
        }
        @keyframes ripple {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
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
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="bg-white border border-slate-200 rounded-2xl mb-6 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-11 h-11 ring-2 ring-white shadow-md cursor-pointer hover:ring-primary transition-all">
              <AvatarImage
                src={post.avatar}
                alt={post.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold">
                {post.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <Link to={`/user-post-profile/${post.id}`}>
                <h3 className="font-bold text-sm hover:text-primary cursor-pointer transition-colors">
                  {(post === appUser?.id
                    ? `${appUser?.first_name ?? ""} ${appUser?.last_name ?? ""}`
                    : post.name
                  )
                    .toLowerCase()
                    .replace(/\s+/g, "_")}
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
                  <DropdownMenuItem
                    className="cursor-pointer text-primary focus:text-primary"
                    onClick={() =>
                      navigate(`user-feed/edit-post/${post.id}`, {
                        state: { post },
                      })
                    }
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit Post
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete Post
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                    <Flag className="w-4 h-4 mr-2" /> Report
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer text-primary focus:text-primary">
                    <UserPlus className="w-4 h-4 mr-2" /> Follow
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Media */}
        <div
          className="relative bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden touch-pan-y"
          onDoubleClick={handleImageDoubleTap}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {allImages.length > 0 && (
            <>
              {post.mediaType === "video" && currentImageIndex === 0 ? (
                <video
                  key={currentImageIndex}
                  src={allImages[currentImageIndex]}
                  controls
                  className={`w-full max-h-[600px] object-contain bg-black select-none transition-all duration-500 ${isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
                />
              ) : (
                <img
                  key={currentImageIndex}
                  src={allImages[currentImageIndex]}
                  alt="Post content"
                  className={`w-full max-h-[600px] object-contain select-none transition-all duration-500 ${isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
                />
              )}
              {showLikeAnimation && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <Heart
                    className="w-32 h-32 sm:w-40 sm:h-40 text-red-500 fill-red-500"
                    style={{
                      animation:
                        "heartPop 1.4s cubic-bezier(0.34,1.56,0.64,1) forwards, heartGlow 1.4s ease-in-out forwards",
                    }}
                  />
                </div>
              )}
              {allImages.length > 1 && (
                <>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/40 backdrop-blur-sm px-3 py-2 rounded-full">
                    {allImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleImageChange(idx)}
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${idx === currentImageIndex ? "bg-white w-8" : "bg-white/60 w-2 hover:w-4"}`}
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

        {/* Action Buttons */}
        <div className="flex items-center gap-2 px-4 py-3">
          <button
            onClick={handleLike}
            className="group relative cursor-pointer"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 group-hover:scale-105 ${isLiked ? "bg-gradient-to-br from-red-500 to-pink-500" : "bg-gradient-to-br from-red-400 to-pink-400"} ${showRipple === "like" ? "ripple-effect" : ""}`}
            >
              <Heart
                className={`w-6 h-6 text-white transition-all duration-300 ${isLiked ? "fill-white scale-110" : ""}`}
              />
            </div>
          </button>
          <button
            onClick={handleCommentClick}
            className="group relative cursor-pointer"
          >
            <div
              className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-xl transition-all duration-300 group-hover:scale-105 ${showRipple === "comment" ? "ripple-effect" : ""}`}
            >
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
          </button>
          <button
            onClick={handleShareClick}
            className="group relative cursor-pointer"
          >
            <div
              className={`w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-xl transition-all duration-300 group-hover:scale-105 ${showRipple === "share" ? "ripple-effect" : ""}`}
            >
              <Send className="w-6 h-6 text-white mt-0.5" />
            </div>
          </button>
        </div>

        {/* Post Content */}
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

        {/* Comments */}
        {showComments && commentsList.length > 0 && (
          <div className="px-4 pb-2 space-y-3 max-h-[480px] overflow-y-auto">
            {displayedComments.map((comment) => (
              <div key={comment.id}>
                <div className="flex gap-3 group">
                  <Avatar className="w-8 h-8 shrink-0 ring-2 ring-white mt-0.5">
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
                    <div className="flex items-center gap-3 mt-1.5 px-1 flex-wrap">
                      <span className="text-xs text-slate-400">
                        {comment.timestamp}
                      </span>
                      {comment.likes > 0 && (
                        <span className="text-xs text-slate-500 font-medium">
                          {comment.likes}{" "}
                          {comment.likes === 1 ? "like" : "likes"}
                        </span>
                      )}
                      <button
                        onClick={() =>
                          handleReplyClick(comment.id, comment.userName)
                        }
                        className="text-xs text-slate-500 font-semibold hover:text-primary transition-colors cursor-pointer"
                      >
                        Reply
                      </button>
                      {comment.replies.length > 0 && (
                        <button
                          onClick={() => toggleReplies(comment.id)}
                          className="flex items-center gap-0.5 text-xs text-primary font-semibold cursor-pointer hover:text-primary/80 transition-colors"
                        >
                          {expandedReplies.includes(comment.id) ? (
                            <>
                              <ChevronUp className="w-3 h-3" />
                              Hide replies
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3 h-3" />
                              {comment.replies.length}{" "}
                              {comment.replies.length === 1
                                ? "reply"
                                : "replies"}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCommentLike(comment.id)}
                    className="shrink-0 mt-2 cursor-pointer"
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${likedComments.includes(comment.id) ? "fill-red-500 text-red-500" : "text-slate-400 hover:text-red-500"}`}
                    />
                  </button>
                </div>

                {/* Replies */}
                {expandedReplies.includes(comment.id) &&
                  comment.replies.length > 0 && (
                    <div className="ml-11 mt-2 space-y-2.5">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-2.5 group">
                          <Avatar className="w-7 h-7 shrink-0 ring-1 ring-white mt-0.5">
                            <AvatarImage
                              src={reply.userAvatar}
                              alt={reply.userName}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-gradient-to-br from-blue-200 to-purple-200 text-xs font-semibold">
                              {reply.userName[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs bg-slate-50 rounded-2xl px-3.5 py-2">
                              <span className="font-bold mr-1.5 text-slate-900">
                                {reply.userName}
                              </span>
                              <span className="text-slate-700">
                                {reply.content}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 px-1">
                              <span className="text-xs text-slate-400">
                                {reply.timestamp}
                              </span>
                              <button
                                onClick={() =>
                                  handleReplyClick(comment.id, reply.userName)
                                }
                                className="text-xs text-slate-500 font-semibold hover:text-primary transition-colors cursor-pointer"
                              >
                                Reply
                              </button>
                            </div>
                          </div>
                          <button
                            onClick={() => handleReplyLike(reply.id)}
                            className="shrink-0 mt-1.5 cursor-pointer"
                          >
                            <Heart
                              className={`w-3.5 h-3.5 transition-colors ${likedReplies.includes(reply.id) ? "fill-red-500 text-red-500" : "text-slate-400 hover:text-red-500"}`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            ))}

            {commentsList.length > 2 && !showAllComments && (
              <button
                onClick={() => setShowAllComments(true)}
                className="w-full text-sm text-slate-500 cursor-pointer hover:text-slate-700 font-medium py-1"
              >
                View all {commentsList.length} comments
              </button>
            )}
            {showAllComments && commentsList.length > 2 && (
              <button
                onClick={() => setShowAllComments(false)}
                className="w-full text-sm text-slate-500 hover:text-slate-700 font-medium py-1"
              >
                Show less
              </button>
            )}
          </div>
        )}

        {/* ── Comment / Reply Input ── */}
        <div className="px-4 pt-2 pb-4 border-t border-slate-100">
          {/* Replying banner */}
          {replyingTo && (
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-xs text-slate-500">
                Replying to{" "}
                <span className="font-semibold text-primary">
                  @{replyingTo.userName}
                </span>
              </p>
              <button
                onClick={handleCancelReply}
                className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer font-medium"
              >
                Cancel
              </button>
            </div>
          )}

          {replyingTo ? (
            /* Reply input with emoji picker */
            <form
              onSubmit={handleReplySubmit}
              className="flex items-center gap-2"
            >
              <Avatar className="w-8 h-8 shrink-0 ring-2 ring-white shadow-sm">
                <AvatarImage
                  src={
                    appUser?.profileImage
                      ? getUserProfileImage(
                          appUser.imageBaseUrl,
                          appUser.profileImage,
                        )
                      : DummyImage
                  }
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs font-semibold">
                  {appUser
                    ? `${appUser.first_name?.[0] ?? ""}${appUser.last_name?.[0] ?? ""}`
                    : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex items-center gap-1 bg-slate-50 rounded-full px-3 border border-slate-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                <Input
                  ref={replyInputRef}
                  type="text"
                  placeholder={`Reply to @${replyingTo.userName}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 border-0 bg-transparent text-sm focus-visible:ring-0 px-0 placeholder:text-slate-400"
                />
                {/* Emoji button for reply */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReplyEmoji(!showReplyEmoji);
                      setShowCommentEmoji(false);
                    }}
                    className="p-1 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <Smile className="w-4 h-4 text-slate-400 hover:text-primary transition-colors" />
                  </button>
                  {showReplyEmoji && (
                    <EmojiPicker
                      position="top"
                      onEmojiSelect={(emoji) =>
                        insertEmoji(
                          emoji,
                          replyText,
                          setReplyText,
                          replyInputRef,
                        )
                      }
                      onClose={() => setShowReplyEmoji(false)}
                    />
                  )}
                </div>
              </div>
              {replyText.trim() && replyText !== `@${replyingTo.userName} ` && (
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="text-primary cursor-pointer font-bold px-3 h-auto hover:bg-blue-50 rounded-full shrink-0"
                >
                  Post
                </Button>
              )}
            </form>
          ) : (
            /* Comment input with emoji picker */
            <form
              onSubmit={handleCommentSubmit}
              className="flex items-center gap-2"
            >
              <Avatar className="w-8 h-8 shrink-0 ring-2 ring-white shadow-sm">
                <AvatarImage
                  src={
                    appUser?.profileImage
                      ? getUserProfileImage(
                          appUser.imageBaseUrl,
                          appUser.profileImage,
                        )
                      : DummyImage
                  }
                  alt={
                    appUser
                      ? `${appUser.first_name} ${appUser.last_name}`
                      : "You"
                  }
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs font-semibold">
                  {appUser
                    ? `${appUser.first_name?.[0] ?? ""}${appUser.last_name?.[0] ?? ""}`
                    : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex items-center gap-1 bg-slate-50 rounded-full px-3 border border-slate-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                <Input
                  ref={commentInputRef}
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 border-0 bg-transparent text-sm focus-visible:ring-0 px-0 placeholder:text-slate-400"
                />
                {/* Emoji button for comment */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCommentEmoji(!showCommentEmoji);
                      setShowReplyEmoji(false);
                    }}
                    className="p-1 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <Smile className="w-4 h-4 text-slate-400 hover:text-primary transition-colors" />
                  </button>
                  {showCommentEmoji && (
                    <EmojiPicker
                      position="top"
                      onEmojiSelect={(emoji) =>
                        insertEmoji(
                          emoji,
                          newComment,
                          setNewComment,
                          commentInputRef,
                        )
                      }
                      onClose={() => setShowCommentEmoji(false)}
                    />
                  )}
                </div>
              </div>
              {newComment.trim() && (
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="text-primary cursor-pointer font-bold px-3 h-auto hover:bg-blue-50 rounded-full shrink-0"
                >
                  Post
                </Button>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Share Dialog */}
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
              value={shareSearchQuery}
              onChange={(e) => setShareSearchQuery(e.target.value)}
              className="pl-10 bg-slate-50 border-slate-200 rounded-xl"
            />
          </div>
          <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
            {filteredPeople.map((person) => (
              <div
                key={person.id}
                onClick={() => togglePersonSelection(person.id)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${selectedPeople.includes(person.id) ? "bg-blue-50 ring-2 ring-primary" : "hover:bg-slate-50"}`}
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
                setShareSearchQuery("");
              }}
              className="flex-1 cursor-pointer rounded-xl border-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendShare}
              disabled={selectedPeople.length === 0}
              className="flex-1 bg-gradient-to-r cursor-pointer from-primary to-primary rounded-xl shadow-md"
            >
              Send ({selectedPeople.length})
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// ─── Feed ─────────────────────────────────────────────────────────────────────
interface FeedProps {
  userPosts: Post[];
}

const Feed = ({ userPosts }: FeedProps) => {
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
              {allPosts.length > 0 ? (
                allPosts.map((post) => <FeedCard key={post.id} post={post} />)
              ) : (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-700 mb-2">
                    No posts yet
                  </h3>
                  <p className="text-sm text-slate-500">
                    Posts will appear here
                  </p>
                </div>
              )}
            </div>
            {allPosts.length > 0 && (
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
                        <p className="text-sm font-bold truncate">
                          {user.name}
                        </p>
                      </Link>
                      <p className="text-xs text-slate-500 truncate">
                        {user.subtitle}
                      </p>
                      <button
                        onClick={() => handleFollow(user.id)}
                        className="mt-2 text-xs font-bold cursor-pointer text-primary"
                      >
                        {followedUsers.includes(user.id) ? (
                          <UserCheck className="w-4 h-4 mx-auto" />
                        ) : (
                          <UserPlus className="w-4 h-4 mx-auto" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {allPosts.length > 0 && (
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

          <aside className="hidden xl:block w-[320px] shrink-0 sticky top-6 self-start">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
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
                      className={`text-xs font-bold cursor-pointer transition-all rounded-lg px-3 py-1.5 ${followedUsers.includes(user.id) ? "text-slate-600 hover:text-slate-900" : "text-primary hover:text-primary-700 hover:bg-primary-50"}`}
                    >
                      {followedUsers.includes(user.id) ? (
                        <UserCheck className="w-4 h-4" />
                      ) : (
                        <UserPlus className="w-4 h-4" />
                      )}
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
