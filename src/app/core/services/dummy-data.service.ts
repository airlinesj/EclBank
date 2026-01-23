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
        phoneNumber: '+1-555-0101',
        type: 'individual',
        creditScore: 750,
        totalLoans: 2,
        defaultHistory: 0,
        lastPaymentDate: new Date('2026-01-15')
      },
      {
        borrowerId: 'BOR_002',
        name: 'Sarah Johnson',
        phoneNumber: '+1-555-0102',
        type: 'individual',
        creditScore: 680,
        totalLoans: 1,
        defaultHistory: 0,
        lastPaymentDate: new Date('2026-01-14')
      },
      {
        borrowerId: 'BOR_003',
        name: 'Tech Innovations Corp',
        phoneNumber: '+1-555-0103',
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
        phoneNumber: '+1-555-0104',
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
        phoneNumber: '+1-555-0105',
        type: 'individual',
        creditScore: 620,
        totalLoans: 1,
        defaultHistory: 1,
        lastPaymentDate: new Date('2025-12-20')
      },
      {
        borrowerId: 'BOR_006',
        name: 'Global Manufacturing Inc',
        phoneNumber: '+1-555-0106',
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
        phoneNumber: '+1-555-0107',
        type: 'individual',
        creditScore: 700,
        totalLoans: 1,
        defaultHistory: 0,
        lastPaymentDate: new Date('2026-01-16')
      },
      {
        borrowerId: 'BOR_008',
        name: 'Financial Services Group',
        phoneNumber: '+1-555-0108',
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
   * 7 primary loans plus additional portfolio loans
   */
  private generateDummyLoans(borrowers: BorrowerInfo[]): LoanBalance[] {
    return [
      // PRIMARY LOAN 1: Residential Mortgage - John Smith
      {
        loanId: 'LOAN_001',
        borrowerId: 'BOR_001',
        principal: 450000,
        outstandingBalance: 412500,
        interestRate: 4.25,
        currency: 'USD',
        loanType: 'mortgage',
        originationDate: new Date('2021-06-15'),
        maturityDate: new Date('2031-06-15'),
        status: 'active'
      },
      // PRIMARY LOAN 2: Auto Loan - Sarah Johnson
      {
        loanId: 'LOAN_002',
        borrowerId: 'BOR_002',
        principal: 85000,
        outstandingBalance: 68400,
        interestRate: 5.75,
        currency: 'USD',
        loanType: 'retail',
        originationDate: new Date('2023-08-20'),
        maturityDate: new Date('2028-08-20'),
        status: 'active'
      },
      // PRIMARY LOAN 3: Business Expansion - Tech Innovations Corp
      {
        loanId: 'LOAN_003',
        borrowerId: 'BOR_003',
        principal: 3500000,
        outstandingBalance: 3150000,
        interestRate: 4.0,
        currency: 'USD',
        loanType: 'corporate',
        originationDate: new Date('2022-03-01'),
        maturityDate: new Date('2027-03-01'),
        status: 'active'
      },
      // PRIMARY LOAN 4: Real Estate Development - Real Estate Holdings LLC
      {
        loanId: 'LOAN_004',
        borrowerId: 'BOR_004',
        principal: 12500000,
        outstandingBalance: 11250000,
        interestRate: 4.5,
        currency: 'USD',
        loanType: 'corporate',
        originationDate: new Date('2019-01-15'),
        maturityDate: new Date('2029-01-15'),
        status: 'active'
      },
      // PRIMARY LOAN 5: Working Capital - Global Manufacturing Inc
      {
        loanId: 'LOAN_005',
        borrowerId: 'BOR_006',
        principal: 6500000,
        outstandingBalance: 5850000,
        interestRate: 3.75,
        currency: 'USD',
        loanType: 'corporate',
        originationDate: new Date('2021-09-10'),
        maturityDate: new Date('2031-09-10'),
        status: 'active'
      },
      // PRIMARY LOAN 6: Personal Loan - Michael Chen
      {
        loanId: 'LOAN_006',
        borrowerId: 'BOR_005',
        principal: 75000,
        outstandingBalance: 52500,
        interestRate: 7.5,
        currency: 'USD',
        loanType: 'retail',
        originationDate: new Date('2022-11-15'),
        maturityDate: new Date('2027-11-15'),
        status: 'active'
      },
      // PRIMARY LOAN 7: Commercial Mortgage - Emily Davis
      {
        loanId: 'LOAN_007',
        borrowerId: 'BOR_007',
        principal: 550000,
        outstandingBalance: 495000,
        interestRate: 4.5,
        currency: 'USD',
        loanType: 'mortgage',
        originationDate: new Date('2020-04-20'),
        maturityDate: new Date('2030-04-20'),
        status: 'active'
      },
      // ADDITIONAL LOANS IN PORTFOLIO
      {
        loanId: 'LOAN_008',
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
        loanId: 'LOAN_009',
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
        loanId: 'LOAN_010',
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
        loanId: 'LOAN_011',
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
        loanId: 'LOAN_012',
        borrowerId: 'BOR_008',
        principal: 8000000,
        outstandingBalance: 7200000,
        interestRate: 3.25,
        currency: 'USD',
        loanType: 'corporate',
        originationDate: new Date('2019-07-15'),
        maturityDate: new Date('2029-07-15'),
        status: 'active'
      }
    ];
  }

  /**
   * Generate dummy transactions for the last 5 months
   * Includes payments, interest, fees, and disbursements
   */
  private generateDummyTransactions(loans: LoanBalance[]): Transaction[] {
    const transactions: Transaction[] = [];
    const now = new Date();
    let txnCounter = 1;

    loans.forEach(loan => {
      // Add monthly payments and transactions for the last 5 months
      for (let i = 0; i < 5; i++) {
        const transactionDate = new Date(now);
        transactionDate.setMonth(transactionDate.getMonth() - i);
        transactionDate.setDate(15); // Set to 15th of each month for consistency
        
        // Calculate monthly payment based on loan type
        const loanTermYears = loan.maturityDate.getFullYear() - loan.originationDate.getFullYear();
        const monthlyPayment = Math.round((loan.principal / (loanTermYears || 1)) / 12);
        
        // Monthly payment
        transactions.push({
          transactionId: `TXN_${String(txnCounter).padStart(4, '0')}`,
          loanId: loan.loanId,
          transactionDate: transactionDate,
          amount: monthlyPayment > 0 ? monthlyPayment : 5000,
          type: 'payment',
          status: Math.random() > 0.05 ? 'completed' : 'pending',
          description: `Monthly payment for ${loan.loanId}`
        });
        txnCounter++;

        // Interest charge
        const monthlyInterest = Math.round((loan.outstandingBalance * (loan.interestRate / 100)) / 12);
        transactions.push({
          transactionId: `TXN_${String(txnCounter).padStart(4, '0')}`,
          loanId: loan.loanId,
          transactionDate: transactionDate,
          amount: monthlyInterest > 0 ? monthlyInterest : 1000,
          type: 'interest',
          status: 'completed',
          description: `Interest charge for ${loan.loanId}`
        });
        txnCounter++;

        // Service fees on selected loans
        if (loan.loanType === 'corporate' || Math.random() > 0.75) {
          const feeAmount = Math.round(Math.random() * 300 + 100);
          transactions.push({
            transactionId: `TXN_${String(txnCounter).padStart(4, '0')}`,
            loanId: loan.loanId,
            transactionDate: transactionDate,
            amount: feeAmount,
            type: 'fee',
            status: 'completed',
            description: `Service fee for ${loan.loanId}`
          });
          txnCounter++;
        }

        // Additional payment on some months (extra principal payment)
        if (Math.random() > 0.8) {
          const extraPayment = Math.round(Math.random() * 5000 + 2000);
          transactions.push({
            transactionId: `TXN_${String(txnCounter).padStart(4, '0')}`,
            loanId: loan.loanId,
            transactionDate: new Date(transactionDate.getTime() + 86400000 * 5), // 5 days later
            amount: extraPayment,
            type: 'payment',
            status: 'completed',
            description: `Extra principal payment for ${loan.loanId}`
          });
          txnCounter++;
        }
      }

      // Add initial disbursement
      const disbursementDate = new Date(loan.originationDate);
      transactions.push({
        transactionId: `TXN_${String(txnCounter).padStart(4, '0')}`,
        loanId: loan.loanId,
        transactionDate: disbursementDate,
        amount: loan.principal,
        type: 'disbursement',
        status: 'completed',
        description: `Initial loan disbursement for ${loan.loanId}`
      });
      txnCounter++;

      // Add a second disbursement for corporate loans with multiple tranches
      if (loan.loanType === 'corporate' && Math.random() > 0.6) {
        const trancheDate = new Date(loan.originationDate);
        trancheDate.setMonth(trancheDate.getMonth() + 3);
        const trancheAmount = Math.round(loan.principal * 0.3);
        
        transactions.push({
          transactionId: `TXN_${String(txnCounter).padStart(4, '0')}`,
          loanId: loan.loanId,
          transactionDate: trancheDate,
          amount: trancheAmount,
          type: 'disbursement',
          status: 'completed',
          description: `Second tranche disbursement for ${loan.loanId}`
        });
        txnCounter++;
      }
    });

    return transactions.sort((a, b) => b.transactionDate.getTime() - a.transactionDate.getTime());
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
