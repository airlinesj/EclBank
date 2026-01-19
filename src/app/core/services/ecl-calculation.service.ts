import { Injectable } from '@angular/core';
import { ECLCalculation, ECLSummary, ECLBreakdown, MacroVariableInput, LoanTypeECLSummary } from '../interfaces/ecl.interface';
import { DataRepositoryService } from './data-repository.service';
import { MacroDataRepositoryService } from './macro-data-repository.service';
import { ECLFormulaService } from './ecl-formula.service';
import { LoanBalance, BorrowerInfo } from '../interfaces/banking.interface';

/**
 * ECL Calculation Engine Service
 * Performs Expected Credit Loss calculations using formulas,
 * banking data, and macroeconomic variables
 */
@Injectable({
  providedIn: 'root'
})
export class ECLCalculationService {
  private calculationHistory: Map<string, ECLCalculation> = new Map();

  constructor(
    private dataRepository: DataRepositoryService,
    private macroRepository: MacroDataRepositoryService,
    private formulaService: ECLFormulaService
  ) {
    this.loadCalculationHistory();
  }

  /**
   * Calculate ECL for a single loan
   */
  calculateLoanECL(loanId: string, formulaId: string): ECLCalculation | null {
    const loan = this.dataRepository.getLoanBalance(loanId);
    const formula = this.formulaService.getFormula(formulaId);
    const borrower = loan ? this.dataRepository.getBorrowerInfo(loan.borrowerId) : null;

    if (!loan || !formula || !borrower) {
      console.error('Missing loan, formula, or borrower data');
      return null;
    }

    // Determine IFRS 9 stage
    const stage = this.determineStage(loan, borrower);

    // Calculate PD (Probability of Default)
    const pd = this.calculateProbabilityOfDefault(loan, borrower);

    // Calculate LGD (Loss Given Default)
    const lgd = this.calculateLossGivenDefault(loan);

    // Calculate EAD (Exposure at Default)
    const ead = loan.outstandingBalance;

    // Get macro variable inputs for adjustment
    const macroInputs = this.getMacroVariableInputsForLoan(loan);

    // Prepare formula parameters
    const parameters: Record<string, number> = {
      PD: pd,
      LGD: lgd,
      EAD: ead,
      MACRO_ADJUSTMENT: this.calculateMacroAdjustment(macroInputs),
      HOUSE_PRICE_INDEX: this.getMacroVariableValue('HOUSE_PRICE_INDEX', 100)
    };

    // Evaluate formula
    let totalECL = 0;
    try {
      totalECL = this.formulaService.evaluateFormula(formula.formula, parameters);
    } catch (error) {
      console.error('Formula evaluation failed:', error);
      totalECL = 0;
    }

    // Calculate stage-specific ECL
    const stageCalculation = this.calculateStageECL(stage, pd, lgd, ead, macroInputs);

    const calculation: ECLCalculation = {
      calculationId: `ECL_${loanId}_${Date.now()}`,
      loanId,
      formulaId,
      stage,
      probability12MonthDefault: stage === 1 ? pd : 0,
      probabilityLifetimeDefault: pd,
      lossGivenDefault: lgd,
      exposureAtDefault: ead,
      ecl12Month: stage === 1 ? totalECL : 0,
      eclLifetime: totalECL,
      calculationDate: new Date(),
      macroVariableInputs: macroInputs
    };

    // Assign stage-specific calculations
    if (stage === 1) {
      calculation.stage1Calculation = stageCalculation;
    } else if (stage === 2) {
      calculation.stage2Calculation = stageCalculation;
    } else {
      calculation.stage3Calculation = stageCalculation;
    }

    // Store calculation
    this.calculationHistory.set(calculation.calculationId, calculation);
    this.saveCalculationHistory();

    return calculation;
  }

  /**
   * Calculate ECL for all loans in portfolio
   */
  calculatePortfolioECL(formulaId: string): ECLSummary {
    const loans = this.dataRepository.getAllLoanBalances();
    const calculations: ECLCalculation[] = [];
    let totalECL = 0;
    let stage1ECL = 0;
    let stage2ECL = 0;
    let stage3ECL = 0;
    let defaultedLoanCount = 0;

    loans.forEach(loan => {
      const calculation = this.calculateLoanECL(loan.loanId, formulaId);
      if (calculation) {
        calculations.push(calculation);
        const ecl = calculation.eclLifetime;
        totalECL += ecl;

        if (calculation.stage === 1) {
          stage1ECL += ecl;
        } else if (calculation.stage === 2) {
          stage2ECL += ecl;
        } else {
          stage3ECL += ecl;
        }

        if (loan.status === 'defaulted') {
          defaultedLoanCount++;
        }
      }
    });

    // Group by loan type
    const summaryByLoanType = this.calculateSummaryByLoanType(loans, calculations);

    const summary: ECLSummary = {
      totalECL,
      stage1ECL,
      stage2ECL,
      stage3ECL,
      loanCount: loans.length,
      defaultedLoanCount,
      calculatedDate: new Date(),
      summaryByLoanType
    };

    return summary;
  }

  /**
   * Determine IFRS 9 stage based on loan and borrower characteristics
   */
  private determineStage(loan: LoanBalance, borrower: BorrowerInfo): 1 | 2 | 3 {
    // Stage 3: Defaulted loans
    if (loan.status === 'defaulted') {
      return 3;
    }

    // Stage 2: Loans showing significant increase in credit risk
    // Criteria: Credit score < 650, default history > 0, or delinquency
    if (borrower.creditScore && borrower.creditScore < 650) {
      return 2;
    }

    if (borrower.defaultHistory > 0) {
      return 2;
    }

    // Check for recent missed payments (simplified)
    const transactions = this.dataRepository.getTransactionsForLoan(loan.loanId);
    const missedPayments = transactions.filter(t => t.type === 'payment' && t.status === 'failed').length;
    if (missedPayments > 0) {
      return 2;
    }

    // Stage 1: Performing loans with no significant increase in credit risk
    return 1;
  }

  /**
   * Calculate Probability of Default
   */
  private calculateProbabilityOfDefault(loan: LoanBalance, borrower: BorrowerInfo): number {
    let pd = 0.01; // Base PD of 1%

    // Adjust based on credit score
    if (borrower.creditScore) {
      if (borrower.creditScore < 500) {
        pd = 0.15;
      } else if (borrower.creditScore < 600) {
        pd = 0.10;
      } else if (borrower.creditScore < 700) {
        pd = 0.05;
      } else if (borrower.creditScore < 750) {
        pd = 0.02;
      } else {
        pd = 0.005;
      }
    }

    // Adjust based on default history
    pd += borrower.defaultHistory * 0.05;

    // Adjust based on interest rate (riskier loans have higher rates)
    if (loan.interestRate > 7) {
      pd += 0.03;
    } else if (loan.interestRate > 5) {
      pd += 0.01;
    }

    // Cap PD at 1.0 (100%)
    return Math.min(pd, 1.0);
  }

  /**
   * Calculate Loss Given Default
   */
  private calculateLossGivenDefault(loan: LoanBalance): number {
    // Base LGD varies by loan type
    let baseLGD = 0.45; // 45% for unsecured

    if (loan.loanType === 'mortgage') {
      baseLGD = 0.25; // 25% for mortgages (secured by property)
    } else if (loan.loanType === 'corporate') {
      baseLGD = 0.35; // 35% for corporate (typically some collateral)
    }

    // Adjust based on loan-to-value ratio (simplified: use outstanding/principal)
    const ltv = loan.outstandingBalance / loan.principal;
    const ltvAdjustment = Math.max(0, ltv - 0.7) * 0.2; // 0.2 adjustment per 10% LTV above 70%

    const lgd = Math.min(baseLGD + ltvAdjustment, 0.95);
    return Number(lgd.toFixed(4));
  }

  /**
   * Get macro variable inputs relevant to the loan
   */
  private getMacroVariableInputsForLoan(loan: LoanBalance): MacroVariableInput[] {
    const inputs: MacroVariableInput[] = [];

    // All loans use GDP growth
    const gdpGrowth = this.macroRepository.getMacroVariable('GDP_GROWTH');
    if (gdpGrowth) {
      inputs.push({
        variableId: 'GDP_GROWTH',
        variableName: 'GDP Growth Rate',
        value: gdpGrowth.value,
        weight: 0.3
      });
    }

    // Add inflation for all loans
    const inflation = this.macroRepository.getMacroVariable('INFLATION_RATE');
    if (inflation) {
      inputs.push({
        variableId: 'INFLATION_RATE',
        variableName: 'Inflation Rate',
        value: inflation.value,
        weight: 0.15
      });
    }

    // Add unemployment
    const unemployment = this.macroRepository.getMacroVariable('UNEMPLOYMENT_RATE');
    if (unemployment) {
      inputs.push({
        variableId: 'UNEMPLOYMENT_RATE',
        variableName: 'Unemployment Rate',
        value: unemployment.value,
        weight: 0.25
      });
    }

    // Mortgages use house price index
    if (loan.loanType === 'mortgage') {
      const hpi = this.macroRepository.getMacroVariable('HOUSE_PRICE_INDEX');
      if (hpi) {
        inputs.push({
          variableId: 'HOUSE_PRICE_INDEX',
          variableName: 'House Price Index',
          value: hpi.value,
          weight: 0.3
        });
      }
    }

    // Corporate loans use credit growth
    if (loan.loanType === 'corporate') {
      const creditGrowth = this.macroRepository.getMacroVariable('CREDIT_GROWTH');
      if (creditGrowth) {
        inputs.push({
          variableId: 'CREDIT_GROWTH',
          variableName: 'Credit Growth Rate',
          value: creditGrowth.value,
          weight: 0.2
        });
      }
    }

    return inputs;
  }

  /**
   * Calculate macro adjustment factor
   */
  private calculateMacroAdjustment(macroInputs: MacroVariableInput[]): number {
    let adjustment = 0;

    macroInputs.forEach(input => {
      // Normalize values and apply weights
      let normalizedValue = input.value / 100; // Assume percentages

      if (input.variableId === 'GDP_GROWTH') {
        // Negative GDP growth increases default probability
        adjustment += (2 - normalizedValue) * input.weight;
      } else if (input.variableId === 'UNEMPLOYMENT_RATE') {
        // Higher unemployment increases default probability
        adjustment += (normalizedValue - 5) * input.weight;
      } else if (input.variableId === 'INFLATION_RATE') {
        // Extreme inflation (too high or too low) affects default
        adjustment += Math.abs(normalizedValue - 2) * input.weight * 0.1;
      }
    });

    return Number(adjustment.toFixed(4));
  }

  /**
   * Calculate stage-specific ECL
   */
  private calculateStageECL(
    stage: 1 | 2 | 3,
    pd: number,
    lgd: number,
    ead: number,
    macroInputs: MacroVariableInput[]
  ): ECLBreakdown {
    let macroAdjustment = this.calculateMacroAdjustment(macroInputs);

    // Stage 3 (defaulted) uses maximum parameters
    if (stage === 3) {
      pd = 1.0;
      macroAdjustment = 0.5;
    }

    const ecl = pd * lgd * ead + (macroAdjustment * lgd * ead);

    return {
      pd: Number(pd.toFixed(4)),
      lgd: Number(lgd.toFixed(4)),
      ead: Number(ead.toFixed(2)),
      ecl: Number(ecl.toFixed(2)),
      macroAdjustments: Number(macroAdjustment.toFixed(4))
    };
  }

  /**
   * Calculate summary by loan type
   */
  private calculateSummaryByLoanType(
    loans: LoanBalance[],
    calculations: ECLCalculation[]
  ): LoanTypeECLSummary[] {
    const types: ('retail' | 'corporate' | 'mortgage')[] = ['retail', 'corporate', 'mortgage'];
    const summaries: LoanTypeECLSummary[] = [];

    types.forEach(type => {
      const typeLoans = loans.filter(l => l.loanType === type);
      const typeCalcs = calculations.filter(c => {
        const loan = loans.find(l => l.loanId === c.loanId);
        return loan?.loanType === type;
      });

      const totalECL = typeCalcs.reduce((sum, c) => sum + c.eclLifetime, 0);
      const avgECL = typeCalcs.length > 0 ? totalECL / typeCalcs.length : 0;

      summaries.push({
        loanType: type,
        totalECL: Number(totalECL.toFixed(2)),
        loanCount: typeLoans.length,
        avgECL: Number(avgECL.toFixed(2))
      });
    });

    return summaries;
  }

  /**
   * Get macro variable value
   */
  private getMacroVariableValue(variableId: string, defaultValue: number): number {
    const variable = this.macroRepository.getMacroVariable(variableId);
    return variable ? variable.value : defaultValue;
  }

  /**
   * Get calculation history
   */
  getCalculationHistory(loanId?: string): ECLCalculation[] {
    const calculations = Array.from(this.calculationHistory.values());
    if (loanId) {
      return calculations.filter(c => c.loanId === loanId);
    }
    return calculations;
  }

  /**
   * Save calculation history to storage
   */
  private saveCalculationHistory(): void {
    try {
      const calculations = Array.from(this.calculationHistory.values());
      localStorage.setItem('ecl_calculations', JSON.stringify(calculations));
    } catch (error) {
      console.error('Failed to save calculation history:', error);
    }
  }

  /**
   * Load calculation history from storage
   */
  private loadCalculationHistory(): void {
    const stored = localStorage.getItem('ecl_calculations');
    if (stored) {
      try {
        const calculations = JSON.parse(stored) as ECLCalculation[];
        calculations.forEach(c => this.calculationHistory.set(c.calculationId, c));
      } catch (error) {
        console.error('Failed to load calculation history:', error);
      }
    }
  }
}
