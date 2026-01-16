export interface Company {
  countryCode: string;
  vatCode?: string;
  fiscalCode?: string;
  description?: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface PaginationParams {
  page?: number;
  size?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface JobStatus {
  jobId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress?: number;
  downloadUrl?: string;
  error?: string;
}

export type DownloadType =
  | 'ReportExcel'
  | 'DownloadPdf'
  | 'DownloadArchiving'
  | 'DownloadP7m'
  | 'DownloadXml'
  | 'DownloadNotifications';

export interface DateRange {
  startDate: string;
  endDate: string;
}
