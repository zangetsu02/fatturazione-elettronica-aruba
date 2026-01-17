import type { Company, PagedResponse } from '@fatturazione-elettronica-aruba/core';

export type InvoiceStatus =
  | 'Inviata'
  | 'Consegnata'
  | 'Non Consegnata'
  | 'Scartata'
  | 'Accettata'
  | 'Rifiutata'
  | 'Decorrenza Termini'
  | 'Errore Elaborazione'
  | 'In Elaborazione';

export type DocumentType =
  | 'TD01'
  | 'TD02'
  | 'TD03'
  | 'TD04'
  | 'TD05'
  | 'TD06'
  | 'TD07'
  | 'TD08'
  | 'TD09'
  | 'TD10'
  | 'TD11'
  | 'TD12'
  | 'TD16'
  | 'TD17'
  | 'TD18'
  | 'TD19'
  | 'TD20'
  | 'TD21'
  | 'TD22'
  | 'TD23'
  | 'TD24'
  | 'TD25'
  | 'TD26'
  | 'TD27'
  | 'TD28';

export type InvoiceType = 'FPA12' | 'FPR12' | 'FSM10';

export type DocType = 'in' | 'out';

export interface SdiError {
  code: string;
  description: string;
}

export interface InvoiceItem {
  invoiceDate: string;
  number: string;
  documentType: DocumentType;
  status: InvoiceStatus;
  statusDescription: string;
  totalDocument: number;
  totalVat: number;
  netPayable: number;
}

export interface Invoice {
  id: string;
  filename: string;
  sender: Company;
  receiver: Company;
  invoiceType: InvoiceType;
  docType: DocType;
  file: string | null;
  username: string;
  creationDate: string;
  lastUpdate: string;
  idSdi: string;
  pddAvailable: boolean;
  channelGroup: number;
  shopName: string | null;
  invoices: InvoiceItem[];
  sdiErrors: SdiError[];
}

export interface InvoiceDetail extends Invoice {
  file: string;
  pdf?: string;
  unsignedFile?: string;
}

// Upload request/response
export interface UploadInvoiceRequest {
  dataFile: string;
  credential?: string;
  domain?: string;
  senderPIVA?: string;
  skipExtraSchema?: boolean;
  dryRun?: boolean;
}

export interface UploadSignedInvoiceRequest {
  dataFile: string;
  senderPIVA?: string;
  skipExtraSchema?: boolean;
  dryRun?: boolean;
}

export interface UploadInvoiceResponse {
  errorCode: string;
  errorDescription: string;
  uploadFileName: string;
}

// Search params
export interface FindInvoicesParams {
  page?: number;
  size?: number;
  creationStartDate: string;
  creationEndDate: string;
  senderCountry?: string;
  senderVatcode?: string;
  receiverCountry?: string;
  receiverVatcode?: string;
  receiverFiscalcode?: string;
  status?: InvoiceStatus;
  documentType?: DocumentType;
  modifiedStartDate?: string;
  modifiedEndDate?: string;
}

export interface InvoiceDetailParams {
  id?: string;
  filename?: string;
  idSdi?: string;
  includePdf?: boolean;
  includeFile?: boolean;
  includeUnsignedFile?: boolean;
}

export interface InvoiceZipParams {
  id?: string;
  filename?: string;
  idSdi?: string;
}

export interface InvoicePddParams {
  id?: string;
  filename?: string;
  idSdi?: string;
}

// Download
export type DownloadType =
  | 'ReportExcel'
  | 'DownloadPdf'
  | 'DownloadArchiving'
  | 'DownloadP7m'
  | 'DownloadXml'
  | 'DownloadNotifications';

export interface DownloadRequest {
  ids: string[];
  downloadTypes: DownloadType[];
}

export interface DownloadResponse {
  jobId: string;
}

export interface DownloadResult {
  jobId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress?: number;
  file?: string;
  error?: string;
}

// Esito committente
export type EsitoType = 'EC01' | 'EC02';

export interface SendEsitoCommittenteRequest {
  filename: string;
  sdiId: string;
  esito: EsitoType;
  numero?: string;
  anno?: string;
  posizione?: string;
  descrizione?: string;
  messageId?: string;
}

export interface SendEsitoCommittenteResponse {
  errorCode: string;
  errorDescription: string;
}

export interface EsitoCommittenteStatus {
  status: string;
  errorCode?: string;
  errorDescription?: string;
}

// Paged responses
export type InvoicesPagedResponse = PagedResponse<Invoice>;
