import type { HttpClient } from '@fatturazione-aruba/core';
import type {
  CreateTransmissionRequest,
  CreateTransmissionResponse,
  TransmissionInfo,
} from './types.js';

export interface CommunicationsClientOptions {
  httpClient: HttpClient;
}

export class CommunicationsClient {
  private readonly httpClient: HttpClient;

  constructor(options: CommunicationsClientOptions) {
    this.httpClient = options.httpClient;
  }

  async createTransmission(request: CreateTransmissionRequest): Promise<CreateTransmissionResponse> {
    return this.httpClient.post<CreateTransmissionResponse>(
      'ws',
      '/api/v2/comfin',
      request
    );
  }

  async getTransmissionInfo(requestId: string): Promise<TransmissionInfo> {
    return this.httpClient.get<TransmissionInfo>(
      'ws',
      `/api/v2/comfin/${encodeURIComponent(requestId)}`
    );
  }

  async getPdd(requestId: string): Promise<ArrayBuffer> {
    return this.httpClient.get<ArrayBuffer>(
      'ws',
      `/api/v2/comfin/${encodeURIComponent(requestId)}/pdd`
    );
  }
}
