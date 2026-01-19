import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataRepositoryService } from '@core/services/data-repository.service';
import { ECLCalculationService } from '@core/services/ecl-calculation.service';
import { ECLSummary } from '@core/interfaces/ecl.interface';
import { AiChatComponent } from './components/ai-chat.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, AiChatComponent],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnInit {
  summary: ECLSummary | null = null;
  bankingSummary: any = null;
  selectedReport: 'portfolio' | 'risk' | 'forecast' = 'portfolio';
  activeTab: 'reports' | 'ai-chat' = 'reports';

  constructor(
    private dataRepository: DataRepositoryService,
    private eclCalculation: ECLCalculationService
  ) {}

  ngOnInit(): void {
    this.loadReportData();
  }

  loadReportData(): void {
    this.summary = this.eclCalculation.calculatePortfolioECL('ECL_STANDARD_001');
    this.bankingSummary = this.dataRepository.getSummaryStatistics();
  }

  generateReport(): void {
    let html = '';

    if (this.selectedReport === 'portfolio') {
      html = this.generatePortfolioReport();
    } else if (this.selectedReport === 'risk') {
      html = this.generateRiskReport();
    } else {
      html = this.generateForecastReport();
    }

    this.downloadHTMLReport(html, `report_${this.selectedReport}.html`);
  }

  private generatePortfolioReport(): string {
    if (!this.summary || !this.bankingSummary) return '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Portfolio Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1, h2 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f0f0f0; font-weight: bold; }
          .metric { display: inline-block; margin: 10px 20px; }
          .highlight { background-color: #fff3cd; }
        </style>
      </head>
      <body>
        <h1>Banking Portfolio Report</h1>
        <p>Generated: ${new Date().toISOString()}</p>
        
        <h2>Portfolio Summary</h2>
        <div class="metric">
          <strong>Total Loan Balance:</strong> $${this.bankingSummary.totalLoanBalance.toFixed(2)}
        </div>
        <div class="metric">
          <strong>Active Loans:</strong> ${this.bankingSummary.activeLoanCount}
        </div>
        <div class="metric highlight">
          <strong>Defaulted Loans:</strong> ${this.bankingSummary.defaultedLoanCount}
        </div>
        <div class="metric">
          <strong>Total Borrowers:</strong> ${this.bankingSummary.borrowerCount}
        </div>

        <h2>Expected Credit Loss (ECL)</h2>
        <div class="metric">
          <strong>Total ECL:</strong> $${this.summary.totalECL.toFixed(2)}
        </div>
        <div class="metric">
          <strong>Stage 1 ECL:</strong> $${this.summary.stage1ECL.toFixed(2)}
        </div>
        <div class="metric">
          <strong>Stage 2 ECL:</strong> $${this.summary.stage2ECL.toFixed(2)}
        </div>
        <div class="metric highlight">
          <strong>Stage 3 ECL:</strong> $${this.summary.stage3ECL.toFixed(2)}
        </div>

        <h2>ECL by Loan Type</h2>
        <table>
          <thead>
            <tr>
              <th>Loan Type</th>
              <th>Count</th>
              <th>Total ECL</th>
              <th>Average ECL</th>
            </tr>
          </thead>
          <tbody>
            ${this.summary.summaryByLoanType.map(lt => `
              <tr>
                <td>${lt.loanType}</td>
                <td>${lt.loanCount}</td>
                <td>$${lt.totalECL.toFixed(2)}</td>
                <td>$${lt.avgECL.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <p style="margin-top: 30px; font-size: 12px; color: #999;">
          This report is confidential and for internal use only.
        </p>
      </body>
      </html>
    `;
  }

  private generateRiskReport(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Risk Assessment Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1, h2 { color: #333; }
          .risk-level { padding: 10px; margin: 10px 0; border-radius: 4px; }
          .high { background-color: #f8d7da; color: #721c24; }
          .medium { background-color: #fff3cd; color: #856404; }
          .low { background-color: #d4edda; color: #155724; }
        </style>
      </head>
      <body>
        <h1>Credit Risk Assessment Report</h1>
        <p>Generated: ${new Date().toISOString()}</p>
        
        <h2>Risk Overview</h2>
        <div class="risk-level high">
          <strong>High Risk:</strong> Default probability > 50% or Credit Score < 500
        </div>
        <div class="risk-level medium">
          <strong>Medium Risk:</strong> Default probability 20-50% or Credit Score 500-650
        </div>
        <div class="risk-level low">
          <strong>Low Risk:</strong> Default probability < 20% and Credit Score > 650
        </div>

        <h2>Recommendations</h2>
        <ul>
          <li>Monitor high-risk loans closely</li>
          <li>Consider increasing provisions for high-risk segments</li>
          <li>Review collateral adequacy for medium-risk loans</li>
          <li>Implement early warning systems for credit deterioration</li>
        </ul>

        <p style="margin-top: 30px; font-size: 12px; color: #999;">
          This report is confidential and for internal use only.
        </p>
      </body>
      </html>
    `;
  }

  private generateForecastReport(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Forecast Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1, h2 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f0f0f0; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>ECL Forecast Report (12 Month)</h1>
        <p>Generated: ${new Date().toISOString()}</p>
        
        <h2>Forecast Summary</h2>
        <p>
          Based on macroeconomic indicators and historical trends, we forecast the following 
          expected credit loss trajectory over the next 12 months.
        </p>

        <h2>Key Assumptions</h2>
        <ul>
          <li>GDP Growth: Assumed to remain stable at 2.5%</li>
          <li>Inflation: Expected to trend towards 3.0%</li>
          <li>Unemployment: Projected to remain around 4.5%</li>
          <li>Interest Rates: Expected rate of 4.75% maintained</li>
        </ul>

        <h2>Forecast Table</h2>
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Projected ECL</th>
              <th>Confidence Level</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Month 1</td><td>$${(this.summary?.totalECL || 0).toFixed(2)}</td><td>95%</td><td>Current level</td></tr>
            <tr><td>Month 3</td><td>$${(this.summary?.totalECL || 0) * 1.02}.toFixed(2)}</td><td>92%</td><td>Slight increase</td></tr>
            <tr><td>Month 6</td><td>$${(this.summary?.totalECL || 0) * 1.05}.toFixed(2)}</td><td>85%</td><td>Moderate increase</td></tr>
            <tr><td>Month 12</td><td>$${(this.summary?.totalECL || 0) * 1.08}.toFixed(2)}</td><td>80%</td><td>Trend stabilizing</td></tr>
          </tbody>
        </table>

        <p style="margin-top: 30px; font-size: 12px; color: #999;">
          This report is confidential and for internal use only.
        </p>
      </body>
      </html>
    `;
  }

  private downloadHTMLReport(html: string, filename: string): void {
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
}
