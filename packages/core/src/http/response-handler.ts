import {
  ArubaApiError,
  RateLimitError,
  type ApiErrorResponse,
} from '../types/index.js';

export class ResponseHandler {
  async handle<T>(response: Response): Promise<T> {
    if (response.ok) {
      return this.parseSuccessResponse<T>(response);
    }

    throw await this.parseErrorResponse(response);
  }

  private async parseSuccessResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      return response.json() as Promise<T>;
    }

    return response.text() as unknown as T;
  }

  private async parseErrorResponse(response: Response): Promise<Error> {
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      return new RateLimitError(
        'Rate limit exceeded',
        retryAfter ? parseInt(retryAfter, 10) : undefined
      );
    }

    const errorBody = await this.tryParseJson<unknown>(response);

    if (errorBody && this.isApiErrorResponse(errorBody)) {
      return ArubaApiError.fromResponse(errorBody, response.status);
    }

    const fallbackMessage = errorBody
      ? JSON.stringify(errorBody as object)
      : response.statusText || 'Request failed';

    return new ArubaApiError(
      fallbackMessage,
      'HTTP_ERROR',
      response.status
    );
  }

  private isApiErrorResponse(body: unknown): body is ApiErrorResponse {
    if (typeof body !== 'object' || body === null) return false;
    const obj = body as Record<string, unknown>;
    return (
      typeof obj.error === 'object' &&
      obj.error !== null &&
      'message' in obj.error &&
      'code' in obj.error
    );
  }

  private async tryParseJson<T>(response: Response): Promise<T | null> {
    try {
      return (await response.json()) as T;
    } catch {
      return null;
    }
  }
}
