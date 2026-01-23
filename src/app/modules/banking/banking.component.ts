import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataRepositoryService } from '@core/services/data-repository.service';
import { CoreBankingService } from '@core/services/core-banking.service';
import { AuditTrailService } from '@core/services/audit-trail.service';
import { LoanBalance, Transaction, BorrowerInfo } from '@core/interfaces/banking.interface';

@Component({
  selector: 'app-banking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './banking.component.html',
  styleUrl: './banking.component.scss'
})
export class BankingComponent implements OnInit, OnDestroy {
  loans: LoanBalance[] = [];
  transactions: Transaction[] = [];
  borrowers: BorrowerInfo[] = [];
  selectedTab: 'loans' | 'transactions' | 'borrowers' = 'loans';
  loading = false;
  selectedLoanId: string | null = null;

  constructor(
    private dataRepository: DataRepositoryService,
    private coreBanking: CoreBankingService,
    private auditTrail: AuditTrailService
  ) {}

  ngOnInit(): void {
    this.loadBankingData();
  }

  loadBankingData(): void {
    this.loading = true;
    this.coreBanking
      .extractAllBankingData()
      .then(data => {
        this.dataRepository.updateBankingData(data);
        this.loans = data.loanBalances;
        this.transactions = data.transactions;
        this.borrowers = data.borrowerInfo;

        this.auditTrail.logDataImport('BANKING_DATA', data.loanBalances.length, 'success');
      })
      .catch(error => {
        console.error('Error loading banking data:', error);
        this.auditTrail.logDataImport('BANKING_DATA', 0, 'failed', error.message);
      })
      .finally(() => {
        this.loading = false;
      });
  }

  selectLoan(loanId: string): void {
    this.selectedLoanId = this.selectedLoanId === loanId ? null : loanId;
  }

  getLoanTransactions(loanId: string): Transaction[] {
    return this.dataRepository.getTransactionsForLoan(loanId);
  }

  getBorrowerForLoan(loanId: string): BorrowerInfo | undefined {
    const loan = this.loans.find(l => l.loanId === loanId);
    return loan ? this.dataRepository.getBorrowerInfo(loan.borrowerId) : undefined;
  }

  exportData(format: 'json' | 'csv'): void {
    let content = '';
    let filename = '';

    if (this.selectedTab === 'loans') {
      if (format === 'json') {
        content = JSON.stringify(this.loans, null, 2);
        filename = 'loans.json';
      } else {
        content = this.convertToCSV(this.loans);
        filename = 'loans.csv';
      }
    }

    this.downloadFile(content, filename);
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','))
    ].join('\n');

    return csv;
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

  ngOnDestroy(): void {
    // Clean up loading state
    this.loading = false;
    // Clear data arrays to allow garbage collection
    this.loans = [];
    this.transactions = [];
    this.borrowers = [];
    this.selectedLoanId = null;
  }
}
