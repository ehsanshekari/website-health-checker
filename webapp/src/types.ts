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
