export interface Post {
  id: number;
  name: string;
  role: string;
  timestamp: string;
  avatar: string;
  image?: string;
  mediaType?: "image" | "video";
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

export interface Connection {
  _id: string;
  first_name?: string;
  last_name?: string;
  profileImage?: string;
  imageBaseUrl?: string;
  designation?: string;
  company?: string;
}