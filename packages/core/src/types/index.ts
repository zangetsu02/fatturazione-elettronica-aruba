// Environment types
export {
  type Environment,
  type EnvironmentConfig,
  ENVIRONMENT_URLS,
  RATE_LIMITS,
  FILE_LIMITS,
  ARUBA_CONSTANTS,
} from './environment.js';

// Error types
export {
  type HttpStatusCode,
  type ApiError,
  type ApiErrorResponse,
  type SyncErrorCode,
  type AsyncErrorCode,
  SYNC_ERROR_CODES,
  ASYNC_ERROR_CODES,
  ArubaApiError,
  AuthenticationError,
  RateLimitError,
  TimeoutError,
  NetworkError,
} from './errors.js';

// Common types
export {
  type Company,
  type PagedResponse,
  type PaginationParams,
  type ApiResponse,
  type JobStatus,
  type DownloadType,
  type DateRange,
} from './common.js';

// Auth types
export {
  type AuthToken,
  type AccountStatus,
  type UsageStatus,
  type UserInfo,
  type MulticedenteStatus,
  type Multicedente,
  type MulticedentiSearchParams,
  type SignInCredentials,
  type RefreshTokenOptions,
  type TokenStorage,
  MemoryTokenStorage,
} from './auth.js';
