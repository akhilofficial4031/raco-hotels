export interface LoginResponse {
  data: {
    user: LoginUserResponse;
    csrfToken: string;
    expiresIn: number;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  success: boolean;
}

export interface LoginUserResponse {
  id: number;
  email: string;
  fullName: string;
  role: string;
  status: string;
  token?: string;
  refreshToken?: string;
}
