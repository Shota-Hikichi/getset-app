// src/components/AdminRouteGuard.tsx
import React from "react";
import { Navigate } from "react-router-dom";

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

/**
 * 管理者として認証されているかチェックする簡易ガード
 */
const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children }) => {
  const isAuthenticated =
    sessionStorage.getItem("isAdminAuthenticated") === "true";

  if (!isAuthenticated) {
    // 認証されていない場合、ログインページへリダイレクト
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default AdminRouteGuard;
