/**
 * Costruisce il nome file conforme al formato SDI:
 * `<IdPaese><IdCodice>_<Progressivo>.xml` (es. `IT01234567890_00001.xml`).
 *
 * Il progressivo è un identificativo alfanumerico univoco (max 5 caratteri):
 * se più corto viene completato con zeri a sinistra.
 */
export function nomeFileSdi(
  idPaese: string,
  idCodice: string,
  progressivo: string | number
): string {
  const prog = String(progressivo).padStart(5, '0');
  return `${idPaese}${idCodice}_${prog}.xml`;
}
