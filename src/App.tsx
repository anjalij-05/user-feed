import { Route, Routes } from "react-router";
import "./App.css";
import Feed from "./feed";
import UserFeedLayout from "./feed/layout";
import UserPostProfile from "./feed/usersProfile";
import UserProfile from "./feed/createUserProfile";
import CreatePost from "./feed/createPost";

function App() {
  return (
    <Routes>
      <Route path="/" element={<UserFeedLayout />}>
        <Route
          path="/user-post-profile"
          element={<UserPostProfile />}
        />
        <Route
          path="/user-feed/create-user-profile"
          element={<UserProfile />}
        />
        <Route path="/" element={<Feed />} />
        <Route path="/user-feed/create-post" element={<CreatePost />} />
      </Route>
    </Routes>
  );
}

export default App;
