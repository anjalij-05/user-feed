import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/redux/hooks";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isLoggedIn, token } = useAppSelector((state) => state.auth);

  // If user is already logged in, redirect to home
  if (isLoggedIn && token) {
    return <Navigate to="/" replace />;
  }

  // If user is not logged in, render the login/signup page
  return <>{children}</>;
};

export default PublicRoute;