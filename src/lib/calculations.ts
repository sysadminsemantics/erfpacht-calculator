/**
 * Berekeningsfuncties voor erfpacht scenarios
 */

import { DEFAULTS } from '@/data/denhaag-canonpercentages';

export interface CanonInput {
  groundValue: number;
  canonRate: number;
  managementFee?: number;
}

export interface TaxInput {
  deductibleAmount: number;
  marginalRate: number;
}

export interface NPVInput {
  cashflows: number[];
  discountRate: number;
}

export interface ScenarioInput {
  years: number;
  groundValue: number;
  canonRate: number;
  managementFee?: number;
  isOwnHome?: boolean;
  marginalTaxRate?: number;
  includeManagementFee?: boolean;
}

export interface LoanInput {
  principal: number;
  interestRate: number;
  termYears: number;
}

export interface Scenario {
  id: string;
  label: string;
  description: string;
  cashflowsBruto: number[];
  cashflowsNetto: number[];
  npvBruto: number;
  npvNetto: number;
  totalBruto: number;
  totalNetto: number;
  yearlyBruto: number;
  yearlyNetto: number;
  breakEvenYear?: number;
}

/**
 * Bereken jaarlijkse canon (bruto)
 */
export function calcAnnualCanon({ groundValue, canonRate, managementFee = 0 }: CanonInput): number {
  return groundValue * canonRate + managementFee;
}

/**
 * Bereken belastingvoordeel
 */
export function calcTaxBenefit({ deductibleAmount, marginalRate }: TaxInput): number {
  return deductibleAmount * marginalRate;
}

/**
 * Bereken netto kosten na belastingaftrek
 */
export function calcNetCost(brutoAmount: number, marginalRate: number, isDeductible: boolean): number {
  if (!isDeductible) return brutoAmount;
  return brutoAmount * (1 - marginalRate);
}

/**
 * Bereken Net Present Value (NPV)
 */
export function calcNPV({ cashflows, discountRate }: NPVInput): number {
  return cashflows.reduce((npv, cashflow, year) => {
    return npv + cashflow / Math.pow(1 + discountRate, year);
  }, 0);
}

/**
 * Bereken annuïteit voor lening
 */
export function calcAnnuity({ principal, interestRate, termYears }: LoanInput): number {
  if (interestRate === 0) return principal / termYears;
  const r = interestRate;
  const n = termYears;
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

/**
 * Bereken rente component per jaar voor lening (aflopend)
 */
export function calcYearlyInterest({ principal, interestRate, termYears }: LoanInput, year: number): number {
  if (year >= termYears) return 0;
  const annuity = calcAnnuity({ principal, interestRate, termYears });
  let remainingPrincipal = principal;
  
  for (let i = 0; i < year; i++) {
    const interest = remainingPrincipal * interestRate;
    const amortization = annuity - interest;
    remainingPrincipal -= amortization;
  }
  
  return remainingPrincipal * interestRate;
}

/**
 * Bouw cashflows voor canon scenario (AB1986 of AB2024)
 */
export function buildCanonCashflows(input: ScenarioInput): { bruto: number[]; netto: number[] } {
  const {
    years,
    groundValue,
    canonRate,
    managementFee = DEFAULTS.managementFee,
    isOwnHome = true,
    marginalTaxRate = DEFAULTS.marginalTaxRate,
  } = input;

  const yearlyCanon = calcAnnualCanon({ groundValue, canonRate, managementFee });
  const bruto: number[] = [];
  const netto: number[] = [];

  for (let i = 0; i < years; i++) {
    bruto.push(yearlyCanon);
    // Canon is aftrekbaar bij eigen woning
    const nettoCanon = isOwnHome 
      ? calcNetCost(yearlyCanon, marginalTaxRate, true)
      : yearlyCanon;
    netto.push(nettoCanon);
  }

  return { bruto, netto };
}

/**
 * Bouw cashflows voor afkoop scenario
 */
export function buildAfkoopCashflows(input: {
  years: number;
  afkoopBedrag: number;
  managementFee?: number;
  includeManagementFee?: boolean;
  financierenMetLening?: boolean;
  loanInterestRate?: number;
  loanTermYears?: number;
  isOwnHome?: boolean;
  marginalTaxRate?: number;
}): { bruto: number[]; netto: number[] } {
  const {
    years,
    afkoopBedrag,
    managementFee = 0,
    includeManagementFee = false,
    financierenMetLening = false,
    loanInterestRate = DEFAULTS.loanInterestRate,
    loanTermYears = DEFAULTS.loanTermYears,
    isOwnHome = true,
    marginalTaxRate = DEFAULTS.marginalTaxRate,
  } = input;

  const bruto: number[] = [];
  const netto: number[] = [];

  for (let i = 0; i < years; i++) {
    let yearBruto = 0;
    let yearNetto = 0;

    if (i === 0) {
      if (!financierenMetLening) {
        // Afkoopbedrag in jaar 0 (niet aftrekbaar)
        yearBruto += afkoopBedrag;
        yearNetto += afkoopBedrag;
      }
    }

    if (financierenMetLening && i < loanTermYears) {
      const annuity = calcAnnuity({ 
        principal: afkoopBedrag, 
        interestRate: loanInterestRate, 
        termYears: loanTermYears 
      });
      const interest = calcYearlyInterest(
        { principal: afkoopBedrag, interestRate: loanInterestRate, termYears: loanTermYears },
        i
      );
      yearBruto += annuity;
      // Rente is aftrekbaar, aflossing niet
      const nettoRente = isOwnHome ? calcNetCost(interest, marginalTaxRate, true) : interest;
      const aflossing = annuity - interest;
      yearNetto += nettoRente + aflossing;
    }

    // Beheerkosten blijven mogelijk bestaan
    if (includeManagementFee) {
      yearBruto += managementFee;
      yearNetto += managementFee; // Beheerkosten meestal niet aftrekbaar
    }

    bruto.push(yearBruto);
    netto.push(yearNetto);
  }

  return { bruto, netto };
}

/**
 * Bouw cashflows voor bloot eigendom scenario
 */
export function buildEigenGrondCashflows(input: {
  years: number;
  koopBedrag: number;
  extraBedrag?: number;
  financierenMetLening?: boolean;
  loanInterestRate?: number;
  loanTermYears?: number;
  isOwnHome?: boolean;
  marginalTaxRate?: number;
}): { bruto: number[]; netto: number[] } {
  const {
    years,
    koopBedrag,
    extraBedrag = 0,
    financierenMetLening = false,
    loanInterestRate = DEFAULTS.loanInterestRate,
    loanTermYears = DEFAULTS.loanTermYears,
    isOwnHome = true,
    marginalTaxRate = DEFAULTS.marginalTaxRate,
  } = input;

  const totalKoopBedrag = koopBedrag + extraBedrag;
  const bruto: number[] = [];
  const netto: number[] = [];

  for (let i = 0; i < years; i++) {
    let yearBruto = 0;
    let yearNetto = 0;

    if (i === 0 && !financierenMetLening) {
      yearBruto += totalKoopBedrag;
      yearNetto += totalKoopBedrag;
    }

    if (financierenMetLening && i < loanTermYears) {
      const annuity = calcAnnuity({
        principal: totalKoopBedrag,
        interestRate: loanInterestRate,
        termYears: loanTermYears,
      });
      const interest = calcYearlyInterest(
        { principal: totalKoopBedrag, interestRate: loanInterestRate, termYears: loanTermYears },
        i
      );
      yearBruto += annuity;
      const nettoRente = isOwnHome ? calcNetCost(interest, marginalTaxRate, true) : interest;
      const aflossing = annuity - interest;
      yearNetto += nettoRente + aflossing;
    }

    bruto.push(yearBruto);
    netto.push(yearNetto);
  }

  return { bruto, netto };
}

/**
 * Afkoopbedrag voor eeuwigdurende erfpacht = grondwaarde
 * Bron: Gemeente Den Haag - bij eeuwigdurende afkoop betaal je de volledige grondwaarde
 */
export function getAfkoopBedrag(groundValue: number): number {
  return groundValue;
}

/**
 * Bereken break-even jaar tussen twee scenarios
 */
export function calcBreakEvenYear(
  cumulativeCosts1: number[],
  cumulativeCosts2: number[]
): number | null {
  for (let i = 0; i < Math.min(cumulativeCosts1.length, cumulativeCosts2.length); i++) {
    if (cumulativeCosts2[i] <= cumulativeCosts1[i]) {
      return i;
    }
  }
  return null;
}

/**
 * Bereken cumulatieve kosten
 */
export function calcCumulativeCosts(cashflows: number[]): number[] {
  const cumulative: number[] = [];
  let total = 0;
  for (const cf of cashflows) {
    total += cf;
    cumulative.push(total);
  }
  return cumulative;
}

/**
 * Bouw volledig scenario object
 */
export function buildScenario(
  id: string,
  label: string,
  description: string,
  cashflows: { bruto: number[]; netto: number[] },
  discountRate: number = DEFAULTS.discountRate
): Scenario {
  const npvBruto = calcNPV({ cashflows: cashflows.bruto, discountRate });
  const npvNetto = calcNPV({ cashflows: cashflows.netto, discountRate });
  const totalBruto = cashflows.bruto.reduce((a, b) => a + b, 0);
  const totalNetto = cashflows.netto.reduce((a, b) => a + b, 0);
  const years = cashflows.bruto.length;
  // Gebruik gemiddelde per jaar voor eerlijke vergelijking
  const yearlyBruto = totalBruto / years;
  const yearlyNetto = totalNetto / years;

  return {
    id,
    label,
    description,
    cashflowsBruto: cashflows.bruto,
    cashflowsNetto: cashflows.netto,
    npvBruto,
    npvNetto,
    totalBruto,
    totalNetto,
    yearlyBruto,
    yearlyNetto,
  };
}
