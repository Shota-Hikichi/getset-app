// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth"; // ステップ1で作成したフック

interface ProtectedRouteProps {
  children: React.ReactElement;
}

/**
 * 認証が必要なルートを保護するコンポーネント
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // (1) 認証状態をローカルストレージから読み込み中の場合
  // 画面リロード直後はここに該当する。
  if (isLoading) {
    // ローディング中であることを示す（画面が一瞬白くなるのを防ぐため）
    // 必要に応じてローディングスピナーなどを表示しても良い
    return <div>Loading authentication...</div>;
  }

  // (2) 読み込みが完了し、かつ「未認証」だった場合
  if (!isAuthenticated) {
    // ログイン画面 (Welcomeページ) にリダイレクトさせる
    // 'replace' を指定して、ブラウザ履歴に残さないようにする
    return <Navigate to="/welcome" state={{ from: location }} replace />;
  }

  // (3) 読み込みが完了し、「認証済み」だった場合
  // 要求されたページ (children) をそのまま表示する
  return children;
};

export default ProtectedRoute;
