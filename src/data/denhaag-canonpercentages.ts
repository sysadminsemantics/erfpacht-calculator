/**
 * Canon percentages Den Haag
 * Bron: Gemeente Den Haag / RIS
 * Laatste update: januari 2026
 */

// AB1986 canonpercentages per jaar
// Bron: Collegebesluit Vaststelling canonpercentage (RIS324183)
export const AB1986_CANON_RATES: Record<number, number> = {
  2024: 0.032, // 3.2%
  2025: 0.033, // 3.3%
  2026: 0.033, // 3.3%
};

// AB2024 canonpercentages per jaar (tienjaarsgemiddelde)
// Bron: Algemene Bepalingen 2024
export const AB2024_CANON_RATES: Record<number, number> = {
  2023: 0.019, // 1.9%
  2024: 0.020, // 2.0%
  2025: 0.021, // 2.1%
  2026: 0.022, // 2.2%
};

// Bloot eigendom: koopprijs op basis van WOZ-waarde (vaste staffel)
// Dit is de VOLLEDIGE koopprijs (niet een fractie van grondwaarde)
// Bron: https://www.denhaag.nl/nl/erfpacht/van-erfpacht-naar-eigen-grond/
export const BLOOT_EIGENDOM_KOOPPRIJS_STAFFEL: { min: number; max: number; bedrag: number }[] = [
  { min: 0, max: 200000, bedrag: 700 },
  { min: 200000, max: 300000, bedrag: 1205 },
  { min: 300000, max: 400000, bedrag: 1650 },
  { min: 400000, max: 500000, bedrag: 2350 },
  { min: 500000, max: 700000, bedrag: 2790 },
  { min: 700000, max: 1000000, bedrag: 4315 },
  { min: 1000000, max: Infinity, bedrag: 6980 },
];

// Taxatie bij heruitgifte: grondwaarde bebouwd is maximaal 55% van onbebouwd
export const HERUITGIFTE_GRONDWAARDE_CAP = 0.55;

// Default waarden
export const DEFAULTS = {
  discountRate: 0.035, // 3.5% discontovoet
  projectionYears: 30,
  managementFee: 34, // Beheerkosten per jaar (officieel tarief 2026)
  managementFeeAfkoop: 289, // Afkoopsom beheerkosten
  marginalTaxRate: 0.37, // 37% marginale belastingdruk
  loanInterestRate: 0.045, // 4.5% hypotheekrente
  loanTermYears: 30,
};

// Helper functie om canonpercentage op te halen
export function getCanonRate(contractType: 'AB1986' | 'AB2024', year: number): number | null {
  const rates = contractType === 'AB1986' ? AB1986_CANON_RATES : AB2024_CANON_RATES;
  return rates[year] ?? null;
}

// Helper functie voor bloot eigendom koopprijs (op basis van WOZ-staffel)
// Dit is de volledige koopprijs, NIET een fractie van grondwaarde
export function getBlootEigendomKoopprijs(wozWaarde: number): number {
  const staffel = BLOOT_EIGENDOM_KOOPPRIJS_STAFFEL.find(
    (s) => wozWaarde >= s.min && wozWaarde < s.max
  );
  return staffel?.bedrag ?? BLOOT_EIGENDOM_KOOPPRIJS_STAFFEL[BLOOT_EIGENDOM_KOOPPRIJS_STAFFEL.length - 1].bedrag;
}

// Beschikbare jaren
export function getAvailableYears(contractType: 'AB1986' | 'AB2024'): number[] {
  const rates = contractType === 'AB1986' ? AB1986_CANON_RATES : AB2024_CANON_RATES;
  return Object.keys(rates).map(Number).sort((a, b) => b - a);
}
