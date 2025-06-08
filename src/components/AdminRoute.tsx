import React from "react";
import { Navigate } from "react-router-dom";
import { isAdminAuthenticated } from "@/lib/auth";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  if (!isAdminAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default AdminRoute;
