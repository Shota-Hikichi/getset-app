// functions/src/index.ts
//test at 03:55
console.log("--- Loading function index.ts ---"); // 1. ファイル読み込み開始

import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import axios from "axios";
import * as logger from "firebase-functions/logger";

let adminInitialized = false; // Admin SDK初期化フラグ

try {
  console.log("--- Attempting to initialize Firebase Admin SDK ---");
  admin.initializeApp();
  adminInitialized = true;
  console.log("--- Firebase Admin SDK initialized successfully ---"); // 2. Admin SDK 初期化成功
} catch (initError) {
  console.error("--- Firebase Admin SDK initialization failed ---", initError); // 2a. Admin SDK 初期化失敗
  // 初期化失敗時は致命的なので、ここでエラーをスローしてもよい
  // throw new Error("Admin SDK initialization failed");
}

let db: admin.firestore.Firestore | null = null;
if (adminInitialized) {
  try {
    console.log("--- Attempting to get Firestore instance ---");
    db = admin.firestore();
    console.log("--- Firestore instance obtained successfully ---"); // 3. Firestoreインスタンス取得成功
  } catch (dbError) {
    console.error("--- Failed to get Firestore instance ---", dbError); // 3a. Firestoreインスタンス取得失敗
  }
} else {
  console.error(
    "--- Skipping Firestore initialization because Admin SDK failed ---"
  );
}

/**
 * GoogleのアクセストークンをリフレッシュするCallable Function
 */
export const refreshGoogleToken = onCall(
  {
    region: "asia-northeast1",
    secrets: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"], // Secret Managerを使う場合
  },
  async (request) => {
    logger.info("--- refreshGoogleToken function execution started ---"); // 4. 関数実行開始

    // Admin SDKやFirestoreが初期化失敗している場合は早期にエラー
    if (!adminInitialized || !db) {
      logger.error("Firebase Admin SDK or Firestore is not initialized.");
      throw new HttpsError(
        "internal",
        "サーバーの初期化に失敗しました。管理者に連絡してください。"
      );
    }

    if (!request.auth) {
      logger.warn("Function called without authentication.");
      throw new HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
      );
    }
    const uid = request.auth.uid;
    logger.info(`Function called by user: ${uid}`); // 5. 認証済みユーザーID

    // 環境変数(Secret Manager経由)の読み込み確認
    logger.info("Attempting to read secrets...");
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    logger.info(`GOOGLE_CLIENT_ID loaded: ${!!GOOGLE_CLIENT_ID}`); // 6. Secret読み込み確認 (ID)
    logger.info(`GOOGLE_CLIENT_SECRET loaded: ${!!GOOGLE_CLIENT_SECRET}`); // 7. Secret読み込み確認 (Secret)

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      logger.error(
        "Secret Managerから GOOGLE_CLIENT_ID または GOOGLE_CLIENT_SECRET を読み込めませんでした。"
      );
      throw new HttpsError("internal", "サーバー設定エラーが発生しました。");
    }
    logger.info("Secrets loaded successfully."); // 8. Secret読み込み成功

    try {
      logger.info(`Fetching refresh token for user: ${uid}`); // 9. Firestore読み込み開始
      const userDocRef = db.collection("userProfiles").doc(uid);
      const userDoc = await userDocRef.get();
      logger.info(`Firestore document exists: ${userDoc.exists}`); // 10. Firestoreドキュメント存在確認

      if (!userDoc.exists) {
        logger.error(`Firestore profile not found for user: ${uid}`);
        throw new HttpsError("not-found", "ユーザー情報が見つかりません。");
      }

      const userData = userDoc.data();
      const refreshToken = userData?.googleRefreshToken;
      logger.info(`Refresh token found in Firestore: ${!!refreshToken}`); // 11. リフレッシュトークン有無確認

      if (!refreshToken) {
        logger.error(`Refresh token not found in Firestore for user: ${uid}`);
        throw new HttpsError(
          "failed-precondition",
          "Googleアカウントとの連携情報が見つかりません。再度連携を行ってください。"
        );
      }

      logger.info(
        `Attempting to call Google OAuth token endpoint for user: ${uid}`
      ); // 12. Google API呼び出し開始

      const response = await axios.post(
        "https://oauth2.googleapis.com/token",
        new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        }).toString(),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          validateStatus: (status) => status < 500,
        }
      );
      logger.info(`Google API response status: ${response.status}`); // 13. Google API応答ステータス

      if (response.status >= 400) {
        logger.error(
          `Google API Error for ${uid}:`,
          response.status,
          response.data
        );
        if (response.data?.error === "invalid_grant") {
          logger.error(
            `Invalid refresh token for user: ${uid}. Requires re-authentication.`
          );
          // 無効なトークンを削除
          await userDocRef.update({
            googleRefreshToken: admin.firestore.FieldValue.delete(),
          });
          throw new HttpsError(
            "unauthenticated",
            "Googleアカウントの認証が無効になりました。再度連携してください。"
          );
        }
        throw new HttpsError(
          "internal",
          `Google APIとの通信に失敗しました (${response.status})。`
        );
      }

      const newAccessToken = response.data.access_token;
      logger.info(`New access token received: ${!!newAccessToken}`); // 14. 新アクセストークン有無

      if (!newAccessToken) {
        logger.error(
          `New access token not found in Google response for user: ${uid}`,
          response.data
        );
        throw new HttpsError(
          "internal",
          "Googleからのトークン取得に失敗しました。"
        );
      }

      logger.info(`Successfully refreshed token for user: ${uid}`); // 15. 成功

      return { accessToken: newAccessToken };
    } catch (error: unknown) {
      if (error instanceof HttpsError) {
        logger.error(`HttpsError caught: ${error.code} - ${error.message}`); // 16a. HttpsError発生
        throw error;
      }
      logger.error("Unexpected error in refreshGoogleToken:", error); // 16b. 予期せぬエラー発生
      throw new HttpsError(
        "internal",
        "アクセストークンの更新中にサーバーエラーが発生しました。"
      );
    }
  }
);

console.log("--- Finished loading function index.ts ---"); // 17. ファイル読み込み完了
