import { Injectable } from '@angular/core';
import { LoanBalance, Transaction, BorrowerInfo, BankingDataExtractionResponse } from '../interfaces/banking.interface';

/**
 * Dummy Data Service
 * Generates realistic dummy banking data for testing and demonstration
 */
@Injectable({
  providedIn: 'root'
})
export class DummyDataService {

  /**
   * Generate complete dummy banking dataset
   */
  generateDummyBankingData(): BankingDataExtractionResponse {
    const borrowers = this.generateDummyBorrowers();
    const loans = this.generateDummyLoans(borrowers);
    const transactions = this.generateDummyTransactions(loans);

    return {
      loanBalances: loans,
      transactions: transactions,
      borrowerInfo: borrowers,
      extractionTimestamp: new Date(),
      status: 'success'
    };
  }

  /**
   * Generate dummy borrowers with realistic data
   */
  private generateDummyBorrowers(): BorrowerInfo[] {
    return [
      {
        borrowerId: 'BOR_001',
        name: 'John Smith',
        type: 'individual',
        creditScore: 750,
        totalLoans: 2,
        defaultHistory: 0,
        lastPaymentDate: new Date('2026-01-15')
      },
      {
        borrowerId: 'BOR_002',
        name: 'Sarah Johnson',
        type: 'individual',
        creditScore: 680,
        totalLoans: 1,
        defaultHistory: 0,
        lastPaymentDate: new Date('2026-01-14')
      },
      {
        borrowerId: 'BOR_003',
        name: 'Tech Innovations Corp',
        type: 'corporate',
        sector: 'Technology',
        creditScore: 720,
        totalLoans: 3,
        defaultHistory: 0,
        lastPaymentDate: new Date('2026-01-10')
      },
      {
        borrowerId: 'BOR_004',
        name: 'Real Estate Holdings LLC',
        type: 'corporate',
        sector: 'Real Estate',
        creditScore: 650,
        totalLoans: 5,
        defaultHistory: 1,
        lastPaymentDate: new Date('2026-01-01')
      },
      {
        borrowerId: 'BOR_005',
        name: 'Michael Chen',
        type: 'individual',
        creditScore: 620,
        totalLoans: 1,
        defaultHistory: 1,
        lastPaymentDate: new Date('2025-12-20')
      },
      {
        borrowerId: 'BOR_006',
        name: 'Global Manufacturing Inc',
        type: 'corporate',
        sector: 'Manufacturing',
        creditScore: 780,
        totalLoans: 4,
        defaultHistory: 0,
        lastPaymentDate: new Date('2026-01-15')
      },
      {
        borrowerId: 'BOR_007',
        name: 'Emily Davis',
        type: 'individual',
        creditScore: 700,
        totalLoans: 1,
        defaultHistory: 0,
        lastPaymentDate: new Date('2026-01-16')
      },
      {
        borrowerId: 'BOR_008',
        name: 'Financial Services Group',
        type: 'corporate',
        sector: 'Finance',
        creditScore: 710,
        totalLoans: 2,
        defaultHistory: 0,
        lastPaymentDate: new Date('2026-01-12')
      }
    ];
  }

  /**
   * Generate dummy loans with realistic data
   */
  private generateDummyLoans(borrowers: BorrowerInfo[]): LoanBalance[] {
    return [
      {
        loanId: 'LOAN_001',
        borrowerId: 'BOR_001',
        principal: 250000,
        outstandingBalance: 235000,
        interestRate: 4.5,
        currency: 'USD',
        loanType: 'mortgage',
        originationDate: new Date('2021-06-15'),
        maturityDate: new Date('2031-06-15'),
        status: 'active'
      },
      {
        loanId: 'LOAN_002',
        borrowerId: 'BOR_001',
        principal: 50000,
        outstandingBalance: 42000,
        interestRate: 6.25,
        currency: 'USD',
        loanType: 'retail',
        originationDate: new Date('2023-03-10'),
        maturityDate: new Date('2028-03-10'),
        status: 'active'
      },
      {
        loanId: 'LOAN_003',
        borrowerId: 'BOR_002',
        principal: 180000,
        outstandingBalance: 165000,
        interestRate: 5.0,
        currency: 'USD',
        loanType: 'mortgage',
        originationDate: new Date('2020-09-20'),
        maturityDate: new Date('2030-09-20'),
        status: 'active'
      },
      {
        loanId: 'LOAN_004',
        borrowerId: 'BOR_003',
        principal: 5000000,
        outstandingBalance: 4500000,
        interestRate: 3.75,
        currency: 'USD',
        loanType: 'corporate',
        originationDate: new Date('2022-01-15'),
        maturityDate: new Date('2027-01-15'),
        status: 'active'
      },
      {
        loanId: 'LOAN_005',
        borrowerId: 'BOR_003',
        principal: 2000000,
        outstandingBalance: 1800000,
        interestRate: 4.0,
        currency: 'USD',
        loanType: 'corporate',
        originationDate: new Date('2023-06-01'),
        maturityDate: new Date('2028-06-01'),
        status: 'active'
      },
      {
        loanId: 'LOAN_006',
        borrowerId: 'BOR_004',
        principal: 15000000,
        outstandingBalance: 13500000,
        interestRate: 4.5,
        currency: 'USD',
        loanType: 'corporate',
        originationDate: new Date('2018-12-01'),
        maturityDate: new Date('2028-12-01'),
        status: 'active'
      },
      {
        loanId: 'LOAN_007',
        borrowerId: 'BOR_004',
        principal: 3000000,
        outstandingBalance: 2200000,
        interestRate: 5.5,
        currency: 'USD',
        loanType: 'corporate',
        originationDate: new Date('2021-03-15'),
        maturityDate: new Date('2026-03-15'),
        status: 'defaulted'
      },
      {
        loanId: 'LOAN_008',
        borrowerId: 'BOR_005',
        principal: 100000,
        outstandingBalance: 35000,
        interestRate: 7.25,
        currency: 'USD',
        loanType: 'retail',
        originationDate: new Date('2022-05-10'),
        maturityDate: new Date('2027-05-10'),
        status: 'active'
      },
      {
        loanId: 'LOAN_009',
        borrowerId: 'BOR_006',
        principal: 8000000,
        outstandingBalance: 7200000,
        interestRate: 3.5,
        currency: 'USD',
        loanType: 'corporate',
        originationDate: new Date('2021-11-01'),
        maturityDate: new Date('2031-11-01'),
        status: 'active'
      },
      {
        loanId: 'LOAN_010',
        borrowerId: 'BOR_007',
        principal: 350000,
        outstandingBalance: 320000,
        interestRate: 4.75,
        currency: 'USD',
        loanType: 'mortgage',
        originationDate: new Date('2020-02-01'),
        maturityDate: new Date('2030-02-01'),
        status: 'active'
      },
      {
        loanId: 'LOAN_011',
        borrowerId: 'BOR_008',
        principal: 12000000,
        outstandingBalance: 11000000,
        interestRate: 3.25,
        currency: 'USD',
        loanType: 'corporate',
        originationDate: new Date('2019-07-15'),
        maturityDate: new Date('2029-07-15'),
        status: 'active'
      },
      {
        loanId: 'LOAN_012',
        borrowerId: 'BOR_003',
        principal: 1500000,
        outstandingBalance: 1350000,
        interestRate: 4.25,
        currency: 'USD',
        loanType: 'corporate',
        originationDate: new Date('2022-09-01'),
        maturityDate: new Date('2027-09-01'),
        status: 'active'
      }
    ];
  }

  /**
   * Generate dummy transactions
   */
  private generateDummyTransactions(loans: LoanBalance[]): Transaction[] {
    const transactions: Transaction[] = [];
    const now = new Date();

    loans.forEach(loan => {
      // Add monthly payments for the last 6 months
      for (let i = 0; i < 6; i++) {
        const paymentDate = new Date(now);
        paymentDate.setMonth(paymentDate.getMonth() - i);
        
        transactions.push({
          transactionId: `TXN_${loan.loanId}_${i}`,
          loanId: loan.loanId,
          transactionDate: paymentDate,
          amount: (loan.outstandingBalance * (loan.interestRate / 100)) / 12,
          type: 'payment',
          status: 'completed',
          description: `Monthly payment for ${loan.loanId}`
        });

        // Add interest charges
        transactions.push({
          transactionId: `INT_${loan.loanId}_${i}`,
          loanId: loan.loanId,
          transactionDate: paymentDate,
          amount: (loan.outstandingBalance * (loan.interestRate / 100)) / 12,
          type: 'interest',
          status: 'completed',
          description: `Interest charge for ${loan.loanId}`
        });
      }
    });

    return transactions;
  }

  /**
   * Get a specific dummy loan for testing
   */
  getDummyLoan(loanId: string): LoanBalance | null {
    const data = this.generateDummyBankingData();
    return data.loanBalances.find(loan => loan.loanId === loanId) || null;
  }

  /**
   * Get all dummy loans
   */
  getAllDummyLoans(): LoanBalance[] {
    return this.generateDummyBankingData().loanBalances;
  }

  /**
   * Get a specific dummy borrower
   */
  getDummyBorrower(borrowerId: string): BorrowerInfo | null {
    const data = this.generateDummyBankingData();
    return data.borrowerInfo.find(b => b.borrowerId === borrowerId) || null;
  }
}
