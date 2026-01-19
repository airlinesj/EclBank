import { Injectable } from '@angular/core';
import { ECLCalculationInput, ECLCalculationResult } from '../interfaces/ecl.interface';

/**
 * ECL Custom Calculation Service
 * Handles ECL calculations using the formula: PD * LGD * EAD * Effective Interest Rate
 */
@Injectable({
  providedIn: 'root'
})
export class ECLCustomCalculationService {

  /**
   * Calculate ECL using the formula: PD * LGD * EAD * Effective Interest Rate
   * @param input ECL calculation input with PD, LGD, EAD, and optional EIR
   * @param source Data source indicator
   * @returns ECL calculation result
   */
  calculateECL(input: ECLCalculationInput, source: 'dummy_data' | 'user_input' | 'combined' = 'user_input'): ECLCalculationResult {
    // Normalize PD and LGD if provided as percentages (0-100) to decimals (0-1)
    const pd = input.pd > 1 ? input.pd / 100 : input.pd;
    const lgd = input.lgd > 1 ? input.lgd / 100 : input.lgd;
    const ead = input.ead;
    const eir = input.effectiveInterestRate || 0.04; // Default 4% if not provided

    // Formula: PD * LGD * EAD * EIR
    const ecl = pd * lgd * ead * eir;

    return {
      ecl,
      pd: input.pd, // Return original format
      lgd: input.lgd, // Return original format
      ead,
      effectiveInterestRate: eir,
      formula: 'ECL = PD × LGD × EAD × Effective Interest Rate',
      calculationDate: new Date(),
      source
    };
  }

  /**
   * Calculate ECL with detailed breakdown
   * @param input ECL calculation input
   * @param source Data source indicator
   * @returns Detailed calculation result with breakdown
   */
  calculateECLWithBreakdown(input: ECLCalculationInput, source: 'dummy_data' | 'user_input' | 'combined' = 'user_input') {
    // Normalize values
    const pdDecimal = input.pd > 1 ? input.pd / 100 : input.pd;
    const lgdDecimal = input.lgd > 1 ? input.lgd / 100 : input.lgd;
    const ead = input.ead;
    const eir = input.effectiveInterestRate || 0.04;

    // Calculate intermediate values
    const pdLgd = pdDecimal * lgdDecimal;
    const interestComponent = ead * eir;
    const ecl = pdLgd * interestComponent;

    return {
      result: {
        ecl,
        pd: input.pd,
        lgd: input.lgd,
        ead,
        effectiveInterestRate: eir,
        formula: 'ECL = PD × LGD × EAD × Effective Interest Rate',
        calculationDate: new Date(),
        source
      },
      breakdown: {
        pdPercentage: input.pd > 1 ? input.pd : input.pd * 100,
        lgdPercentage: input.lgd > 1 ? input.lgd : input.lgd * 100,
        pdDecimal,
        lgdDecimal,
        pdLgdProduct: pdLgd,
        pdLgdPercentage: pdLgd * 100,
        interestComponent,
        lossAmount: ecl
      }
    };
  }

  /**
   * Validate ECL inputs
   * @param input ECL calculation input
   * @returns Validation result with error messages
   */
  validateInput(input: ECLCalculationInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check PD
    if (input.pd === null || input.pd === undefined) {
      errors.push('Probability of Default (PD) is required');
    } else if (input.pd < 0 || input.pd > 100) {
      errors.push('Probability of Default (PD) must be between 0 and 100');
    }

    // Check LGD
    if (input.lgd === null || input.lgd === undefined) {
      errors.push('Loss Given Default (LGD) is required');
    } else if (input.lgd < 0 || input.lgd > 100) {
      errors.push('Loss Given Default (LGD) must be between 0 and 100');
    }

    // Check EAD
    if (input.ead === null || input.ead === undefined) {
      errors.push('Exposure at Default (EAD) is required');
    } else if (input.ead < 0) {
      errors.push('Exposure at Default (EAD) must be a positive number');
    }

    // Check EIR if provided
    if (input.effectiveInterestRate !== undefined && input.effectiveInterestRate !== null) {
      if (input.effectiveInterestRate < 0 || input.effectiveInterestRate > 100) {
        errors.push('Effective Interest Rate must be between 0 and 100');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Compare two ECL calculations
   * @param result1 First calculation result
   * @param result2 Second calculation result
   * @returns Comparison with difference and percentage change
   */
  compareCalculations(result1: ECLCalculationResult, result2: ECLCalculationResult) {
    const difference = result2.ecl - result1.ecl;
    const percentageChange = ((difference / result1.ecl) * 100).toFixed(2);

    return {
      calculation1: result1,
      calculation2: result2,
      difference,
      percentageChange,
      increased: difference > 0,
      decreased: difference < 0,
      unchanged: difference === 0
    };
  }

  /**
   * Generate default values for ECL calculation based on loan type and risk level
   * @param loanType Type of loan (retail, corporate, mortgage)
   * @param riskLevel Risk level (low, medium, high)
   * @returns Default ECL calculation input
   */
  generateDefaultValues(loanType: 'retail' | 'corporate' | 'mortgage', riskLevel: 'low' | 'medium' | 'high'): ECLCalculationInput {
    const defaults = {
      retail: { low: { pd: 2, lgd: 45 }, medium: { pd: 5, lgd: 50 }, high: { pd: 15, lgd: 60 } },
      corporate: { low: { pd: 1.5, lgd: 40 }, medium: { pd: 4, lgd: 55 }, high: { pd: 12, lgd: 70 } },
      mortgage: { low: { pd: 1, lgd: 30 }, medium: { pd: 3, lgd: 40 }, high: { pd: 10, lgd: 50 } }
    };

    const pdLgd = defaults[loanType][riskLevel];
    const baseEad = { retail: 50000, corporate: 5000000, mortgage: 250000 };
    const baseEir = { retail: 0.065, corporate: 0.045, mortgage: 0.045 };

    return {
      pd: pdLgd.pd,
      lgd: pdLgd.lgd,
      ead: baseEad[loanType],
      effectiveInterestRate: baseEir[loanType]
    };
  }

  /**
   * Calculate ECL for a range of inputs to show sensitivity
   * @param baseInput Base input values
   * @param parameterToVary Parameter to vary (pd, lgd, ead)
   * @param range Range of values to test
   * @returns Array of results showing sensitivity
   */
  calculateSensitivityAnalysis(
    baseInput: ECLCalculationInput,
    parameterToVary: 'pd' | 'lgd' | 'ead',
    range: { min: number; max: number; step: number }
  ): Array<ECLCalculationResult & { parameterValue: number }> {
    const results = [];
    const steps = Math.floor((range.max - range.min) / range.step);

    for (let i = 0; i <= steps; i++) {
      const parameterValue = range.min + (i * range.step);
      const input = { ...baseInput };

      switch (parameterToVary) {
        case 'pd':
          input.pd = parameterValue;
          break;
        case 'lgd':
          input.lgd = parameterValue;
          break;
        case 'ead':
          input.ead = parameterValue;
          break;
      }

      const result = this.calculateECL(input);
      results.push({ ...result, parameterValue });
    }

    return results;
  }
}
