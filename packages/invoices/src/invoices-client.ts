import type { HttpClient } from '@fatturazione-aruba/core';
import type {
  UploadInvoiceRequest,
  UploadSignedInvoiceRequest,
  UploadInvoiceResponse,
  FindInvoicesParams,
  InvoicesPagedResponse,
  InvoiceDetailParams,
  InvoiceDetail,
  InvoiceZipParams,
  InvoicePddParams,
  DownloadRequest,
  DownloadResponse,
  DownloadResult,
  SendEsitoCommittenteRequest,
  SendEsitoCommittenteResponse,
  EsitoCommittenteStatus,
} from './types.js';

type QueryParams = Record<string, string | number | boolean | undefined>;

export interface InvoicesClientOptions {
  httpClient: HttpClient;
}

export class InvoicesClient {
  private readonly httpClient: HttpClient;

  constructor(options: InvoicesClientOptions) {
    this.httpClient = options.httpClient;
  }

  private toQueryParams<T extends object>(params: T): QueryParams {
    return Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined)
    ) as QueryParams;
  }

  async upload(request: UploadInvoiceRequest): Promise<UploadInvoiceResponse> {
    return this.httpClient.post<UploadInvoiceResponse>(
      'ws',
      '/services/invoice/upload',
      request
    );
  }

  async uploadSigned(request: UploadSignedInvoiceRequest): Promise<UploadInvoiceResponse> {
    return this.httpClient.post<UploadInvoiceResponse>(
      'ws',
      '/services/invoice/uploadSigned',
      request
    );
  }

  async findSent(params: FindInvoicesParams): Promise<InvoicesPagedResponse> {
    return this.httpClient.get<InvoicesPagedResponse>(
      'ws',
      '/api/v2/invoices-out',
      this.toQueryParams(params)
    );
  }

  async getSentDetail(params: InvoiceDetailParams): Promise<InvoiceDetail> {
    return this.httpClient.get<InvoiceDetail>(
      'ws',
      '/api/v2/invoices-out/detail',
      this.toQueryParams(params)
    );
  }

  async getSentZip(params: InvoiceZipParams): Promise<string> {
    return this.httpClient.get<string>(
      'ws',
      '/api/v2/invoices-out/zip',
      this.toQueryParams(params)
    );
  }

  async getSentPdd(params: InvoicePddParams): Promise<string> {
    return this.httpClient.get<string>(
      'ws',
      '/api/v2/invoices-out/pdd',
      this.toQueryParams(params)
    );
  }

  async downloadSent(request: DownloadRequest): Promise<DownloadResponse> {
    return this.httpClient.post<DownloadResponse>(
      'ws',
      '/api/v2/invoices-out/download',
      request
    );
  }

  async findReceived(params: FindInvoicesParams): Promise<InvoicesPagedResponse> {
    return this.httpClient.get<InvoicesPagedResponse>(
      'ws',
      '/api/v2/invoices-in',
      this.toQueryParams(params)
    );
  }

  async getReceivedDetail(params: InvoiceDetailParams): Promise<InvoiceDetail> {
    return this.httpClient.get<InvoiceDetail>(
      'ws',
      '/api/v2/invoices-in/detail',
      this.toQueryParams(params)
    );
  }

  async getReceivedZip(params: InvoiceZipParams): Promise<string> {
    return this.httpClient.get<string>(
      'ws',
      '/api/v2/invoices-in/zip',
      this.toQueryParams(params)
    );
  }

  async getReceivedPdd(params: InvoicePddParams): Promise<string> {
    return this.httpClient.get<string>(
      'ws',
      '/api/v2/invoices-in/pdd',
      this.toQueryParams(params)
    );
  }

  async downloadReceived(request: DownloadRequest): Promise<DownloadResponse> {
    return this.httpClient.post<DownloadResponse>(
      'ws',
      '/api/v2/invoices-in/download',
      request
    );
  }

  async sendEsitoCommittente(
    request: SendEsitoCommittenteRequest
  ): Promise<SendEsitoCommittenteResponse> {
    return this.httpClient.post<SendEsitoCommittenteResponse>(
      'ws',
      '/services/invoice/in/sendEsitoCommittente',
      request
    );
  }

  async getEsitoCommittenteStatus(filename: string): Promise<EsitoCommittenteStatus> {
    return this.httpClient.get<EsitoCommittenteStatus>(
      'ws',
      `/services/invoice/in/sendEsitoCommittente/${encodeURIComponent(filename)}`
    );
  }

  async getDownload(jobId: string): Promise<DownloadResult> {
    return this.httpClient.get<DownloadResult>(
      'ws',
      `/api/v2/download/${encodeURIComponent(jobId)}`
    );
  }
}
