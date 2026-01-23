import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BankingDataExtractionResponse } from '../interfaces/banking.interface';
import { DummyDataService } from './dummy-data.service';

/**
 * Central Data Repository Service
 * Stores and manages all extracted banking data
 * Acts as a single source of truth for banking information
 */
@Injectable({
  providedIn: 'root'
})
export class DataRepositoryService {
  private bankingData = new BehaviorSubject<BankingDataExtractionResponse | null>(null);
  private lastUpdateTime = new BehaviorSubject<Date | null>(null);
  private dataVersion = new BehaviorSubject<number>(0);

  public bankingData$ = this.bankingData.asObservable();
  public lastUpdateTime$ = this.lastUpdateTime.asObservable();
  public dataVersion$ = this.dataVersion.asObservable();

  constructor(private dummyDataService: DummyDataService) {
    this.initializeStorage();
  }

  /**
   * Initialize storage from localStorage if available, otherwise load dummy data
   */
  private initializeStorage(): void {
    const storedData = localStorage.getItem('banking_data');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        this.bankingData.next(parsedData);
      } catch (error) {
        console.error('Failed to load stored banking data:', error);
        this.loadDummyData();
      }
    } else {
      // Load dummy data if no stored data exists
      this.loadDummyData();
    }
  }

  /**
   * Load dummy data
   */
  private loadDummyData(): void {
    const dummyData = this.dummyDataService.generateDummyBankingData();
    this.bankingData.next(dummyData);
    this.lastUpdateTime.next(new Date());
    this.persistToStorage(dummyData);
  }

  /**
   * Update banking data in the repository
   */
  updateBankingData(data: BankingDataExtractionResponse): void {
    this.bankingData.next(data);
    this.lastUpdateTime.next(new Date());
    this.dataVersion.next(this.dataVersion.value + 1);
    this.persistToStorage(data);
  }

  /**
   * Get current banking data
   */
  getBankingData(): BankingDataExtractionResponse | null {
    return this.bankingData.value;
  }

  /**
   * Get loan balance by loan ID
   */
  getLoanBalance(loanId: string) {
    const data = this.bankingData.value;
    return data?.loanBalances.find(loan => loan.loanId === loanId);
  }

  /**
   * Get all loan balances
   */
  getAllLoanBalances() {
    return this.bankingData.value?.loanBalances || [];
  }

  /**
   * Get transactions for a specific loan
   */
  getTransactionsForLoan(loanId: string) {
    const data = this.bankingData.value;
    return data?.transactions.filter(txn => txn.loanId === loanId) || [];
  }

  /**
   * Get all transactions
   */
  getAllTransactions() {
    return this.bankingData.value?.transactions || [];
  }

  /**
   * Get borrower info by borrower ID
   */
  getBorrowerInfo(borrowerId: string) {
    const data = this.bankingData.value;
    return data?.borrowerInfo.find(borrower => borrower.borrowerId === borrowerId);
  }

  /**
   * Get all borrower info
   */
  getAllBorrowers() {
    return this.bankingData.value?.borrowerInfo || [];
  }

  /**
   * Get summary statistics
   */
  getSummaryStatistics() {
    const data = this.bankingData.value;
    if (!data) return null;

    const totalLoanBalance = data.loanBalances.reduce((sum, loan) => sum + loan.outstandingBalance, 0);
    const activeLoanCount = data.loanBalances.filter(loan => loan.status === 'active').length;
    const defaultedLoanCount = data.loanBalances.filter(loan => loan.status === 'defaulted').length;
    const totalTransactions = data.transactions.length;

    return {
      totalLoanBalance,
      activeLoanCount,
      defaultedLoanCount,
      totalTransactions,
      borrowerCount: data.borrowerInfo.length
    };
  }

  /**
   * Clear repository data
   */
  clearData(): void {
    this.bankingData.next(null);
    this.lastUpdateTime.next(null);
    localStorage.removeItem('banking_data');
  }

  /**
   * Persist data to localStorage
   */
  private persistToStorage(data: BankingDataExtractionResponse): void {
    try {
      localStorage.setItem('banking_data', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to persist banking data to storage:', error);
    }
  }
}
