import { Injectable } from '@angular/core';
import { ECLFormula, ECLParameter, ECLCalculation, ECLBreakdown, MacroVariableInput } from '../interfaces/ecl.interface';

/**
 * ECL Formula Configuration Service
 * Manages and configures formulas for Expected Credit Loss calculations
 */
@Injectable({
  providedIn: 'root'
})
export class ECLFormulaService {
  private formulas: Map<string, ECLFormula> = new Map();
  private defaultFormulas: ECLFormula[] = [];

  constructor() {
    this.initializeDefaultFormulas();
    this.loadFormulasFromStorage();
  }

  /**
   * Initialize with standard IFRS 9 ECL formulas
   */
  private initializeDefaultFormulas(): void {
    // Standard ECL Formula for all loan types
    const standardECLFormula: ECLFormula = {
      formulaId: 'ECL_STANDARD_001',
      name: 'Standard ECL Formula',
      description: 'Standard ECL calculation: PD × LGD × EAD',
      formula: 'PD * LGD * EAD',
      parameters: [
        {
          parameterName: 'PD',
          dataSource: 'calculated',
          sourceId: 'probability_default',
          description: 'Probability of Default'
        },
        {
          parameterName: 'LGD',
          dataSource: 'calculated',
          sourceId: 'loss_given_default',
          description: 'Loss Given Default (includes collateral value)'
        },
        {
          parameterName: 'EAD',
          dataSource: 'banking_data',
          sourceId: 'outstanding_balance',
          description: 'Exposure at Default'
        }
      ],
      loanType: 'all',
      status: 'active',
      createdDate: new Date(),
      lastModifiedDate: new Date()
    };

    // Macro-adjusted formula for corporate loans
    const macroAdjustedFormula: ECLFormula = {
      formulaId: 'ECL_MACRO_ADJ_001',
      name: 'Macro-Adjusted ECL Formula',
      description: 'ECL with macro-economic adjustments for corporate loans',
      formula: '(PD * (1 + MACRO_ADJUSTMENT)) * LGD * EAD',
      parameters: [
        {
          parameterName: 'PD',
          dataSource: 'calculated',
          sourceId: 'probability_default',
          description: 'Base Probability of Default'
        },
        {
          parameterName: 'MACRO_ADJUSTMENT',
          dataSource: 'macro_variable',
          sourceId: 'GDP_GROWTH',
          defaultValue: 0,
          description: 'Macro variable adjustment factor'
        },
        {
          parameterName: 'LGD',
          dataSource: 'calculated',
          sourceId: 'loss_given_default',
          description: 'Loss Given Default'
        },
        {
          parameterName: 'EAD',
          dataSource: 'banking_data',
          sourceId: 'outstanding_balance',
          description: 'Exposure at Default'
        }
      ],
      loanType: 'corporate',
      status: 'active',
      createdDate: new Date(),
      lastModifiedDate: new Date()
    };

    // Retail mortgage specific formula
    const mortgageFormula: ECLFormula = {
      formulaId: 'ECL_MORTGAGE_001',
      name: 'Mortgage ECL Formula',
      description: 'ECL formula specific to mortgage loans with house price index adjustment',
      formula: '(PD * (1 - (HOUSE_PRICE_INDEX / 100))) * LGD * EAD',
      parameters: [
        {
          parameterName: 'PD',
          dataSource: 'calculated',
          sourceId: 'probability_default',
          description: 'Probability of Default'
        },
        {
          parameterName: 'HOUSE_PRICE_INDEX',
          dataSource: 'macro_variable',
          sourceId: 'HOUSE_PRICE_INDEX',
          defaultValue: 100,
          description: 'House Price Index (2015=100)'
        },
        {
          parameterName: 'LGD',
          dataSource: 'calculated',
          sourceId: 'loss_given_default',
          description: 'Loss Given Default'
        },
        {
          parameterName: 'EAD',
          dataSource: 'banking_data',
          sourceId: 'outstanding_balance',
          description: 'Exposure at Default'
        }
      ],
      loanType: 'mortgage',
      status: 'active',
      createdDate: new Date(),
      lastModifiedDate: new Date()
    };

    this.defaultFormulas = [standardECLFormula, macroAdjustedFormula, mortgageFormula];
    this.formulas.set(standardECLFormula.formulaId, standardECLFormula);
    this.formulas.set(macroAdjustedFormula.formulaId, macroAdjustedFormula);
    this.formulas.set(mortgageFormula.formulaId, mortgageFormula);
  }

  /**
   * Load formulas from localStorage
   */
  private loadFormulasFromStorage(): void {
    const stored = localStorage.getItem('ecl_formulas');
    if (stored) {
      try {
        const formulas = JSON.parse(stored) as ECLFormula[];
        formulas.forEach(f => this.formulas.set(f.formulaId, f));
      } catch (error) {
        console.error('Failed to load formulas from storage:', error);
      }
    }
  }

  /**
   * Save formula to storage
   */
  private saveFormulasToStorage(): void {
    try {
      const formulas = Array.from(this.formulas.values());
      localStorage.setItem('ecl_formulas', JSON.stringify(formulas));
    } catch (error) {
      console.error('Failed to save formulas to storage:', error);
    }
  }

  /**
   * Get formula by ID
   */
  getFormula(formulaId: string): ECLFormula | null {
    return this.formulas.get(formulaId) || null;
  }

  /**
   * Get all formulas
   */
  getAllFormulas(): ECLFormula[] {
    return Array.from(this.formulas.values());
  }

  /**
   * Get formulas by loan type
   */
  getFormulasByLoanType(loanType: 'retail' | 'corporate' | 'mortgage'): ECLFormula[] {
    return Array.from(this.formulas.values()).filter(
      f => f.loanType === loanType || f.loanType === 'all'
    );
  }

  /**
   * Create new formula
   */
  createFormula(formula: ECLFormula): void {
    formula.createdDate = new Date();
    formula.lastModifiedDate = new Date();
    this.formulas.set(formula.formulaId, formula);
    this.saveFormulasToStorage();
  }

  /**
   * Update formula
   */
  updateFormula(formulaId: string, updates: Partial<ECLFormula>): void {
    const formula = this.formulas.get(formulaId);
    if (formula) {
      Object.assign(formula, updates, { lastModifiedDate: new Date() });
      this.formulas.set(formulaId, formula);
      this.saveFormulasToStorage();
    }
  }

  /**
   * Delete formula
   */
  deleteFormula(formulaId: string): void {
    this.formulas.delete(formulaId);
    this.saveFormulasToStorage();
  }

  /**
   * Parse and validate formula expression
   */
  validateFormula(formulaExpression: string, parameters: ECLParameter[]): { valid: boolean; error?: string } {
    const paramNames = parameters.map(p => p.parameterName);

    // Simple validation - check if all parameters in formula are defined
    const regex = /[A-Z_]+/g;
    const matches = formulaExpression.match(regex) || [];
    const undefinedParams = matches.filter(m => !paramNames.includes(m) && !['POW', 'SQRT', 'MIN', 'MAX'].includes(m));

    if (undefinedParams.length > 0) {
      return { valid: false, error: `Undefined parameters: ${undefinedParams.join(', ')}` };
    }

    // Try to evaluate with test values
    try {
      const testParams = parameters.reduce((acc, p) => {
        acc[p.parameterName] = p.defaultValue || 0.1;
        return acc;
      }, {} as Record<string, number>);

      this.evaluateFormula(formulaExpression, testParams);
      return { valid: true };
    } catch (error) {
      return { valid: false, error: (error as Error).message };
    }
  }

  /**
   * Evaluate formula with given parameters
   */
  evaluateFormula(formulaExpression: string, parameters: Record<string, number>): number {
    // Replace parameter names with values
    let expression = formulaExpression;
    for (const [key, value] of Object.entries(parameters)) {
      expression = expression.replace(new RegExp('\\b' + key + '\\b', 'g'), String(value));
    }

    // Use Function constructor for evaluation (be careful with untrusted input in production)
    try {
      const result = Function(`"use strict"; return (${expression})`)();
      return Number(result);
    } catch (error) {
      throw new Error(`Failed to evaluate formula: ${error}`);
    }
  }

  /**
   * Reset to default formulas
   */
  resetToDefaults(): void {
    this.formulas.clear();
    this.defaultFormulas.forEach(f => this.formulas.set(f.formulaId, f));
    this.saveFormulasToStorage();
  }
}
