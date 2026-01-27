import { Route, Routes } from "react-router-dom";
import "./App.css";
import UserFeedLayout from "./feed/layout";
import UserPostProfile from "./feed/usersProfile";
import UserProfile from "./feed/createUserProfile";
import CreatePostWrapper from "./feed/createWrapper";
import FeedWrapper from "./feed/feedWrapper";
import { useState } from "react";

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

function App() {
  const [userPosts, setUserPosts] = useState<Post[]>([]);

  const handlePostCreated = (newPost: Post) => {
    console.log("New post created in App:", newPost);
    setUserPosts((prev) => {
      const updated = [newPost, ...prev];
      console.log("Updated posts array:", updated);
      return updated;
    });
  };

  console.log("Current userPosts in App:", userPosts);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <UserFeedLayout
            userPosts={userPosts}
            onPostCreated={handlePostCreated}
          />
        }
      >
        <Route path="/user-post-profile/:id" element={<UserPostProfile />} />
        <Route
          path="/user-feed/create-user-profile"
          element={<UserProfile posts={userPosts} />}
        />
        <Route index element={<FeedWrapper />} />
        <Route path="user-feed/create-post" element={<CreatePostWrapper />} />
      </Route>
    </Routes>
  );
}

export default App;
