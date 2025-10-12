export interface User {
  _id?: string;
  email: string;
  password: string;
  name: string;
  createdAt?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    _id: string;
    email: string;
    name: string;
  };
}