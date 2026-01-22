import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ECLCalculationService } from '@core/services/ecl-calculation.service';
import { ECLFormulaService } from '@core/services/ecl-formula.service';
import { ECLCustomCalculationService } from '@core/services/ecl-custom-calculation.service';
import { DummyDataService } from '@core/services/dummy-data.service';
import { DataRepositoryService } from '@core/services/data-repository.service';
import { AuditTrailService } from '@core/services/audit-trail.service';
import { ECLCalculation, ECLSummary, ECLFormula, ECLCalculationInput, ECLCalculationResult } from '@core/interfaces/ecl.interface';
import { LoanBalance } from '@core/interfaces/banking.interface';

@Component({
  selector: 'app-ecl',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ecl.component.html',
  styleUrl: './ecl.component.scss'
})
export class EclComponent implements OnInit, OnDestroy {
  formulas: ECLFormula[] = [];
  selectedFormulaId = 'ECL_STANDARD_001';
  calculations: ECLCalculation[] = [];
  summary: ECLSummary | null = null;
  loading = false;
  selectedTab: 'summary' | 'details' | 'formulas' | 'custom' = 'summary';

  // Custom calculation properties
  customCalcTab: 'portfolio' | 'single' | 'compare' = 'portfolio';
  selectedOption: 'dummy_data' | 'user_input' = 'dummy_data';
  dummyLoans: LoanBalance[] = [];
  selectedDummyLoan: LoanBalance | null = null;
  
  // User input form
  userInput: ECLCalculationInput = {
    pd: 5,
    lgd: 50,
    ead: 100000,
    effectiveInterestRate: 4
  };

  customResult: ECLCalculationResult | null = null;
  customResultDetailed: any = null;
  validationErrors: string[] = [];

  constructor(
    private eclCalculation: ECLCalculationService,
    private formulaService: ECLFormulaService,
    private customCalcService: ECLCustomCalculationService,
    private dummyDataService: DummyDataService,
    private dataRepository: DataRepositoryService,
    private auditTrail: AuditTrailService
  ) {}

  ngOnInit(): void {
    this.loadFormulas();
    this.loadDummyLoans();
  }

  loadFormulas(): void {
    this.formulas = this.formulaService.getAllFormulas();
  }

  loadDummyLoans(): void {
    this.dummyLoans = this.dummyDataService.getAllDummyLoans();
    if (this.dummyLoans.length > 0) {
      this.selectedDummyLoan = this.dummyLoans[0];
    }
  }

  calculateECL(): void {
    this.loading = true;

    try {
      this.summary = this.eclCalculation.calculatePortfolioECL(this.selectedFormulaId);
      this.calculations = this.eclCalculation.getCalculationHistory();

      this.auditTrail.logECLCalculation(
        'PORTFOLIO',
        this.selectedFormulaId,
        this.summary.totalECL,
        'success'
      );
    } catch (error) {
      console.error('Error calculating ECL:', error);
      this.auditTrail.logECLCalculation(
        'PORTFOLIO',
        this.selectedFormulaId,
        0,
        'failed'
      );
    } finally {
      this.loading = false;
    }
  }

  // Custom Calculation Methods
  calculateCustomECL(): void {
    this.validationErrors = [];
    this.customResult = null;
    this.customResultDetailed = null;

    // Prepare input based on selected option
    let calculationInput: ECLCalculationInput;
    let source: 'dummy_data' | 'user_input' | 'combined' = 'user_input';

    if (this.selectedOption === 'dummy_data' && this.selectedDummyLoan) {
      calculationInput = this.extractInputFromDummyLoan(this.selectedDummyLoan);
      source = 'dummy_data';
    } else {
      calculationInput = this.userInput;
      source = 'user_input';
    }

    // Validate input
    const validation = this.customCalcService.validateInput(calculationInput);
    if (!validation.valid) {
      this.validationErrors = validation.errors;
      return;
    }

    // Calculate ECL
    this.customResult = this.customCalcService.calculateECL(
      calculationInput,
      source
    );
    this.customResultDetailed = this.customCalcService.calculateECLWithBreakdown(
      calculationInput,
      this.selectedOption
    );
  }

  private extractInputFromDummyLoan(loan: LoanBalance): ECLCalculationInput {
    // Generate PD and LGD based on loan characteristics
    // This is a simplified approach - in production, you'd use actual credit models
    const pd = this.calculatePDFromLoan(loan);
    const lgd = this.calculateLGDFromLoan(loan);

    return {
      pd,
      lgd,
      ead: loan.outstandingBalance,
      effectiveInterestRate: loan.interestRate
    };
  }

  private calculatePDFromLoan(loan: LoanBalance): number {
    // Simplified PD calculation based on loan status and interest rate
    if (loan.status === 'defaulted') return 80;
    if (loan.status === 'active') {
      if (loan.interestRate > 6) return 8; // Higher risk
      if (loan.interestRate > 5) return 5;
      return 3; // Lower risk
    }
    return 1;
  }

  private calculateLGDFromLoan(loan: LoanBalance): number {
    // Simplified LGD calculation based on loan type
    const lgdByType: Record<string, number> = {
      'mortgage': 30,
      'retail': 50,
      'corporate': 40
    };
    return lgdByType[loan.loanType] || 50;
  }

  switchOption(option: 'dummy_data' | 'user_input'): void {
    this.selectedOption = option;
    this.customResult = null;
    this.customResultDetailed = null;
    this.validationErrors = [];
  }

  resetCustomForm(): void {
    this.userInput = {
      pd: 5,
      lgd: 50,
      ead: 100000,
      effectiveInterestRate: 4
    };
    this.customResult = null;
    this.customResultDetailed = null;
    this.validationErrors = [];
  }

  exportSummary(format: 'json' | 'csv'): void {
    if (!this.summary) return;

    let content = '';
    let filename = '';

    if (format === 'json') {
      content = JSON.stringify(this.summary, null, 2);
      filename = 'ecl_summary.json';
    } else {
      content = this.summaryToCSV();
      filename = 'ecl_summary.csv';
    }

    this.downloadFile(content, filename);
  }

  exportCustomResult(format: 'json' | 'csv'): void {
    if (!this.customResult) return;

    let content = '';
    let filename = '';

    if (format === 'json') {
      content = JSON.stringify(this.customResultDetailed, null, 2);
      filename = 'ecl_custom_calculation.json';
    } else {
      content = this.customResultToCSV();
      filename = 'ecl_custom_calculation.csv';
    }

    this.downloadFile(content, filename);
  }

  private customResultToCSV(): string {
    if (!this.customResult || !this.customResultDetailed) return '';

    const lines = [
      'Custom ECL Calculation Report',
      new Date().toISOString(),
      '',
      'Formula: PD × LGD × EAD × Effective Interest Rate',
      '',
      'Input Parameters',
      'Probability of Default (PD),' + this.customResultDetailed.breakdown.pdPercentage.toFixed(2) + '%',
      'Loss Given Default (LGD),' + this.customResultDetailed.breakdown.lgdPercentage.toFixed(2) + '%',
      'Exposure at Default (EAD),' + this.customResult.ead.toFixed(2),
      'Effective Interest Rate,' + (this.customResult.effectiveInterestRate * 100).toFixed(2) + '%',
      '',
      'Calculation Breakdown',
      'PD × LGD,' + this.customResultDetailed.breakdown.pdLgdProduct.toFixed(6),
      'PD × LGD (%),' + this.customResultDetailed.breakdown.pdLgdPercentage.toFixed(4) + '%',
      'Interest Component (EAD × EIR),' + this.customResultDetailed.breakdown.interestComponent.toFixed(2),
      '',
      'Result',
      'Expected Credit Loss (ECL),' + this.customResult.ecl.toFixed(2),
      'Data Source,' + this.customResult.source,
      'Calculation Date,' + this.customResult.calculationDate.toISOString()
    ];

    return lines.join('\n');
  }

  private summaryToCSV(): string {
    if (!this.summary) return '';

    const lines = [
      'ECL Summary Report',
      '',
      'Portfolio Level',
      'Total ECL,' + this.summary.totalECL,
      'Stage 1 ECL,' + this.summary.stage1ECL,
      'Stage 2 ECL,' + this.summary.stage2ECL,
      'Stage 3 ECL,' + this.summary.stage3ECL,
      'Loan Count,' + this.summary.loanCount,
      'Defaulted Loans,' + this.summary.defaultedLoanCount,
      '',
      'By Loan Type',
      'Loan Type,Total ECL,Count,Avg ECL'
    ];

    this.summary.summaryByLoanType.forEach(summary => {
      lines.push(`${summary.loanType},${summary.totalECL},${summary.loanCount},${summary.avgECL}`);
    });

    return lines.join('\n');
  }

  downloadHTMLReport(html: string, filename: string): void {
    const blob = new Blob([html], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  ngOnDestroy(): void {
    // Clean up loading state
    this.loading = false;
    // Clear arrays to allow garbage collection
    this.formulas = [];
    this.calculations = [];
    this.dummyLoans = [];
    this.summary = null;
    this.selectedDummyLoan = null;
    this.customResult = null;
    this.validationErrors = [];
  }
}
