import type { Post, Comment } from "@/types/post";

// Static comments that will be used for posts
const staticComments: Comment[] = [
  {
    id: 1,
    userId: 101,
    userName: "Emily Johnson",
    userAvatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=50&h=50&fit=crop",
    content: "Great post! Really enjoyed the insights you shared.",
    timestamp: "1h",
    likes: 15,
  },
  {
    id: 2,
    userId: 102,
    userName: "Michael Smith",
    userAvatar:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=50&h=50&fit=crop",
    content: "Thanks for sharing this information!",
    timestamp: "2h",
    likes: 8,
  },
  {
    id: 3,
    userId: 103,
    userName: "Olivia Brown",
    userAvatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop",
    content: "This is really insightful!",
    timestamp: "3h",
    likes: 12,
  },
  {
    id: 4,
    userId: 104,
    userName: "James Wilson",
    userAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop",
    content: "Absolutely love this! Keep up the great work.",
    timestamp: "4h",
    likes: 20,
  },
  {
    id: 5,
    userId: 105,
    userName: "Sophia Martinez",
    userAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop",
    content: "I learned so much from this post.",
    timestamp: "5h",
    likes: 9,
  },
  {
    id: 6,
    userId: 106,
    userName: "Daniel Lee",
    userAvatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=50&h=50&fit=crop",
    content: "This resonates with me so much!",
    timestamp: "6h",
    likes: 14,
  },
  {
    id: 7,
    userId: 107,
    userName: "Isabella Garcia",
    userAvatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=50&h=50&fit=crop",
    content: "Very well explained. Thank you!",
    timestamp: "7h",
    likes: 11,
  },
  {
    id: 8,
    userId: 108,
    userName: "Matthew Anderson",
    userAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop",
    content: "I needed to see this today. Thanks!",
    timestamp: "8h",
    likes: 18,
  },
  {
    id: 9,
    userId: 109,
    userName: "Ava Thomas",
    userAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop",
    content: "Can't wait to try this out myself!",
    timestamp: "9h",
    likes: 7,
  },
  {
    id: 10,
    userId: 110,
    userName: "Christopher Taylor",
    userAvatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop",
    content: "This is exactly what I was looking for!",
    timestamp: "10h",
    likes: 16,
  },
];

export const defaultPosts: Post[] = [
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
    defaultComments: staticComments,
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
    defaultComments: staticComments,
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
    defaultComments: staticComments,
  },
];
