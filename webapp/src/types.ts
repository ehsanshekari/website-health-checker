export interface StatusItem {
  url: string;
  status: string;
  responseTimeMs?: number;
  lastCheck: string;
}

export interface StatusResponse {
  generatedAt: string;
  items: StatusItem[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
}
