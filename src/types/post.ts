export interface Post {
  id: number;
  name: string;
  role: string;
  timestamp: string;
  avatar: string;
  image?: string;
  title: string;
  content: string;
  likes: number;
  comments: number;
  shares?: number;
}
