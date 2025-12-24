import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStateContext } from "@/Utils/Contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuthStateContext();

  if (!user) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
