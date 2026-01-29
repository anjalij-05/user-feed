import { Route, Routes } from "react-router-dom";
import "./App.css";
import UserFeedLayout from "./feed/layout";
import UserProfile from "./feed/createUserProfile";
import CreatePostWrapper from "./feed/createWrapper";
import FeedWrapper from "./feed/feedWrapper";
import { useState } from "react";
import PostDetailViewWrapper from "./feed/postDetailViewWrapper";
import UserPostProfileWrapper from "@/feed/userpostProfileWrapper";
import type { Post } from "@/types/post";
import Navbar from "./components/navbar";


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
      <Route path="/" element={<Navbar />} />
      <Route
        path="/"
        element={
          <UserFeedLayout
            userPosts={userPosts}
            onPostCreated={handlePostCreated}
          />
        }
      >
        <Route index element={<FeedWrapper />} />
        <Route path="user-feed/create-post" element={<CreatePostWrapper />} />
        <Route
          path="user-feed/create-user-profile"
          element={<UserProfile posts={userPosts} />}
        />
        <Route path="post/:postId" element={<PostDetailViewWrapper />} />
        <Route
          path="user-post-profile/:userId"
          element={<UserPostProfileWrapper />}
        />
      </Route>
    </Routes>
  );
}

export default App;
