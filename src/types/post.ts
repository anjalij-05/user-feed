export interface Post {
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
  defaultComments?: Comment[];
}

export interface Comment {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
}