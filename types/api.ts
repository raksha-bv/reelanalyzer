export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AnalyzeRequest {
  url: string;
  forceRefresh?: boolean;
}

export interface CompareRequest {
  urls: string[];
}
