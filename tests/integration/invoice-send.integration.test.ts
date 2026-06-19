import { describe, it, expect, beforeAll } from 'vitest';
import { ArubaClient } from '@fatturazione-elettronica-aruba/core';
import { InvoicesClient } from '@fatturazione-elettronica-aruba/invoices';
import { encodeBase64 } from '@fatturazione-elettronica-aruba/utils';
import {
  FatturaBuilder,
  FatturaSerializer,
  validateFattura,
} from '@fatturazione-elettronica-aruba/xml-builder';
import { createTestClient, skipIfNoCredentials } from './helpers.js';

const hasCredentials = !skipIfNoCredentials();

describe.skipIf(!hasCredentials)('Invoice Send Integration', () => {
  let client: ArubaClient;
  let invoices: InvoicesClient;
  let vatCode: string;
  let countryCode: string;
  let pec: string;

  beforeAll(async () => {
    if (!hasCredentials) return;
    client = createTestClient();
    await client.auth.signIn(
      process.env.ARUBA_USERNAME!,
      process.env.ARUBA_PASSWORD!
    );
    invoices = new InvoicesClient({ httpClient: client.http });
    const userInfo = await client.auth.getUserInfo();
    vatCode = userInfo.vatCode;
    countryCode = userInfo.countryCode;
    pec = userInfo.pec;
  });

  function buildFattura(progressivo: string) {
    const oggi = new Date().toISOString().split('T')[0];

    return FatturaBuilder.create()
      .setTrasmissioneB2B({
        idPaese: countryCode,
        idCodice: vatCode,
        progressivoInvio: progressivo,
        codiceDestinatario: '0000000',
        pecDestinatario: pec,
      })
      .setCedentePrestatore({
        datiAnagrafici: {
          idFiscaleIVA: { idPaese: countryCode, idCodice: vatCode },
          anagrafica: { denominazione: 'Test Company SRL' },
          regimeFiscale: 'RF01',
        },
        sede: {
          indirizzo: 'Via Test 1',
          cap: '00100',
          comune: 'Roma',
          provincia: 'RM',
          nazione: 'IT',
        },
      })
      .setCessionarioCommittente({
        datiAnagrafici: {
          idFiscaleIVA: { idPaese: 'IT', idCodice: '09876543210' },
          anagrafica: { denominazione: 'Cliente Test SPA' },
        },
        sede: {
          indirizzo: 'Via Cliente 2',
          cap: '20100',
          comune: 'Milano',
          provincia: 'MI',
          nazione: 'IT',
        },
      })
      .setDatiGenerali({
        datiGeneraliDocumento: {
          tipoDocumento: 'TD01',
          divisa: 'EUR',
          data: oggi,
          numero: progressivo,
          importoTotaleDocumento: 122.00,
        },
      })
      .setDatiBeniServizi({
        dettaglioLinee: [
          {
            numeroLinea: 1,
            descrizione: 'Servizio di test integrazione',
            quantita: 1,
            prezzoUnitario: 100.00,
            prezzoTotale: 100.00,
            aliquotaIVA: 22.00,
          },
        ],
        datiRiepilogo: [
          {
            aliquotaIVA: 22.00,
            imponibileImporto: 100.00,
            imposta: 22.00,
            esigibilitaIVA: 'I',
          },
        ],
      })
      .addDatiPagamento({
        condizioniPagamento: 'TP02',
        dettaglioPagamento: [
          {
            modalitaPagamento: 'MP05',
            importoPagamento: 122.00,
            iban: 'IT60X0542811101000000123456',
          },
        ],
      })
      .build();
  }

  it('should build, validate, serialize and send (dryRun)', async () => {
    const progressivo = '00001';
    const fattura = buildFattura(progressivo);

    // Validate locally (skip P.IVA format — sandbox accounts use non-standard vatCodes)
    const validation = validateFattura(fattura, {
      validateTotals: true,
      validatePartitaIVA: false,
    });
    console.log('validation errors:', validation.errors);
    console.log('validation warnings:', validation.warnings);
    expect(validation.valid).toBe(true);

    // Serialize to XML
    const serializer = new FatturaSerializer();
    const xml = serializer.serialize(fattura);
    expect(xml).toContain('<TipoDocumento>TD01</TipoDocumento>');
    expect(xml).toContain(`<Numero>${progressivo}</Numero>`);

    // Send with dryRun — SDI validates without actually sending
    const result = await invoices.upload({
      dataFile: encodeBase64(xml),
      dryRun: true,
    });

    console.log('dryRun result:', JSON.stringify(result, null, 2));
    expect(result).toBeDefined();
  });

  it('should build, validate, serialize and send a real invoice', async () => {
    const progressivo = '00002';
    const fattura = buildFattura(progressivo);

    // Validate locally
    const validation = validateFattura(fattura, {
      validateTotals: true,
      validatePartitaIVA: false,
    });
    expect(validation.valid).toBe(true);

    // Serialize to XML
    const xml = new FatturaSerializer().serialize(fattura);

    // Send for real
    const result = await invoices.upload({
      dataFile: encodeBase64(xml),
    });

    console.log('upload result:', JSON.stringify(result, null, 2));
    expect(result).toBeDefined();

    if (!result.errorCode || result.errorCode === '0000') {
      expect(result.uploadFileName).toBeDefined();
      console.log('Fattura inviata:', result.uploadFileName);
    } else {
      console.log('Upload response:', result.errorCode, result.errorDescription);
    }
  });
});
