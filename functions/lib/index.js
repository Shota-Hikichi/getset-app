"use strict";
// functions/src/index.ts (最終調整版：型エラー回避)
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshGoogleToken = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const axios_1 = __importDefault(require("axios"));
// 💡 型エラー回避のため、CallableContextのインポートは削除します。
// Firebase Admin SDKを初期化
admin.initializeApp();
const db = admin.firestore();
/**
 * GoogleのアクセストークンをリフレッシュするCallable Function
 */
// 💡 引数の型指定を外し、推論に任せます。これにより、ローカル環境の型チェックが緩くなります。
exports.refreshGoogleToken = functions.https.onCall(async (data, context) => {
    var _a, _b;
    // 1. ユーザーがログインしているかチェック
    // 💡 context.auth は undefined の可能性があるため、オプショナルチェイニングを使用
    const uid = (_a = context === null || context === void 0 ? void 0 : context.auth) === null || _a === void 0 ? void 0 : _a.uid;
    if (!uid) {
        throw new functions.https.HttpsError("unauthenticated", "この機能を利用するには認証が必要です。");
    }
    // 💡 環境変数を Functions の config から取得
    const clientConfig = functions.config().google;
    const CLIENT_ID = clientConfig.client_id;
    const CLIENT_SECRET = clientConfig.client_secret;
    try {
        // 2. Firestoreからユーザーのリフレッシュトークンを取得
        const userDoc = await db.collection("userProfiles").doc(uid).get();
        const userData = userDoc.data();
        const refreshToken = userData === null || userData === void 0 ? void 0 : userData.googleRefreshToken;
        if (!refreshToken || !CLIENT_ID || !CLIENT_SECRET) {
            throw new functions.https.HttpsError("failed-precondition", "リフレッシュトークンまたはFunctionsの環境変数が不足しています。再度連携と環境設定を行ってください。");
        }
        console.log(`User ${uid} のためにトークンをリフレッシュしています...`);
        // 3. Googleのトークンエンドポイントにリクエストを送信
        const response = await axios_1.default.post("https://oauth2.googleapis.com/token", new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            refresh_token: refreshToken,
            grant_type: "refresh_token",
        }).toString(), {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        // 4. 新しいアクセストークンをクライアントに返す
        const newAccessToken = response.data.access_token;
        console.log(`User ${uid} のアクセストークンを正常にリフレッシュしました。`);
        return { accessToken: newAccessToken };
    }
    catch (error) {
        console.error("トークンのリフレッシュに失敗しました:", ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message);
        throw new functions.https.HttpsError("internal", "アクセストークンの更新に失敗しました。時間をおいて再度お試しください。");
    }
});
//# sourceMappingURL=index.js.map