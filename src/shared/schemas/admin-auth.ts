export interface AdminLoginInput {
  email: string;
  password: string;
}

export interface AdminForgotPasswordInput {
  email: string;
}

export interface AdminResetPasswordInput {
  password: string;
  confirm: string;
}

export interface AdminVerifyOtpInput {
  otp: string;
}
