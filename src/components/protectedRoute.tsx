import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "@/redux/hooks";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoggedIn, token } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // If user is not logged in, redirect to login page
  if (!isLoggedIn || !token) {
    return <Navigate to="/user-login" state={{ from: location }} replace />;
  }

  // If user is logged in, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;