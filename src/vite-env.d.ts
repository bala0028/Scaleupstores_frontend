/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_RAZORPAY_KEY: string;
  readonly VITE_CLIENT_NAME?: string;
  readonly VITE_CLIENT_ID?: string;
}
