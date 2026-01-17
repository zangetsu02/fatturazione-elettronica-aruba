/**
 * Formato trasmissione fattura elettronica
 * - FPA12: Fattura verso Pubblica Amministrazione (schema 1.2)
 * - FPR12: Fattura verso Privati (schema 1.2)
 * - FSM10: Fattura semplificata (schema 1.0)
 */
export type FormatoTrasmissione = 'FPA12' | 'FPR12' | 'FSM10';

/**
 * Tipo documento - Codici TD01-TD28
 */
export type TipoDocumento =
  | 'TD01' // Fattura
  | 'TD02' // Acconto/Anticipo su fattura
  | 'TD03' // Acconto/Anticipo su parcella
  | 'TD04' // Nota di Credito
  | 'TD05' // Nota di Debito
  | 'TD06' // Parcella
  | 'TD07' // Fattura semplificata
  | 'TD08' // Nota di credito semplificata
  | 'TD09' // Nota di debito semplificata
  | 'TD16' // Integrazione fattura reverse charge interno
  | 'TD17' // Integrazione/autofattura per acquisto servizi dall'estero
  | 'TD18' // Integrazione per acquisto di beni intracomunitari
  | 'TD19' // Integrazione/autofattura per acquisto di beni ex art.17 c.2 DPR 633/72
  | 'TD20' // Autofattura per regolarizzazione e integrazione delle fatture
  | 'TD21' // Autofattura per splafonamento
  | 'TD22' // Estrazione beni da Deposito IVA
  | 'TD23' // Estrazione beni da Deposito IVA con versamento dell'IVA
  | 'TD24' // Fattura differita di cui all'art. 21, comma 4, lett. a)
  | 'TD25' // Fattura differita di cui all'art. 21, comma 4, terzo periodo lett. b)
  | 'TD26' // Cessione di beni ammortizzabili e per passaggi interni
  | 'TD27' // Fattura per autoconsumo o per cessioni gratuite senza rivalsa
  | 'TD28'; // Acquisti da San Marino con IVA (fattura cartacea)

/**
 * Descrizioni tipi documento
 */
export const TIPO_DOCUMENTO_DESCRIZIONI: Record<TipoDocumento, string> = {
  TD01: 'Fattura',
  TD02: 'Acconto/Anticipo su fattura',
  TD03: 'Acconto/Anticipo su parcella',
  TD04: 'Nota di Credito',
  TD05: 'Nota di Debito',
  TD06: 'Parcella',
  TD07: 'Fattura semplificata',
  TD08: 'Nota di credito semplificata',
  TD09: 'Nota di debito semplificata',
  TD16: 'Integrazione fattura reverse charge interno',
  TD17: "Integrazione/autofattura per acquisto servizi dall'estero",
  TD18: 'Integrazione per acquisto di beni intracomunitari',
  TD19: 'Integrazione/autofattura per acquisto di beni ex art.17 c.2 DPR 633/72',
  TD20: 'Autofattura per regolarizzazione e integrazione delle fatture',
  TD21: 'Autofattura per splafonamento',
  TD22: 'Estrazione beni da Deposito IVA',
  TD23: "Estrazione beni da Deposito IVA con versamento dell'IVA",
  TD24: "Fattura differita di cui all'art. 21, comma 4, lett. a)",
  TD25: "Fattura differita di cui all'art. 21, comma 4, terzo periodo lett. b)",
  TD26: 'Cessione di beni ammortizzabili e per passaggi interni',
  TD27: 'Fattura per autoconsumo o per cessioni gratuite senza rivalsa',
  TD28: 'Acquisti da San Marino con IVA (fattura cartacea)',
};

/**
 * Regime fiscale
 */
export type RegimeFiscale =
  | 'RF01' // Ordinario
  | 'RF02' // Contribuenti minimi (art.1, c.96-117, L. 244/07)
  | 'RF04' // Agricoltura e attività connesse e pesca (artt.34 e 34-bis, DPR 633/72)
  | 'RF05' // Vendita sali e tabacchi (art.74, c.1, DPR. 633/72)
  | 'RF06' // Commercio fiammiferi (art.74, c.1, DPR 633/72)
  | 'RF07' // Editoria (art.74, c.1, DPR 633/72)
  | 'RF08' // Gestione servizi telefonia pubblica (art.74, c.1, DPR 633/72)
  | 'RF09' // Rivendita documenti di trasporto pubblico e di sosta (art.74, c.1, DPR 633/72)
  | 'RF10' // Intrattenimenti, giochi e altre attività di cui alla tariffa allegata al DPR 640/72
  | 'RF11' // Agenzie viaggi e turismo (art.74-ter, DPR 633/72)
  | 'RF12' // Agriturismo (art.5, c.2, L. 413/91)
  | 'RF13' // Vendite a domicilio (art.25-bis, c.6, DPR 600/73)
  | 'RF14' // Rivendita beni usati, oggetti d'arte, d'antiquariato o da collezione (art.36, DL 41/95)
  | 'RF15' // Agenzie di vendite all'asta di oggetti d'arte, antiquariato o da collezione (art.40-bis, DL 41/95)
  | 'RF16' // IVA per cassa P.A. (art.6, c.5, DPR 633/72)
  | 'RF17' // IVA per cassa (art. 32-bis, DL 83/2012)
  | 'RF18' // Altro
  | 'RF19'; // Regime forfettario (art.1, c.54-89, L. 190/2014)

/**
 * Descrizioni regime fiscale
 */
export const REGIME_FISCALE_DESCRIZIONI: Record<RegimeFiscale, string> = {
  RF01: 'Ordinario',
  RF02: 'Contribuenti minimi',
  RF04: 'Agricoltura e attività connesse e pesca',
  RF05: 'Vendita sali e tabacchi',
  RF06: 'Commercio fiammiferi',
  RF07: 'Editoria',
  RF08: 'Gestione servizi telefonia pubblica',
  RF09: 'Rivendita documenti di trasporto pubblico e di sosta',
  RF10: 'Intrattenimenti, giochi e altre attività',
  RF11: 'Agenzie viaggi e turismo',
  RF12: 'Agriturismo',
  RF13: 'Vendite a domicilio',
  RF14: "Rivendita beni usati, oggetti d'arte, d'antiquariato o da collezione",
  RF15: "Agenzie di vendite all'asta di oggetti d'arte, antiquariato o da collezione",
  RF16: 'IVA per cassa P.A.',
  RF17: 'IVA per cassa',
  RF18: 'Altro',
  RF19: 'Regime forfettario',
};

/**
 * Natura operazione (per operazioni non soggette a IVA)
 */
export type Natura =
  | 'N1' // Escluse ex art. 15
  | 'N2' // Non soggette (obsoleto, usare N2.1 o N2.2)
  | 'N2.1' // Non soggette ad IVA ai sensi degli artt. da 7 a 7-septies del DPR 633/72
  | 'N2.2' // Non soggette - altri casi
  | 'N3' // Non imponibili (obsoleto, usare N3.1-N3.6)
  | 'N3.1' // Non imponibili - esportazioni
  | 'N3.2' // Non imponibili - cessioni intracomunitarie
  | 'N3.3' // Non imponibili - cessioni verso San Marino
  | 'N3.4' // Non imponibili - operazioni assimilate alle cessioni all'esportazione
  | 'N3.5' // Non imponibili - a seguito di dichiarazioni d'intento
  | 'N3.6' // Non imponibili - altre operazioni che non concorrono alla formazione del plafond
  | 'N4' // Esenti
  | 'N5' // Regime del margine / IVA non esposta in fattura
  | 'N6' // Inversione contabile (obsoleto, usare N6.1-N6.9)
  | 'N6.1' // Inversione contabile - cessione di rottami e altri materiali di recupero
  | 'N6.2' // Inversione contabile - cessione di oro e argento puro
  | 'N6.3' // Inversione contabile - subappalto nel settore edile
  | 'N6.4' // Inversione contabile - cessione di fabbricati
  | 'N6.5' // Inversione contabile - cessione di telefoni cellulari
  | 'N6.6' // Inversione contabile - cessione di prodotti elettronici
  | 'N6.7' // Inversione contabile - prestazioni comparto edile e settori connessi
  | 'N6.8' // Inversione contabile - operazioni settore energetico
  | 'N6.9' // Inversione contabile - altri casi
  | 'N7'; // IVA assolta in altro stato UE

/**
 * Tipo cessione/prestazione
 */
export type TipoCessionePrestazione =
  | 'SC' // Sconto
  | 'PR' // Premio
  | 'AB' // Abbuono
  | 'AC'; // Spesa accessoria

/**
 * Modalità di pagamento
 */
export type ModalitaPagamento =
  | 'MP01' // Contanti
  | 'MP02' // Assegno
  | 'MP03' // Assegno circolare
  | 'MP04' // Contanti presso Tesoreria
  | 'MP05' // Bonifico
  | 'MP06' // Vaglia cambiario
  | 'MP07' // Bollettino bancario
  | 'MP08' // Carta di pagamento
  | 'MP09' // RID
  | 'MP10' // RID utenze
  | 'MP11' // RID veloce
  | 'MP12' // RIBA
  | 'MP13' // MAV
  | 'MP14' // Quietanza erario
  | 'MP15' // Giroconto su conti di contabilità speciale
  | 'MP16' // Domiciliazione bancaria
  | 'MP17' // Domiciliazione postale
  | 'MP18' // Bollettino di c/c postale
  | 'MP19' // SEPA Direct Debit
  | 'MP20' // SEPA Direct Debit CORE
  | 'MP21' // SEPA Direct Debit B2B
  | 'MP22' // Trattenuta su somme già riscosse
  | 'MP23'; // PagoPA

/**
 * Descrizioni modalità pagamento
 */
export const MODALITA_PAGAMENTO_DESCRIZIONI: Record<ModalitaPagamento, string> = {
  MP01: 'Contanti',
  MP02: 'Assegno',
  MP03: 'Assegno circolare',
  MP04: 'Contanti presso Tesoreria',
  MP05: 'Bonifico',
  MP06: 'Vaglia cambiario',
  MP07: 'Bollettino bancario',
  MP08: 'Carta di pagamento',
  MP09: 'RID',
  MP10: 'RID utenze',
  MP11: 'RID veloce',
  MP12: 'RIBA',
  MP13: 'MAV',
  MP14: 'Quietanza erario',
  MP15: 'Giroconto su conti di contabilità speciale',
  MP16: 'Domiciliazione bancaria',
  MP17: 'Domiciliazione postale',
  MP18: 'Bollettino di c/c postale',
  MP19: 'SEPA Direct Debit',
  MP20: 'SEPA Direct Debit CORE',
  MP21: 'SEPA Direct Debit B2B',
  MP22: 'Trattenuta su somme già riscosse',
  MP23: 'PagoPA',
};

/**
 * Condizioni di pagamento
 */
export type CondizioniPagamento =
  | 'TP01' // Pagamento a rate
  | 'TP02' // Pagamento completo
  | 'TP03'; // Anticipo

/**
 * Tipo ritenuta
 */
export type TipoRitenuta =
  | 'RT01' // Ritenuta persone fisiche
  | 'RT02' // Ritenuta persone giuridiche
  | 'RT03' // Contributo INPS
  | 'RT04' // Contributo ENASARCO
  | 'RT05' // Contributo ENPAM
  | 'RT06'; // Altro contributo previdenziale

/**
 * Tipo cassa previdenziale
 */
export type TipoCassa =
  | 'TC01' // Cassa nazionale previdenza e assistenza avvocati e procuratori legali
  | 'TC02' // Cassa previdenza dottori commercialisti
  | 'TC03' // Cassa previdenza e assistenza geometri
  | 'TC04' // Cassa nazionale previdenza e assistenza ingegneri e architetti liberi professionisti
  | 'TC05' // Cassa nazionale del notariato
  | 'TC06' // Cassa nazionale previdenza e assistenza ragionieri e periti commerciali
  | 'TC07' // Ente nazionale assistenza agenti e rappresentanti di commercio (ENASARCO)
  | 'TC08' // Ente nazionale previdenza e assistenza consulenti del lavoro (ENPACL)
  | 'TC09' // Ente nazionale previdenza e assistenza medici (ENPAM)
  | 'TC10' // Ente nazionale previdenza e assistenza farmacisti (ENPAF)
  | 'TC11' // Ente nazionale previdenza e assistenza veterinari (ENPAV)
  | 'TC12' // Ente nazionale previdenza e assistenza impiegati dell'agricoltura (ENPAIA)
  | 'TC13' // Fondo previdenza impiegati imprese di spedizione e agenzie marittime
  | 'TC14' // Istituto nazionale previdenza giornalisti italiani (INPGI)
  | 'TC15' // Opera nazionale assistenza orfani sanitari italiani (ONAOSI)
  | 'TC16' // Cassa autonoma assistenza integrativa giornalisti italiani (CASAGIT)
  | 'TC17' // Ente previdenza periti industriali e periti industriali laureati (EPPI)
  | 'TC18' // Ente previdenza e assistenza pluricategoriale (EPAP)
  | 'TC19' // Ente nazionale previdenza e assistenza biologi (ENPAB)
  | 'TC20' // Ente nazionale previdenza e assistenza professione infermieristica (ENPAPI)
  | 'TC21' // Ente nazionale previdenza e assistenza psicologi (ENPAP)
  | 'TC22'; // INPS

/**
 * Tipo sconto/maggiorazione
 */
export type TipoScontoMaggiorazione =
  | 'SC' // Sconto
  | 'MG'; // Maggiorazione

/**
 * Esigibilità IVA
 */
export type EsigibilitaIVA =
  | 'I' // IVA ad esigibilità immediata
  | 'D' // IVA ad esigibilità differita
  | 'S'; // Scissione dei pagamenti (split payment)

/**
 * Soggetto emittente
 */
export type SoggettoEmittente =
  | 'CC' // Cessionario/Committente
  | 'TZ'; // Terzo

/**
 * Stato liquidazione
 */
export type StatoLiquidazione =
  | 'LS' // Liquidazione in stato di scioglimento
  | 'LN'; // Liquidazione non in stato di scioglimento

/**
 * Socio unico
 */
export type SocioUnico =
  | 'SU' // Socio unico
  | 'SM'; // Più soci

/**
 * Tipo documento correlato
 */
export type TipoDocumentoCorrelato =
  | 'ordine'
  | 'contratto'
  | 'convenzione'
  | 'ricezione'
  | 'fattura';

/**
 * Causale pagamento (per ritenute)
 */
export type CausalePagamento =
  | 'A' // Prestazioni di lavoro autonomo rientranti nell'esercizio di arte o professione abituale
  | 'B' // Utilizzazione economica, da parte dell'autore o inventore, di opere dell'ingegno, brevetti industriali e simili
  | 'C' // Utili derivanti da contratti di associazione in partecipazione e da contratti di cointeressenza
  | 'D' // Utili spettanti ai soci promotori e ai soci fondatori delle società di capitali
  | 'E' // Levata di protesti cambiari da parte dei segretari comunali
  | 'G' // Indennità corrisposte per la cessazione di attività sportiva professionale
  | 'H' // Indennità corrisposte per la cessazione dei rapporti di agenzia delle persone fisiche
  | 'I' // Indennità corrisposte per la cessazione da funzioni notarili
  | 'L' // Utilizzazione economica, da parte di soggetto diverso dall'autore o inventore, di opere dell'ingegno, brevetti industriali e simili
  | 'M' // Prestazioni di lavoro autonomo non esercitate abitualmente
  | 'N' // Indennità di trasferta, rimborso forfetario di spese, premi e compensi erogati ai lavoratori autonomi occasionali
  | 'O' // Prestazioni di lavoro autonomo non esercitate abitualmente, per le quali non sussiste l'obbligo di iscrizione alla gestione separata (Circ. INPS n. 104/2001)
  | 'P' // Compensi corrisposti a soggetti non residenti privi di stabile organizzazione
  | 'Q' // Provvigioni corrisposte ad agente o rappresentante di commercio monomandatario
  | 'R' // Provvigioni corrisposte ad agente o rappresentante di commercio plurimandatario
  | 'S' // Provvigioni corrisposte a commissionario
  | 'T' // Provvigioni corrisposte a mediatore
  | 'U' // Provvigioni corrisposte a procacciatore di affari
  | 'V' // Provvigioni corrisposte a incaricato per le vendite a domicilio
  | 'W' // Corrispettivi erogati nel 2021 per prestazioni relative a contratti d'appalto
  | 'X' // Canoni corrisposti nel 2004 da società o enti residenti
  | 'Y' // Canoni corrisposti a decorrere dal 2005 da società o enti residenti
  | 'Z' // Titolo diverso dai precedenti
  | 'L1' // Redditi derivanti dall'utilizzazione economica di opere dell'ingegno
  | 'M1' // Redditi derivanti da attività di lavoro autonomo occasionale
  | 'M2' // Redditi derivanti dall'assunzione di obblighi di fare, non fare o permettere
  | 'O1' // Redditi derivanti da attività commerciali non esercitate abitualmente
  | 'V1' // Redditi derivanti da attività di lavoro autonomo occasionale o da obblighi di fare, non fare, permettere
  | 'ZO'; // Titolo diverso dai precedenti
