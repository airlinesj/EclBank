/**
 * ECL (Expected Credit Loss) Formula Interface
 * Defines the structure for ECL calculation formulas and configurations
 */

export interface ECLFormula {
  formulaId: string;
  name: string;
  description: string;
  formula: string; // Mathematical formula expression
  parameters: ECLParameter[];
  loanType: 'retail' | 'corporate' | 'mortgage' | 'all';
  status: 'active' | 'inactive';
  createdDate: Date;
  lastModifiedDate: Date;
}

export interface ECLParameter {
  parameterName: string;
  dataSource: 'banking_data' | 'macro_variable' | 'manual_input' | 'calculated';
  sourceId: string; // loanId, variableId, or parameter ID
  defaultValue?: number;
  description: string;
}

export interface ECLCalculation {
  calculationId: string;
  loanId: string;
  formulaId: string;
  stage: 1 | 2 | 3; // IFRS 9 stages
  probability12MonthDefault: number;
  probabilityLifetimeDefault: number;
  lossGivenDefault: number;
  exposureAtDefault: number;
  ecl12Month: number;
  eclLifetime: number;
  stage1Calculation?: ECLBreakdown;
  stage2Calculation?: ECLBreakdown;
  stage3Calculation?: ECLBreakdown;
  calculationDate: Date;
  macroVariableInputs: MacroVariableInput[];
}

export interface ECLBreakdown {
  pd: number; // Probability of Default
  lgd: number; // Loss Given Default
  ead: number; // Exposure at Default
  ecl: number;
  macroAdjustments: number;
}

export interface MacroVariableInput {
  variableId: string;
  variableName: string;
  value: number;
  weight: number; // Impact weight on ECL
}

export interface ECLSummary {
  totalECL: number;
  stage1ECL: number;
  stage2ECL: number;
  stage3ECL: number;
  loanCount: number;
  defaultedLoanCount: number;
  calculatedDate: Date;
  summaryByLoanType: LoanTypeECLSummary[];
}

export interface LoanTypeECLSummary {
  loanType: 'retail' | 'corporate' | 'mortgage';
  totalECL: number;
  loanCount: number;
  avgECL: number;
}

/**
 * ECL Calculation Input Interface
 * Used for custom ECL calculations with user inputs
 */
export interface ECLCalculationInput {
  pd: number; // Probability of Default (0-1 or 0-100%)
  lgd: number; // Loss Given Default (0-1 or 0-100%)
  ead: number; // Exposure at Default (in currency units)
  effectiveInterestRate?: number; // Effective interest rate (optional)
}

/**
 * ECL Calculation Result Interface
 * Contains the output of ECL calculation
 */
export interface ECLCalculationResult {
  ecl: number;
  pd: number;
  lgd: number;
  ead: number;
  effectiveInterestRate: number;
  formula: string;
  calculationDate: Date;
  source: 'dummy_data' | 'user_input' | 'combined';
}
