export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  isProfileComplete: boolean;
}

export interface RegisterRequest {
  lastName: string;
  firstName: string;
  middleName: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  message: string;
  token: string;
  username: string;
  isProfileComplete: boolean;
}
