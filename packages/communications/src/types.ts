export type CommunicationType = 'LI' | 'DTE' | 'DTR' | 'ANN';

export type ResultCode = 'SF01' | 'SF02' | 'SF03';

export type ElaboratedResult = 'ES01' | 'ES02' | 'ES03';

export interface CreateTransmissionRequest {
  userId?: string;
  comunicationType: CommunicationType;
  dataFile: string;
}

export interface CreateTransmissionResponse {
  requestId: string;
}

export interface TransmissionInfo {
  result: ResultCode;
  notifyResult: string;
  elaboratedResult: ElaboratedResult | string;
  receiptTimestamp: string;
  fileId: string;
  fileName: string;
  status: string;
  pddAvailable: boolean;
}
