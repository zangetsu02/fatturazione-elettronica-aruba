// Calcolo importi e riepiloghi IVA
export {
  toNumber,
  round2,
  calcolaPrezzoTotale,
  calcolaRiepilogo,
  type CalcolaRiepilogoOptions,
  type RiepilogoResult,
} from './importi';

// Helper anagrafici (costruzione da campi piatti)
export {
  contatti,
  sede,
  cedentePrestatore,
  cessionario,
  type ContattiInput,
  type SedeInput,
  type CedentePrestatoreInput,
  type CessionarioInput,
} from './anagrafica';

// Nome file SDI
export { nomeFileSdi } from './filename';
