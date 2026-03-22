// functions/src/index.ts
import { onCall, HttpsError, CallableRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import axios from "axios";
import * as logger from "firebase-functions/logger";

admin.initializeApp();
const db = admin.firestore();

export const refreshGoogleToken = onCall(
  {
    region: "asia-northeast1",
    cors: true,
    secrets: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
  },
  async (request: CallableRequest) => {
    logger.info("refreshGoogleToken called");

    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }
    const uid = request.auth.uid;
    logger.info(`User: ${uid}`);

    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      logger.error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
      throw new HttpsError("internal", "Server configuration error.");
    }

    const userDocRef = db.collection("userProfiles").doc(uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      throw new HttpsError("not-found", "User profile not found.");
    }

    const refreshToken = userDoc.data()?.googleRefreshToken;
    if (!refreshToken) {
      throw new HttpsError(
        "failed-precondition",
        "No refresh token stored. Please reconnect Google Calendar."
      );
    }

    logger.info(`Calling Google OAuth for user: ${uid}`);
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

    logger.info(`Google OAuth status: ${response.status}`);

    if (response.data?.error === "invalid_grant") {
      await userDocRef.update({
        googleRefreshToken: admin.firestore.FieldValue.delete(),
      });
      throw new HttpsError("unauthenticated", "Refresh token expired. Please reconnect.");
    }

    if (response.status >= 400) {
      throw new HttpsError("internal", `Google API error: ${response.status}`);
    }

    const newAccessToken = response.data.access_token;
    if (!newAccessToken) {
      throw new HttpsError("internal", "No access token returned from Google.");
    }

    logger.info(`Token refreshed for user: ${uid}`);
    return { accessToken: newAccessToken };
  }
);
