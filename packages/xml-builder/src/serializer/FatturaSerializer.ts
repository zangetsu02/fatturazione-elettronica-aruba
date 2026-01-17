import type { FatturaElettronica, DatiPagamento, Allegati } from '../types';
import { XmlSerializer, type XmlSerializerOptions } from './XmlSerializer';

/**
 * Namespace FatturaPA
 */
const FATTURAPA_NAMESPACE = 'http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2';
const XSI_NAMESPACE = 'http://www.w3.org/2001/XMLSchema-instance';
const SCHEMA_LOCATION =
  'http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2 http://www.fatturapa.gov.it/export/fatturazione/sdi/fatturapa/v1.2.2/Schema_del_file_xml_FatturaPA_v1.2.2.xsd';

/**
 * Opzioni per la serializzazione FatturaPA
 */
export interface FatturaSerializerOptions extends XmlSerializerOptions {
  /** Includere schemaLocation (default: true) */
  includeSchemaLocation?: boolean;
}

/**
 * Serializzatore specifico per FatturaPA
 */
export class FatturaSerializer {
  private serializer: XmlSerializer;
  private includeSchemaLocation: boolean;

  constructor(options: FatturaSerializerOptions = {}) {
    this.serializer = new XmlSerializer(options);
    this.includeSchemaLocation = options.includeSchemaLocation ?? true;
  }

  /**
   * Serializza una FatturaElettronica in XML
   */
  serialize(fattura: FatturaElettronica): string {
    const xmlContent = this.buildXmlContent(fattura);
    return xmlContent;
  }

  /**
   * Costruisce il contenuto XML
   */
  private buildXmlContent(fattura: FatturaElettronica): string {
    const lines: string[] = [];

    // Dichiarazione XML
    lines.push('<?xml version="1.0" encoding="UTF-8"?>');

    // Root element con namespace
    const rootAttrs = this.buildRootAttributes(fattura);
    lines.push(`<p:FatturaElettronica${rootAttrs}>`);

    // Header
    lines.push(this.serializeHeader(fattura));

    // Body (può essere multiplo per fatture lotto)
    for (const body of fattura.fatturaElettronicaBody) {
      lines.push(this.serializeBody(body));
    }

    lines.push('</p:FatturaElettronica>');

    return lines.join('\n');
  }

  /**
   * Costruisce gli attributi del root element
   */
  private buildRootAttributes(fattura: FatturaElettronica): string {
    const attrs: string[] = [
      `xmlns:p="${FATTURAPA_NAMESPACE}"`,
      `xmlns:xsi="${XSI_NAMESPACE}"`,
      `versione="${this.getVersioneFromFormat(fattura)}"`,
    ];

    if (this.includeSchemaLocation) {
      attrs.push(`xsi:schemaLocation="${SCHEMA_LOCATION}"`);
    }

    return ' ' + attrs.join(' ');
  }

  /**
   * Ottiene la versione dal formato trasmissione
   */
  private getVersioneFromFormat(fattura: FatturaElettronica): string {
    return fattura.fatturaElettronicaHeader.datiTrasmissione.formatoTrasmissione;
  }

  /**
   * Serializza l'header
   */
  private serializeHeader(fattura: FatturaElettronica): string {
    const header = fattura.fatturaElettronicaHeader;
    const lines: string[] = [];
    const indent = '  ';

    lines.push(`${indent}<FatturaElettronicaHeader>`);

    // DatiTrasmissione
    lines.push(this.serializeDatiTrasmissione(header.datiTrasmissione, indent + '  '));

    // CedentePrestatore
    lines.push(this.serializeCedentePrestatore(header.cedentePrestatore, indent + '  '));

    // RappresentanteFiscale (opzionale)
    if (header.rappresentanteFiscale) {
      lines.push(
        this.serializeSection('RappresentanteFiscale', header.rappresentanteFiscale, indent + '  ')
      );
    }

    // CessionarioCommittente
    lines.push(this.serializeCessionarioCommittente(header.cessionarioCommittente, indent + '  '));

    // TerzoIntermediarioOSoggettoEmittente (opzionale)
    if (header.terzoIntermediarioOSoggettoEmittente) {
      lines.push(
        this.serializeSection(
          'TerzoIntermediarioOSoggettoEmittente',
          header.terzoIntermediarioOSoggettoEmittente,
          indent + '  '
        )
      );
    }

    // SoggettoEmittente (opzionale)
    if (header.soggettoEmittente) {
      lines.push(`${indent}  <SoggettoEmittente>${header.soggettoEmittente}</SoggettoEmittente>`);
    }

    lines.push(`${indent}</FatturaElettronicaHeader>`);

    return lines.join('\n');
  }

  /**
   * Serializza i dati di trasmissione
   */
  private serializeDatiTrasmissione(
    dati: FatturaElettronica['fatturaElettronicaHeader']['datiTrasmissione'],
    indent: string
  ): string {
    const lines: string[] = [];
    lines.push(`${indent}<DatiTrasmissione>`);

    lines.push(`${indent}  <IdTrasmittente>`);
    lines.push(`${indent}    <IdPaese>${this.escapeXml(dati.idTrasmittente.idPaese)}</IdPaese>`);
    lines.push(`${indent}    <IdCodice>${this.escapeXml(dati.idTrasmittente.idCodice)}</IdCodice>`);
    lines.push(`${indent}  </IdTrasmittente>`);

    lines.push(
      `${indent}  <ProgressivoInvio>${this.escapeXml(dati.progressivoInvio)}</ProgressivoInvio>`
    );
    lines.push(`${indent}  <FormatoTrasmissione>${dati.formatoTrasmissione}</FormatoTrasmissione>`);
    lines.push(
      `${indent}  <CodiceDestinatario>${this.escapeXml(dati.codiceDestinatario)}</CodiceDestinatario>`
    );

    if (dati.contattiTrasmittente) {
      lines.push(`${indent}  <ContattiTrasmittente>`);
      if (dati.contattiTrasmittente.telefono) {
        lines.push(
          `${indent}    <Telefono>${this.escapeXml(dati.contattiTrasmittente.telefono)}</Telefono>`
        );
      }
      if (dati.contattiTrasmittente.email) {
        lines.push(
          `${indent}    <Email>${this.escapeXml(dati.contattiTrasmittente.email)}</Email>`
        );
      }
      lines.push(`${indent}  </ContattiTrasmittente>`);
    }

    if (dati.pecDestinatario) {
      lines.push(
        `${indent}  <PECDestinatario>${this.escapeXml(dati.pecDestinatario)}</PECDestinatario>`
      );
    }

    lines.push(`${indent}</DatiTrasmissione>`);
    return lines.join('\n');
  }

  /**
   * Serializza il cedente/prestatore
   */
  private serializeCedentePrestatore(
    cedente: FatturaElettronica['fatturaElettronicaHeader']['cedentePrestatore'],
    indent: string
  ): string {
    const lines: string[] = [];
    lines.push(`${indent}<CedentePrestatore>`);

    // DatiAnagrafici
    lines.push(`${indent}  <DatiAnagrafici>`);

    if (cedente.datiAnagrafici.idFiscaleIVA) {
      lines.push(`${indent}    <IdFiscaleIVA>`);
      lines.push(
        `${indent}      <IdPaese>${this.escapeXml(cedente.datiAnagrafici.idFiscaleIVA.idPaese)}</IdPaese>`
      );
      lines.push(
        `${indent}      <IdCodice>${this.escapeXml(cedente.datiAnagrafici.idFiscaleIVA.idCodice)}</IdCodice>`
      );
      lines.push(`${indent}    </IdFiscaleIVA>`);
    }

    if (cedente.datiAnagrafici.codiceFiscale) {
      lines.push(
        `${indent}    <CodiceFiscale>${this.escapeXml(cedente.datiAnagrafici.codiceFiscale)}</CodiceFiscale>`
      );
    }

    lines.push(this.serializeAnagrafica(cedente.datiAnagrafici.anagrafica, indent + '    '));

    if (cedente.datiAnagrafici.alboProfessionale) {
      lines.push(
        `${indent}    <AlboProfessionale>${this.escapeXml(cedente.datiAnagrafici.alboProfessionale)}</AlboProfessionale>`
      );
    }
    if (cedente.datiAnagrafici.provinciaAlbo) {
      lines.push(
        `${indent}    <ProvinciaAlbo>${this.escapeXml(cedente.datiAnagrafici.provinciaAlbo)}</ProvinciaAlbo>`
      );
    }
    if (cedente.datiAnagrafici.numeroIscrizioneAlbo) {
      lines.push(
        `${indent}    <NumeroIscrizioneAlbo>${this.escapeXml(cedente.datiAnagrafici.numeroIscrizioneAlbo)}</NumeroIscrizioneAlbo>`
      );
    }
    if (cedente.datiAnagrafici.dataIscrizioneAlbo) {
      lines.push(
        `${indent}    <DataIscrizioneAlbo>${cedente.datiAnagrafici.dataIscrizioneAlbo}</DataIscrizioneAlbo>`
      );
    }

    lines.push(
      `${indent}    <RegimeFiscale>${cedente.datiAnagrafici.regimeFiscale}</RegimeFiscale>`
    );
    lines.push(`${indent}  </DatiAnagrafici>`);

    // Sede
    lines.push(this.serializeIndirizzo('Sede', cedente.sede, indent + '  '));

    // StabileOrganizzazione (opzionale)
    if (cedente.stabileOrganizzazione) {
      lines.push(
        this.serializeIndirizzo(
          'StabileOrganizzazione',
          cedente.stabileOrganizzazione,
          indent + '  '
        )
      );
    }

    // IscrizioneREA (opzionale)
    if (cedente.iscrizioneREA) {
      lines.push(`${indent}  <IscrizioneREA>`);
      lines.push(
        `${indent}    <Ufficio>${this.escapeXml(cedente.iscrizioneREA.ufficio)}</Ufficio>`
      );
      lines.push(
        `${indent}    <NumeroREA>${this.escapeXml(cedente.iscrizioneREA.numeroREA)}</NumeroREA>`
      );
      if (cedente.iscrizioneREA.capitaleSociale !== undefined) {
        lines.push(
          `${indent}    <CapitaleSociale>${this.formatDecimal(cedente.iscrizioneREA.capitaleSociale)}</CapitaleSociale>`
        );
      }
      if (cedente.iscrizioneREA.socioUnico) {
        lines.push(`${indent}    <SocioUnico>${cedente.iscrizioneREA.socioUnico}</SocioUnico>`);
      }
      lines.push(
        `${indent}    <StatoLiquidazione>${cedente.iscrizioneREA.statoLiquidazione}</StatoLiquidazione>`
      );
      lines.push(`${indent}  </IscrizioneREA>`);
    }

    // Contatti (opzionale)
    if (cedente.contatti) {
      lines.push(this.serializeContatti(cedente.contatti, indent + '  '));
    }

    // RiferimentoAmministrazione (opzionale)
    if (cedente.riferimentoAmministrazione) {
      lines.push(
        `${indent}  <RiferimentoAmministrazione>${this.escapeXml(cedente.riferimentoAmministrazione)}</RiferimentoAmministrazione>`
      );
    }

    lines.push(`${indent}</CedentePrestatore>`);
    return lines.join('\n');
  }

  /**
   * Serializza il cessionario/committente
   */
  private serializeCessionarioCommittente(
    cessionario: FatturaElettronica['fatturaElettronicaHeader']['cessionarioCommittente'],
    indent: string
  ): string {
    const lines: string[] = [];
    lines.push(`${indent}<CessionarioCommittente>`);

    // DatiAnagrafici
    lines.push(`${indent}  <DatiAnagrafici>`);

    if (cessionario.datiAnagrafici.idFiscaleIVA) {
      lines.push(`${indent}    <IdFiscaleIVA>`);
      lines.push(
        `${indent}      <IdPaese>${this.escapeXml(cessionario.datiAnagrafici.idFiscaleIVA.idPaese)}</IdPaese>`
      );
      lines.push(
        `${indent}      <IdCodice>${this.escapeXml(cessionario.datiAnagrafici.idFiscaleIVA.idCodice)}</IdCodice>`
      );
      lines.push(`${indent}    </IdFiscaleIVA>`);
    }

    if (cessionario.datiAnagrafici.codiceFiscale) {
      lines.push(
        `${indent}    <CodiceFiscale>${this.escapeXml(cessionario.datiAnagrafici.codiceFiscale)}</CodiceFiscale>`
      );
    }

    lines.push(this.serializeAnagrafica(cessionario.datiAnagrafici.anagrafica, indent + '    '));
    lines.push(`${indent}  </DatiAnagrafici>`);

    // Sede
    lines.push(this.serializeIndirizzo('Sede', cessionario.sede, indent + '  '));

    // StabileOrganizzazione (opzionale)
    if (cessionario.stabileOrganizzazione) {
      lines.push(
        this.serializeIndirizzo(
          'StabileOrganizzazione',
          cessionario.stabileOrganizzazione,
          indent + '  '
        )
      );
    }

    // RappresentanteFiscale (opzionale)
    if (cessionario.rappresentanteFiscale) {
      lines.push(`${indent}  <RappresentanteFiscale>`);
      lines.push(`${indent}    <IdFiscaleIVA>`);
      lines.push(
        `${indent}      <IdPaese>${this.escapeXml(cessionario.rappresentanteFiscale.idFiscaleIVA.idPaese)}</IdPaese>`
      );
      lines.push(
        `${indent}      <IdCodice>${this.escapeXml(cessionario.rappresentanteFiscale.idFiscaleIVA.idCodice)}</IdCodice>`
      );
      lines.push(`${indent}    </IdFiscaleIVA>`);
      if (cessionario.rappresentanteFiscale.denominazione) {
        lines.push(
          `${indent}    <Denominazione>${this.escapeXml(cessionario.rappresentanteFiscale.denominazione)}</Denominazione>`
        );
      }
      if (cessionario.rappresentanteFiscale.nome) {
        lines.push(
          `${indent}    <Nome>${this.escapeXml(cessionario.rappresentanteFiscale.nome)}</Nome>`
        );
      }
      if (cessionario.rappresentanteFiscale.cognome) {
        lines.push(
          `${indent}    <Cognome>${this.escapeXml(cessionario.rappresentanteFiscale.cognome)}</Cognome>`
        );
      }
      lines.push(`${indent}  </RappresentanteFiscale>`);
    }

    lines.push(`${indent}</CessionarioCommittente>`);
    return lines.join('\n');
  }

  /**
   * Serializza il body della fattura
   */
  private serializeBody(body: FatturaElettronica['fatturaElettronicaBody'][0]): string {
    const lines: string[] = [];
    const indent = '  ';

    lines.push(`${indent}<FatturaElettronicaBody>`);

    // DatiGenerali
    lines.push(this.serializeDatiGenerali(body.datiGenerali, indent + '  '));

    // DatiBeniServizi
    lines.push(this.serializeDatiBeniServizi(body.datiBeniServizi, indent + '  '));

    // DatiVeicoli (opzionale)
    if (body.datiVeicoli) {
      lines.push(`${indent}  <DatiVeicoli>`);
      lines.push(`${indent}    <Data>${body.datiVeicoli.data}</Data>`);
      lines.push(
        `${indent}    <TotalePercorso>${this.escapeXml(body.datiVeicoli.totalePercorso)}</TotalePercorso>`
      );
      lines.push(`${indent}  </DatiVeicoli>`);
    }

    // DatiPagamento (opzionale)
    if (body.datiPagamento && body.datiPagamento.length > 0) {
      for (const pagamento of body.datiPagamento) {
        lines.push(this.serializeDatiPagamento(pagamento, indent + '  '));
      }
    }

    // Allegati (opzionale)
    if (body.allegati && body.allegati.length > 0) {
      for (const allegato of body.allegati) {
        lines.push(this.serializeAllegato(allegato, indent + '  '));
      }
    }

    lines.push(`${indent}</FatturaElettronicaBody>`);

    return lines.join('\n');
  }

  /**
   * Serializza i dati generali
   */
  private serializeDatiGenerali(
    datiGenerali: FatturaElettronica['fatturaElettronicaBody'][0]['datiGenerali'],
    indent: string
  ): string {
    const lines: string[] = [];
    lines.push(`${indent}<DatiGenerali>`);

    // DatiGeneraliDocumento
    const doc = datiGenerali.datiGeneraliDocumento;
    lines.push(`${indent}  <DatiGeneraliDocumento>`);
    lines.push(`${indent}    <TipoDocumento>${doc.tipoDocumento}</TipoDocumento>`);
    lines.push(`${indent}    <Divisa>${doc.divisa}</Divisa>`);
    lines.push(`${indent}    <Data>${doc.data}</Data>`);
    lines.push(`${indent}    <Numero>${this.escapeXml(doc.numero)}</Numero>`);

    if (doc.datiRitenuta) {
      lines.push(`${indent}    <DatiRitenuta>`);
      lines.push(`${indent}      <TipoRitenuta>${doc.datiRitenuta.tipoRitenuta}</TipoRitenuta>`);
      lines.push(
        `${indent}      <ImportoRitenuta>${this.formatDecimal(doc.datiRitenuta.importoRitenuta)}</ImportoRitenuta>`
      );
      lines.push(
        `${indent}      <AliquotaRitenuta>${this.formatDecimal(doc.datiRitenuta.aliquotaRitenuta)}</AliquotaRitenuta>`
      );
      lines.push(
        `${indent}      <CausalePagamento>${doc.datiRitenuta.causalePagamento}</CausalePagamento>`
      );
      lines.push(`${indent}    </DatiRitenuta>`);
    }

    if (doc.datiBollo) {
      lines.push(`${indent}    <DatiBollo>`);
      lines.push(`${indent}      <BolloVirtuale>${doc.datiBollo.bolloVirtuale}</BolloVirtuale>`);
      lines.push(
        `${indent}      <ImportoBollo>${this.formatDecimal(doc.datiBollo.importoBollo)}</ImportoBollo>`
      );
      lines.push(`${indent}    </DatiBollo>`);
    }

    if (doc.datiCassaPrevidenziale) {
      for (const cassa of doc.datiCassaPrevidenziale) {
        lines.push(`${indent}    <DatiCassaPrevidenziale>`);
        lines.push(`${indent}      <TipoCassa>${cassa.tipoCassa}</TipoCassa>`);
        lines.push(`${indent}      <AlCassa>${this.formatDecimal(cassa.alCassa)}</AlCassa>`);
        lines.push(
          `${indent}      <ImportoContributoCassa>${this.formatDecimal(cassa.importoContributoCassa)}</ImportoContributoCassa>`
        );
        if (cassa.imponibileCassa !== undefined) {
          lines.push(
            `${indent}      <ImponibileCassa>${this.formatDecimal(cassa.imponibileCassa)}</ImponibileCassa>`
          );
        }
        lines.push(
          `${indent}      <AliquotaIVA>${this.formatDecimal(cassa.aliquotaIVA)}</AliquotaIVA>`
        );
        if (cassa.ritenuta) {
          lines.push(`${indent}      <Ritenuta>${cassa.ritenuta}</Ritenuta>`);
        }
        if (cassa.natura) {
          lines.push(`${indent}      <Natura>${cassa.natura}</Natura>`);
        }
        if (cassa.riferimentoAmministrazione) {
          lines.push(
            `${indent}      <RiferimentoAmministrazione>${this.escapeXml(cassa.riferimentoAmministrazione)}</RiferimentoAmministrazione>`
          );
        }
        lines.push(`${indent}    </DatiCassaPrevidenziale>`);
      }
    }

    if (doc.scontoMaggiorazione) {
      for (const sconto of doc.scontoMaggiorazione) {
        lines.push(this.serializeScontoMaggiorazione(sconto, indent + '    '));
      }
    }

    if (doc.importoTotaleDocumento !== undefined) {
      lines.push(
        `${indent}    <ImportoTotaleDocumento>${this.formatDecimal(doc.importoTotaleDocumento)}</ImportoTotaleDocumento>`
      );
    }

    if (doc.arrotondamento !== undefined) {
      lines.push(
        `${indent}    <Arrotondamento>${this.formatDecimal(doc.arrotondamento)}</Arrotondamento>`
      );
    }

    if (doc.causale) {
      for (const causale of doc.causale) {
        lines.push(`${indent}    <Causale>${this.escapeXml(causale)}</Causale>`);
      }
    }

    if (doc.art73) {
      lines.push(`${indent}    <Art73>${doc.art73}</Art73>`);
    }

    lines.push(`${indent}  </DatiGeneraliDocumento>`);

    // Documenti correlati
    if (datiGenerali.datiOrdineAcquisto) {
      for (const ordine of datiGenerali.datiOrdineAcquisto) {
        lines.push(this.serializeDocumentoCorrelato('DatiOrdineAcquisto', ordine, indent + '  '));
      }
    }

    if (datiGenerali.datiContratto) {
      for (const contratto of datiGenerali.datiContratto) {
        lines.push(this.serializeDocumentoCorrelato('DatiContratto', contratto, indent + '  '));
      }
    }

    if (datiGenerali.datiConvenzione) {
      for (const convenzione of datiGenerali.datiConvenzione) {
        lines.push(this.serializeDocumentoCorrelato('DatiConvenzione', convenzione, indent + '  '));
      }
    }

    if (datiGenerali.datiRicezione) {
      for (const ricezione of datiGenerali.datiRicezione) {
        lines.push(this.serializeDocumentoCorrelato('DatiRicezione', ricezione, indent + '  '));
      }
    }

    if (datiGenerali.datiFattureCollegate) {
      for (const fattura of datiGenerali.datiFattureCollegate) {
        lines.push(
          this.serializeDocumentoCorrelato('DatiFattureCollegate', fattura, indent + '  ')
        );
      }
    }

    if (datiGenerali.datiSAL) {
      for (const sal of datiGenerali.datiSAL) {
        lines.push(`${indent}  <DatiSAL>`);
        lines.push(`${indent}    <RiferimentoFase>${sal.riferimentoFase}</RiferimentoFase>`);
        lines.push(`${indent}  </DatiSAL>`);
      }
    }

    if (datiGenerali.datiDDT) {
      for (const ddt of datiGenerali.datiDDT) {
        lines.push(`${indent}  <DatiDDT>`);
        lines.push(`${indent}    <NumeroDDT>${this.escapeXml(ddt.numeroDDT)}</NumeroDDT>`);
        lines.push(`${indent}    <DataDDT>${ddt.dataDDT}</DataDDT>`);
        if (ddt.riferimentoNumeroLinea) {
          for (const num of ddt.riferimentoNumeroLinea) {
            lines.push(`${indent}    <RiferimentoNumeroLinea>${num}</RiferimentoNumeroLinea>`);
          }
        }
        lines.push(`${indent}  </DatiDDT>`);
      }
    }

    if (datiGenerali.datiTrasporto) {
      lines.push(this.serializeDatiTrasporto(datiGenerali.datiTrasporto, indent + '  '));
    }

    if (datiGenerali.fatturaPrincipale) {
      lines.push(`${indent}  <FatturaPrincipale>`);
      lines.push(
        `${indent}    <NumeroFatturaPrincipale>${this.escapeXml(datiGenerali.fatturaPrincipale.numeroFatturaPrincipale)}</NumeroFatturaPrincipale>`
      );
      lines.push(
        `${indent}    <DataFatturaPrincipale>${datiGenerali.fatturaPrincipale.dataFatturaPrincipale}</DataFatturaPrincipale>`
      );
      lines.push(`${indent}  </FatturaPrincipale>`);
    }

    lines.push(`${indent}</DatiGenerali>`);
    return lines.join('\n');
  }

  /**
   * Serializza dati beni e servizi
   */
  private serializeDatiBeniServizi(
    datiBeniServizi: FatturaElettronica['fatturaElettronicaBody'][0]['datiBeniServizi'],
    indent: string
  ): string {
    const lines: string[] = [];
    lines.push(`${indent}<DatiBeniServizi>`);

    // DettaglioLinee
    for (const linea of datiBeniServizi.dettaglioLinee) {
      lines.push(`${indent}  <DettaglioLinee>`);
      lines.push(`${indent}    <NumeroLinea>${linea.numeroLinea}</NumeroLinea>`);

      if (linea.tipoCessionePrestazione) {
        lines.push(
          `${indent}    <TipoCessionePrestazione>${linea.tipoCessionePrestazione}</TipoCessionePrestazione>`
        );
      }

      if (linea.codiceArticolo) {
        for (const codice of linea.codiceArticolo) {
          lines.push(`${indent}    <CodiceArticolo>`);
          lines.push(
            `${indent}      <CodiceTipo>${this.escapeXml(codice.codiceTipo)}</CodiceTipo>`
          );
          lines.push(
            `${indent}      <CodiceValore>${this.escapeXml(codice.codiceValore)}</CodiceValore>`
          );
          lines.push(`${indent}    </CodiceArticolo>`);
        }
      }

      lines.push(`${indent}    <Descrizione>${this.escapeXml(linea.descrizione)}</Descrizione>`);

      if (linea.quantita !== undefined) {
        lines.push(`${indent}    <Quantita>${this.formatDecimal(linea.quantita)}</Quantita>`);
      }

      if (linea.unitaMisura) {
        lines.push(`${indent}    <UnitaMisura>${this.escapeXml(linea.unitaMisura)}</UnitaMisura>`);
      }

      if (linea.dataInizioPeriodo) {
        lines.push(
          `${indent}    <DataInizioPeriodo>${linea.dataInizioPeriodo}</DataInizioPeriodo>`
        );
      }

      if (linea.dataFinePeriodo) {
        lines.push(`${indent}    <DataFinePeriodo>${linea.dataFinePeriodo}</DataFinePeriodo>`);
      }

      lines.push(
        `${indent}    <PrezzoUnitario>${this.formatDecimal(linea.prezzoUnitario)}</PrezzoUnitario>`
      );

      if (linea.scontoMaggiorazione) {
        for (const sconto of linea.scontoMaggiorazione) {
          lines.push(this.serializeScontoMaggiorazione(sconto, indent + '    '));
        }
      }

      lines.push(
        `${indent}    <PrezzoTotale>${this.formatDecimal(linea.prezzoTotale)}</PrezzoTotale>`
      );
      lines.push(
        `${indent}    <AliquotaIVA>${this.formatDecimal(linea.aliquotaIVA)}</AliquotaIVA>`
      );

      if (linea.ritenuta) {
        lines.push(`${indent}    <Ritenuta>${linea.ritenuta}</Ritenuta>`);
      }

      if (linea.natura) {
        lines.push(`${indent}    <Natura>${linea.natura}</Natura>`);
      }

      if (linea.riferimentoAmministrazione) {
        lines.push(
          `${indent}    <RiferimentoAmministrazione>${this.escapeXml(linea.riferimentoAmministrazione)}</RiferimentoAmministrazione>`
        );
      }

      if (linea.altriDatiGestionali) {
        for (const altri of linea.altriDatiGestionali) {
          lines.push(`${indent}    <AltriDatiGestionali>`);
          lines.push(`${indent}      <TipoDato>${this.escapeXml(altri.tipoDato)}</TipoDato>`);
          if (altri.riferimentoTesto) {
            lines.push(
              `${indent}      <RiferimentoTesto>${this.escapeXml(altri.riferimentoTesto)}</RiferimentoTesto>`
            );
          }
          if (altri.riferimentoNumero !== undefined) {
            lines.push(
              `${indent}      <RiferimentoNumero>${this.formatDecimal(altri.riferimentoNumero)}</RiferimentoNumero>`
            );
          }
          if (altri.riferimentoData) {
            lines.push(
              `${indent}      <RiferimentoData>${altri.riferimentoData}</RiferimentoData>`
            );
          }
          lines.push(`${indent}    </AltriDatiGestionali>`);
        }
      }

      lines.push(`${indent}  </DettaglioLinee>`);
    }

    // DatiRiepilogo
    for (const riepilogo of datiBeniServizi.datiRiepilogo) {
      lines.push(`${indent}  <DatiRiepilogo>`);
      lines.push(
        `${indent}    <AliquotaIVA>${this.formatDecimal(riepilogo.aliquotaIVA)}</AliquotaIVA>`
      );

      if (riepilogo.natura) {
        lines.push(`${indent}    <Natura>${riepilogo.natura}</Natura>`);
      }

      if (riepilogo.speseAccessorie !== undefined) {
        lines.push(
          `${indent}    <SpeseAccessorie>${this.formatDecimal(riepilogo.speseAccessorie)}</SpeseAccessorie>`
        );
      }

      if (riepilogo.arrotondamento !== undefined) {
        lines.push(
          `${indent}    <Arrotondamento>${this.formatDecimal(riepilogo.arrotondamento)}</Arrotondamento>`
        );
      }

      lines.push(
        `${indent}    <ImponibileImporto>${this.formatDecimal(riepilogo.imponibileImporto)}</ImponibileImporto>`
      );
      lines.push(`${indent}    <Imposta>${this.formatDecimal(riepilogo.imposta)}</Imposta>`);

      if (riepilogo.esigibilitaIVA) {
        lines.push(`${indent}    <EsigibilitaIVA>${riepilogo.esigibilitaIVA}</EsigibilitaIVA>`);
      }

      if (riepilogo.riferimentoNormativo) {
        lines.push(
          `${indent}    <RiferimentoNormativo>${this.escapeXml(riepilogo.riferimentoNormativo)}</RiferimentoNormativo>`
        );
      }

      lines.push(`${indent}  </DatiRiepilogo>`);
    }

    lines.push(`${indent}</DatiBeniServizi>`);
    return lines.join('\n');
  }

  /**
   * Serializza dati pagamento
   */
  private serializeDatiPagamento(pagamento: DatiPagamento, indent: string): string {
    const lines: string[] = [];
    lines.push(`${indent}<DatiPagamento>`);
    lines.push(
      `${indent}  <CondizioniPagamento>${pagamento.condizioniPagamento}</CondizioniPagamento>`
    );

    for (const dettaglio of pagamento.dettaglioPagamento) {
      lines.push(`${indent}  <DettaglioPagamento>`);

      if (dettaglio.beneficiario) {
        lines.push(
          `${indent}    <Beneficiario>${this.escapeXml(dettaglio.beneficiario)}</Beneficiario>`
        );
      }

      lines.push(
        `${indent}    <ModalitaPagamento>${dettaglio.modalitaPagamento}</ModalitaPagamento>`
      );

      if (dettaglio.dataRiferimentoTerminiPagamento) {
        lines.push(
          `${indent}    <DataRiferimentoTerminiPagamento>${dettaglio.dataRiferimentoTerminiPagamento}</DataRiferimentoTerminiPagamento>`
        );
      }

      if (dettaglio.giorniTerminiPagamento !== undefined) {
        lines.push(
          `${indent}    <GiorniTerminiPagamento>${dettaglio.giorniTerminiPagamento}</GiorniTerminiPagamento>`
        );
      }

      if (dettaglio.dataScadenzaPagamento) {
        lines.push(
          `${indent}    <DataScadenzaPagamento>${dettaglio.dataScadenzaPagamento}</DataScadenzaPagamento>`
        );
      }

      lines.push(
        `${indent}    <ImportoPagamento>${this.formatDecimal(dettaglio.importoPagamento)}</ImportoPagamento>`
      );

      if (dettaglio.codUfficioPostale) {
        lines.push(
          `${indent}    <CodUfficioPostale>${this.escapeXml(dettaglio.codUfficioPostale)}</CodUfficioPostale>`
        );
      }

      if (dettaglio.cognomeQuietanzante) {
        lines.push(
          `${indent}    <CognomeQuietanzante>${this.escapeXml(dettaglio.cognomeQuietanzante)}</CognomeQuietanzante>`
        );
      }

      if (dettaglio.nomeQuietanzante) {
        lines.push(
          `${indent}    <NomeQuietanzante>${this.escapeXml(dettaglio.nomeQuietanzante)}</NomeQuietanzante>`
        );
      }

      if (dettaglio.cfQuietanzante) {
        lines.push(
          `${indent}    <CFQuietanzante>${this.escapeXml(dettaglio.cfQuietanzante)}</CFQuietanzante>`
        );
      }

      if (dettaglio.titoloQuietanzante) {
        lines.push(
          `${indent}    <TitoloQuietanzante>${this.escapeXml(dettaglio.titoloQuietanzante)}</TitoloQuietanzante>`
        );
      }

      if (dettaglio.istitutoFinanziario) {
        lines.push(
          `${indent}    <IstitutoFinanziario>${this.escapeXml(dettaglio.istitutoFinanziario)}</IstitutoFinanziario>`
        );
      }

      if (dettaglio.iban) {
        lines.push(`${indent}    <IBAN>${this.escapeXml(dettaglio.iban)}</IBAN>`);
      }

      if (dettaglio.abi) {
        lines.push(`${indent}    <ABI>${this.escapeXml(dettaglio.abi)}</ABI>`);
      }

      if (dettaglio.cab) {
        lines.push(`${indent}    <CAB>${this.escapeXml(dettaglio.cab)}</CAB>`);
      }

      if (dettaglio.bic) {
        lines.push(`${indent}    <BIC>${this.escapeXml(dettaglio.bic)}</BIC>`);
      }

      if (dettaglio.scontoPagamentoAnticipato !== undefined) {
        lines.push(
          `${indent}    <ScontoPagamentoAnticipato>${this.formatDecimal(dettaglio.scontoPagamentoAnticipato)}</ScontoPagamentoAnticipato>`
        );
      }

      if (dettaglio.dataLimitePagamentoAnticipato) {
        lines.push(
          `${indent}    <DataLimitePagamentoAnticipato>${dettaglio.dataLimitePagamentoAnticipato}</DataLimitePagamentoAnticipato>`
        );
      }

      if (dettaglio.penalitaPagamentiRitardati !== undefined) {
        lines.push(
          `${indent}    <PenalitaPagamentiRitardati>${this.formatDecimal(dettaglio.penalitaPagamentiRitardati)}</PenalitaPagamentiRitardati>`
        );
      }

      if (dettaglio.dataDecorrenzaPenale) {
        lines.push(
          `${indent}    <DataDecorrenzaPenale>${dettaglio.dataDecorrenzaPenale}</DataDecorrenzaPenale>`
        );
      }

      if (dettaglio.codicePagamento) {
        lines.push(
          `${indent}    <CodicePagamento>${this.escapeXml(dettaglio.codicePagamento)}</CodicePagamento>`
        );
      }

      lines.push(`${indent}  </DettaglioPagamento>`);
    }

    lines.push(`${indent}</DatiPagamento>`);
    return lines.join('\n');
  }

  /**
   * Serializza un allegato
   */
  private serializeAllegato(allegato: Allegati, indent: string): string {
    const lines: string[] = [];
    lines.push(`${indent}<Allegati>`);
    lines.push(
      `${indent}  <NomeAttachment>${this.escapeXml(allegato.nomeAttachment)}</NomeAttachment>`
    );

    if (allegato.algoritmoCompressione) {
      lines.push(
        `${indent}  <AlgoritmoCompressione>${this.escapeXml(allegato.algoritmoCompressione)}</AlgoritmoCompressione>`
      );
    }

    if (allegato.formatoAttachment) {
      lines.push(
        `${indent}  <FormatoAttachment>${this.escapeXml(allegato.formatoAttachment)}</FormatoAttachment>`
      );
    }

    if (allegato.descrizioneAttachment) {
      lines.push(
        `${indent}  <DescrizioneAttachment>${this.escapeXml(allegato.descrizioneAttachment)}</DescrizioneAttachment>`
      );
    }

    lines.push(`${indent}  <Attachment>${allegato.attachment}</Attachment>`);
    lines.push(`${indent}</Allegati>`);
    return lines.join('\n');
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private serializeSection(name: string, obj: unknown, indent: string): string {
    // Placeholder - utilizzare il serializer generico se necessario
    return this.serializer.serialize(name, obj);
  }

  private serializeAnagrafica(
    anagrafica: {
      denominazione?: string;
      nome?: string;
      cognome?: string;
      titolo?: string;
      codEORI?: string;
    },
    indent: string
  ): string {
    const lines: string[] = [];
    lines.push(`${indent}<Anagrafica>`);

    if (anagrafica.denominazione) {
      lines.push(
        `${indent}  <Denominazione>${this.escapeXml(anagrafica.denominazione)}</Denominazione>`
      );
    }
    if (anagrafica.nome) {
      lines.push(`${indent}  <Nome>${this.escapeXml(anagrafica.nome)}</Nome>`);
    }
    if (anagrafica.cognome) {
      lines.push(`${indent}  <Cognome>${this.escapeXml(anagrafica.cognome)}</Cognome>`);
    }
    if (anagrafica.titolo) {
      lines.push(`${indent}  <Titolo>${this.escapeXml(anagrafica.titolo)}</Titolo>`);
    }
    if (anagrafica.codEORI) {
      lines.push(`${indent}  <CodEORI>${this.escapeXml(anagrafica.codEORI)}</CodEORI>`);
    }

    lines.push(`${indent}</Anagrafica>`);
    return lines.join('\n');
  }

  private serializeIndirizzo(
    name: string,
    indirizzo: {
      indirizzo: string;
      numeroCivico?: string;
      cap: string;
      comune: string;
      provincia?: string;
      nazione: string;
    },
    indent: string
  ): string {
    const lines: string[] = [];
    lines.push(`${indent}<${name}>`);
    lines.push(`${indent}  <Indirizzo>${this.escapeXml(indirizzo.indirizzo)}</Indirizzo>`);

    if (indirizzo.numeroCivico) {
      lines.push(
        `${indent}  <NumeroCivico>${this.escapeXml(indirizzo.numeroCivico)}</NumeroCivico>`
      );
    }

    lines.push(`${indent}  <CAP>${this.escapeXml(indirizzo.cap)}</CAP>`);
    lines.push(`${indent}  <Comune>${this.escapeXml(indirizzo.comune)}</Comune>`);

    if (indirizzo.provincia) {
      lines.push(`${indent}  <Provincia>${this.escapeXml(indirizzo.provincia)}</Provincia>`);
    }

    lines.push(`${indent}  <Nazione>${this.escapeXml(indirizzo.nazione)}</Nazione>`);
    lines.push(`${indent}</${name}>`);
    return lines.join('\n');
  }

  private serializeContatti(
    contatti: { telefono?: string; fax?: string; email?: string },
    indent: string
  ): string {
    const lines: string[] = [];
    lines.push(`${indent}<Contatti>`);

    if (contatti.telefono) {
      lines.push(`${indent}  <Telefono>${this.escapeXml(contatti.telefono)}</Telefono>`);
    }
    if (contatti.fax) {
      lines.push(`${indent}  <Fax>${this.escapeXml(contatti.fax)}</Fax>`);
    }
    if (contatti.email) {
      lines.push(`${indent}  <Email>${this.escapeXml(contatti.email)}</Email>`);
    }

    lines.push(`${indent}</Contatti>`);
    return lines.join('\n');
  }

  private serializeScontoMaggiorazione(
    sconto: { tipo: string; percentuale?: number; importo?: number },
    indent: string
  ): string {
    const lines: string[] = [];
    lines.push(`${indent}<ScontoMaggiorazione>`);
    lines.push(`${indent}  <Tipo>${sconto.tipo}</Tipo>`);

    if (sconto.percentuale !== undefined) {
      lines.push(`${indent}  <Percentuale>${this.formatDecimal(sconto.percentuale)}</Percentuale>`);
    }

    if (sconto.importo !== undefined) {
      lines.push(`${indent}  <Importo>${this.formatDecimal(sconto.importo)}</Importo>`);
    }

    lines.push(`${indent}</ScontoMaggiorazione>`);
    return lines.join('\n');
  }

  private serializeDocumentoCorrelato(
    name: string,
    doc: {
      riferimentoNumeroLinea?: number[];
      idDocumento: string;
      data?: string;
      numItem?: string;
      codiceCommessaConvenzione?: string;
      codiceCUP?: string;
      codiceCIG?: string;
    },
    indent: string
  ): string {
    const lines: string[] = [];
    lines.push(`${indent}<${name}>`);

    if (doc.riferimentoNumeroLinea) {
      for (const num of doc.riferimentoNumeroLinea) {
        lines.push(`${indent}  <RiferimentoNumeroLinea>${num}</RiferimentoNumeroLinea>`);
      }
    }

    lines.push(`${indent}  <IdDocumento>${this.escapeXml(doc.idDocumento)}</IdDocumento>`);

    if (doc.data) {
      lines.push(`${indent}  <Data>${doc.data}</Data>`);
    }

    if (doc.numItem) {
      lines.push(`${indent}  <NumItem>${this.escapeXml(doc.numItem)}</NumItem>`);
    }

    if (doc.codiceCommessaConvenzione) {
      lines.push(
        `${indent}  <CodiceCommessaConvenzione>${this.escapeXml(doc.codiceCommessaConvenzione)}</CodiceCommessaConvenzione>`
      );
    }

    if (doc.codiceCUP) {
      lines.push(`${indent}  <CodiceCUP>${this.escapeXml(doc.codiceCUP)}</CodiceCUP>`);
    }

    if (doc.codiceCIG) {
      lines.push(`${indent}  <CodiceCIG>${this.escapeXml(doc.codiceCIG)}</CodiceCIG>`);
    }

    lines.push(`${indent}</${name}>`);
    return lines.join('\n');
  }

  private serializeDatiTrasporto(
    trasporto: FatturaElettronica['fatturaElettronicaBody'][0]['datiGenerali']['datiTrasporto'],
    indent: string
  ): string {
    if (!trasporto) return '';

    const lines: string[] = [];
    lines.push(`${indent}<DatiTrasporto>`);

    if (trasporto.datiAnagraficiVettore) {
      lines.push(`${indent}  <DatiAnagraficiVettore>`);

      if (trasporto.datiAnagraficiVettore.idFiscaleIVA) {
        lines.push(`${indent}    <IdFiscaleIVA>`);
        lines.push(
          `${indent}      <IdPaese>${this.escapeXml(trasporto.datiAnagraficiVettore.idFiscaleIVA.idPaese)}</IdPaese>`
        );
        lines.push(
          `${indent}      <IdCodice>${this.escapeXml(trasporto.datiAnagraficiVettore.idFiscaleIVA.idCodice)}</IdCodice>`
        );
        lines.push(`${indent}    </IdFiscaleIVA>`);
      }

      if (trasporto.datiAnagraficiVettore.codiceFiscale) {
        lines.push(
          `${indent}    <CodiceFiscale>${this.escapeXml(trasporto.datiAnagraficiVettore.codiceFiscale)}</CodiceFiscale>`
        );
      }

      lines.push(
        this.serializeAnagrafica(trasporto.datiAnagraficiVettore.anagrafica, indent + '    ')
      );

      if (trasporto.datiAnagraficiVettore.numeroLicenzaGuida) {
        lines.push(
          `${indent}    <NumeroLicenzaGuida>${this.escapeXml(trasporto.datiAnagraficiVettore.numeroLicenzaGuida)}</NumeroLicenzaGuida>`
        );
      }

      lines.push(`${indent}  </DatiAnagraficiVettore>`);
    }

    if (trasporto.mezzoTrasporto) {
      lines.push(
        `${indent}  <MezzoTrasporto>${this.escapeXml(trasporto.mezzoTrasporto)}</MezzoTrasporto>`
      );
    }

    if (trasporto.causaleTrasporto) {
      lines.push(
        `${indent}  <CausaleTrasporto>${this.escapeXml(trasporto.causaleTrasporto)}</CausaleTrasporto>`
      );
    }

    if (trasporto.numeroColli !== undefined) {
      lines.push(`${indent}  <NumeroColli>${trasporto.numeroColli}</NumeroColli>`);
    }

    if (trasporto.descrizione) {
      lines.push(`${indent}  <Descrizione>${this.escapeXml(trasporto.descrizione)}</Descrizione>`);
    }

    if (trasporto.unitaMisuraPeso) {
      lines.push(
        `${indent}  <UnitaMisuraPeso>${this.escapeXml(trasporto.unitaMisuraPeso)}</UnitaMisuraPeso>`
      );
    }

    if (trasporto.pesoLordo !== undefined) {
      lines.push(`${indent}  <PesoLordo>${this.formatDecimal(trasporto.pesoLordo)}</PesoLordo>`);
    }

    if (trasporto.pesoNetto !== undefined) {
      lines.push(`${indent}  <PesoNetto>${this.formatDecimal(trasporto.pesoNetto)}</PesoNetto>`);
    }

    if (trasporto.dataOraRitiro) {
      lines.push(`${indent}  <DataOraRitiro>${trasporto.dataOraRitiro}</DataOraRitiro>`);
    }

    if (trasporto.dataInizioTrasporto) {
      lines.push(
        `${indent}  <DataInizioTrasporto>${trasporto.dataInizioTrasporto}</DataInizioTrasporto>`
      );
    }

    if (trasporto.tipoResa) {
      lines.push(`${indent}  <TipoResa>${this.escapeXml(trasporto.tipoResa)}</TipoResa>`);
    }

    if (trasporto.indirizzoResa) {
      lines.push(this.serializeIndirizzo('IndirizzoResa', trasporto.indirizzoResa, indent + '  '));
    }

    if (trasporto.dataOraConsegna) {
      lines.push(`${indent}  <DataOraConsegna>${trasporto.dataOraConsegna}</DataOraConsegna>`);
    }

    lines.push(`${indent}</DatiTrasporto>`);
    return lines.join('\n');
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private formatDecimal(num: number): string {
    return num.toFixed(2);
  }
}
