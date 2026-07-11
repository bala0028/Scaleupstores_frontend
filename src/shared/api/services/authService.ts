/**
 * Auth Service
 *
 * Handles all authentication flows for both admin and customer apps.
 * Admin uses OTP-based login; customer supports email, phone, and Google OAuth.
 */
import api from "../client";
import type {
  LoginPayload,
  OtpPayload,
  PhonePayload,
  GooglePayload,
  SetPasswordPayload,
  AdminLoginResponse,
  TokenResponse,
  OtpStepResponse,
  MessageResponse,
  EmailOnlyPayload,
  EmailRegisterStep2Payload,
} from "./types";

export const authService = {
  admin: {
    /** Initiate admin login — returns session_id for OTP step. */
    login: (payload: LoginPayload) => api.post<AdminLoginResponse>("adminlogin/", payload),

    /** Verify OTP and receive JWT tokens + admin profile. */
    verifyOtp: (payload: OtpPayload) => api.post<TokenResponse>("verifyloginotp/", payload),

    /** Invalidate refresh token on the backend. */
    logout: (refresh: string) => api.post<MessageResponse>("logout/", { refresh }),

    /** Send password reset email to admin. */
    forgotPassword: (email: string) => api.post<MessageResponse>("forgot-password/", { email }),

    /** Set new password using uid + token from reset email. */
    setPassword: (payload: SetPasswordPayload) =>
      api.post<MessageResponse>("set-password/", payload),

    /** Dashboard customization tool — send OTP to the fixed owner email. */
    sendDashboardToolOtp: () => api.post<OtpStepResponse>("dashboard-tool/send-otp/"),

    /** Dashboard customization tool — verify the OTP before unlocking the page. */
    verifyDashboardToolOtp: (payload: OtpPayload) =>
      api.post<MessageResponse>("dashboard-tool/verify-otp/", payload),
  },

  customer: {
    /** Email + password login — returns JWT tokens + user profile. */
    login: (payload: LoginPayload) => api.post<TokenResponse>("customer/login/", payload),

    /** Step 1: Register with email — sends OTP, returns session_id. */
    registerEmail: (payload: EmailOnlyPayload) =>
      api.post<OtpStepResponse>("register/email-step1/", payload),

    /** Step 2: Verify email OTP + set password — returns JWT tokens + user profile. */
    verifyEmail: (payload: EmailRegisterStep2Payload) =>
      api.post<TokenResponse>("register/email-step2/", payload),

    /** Step 1: Phone login — sends OTP, returns session_id. */
    phoneLogin: (payload: PhonePayload) => api.post<OtpStepResponse>("phone-login-step1/", payload),

    /** Step 2: Verify phone login OTP — returns JWT tokens. */
    verifyPhoneLogin: (payload: OtpPayload) =>
      api.post<TokenResponse>("phone-login-step2/", payload),

    /** Step 1: Phone register — sends OTP, returns session_id. */
    phoneRegister: (payload: PhonePayload) =>
      api.post<OtpStepResponse>("phone-register-step1/", payload),

    /** Step 2: Verify phone register OTP — returns JWT tokens. */
    verifyPhoneRegister: (payload: OtpPayload) =>
      api.post<TokenResponse>("phone-register-step2/", payload),

    /** Google OAuth — exchange Google ID token for JWT tokens. */
    google: (payload: GooglePayload) => api.post<TokenResponse>("google/", payload),

    /** Invalidate refresh token on the backend. */
    logout: (refresh: string) => api.post<MessageResponse>("logout/", { refresh }),

    /** Send password reset email to customer. */
    forgotPassword: (email: string) =>
      api.post<MessageResponse>("forgot-password-customer/", { email }),

    /** Set new password using uid + token from reset email. */
    setPassword: (payload: SetPasswordPayload) =>
      api.post<MessageResponse>("set-password/", payload),

    /** NEW FLOW: Register with email/password + login_method — sends OTP for login verification. */
    registerEmailMethod: (payload: { email: string; password: string; login_method: string }) =>
      api.post<OtpStepResponse>("register/email-method/", payload),

    /** NEW FLOW: Register with Google + login_method — sends OTP for login verification. */
    registerGoogleMethod: (payload: { token: string; login_method: string }) =>
      api.post<OtpStepResponse>("register/google-method/", payload),

    /** NEW FLOW: Verify OTP for login after registration. */
    verifyLoginOtpCustomer: (payload: OtpPayload) =>
      api.post<TokenResponse>("verify-login-otp-customer/", payload),
  },
} as const;
