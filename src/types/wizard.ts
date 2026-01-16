/**
 * Types voor de erfpacht calculator
 */

export type ContractType = 'AB1986' | 'AB2024' | 'unknown';
export type LooptijdType = 'eeuwigdurend' | 'aflopend' | 'unknown';

export interface WizardData {
  // Stap A: Contract
  contractType: ContractType;
  herzieningsjaar?: number;
  looptijd: LooptijdType;
  einddatum?: number;
  
  // Stap B: Waarden
  grondwaarde: number;
  wozWaarde?: number;
  uitgiftejaar?: number;
  
  // Stap C: Betaling nu
  huidigeCanon?: number;
  beheerkosten: number;
  
  // Stap D: Belasting & financiering
  isEigenWoning: boolean;
  marginaleTariefgroep: number;
  financierenMetLening: boolean;
  leningRente?: number;
  leningLooptijd?: number;
  
  // Extra opties
  selectedYear: number;
  customCanonRate?: number;
  
  // Afkoop scenario
  afkoopBedrag?: number;
  useEstimatedAfkoop: boolean;
  afkoopBeheerkosten: boolean;
  
  // Bloot eigendom scenario
  blootEigendomMogelijk: 'ja' | 'nee' | 'unknown';
  extraBouwMogelijkheden?: number;
}

export const DEFAULT_WIZARD_DATA: WizardData = {
  contractType: 'AB1986',
  looptijd: 'eeuwigdurend',
  grondwaarde: 100000,
  beheerkosten: 34, // Officieel tarief gemeente Den Haag 2026
  isEigenWoning: true,
  marginaleTariefgroep: 0.37,
  financierenMetLening: false,
  leningRente: 0.045,
  leningLooptijd: 30,
  selectedYear: new Date().getFullYear(),
  useEstimatedAfkoop: true,
  afkoopBeheerkosten: false,
  blootEigendomMogelijk: 'unknown',
};
