import { Route, Routes } from "react-router";
import "./App.css";
// import Feed from "./feed/feed";
import UserFeedLayout from "./feed/layout";
import UserPostProfile from "./feed/usersProfile";
import UserProfile from "./feed/createUserProfile";
// import CreatePost from "./feed/createPost";
import CreatePostWrapper from "./feed/createWrapper";
import FeedWrapper from "./feed/feedWrapper";
import { useState } from "react";

function App() {
  const [posts, setPosts] = useState<any[]>([]);

  const handlePostCreated = (newPost: any) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  return (
    <Routes>
      <Route path="/" element={<UserFeedLayout />}>
        <Route path="/user-post-profile/:id" element={<UserPostProfile />} />
        <Route
          path="/user-feed/create-user-profile"
          element={<UserProfile posts={posts} />}
        />
        <Route index element={<FeedWrapper />} />
        <Route
          path="user-feed/create-post"
          element={<CreatePostWrapper onPostCreated={handlePostCreated} />}
        />
      </Route>
    </Routes>
  );
}

export default App;
