export const SYNC_ERROR_CODES = {
  '0000': 'Operazione effettuata',
  '0001': 'Nome file già presente nel sistema',
  '0002': 'Fattura duplicata',
  '0003': 'Superato il limite di spazio',
  '0004': 'File non valido',
  '0005': 'Contenuto Base64 non valido',
  '0006': 'Tipo documento non valido',
  '0007': 'Firma non valida',
  '0008': 'Certificato scaduto',
  '0009': 'Certificato revocato',
  '0010': 'Certificato non attendibile',
  '0096': 'Servizio non disponibile',
  '0097': 'Errore interno',
  '0098': 'Timeout',
  '0099': 'Errore generico',
} as const;

export const ASYNC_ERROR_CODES = {
  FATRSM200: 'File non conforme al formato',
  FATRSM201: 'Identificativo trasmissione non valido',
  FATRSM212: 'IdTrasmittente diverso da quello Aruba',
  FATRSM213: 'Codice destinatario non valido',
  FATRSM214: 'PEC destinatario non valida',
  FATRSM215: 'Formato trasmissione non supportato',
} as const;

export const INVOICE_STATUS = {
  INVIATA: 'Inviata',
  CONSEGNATA: 'Consegnata',
  NON_CONSEGNATA: 'Non Consegnata',
  SCARTATA: 'Scartata',
  ACCETTATA: 'Accettata',
  RIFIUTATA: 'Rifiutata',
  DECORRENZA_TERMINI: 'Decorrenza Termini',
  ERRORE_ELABORAZIONE: 'Errore Elaborazione',
  IN_ELABORAZIONE: 'In Elaborazione',
} as const;

export const DOCUMENT_TYPES = {
  TD01: 'Fattura',
  TD02: 'Acconto/Anticipo su fattura',
  TD03: 'Acconto/Anticipo su parcella',
  TD04: 'Nota di credito',
  TD05: 'Nota di debito',
  TD06: 'Parcella',
  TD07: 'Fattura semplificata',
  TD08: 'Nota di credito semplificata',
  TD09: 'Nota di debito semplificata',
  TD10: 'Fattura per acquisto intracomunitario beni',
  TD11: 'Fattura per acquisto intracomunitario servizi',
  TD12: 'Documento riepilogativo (art. 6 DPR 695/1996)',
  TD16: 'Integrazione fattura reverse charge interno',
  TD17: 'Integrazione/autofattura acquisto servizi estero',
  TD18: 'Integrazione acquisto beni intracomunitari',
  TD19: 'Integrazione/autofattura acquisto beni art. 17 c.2 DPR 633/72',
  TD20: 'Autofattura per regolarizzazione',
  TD21: 'Autofattura per splafonamento',
  TD22: 'Estrazione beni da deposito IVA',
  TD23: 'Estrazione beni da deposito IVA con versamento IVA',
  TD24: 'Fattura differita art. 21 c.4 lett. a',
  TD25: 'Fattura differita art. 21 c.4 terzo periodo lett. b',
  TD26: 'Cessione beni ammortizzabili e passaggi interni',
  TD27: 'Fattura autoconsumo/cessioni gratuite senza rivalsa',
  TD28: 'Acquisti da San Marino con IVA',
} as const;

export const NOTIFICATION_TYPES = {
  RC: 'Ricevuta di Consegna',
  NS: 'Notifica di Scarto',
  MC: 'Mancata Consegna',
  NE: 'Notifica Esito',
  DT: 'Decorrenza Termini',
  AT: 'Attestazione di Trasmissione',
} as const;

export const ESITO_TYPES = {
  EC01: 'Accettazione',
  EC02: 'Rifiuto',
} as const;

export const COMMUNICATION_TYPES = {
  LI: 'Comunicazione liquidazioni periodiche IVA',
  DTE: 'Dati fatture emesse',
  DTR: 'Dati fatture ricevute',
  ANN: 'Annullamento',
} as const;

export const TRANSMISSION_RESULTS = {
  SF01: 'File ricevuto',
  SF02: 'File in elaborazione',
  SF03: 'File elaborato',
} as const;

export const ELABORATED_RESULTS = {
  ES01: 'File accettato',
  ES02: 'File accettato con segnalazioni',
  ES03: 'File scartato',
} as const;
