// src/hooks/useAuth.ts
import { useState, useEffect } from "react";
import { useGoogleAuthStore } from "../stores/useGoogleAuthStore";

/**
 * 認証状態とローカルストレージからの読み込み状態を返すフック
 */
export const useAuth = () => {
  // accessToken をストアから取得
  const accessToken = useGoogleAuthStore((s) => s.accessToken);

  // zustand の persist は非同期でストレージから読み込むため、
  // 初期レンダリング時に「読み込み中」かどうかを判定する必要がある
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // persist ストアがストレージからの読み込み(hydration)を完了したかどうか
    const hasHydrated = useGoogleAuthStore.persist.hasHydrated();

    if (hasHydrated) {
      // すでに読み込み完了していればローディング終了
      setIsLoading(false);
    } else {
      // まだ読み込み中なら、完了イベントを待つ
      const unsubscribe = useGoogleAuthStore.persist.onFinishHydration(() => {
        setIsLoading(false);
      });

      // コンポーネントがアンマウントされたらイベント購読を解除
      return () => {
        unsubscribe();
      };
    }
  }, []);

  return {
    isAuthenticated: !!accessToken, // accessToken があれば認証済み
    isLoading: isLoading, // 認証情報を読み込み中か
  };
};
