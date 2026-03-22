import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

const GoogleLoginComponent: React.FC = () => {
  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      const decoded: any = jwtDecode(credentialResponse.credential);
      console.log("ログイン成功:", decoded);

      localStorage.setItem("google_token", credentialResponse.credential);
      window.location.href = "/home";
    }
  };

  const handleError = () => {
    console.log("ログイン失敗");
  };

  return (
    <div className="flex justify-center">
      <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
    </div>
  );
};

export default GoogleLoginComponent;
