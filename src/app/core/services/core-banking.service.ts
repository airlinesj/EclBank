import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { ICoreBankingSystem, BankingDataExtractionResponse, LoanBalance, Transaction, BorrowerInfo } from '../interfaces/banking.interface';
import { environment } from '../../../environments/environment';

/**
 * Core Banking Service
 * Provides integration with the core banking system
 * This service acts as an adapter to extract banking data
 */
@Injectable({
  providedIn: 'root'
})
export class CoreBankingService implements ICoreBankingSystem {
  private bankingApiUrl = '/api/banking'; // TODO: Configure with actual banking API endpoint
  private requestTimeout = 30000; // 30 seconds
  private useMockApi = environment.useMockApi;

  constructor(private http: HttpClient) {}

  /**
   * Extract loan balances from the banking system
   * TODO: Replace with actual API integration
   */
  extractLoanBalances(): Promise<LoanBalance[]> {
    if (this.useMockApi) {
      return Promise.resolve(this.getMockLoanBalances());
    }

    // Placeholder implementation - replace with actual API call
    return this.http
      .get<LoanBalance[]>(`${this.bankingApiUrl}/loans`)
      .pipe(
        timeout(this.requestTimeout),
        catchError(this.handleError)
      )
      .toPromise()
      .then(data => data || this.getMockLoanBalances());
  }

  /**
   * Extract transaction history from the banking system
   * TODO: Replace with actual API integration
   */
  extractTransactionHistory(
    loanId?: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<Transaction[]> {
    if (this.useMockApi) {
      const transactions = this.getMockTransactions();
      if (!loanId) {
        return Promise.resolve(transactions);
      }
      return Promise.resolve(transactions.filter(transaction => transaction.loanId === loanId));
    }

    let url = `${this.bankingApiUrl}/transactions`;
    if (loanId) {
      url += `?loanId=${loanId}`;
    }
    // TODO: Add date range parameters if needed

    return this.http
      .get<Transaction[]>(url)
      .pipe(
        timeout(this.requestTimeout),
        catchError(this.handleError)
      )
      .toPromise()
      .then(data => data || this.getMockTransactions());
  }

  /**
   * Extract borrower information from the banking system
   * TODO: Replace with actual API integration
   */
  extractBorrowerInfo(borrowerId?: string): Promise<BorrowerInfo[]> {
    if (this.useMockApi) {
      const borrowers = this.getMockBorrowers();
      if (!borrowerId) {
        return Promise.resolve(borrowers);
      }
      return Promise.resolve(borrowers.filter(borrower => borrower.borrowerId === borrowerId));
    }

    let url = `${this.bankingApiUrl}/borrowers`;
    if (borrowerId) {
      url += `?borrowerId=${borrowerId}`;
    }

    return this.http
      .get<BorrowerInfo[]>(url)
      .pipe(
        timeout(this.requestTimeout),
        catchError(this.handleError)
      )
      .toPromise()
      .then(data => data || this.getMockBorrowers());
  }

  /**
   * Health check for banking system connection
   */
  healthCheck(): Promise<boolean> {
    if (this.useMockApi) {
      return Promise.resolve(true);
    }

    return this.http
      .get<{ status: string }>(`${this.bankingApiUrl}/health`)
      .pipe(
        timeout(5000),
        catchError(() => of({ status: 'unavailable' }))
      )
      .toPromise()
      .then(response => response?.status === 'healthy' || response?.status === 'ok');
  }

  /**
   * Extract all banking data in one call
   */
  extractAllBankingData(): Promise<BankingDataExtractionResponse> {
    return Promise.all([
      this.extractLoanBalances(),
      this.extractTransactionHistory(),
      this.extractBorrowerInfo()
    ])
      .then(([loanBalances, transactions, borrowerInfo]) => ({
        loanBalances,
        transactions,
        borrowerInfo,
        extractionTimestamp: new Date(),
        status: 'success' as const
      }))
      .catch(error => ({
        loanBalances: [],
        transactions: [],
        borrowerInfo: [],
        extractionTimestamp: new Date(),
        status: 'failed',
        errorMessage: error.message
      }));
  }

  /**
   * Mock data for development - Replace with actual API calls
   */
  private getMockLoanBalances(): LoanBalance[] {
    return [
      {
        loanId: 'LOAN001',
        borrowerId: 'BORR001',
        principal: 100000,
        outstandingBalance: 85000,
        interestRate: 5.5,
        currency: 'USD',
        loanType: 'corporate',
        originationDate: new Date('2020-01-15'),
        maturityDate: new Date('2025-01-15'),
        status: 'active'
      },
      {
        loanId: 'LOAN002',
        borrowerId: 'BORR002',
        principal: 250000,
        outstandingBalance: 180000,
        interestRate: 4.2,
        currency: 'USD',
        loanType: 'mortgage',
        originationDate: new Date('2019-06-20'),
        maturityDate: new Date('2049-06-20'),
        status: 'active'
      },
      {
        loanId: 'LOAN003',
        borrowerId: 'BORR003',
        principal: 50000,
        outstandingBalance: 45000,
        interestRate: 8.0,
        currency: 'USD',
        loanType: 'retail',
        originationDate: new Date('2021-03-10'),
        maturityDate: new Date('2026-03-10'),
        status: 'defaulted'
      }
    ];
  }

  private getMockTransactions(): Transaction[] {
    return [
      {
        transactionId: 'TXN001',
        loanId: 'LOAN001',
        transactionDate: new Date('2024-12-15'),
        amount: 5000,
        type: 'payment',
        status: 'completed',
        description: 'Monthly payment'
      },
      {
        transactionId: 'TXN002',
        loanId: 'LOAN001',
        transactionDate: new Date('2024-11-15'),
        amount: 5000,
        type: 'payment',
        status: 'completed',
        description: 'Monthly payment'
      },
      {
        transactionId: 'TXN003',
        loanId: 'LOAN002',
        transactionDate: new Date('2024-12-10'),
        amount: 1500,
        type: 'payment',
        status: 'completed',
        description: 'Monthly mortgage payment'
      }
    ];
  }

  private getMockBorrowers(): BorrowerInfo[] {
    return [
      {
        borrowerId: 'BORR001',
        name: 'Tech Corp Inc.',
        type: 'corporate',
        sector: 'Technology',
        creditScore: 750,
        totalLoans: 2,
        defaultHistory: 0,
        lastPaymentDate: new Date('2024-12-15')
      },
      {
        borrowerId: 'BORR002',
        name: 'John Smith',
        type: 'individual',
        creditScore: 720,
        totalLoans: 1,
        defaultHistory: 0,
        lastPaymentDate: new Date('2024-12-10')
      },
      {
        borrowerId: 'BORR003',
        name: 'Manufacturing Ltd.',
        type: 'corporate',
        sector: 'Manufacturing',
        creditScore: 580,
        totalLoans: 1,
        defaultHistory: 2,
        lastPaymentDate: new Date('2024-10-20')
      }
    ];
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred while fetching banking data';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
