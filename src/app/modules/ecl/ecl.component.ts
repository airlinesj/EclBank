import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ECLCalculationService } from '@core/services/ecl-calculation.service';
import { ECLFormulaService } from '@core/services/ecl-formula.service';
import { DataRepositoryService } from '@core/services/data-repository.service';
import { AuditTrailService } from '@core/services/audit-trail.service';
import { ECLCalculation, ECLSummary, ECLFormula } from '@core/interfaces/ecl.interface';

@Component({
  selector: 'app-ecl',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ecl.component.html',
  styleUrl: './ecl.component.scss'
})
export class EclComponent implements OnInit {
  formulas: ECLFormula[] = [];
  selectedFormulaId = 'ECL_STANDARD_001';
  calculations: ECLCalculation[] = [];
  summary: ECLSummary | null = null;
  loading = false;
  selectedTab: 'summary' | 'details' | 'formulas' = 'summary';

  constructor(
    private eclCalculation: ECLCalculationService,
    private formulaService: ECLFormulaService,
    private dataRepository: DataRepositoryService,
    private auditTrail: AuditTrailService
  ) {}

  ngOnInit(): void {
    this.loadFormulas();
  }

  loadFormulas(): void {
    this.formulas = this.formulaService.getAllFormulas();
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

  private downloadFile(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
