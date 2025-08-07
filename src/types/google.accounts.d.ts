// src/types/google.accounts.d.ts

declare namespace google.accounts.oauth2 {
  interface TokenResponse {
    access_token: string;
    expires_in: number;
    error?: string;
    scope: string;
    token_type: string;
  }

  interface TokenClientConfig {
    client_id: string;
    scope: string;
    callback: (response: TokenResponse) => void;
  }

  interface TokenClient {
    requestAccessToken: () => void;
    callback: (resp: TokenResponse) => void;
  }

  function initTokenClient(config: TokenClientConfig): TokenClient;
}
