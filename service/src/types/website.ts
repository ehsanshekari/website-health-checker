export interface Website {
  url: string;
  contentRequirement: string;
  createdAt: string;
}

export interface AddWebsiteRequest {
  url: string;
  contentRequirement: string;
}

export interface StatusItem {
  url: string;
  status: string;
  responseTimeMs?: number;
  statusCode?: number;
  lastChecked: string;
}
