/**
 * Core Banking System Interface
 * This interface defines the contract for extracting banking data
 * Space is left for actual API integration with the banking system
 */

export interface LoanBalance {
  loanId: string;
  borrowerId: string;
  principal: number;
  outstandingBalance: number;
  interestRate: number;
  currency: string;
  loanType: 'retail' | 'corporate' | 'mortgage';
  originationDate: Date;
  maturityDate: Date;
  status: 'active' | 'defaulted' | 'closed';
}

export interface Transaction {
  transactionId: string;
  loanId: string;
  transactionDate: Date;
  amount: number;
  type: 'payment' | 'disbursement' | 'interest' | 'fee';
  status: 'completed' | 'pending' | 'failed';
  description: string;
}

export interface BorrowerInfo {
  borrowerId: string;
  name: string;
  type: 'individual' | 'corporate';
  phoneNumber?: string;
  sector?: string;
  creditScore?: number;
  totalLoans: number;
  defaultHistory: number;
  lastPaymentDate?: Date;
}

export interface BankingDataExtractionResponse {
  loanBalances: LoanBalance[];
  transactions: Transaction[];
  borrowerInfo: BorrowerInfo[];
  extractionTimestamp: Date;
  status: 'success' | 'partial' | 'failed';
  errorMessage?: string;
}

/**
 * Core Banking Interface
 * This should be implemented with actual banking system API calls
 */
export interface ICoreBankingSystem {
  /**
   * Extract loan balances from the core banking system
   * TODO: Integrate with actual banking API endpoint
   */
  extractLoanBalances(): Promise<LoanBalance[]>;

  /**
   * Extract transaction history from the core banking system
   * TODO: Integrate with actual banking API endpoint
   */
  extractTransactionHistory(loanId?: string, dateRange?: { start: Date; end: Date }): Promise<Transaction[]>;

  /**
   * Extract borrower information from the core banking system
   * TODO: Integrate with actual banking API endpoint
   */
  extractBorrowerInfo(borrowerId?: string): Promise<BorrowerInfo[]>;

  /**
   * Perform health check on the banking system connection
   */
  healthCheck(): Promise<boolean>;
}
