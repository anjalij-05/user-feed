import { Route, Routes } from "react-router-dom";
import "./App.css";
import UserFeedLayout from "./pages/feed/layout";
import UserProfile from "./pages/feed/createUserProfile";
import CreatePostWrapper from "./pages/feed/createWrapper";
import FeedWrapper from "./pages/feed/feedWrapper";
import { useState } from "react";
import PostDetailViewWrapper from "./pages/feed/postDetailViewWrapper";
import UserPostProfileWrapper from "@/pages/feed/userpostProfileWrapper";
import type { Post } from "@/types/post";
import Navbar from "./components/navbar";
import Explore from "./pages/explore";
import ChatPage from "./pages/chats/chatPage";
import Connects from "./pages/connects";
import Updates from "./pages/updates";
import ExploreAllEvents from "./pages/explore-all-events";
import ProfileDetails from "./pages/userProfileDetails";
import ExploreViewEvent from "./pages/explore-view-event";

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
        <Route path="/nearby-users" element={<Explore />} />
        <Route path="/chats" element={<ChatPage />} />
        <Route path="/connects" element={<Connects />} />
        <Route path="/updates" element={<Updates />} />
        <Route path="/events" element={<ExploreAllEvents />} />
        <Route path="events/:slug" element={<ExploreViewEvent />} />

        <Route path="/profile/:id" element={<ProfileDetails />} />
      </Route>
    </Routes>
  );
}

export default App;
