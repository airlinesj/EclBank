import { Injectable } from '@angular/core';
import { AuditTrail, AuditChange } from '../interfaces/audit.interface';

/**
 * Audit Trail Service
 * Logs and manages audit trails for all system activities
 */
@Injectable({
  providedIn: 'root'
})
export class AuditTrailService {
  private auditTrails: Map<string, AuditTrail> = new Map();
  private readonly MAX_ENTRIES = 10000;

  constructor() {
    this.loadAuditTrails();
    // Initialize with dummy audit data if empty
    if (this.auditTrails.size === 0) {
      this.generateDummyAuditTrails();
    }
  }

  /**
   * Generate dummy audit trails for demonstration
   */
  private generateDummyAuditTrails(): void {
    const now = new Date();
    const actions = [
      { action: 'Data Import', module: 'BANKING_DATA', entityType: 'DataImport' },
      { action: 'ECL Calculation', module: 'ECL_CALCULATION', entityType: 'Loan' },
      { action: 'Formula UPDATE', module: 'FORMULA_CONFIG', entityType: 'Formula' },
      { action: 'Portfolio Analysis', module: 'MACRO_DATA', entityType: 'Analysis' },
      { action: 'Risk Assessment', module: 'ECL_CALCULATION', entityType: 'Portfolio' },
      { action: 'System Configuration', module: 'SYSTEM', entityType: 'Config' },
      { action: 'Data Validation', module: 'BANKING_DATA', entityType: 'Validation' },
      { action: 'Report Generation', module: 'ECL_CALCULATION', entityType: 'Report' }
    ];

    const borrowerIds = ['BOR_001', 'BOR_002', 'BOR_003', 'BOR_004', 'BOR_005', 'BOR_006', 'BOR_007', 'BOR_008'];
    const loanIds = ['LOAN_001', 'LOAN_002', 'LOAN_003', 'LOAN_004', 'LOAN_005', 'LOAN_006', 'LOAN_007', 'LOAN_008', 'LOAN_009', 'LOAN_010', 'LOAN_011', 'LOAN_012'];

    // Generate audit trails for the last 30 days
    for (let i = 0; i < 50; i++) {
      const actionConfig = actions[Math.floor(Math.random() * actions.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      const hoursAgo = Math.floor(Math.random() * 24);
      const minutesAgo = Math.floor(Math.random() * 60);

      const timestamp = new Date(now);
      timestamp.setDate(timestamp.getDate() - daysAgo);
      timestamp.setHours(timestamp.getHours() - hoursAgo);
      timestamp.setMinutes(timestamp.getMinutes() - minutesAgo);

      let entityId = '';
      if (actionConfig.entityType === 'Loan') {
        entityId = loanIds[Math.floor(Math.random() * loanIds.length)];
      } else if (actionConfig.entityType === 'DataImport') {
        entityId = `IMPORT_${timestamp.getTime()}`;
      } else if (actionConfig.entityType === 'Formula') {
        entityId = `FORMULA_ECL_STANDARD_00${Math.floor(Math.random() * 3) + 1}`;
      } else {
        entityId = `ENTITY_${Math.floor(Math.random() * 1000)}`;
      }

      const status = Math.random() > 0.05 ? 'success' : 'failed';
      const details = this.generateAuditDetails(actionConfig.action, entityId, status);

      this.logAction(
        actionConfig.action,
        actionConfig.module as any,
        actionConfig.entityType,
        entityId,
        status,
        undefined,
        details
      );
    }

    this.saveAuditTrails();
  }

  /**
   * Generate realistic audit trail details
   */
  private generateAuditDetails(action: string, entityId: string, status: string): string {
    const successMessages = {
      'Data Import': `Successfully imported banking data with ${Math.floor(Math.random() * 5) + 1} records`,
      'ECL Calculation': `Calculated ECL for ${entityId}: $${Math.floor(Math.random() * 100000).toLocaleString()}`,
      'Formula UPDATE': `Updated formula with new coefficients. Affected ${Math.floor(Math.random() * 10) + 1} loans`,
      'Portfolio Analysis': `Analyzed ${Math.floor(Math.random() * 12) + 1} loans in portfolio`,
      'Risk Assessment': `Risk assessment completed. ${Math.floor(Math.random() * 3) + 1} high-risk items identified`,
      'System Configuration': `System configuration updated. ${Math.floor(Math.random() * 5) + 1} parameters modified`,
      'Data Validation': `Validation passed. ${Math.floor(Math.random() * 1000) + 1} records verified`,
      'Report Generation': `Report generated successfully with ${Math.floor(Math.random() * 20) + 5} pages`
    };

    const failureMessages = {
      'Data Import': `Data import failed due to format mismatch at record ${Math.floor(Math.random() * 100)}`,
      'ECL Calculation': `ECL calculation failed: Missing required parameters for ${entityId}`,
      'Formula UPDATE': `Formula update failed: Invalid coefficient values provided`,
      'Portfolio Analysis': `Portfolio analysis failed: Incomplete data in borrower records`,
      'Risk Assessment': `Risk assessment incomplete: ${Math.floor(Math.random() * 3) + 1} loans with missing credit scores`,
      'System Configuration': `Configuration update failed: Insufficient permissions`,
      'Data Validation': `Validation failed: ${Math.floor(Math.random() * 10) + 1} records with invalid data`,
      'Report Generation': `Report generation timeout: Processing exceeded 5 minute limit`
    };

    const messageMap = status === 'success' ? successMessages : failureMessages;
    return messageMap[action as keyof typeof messageMap] || `${action} completed with status: ${status}`;
  }

  /**
   * Log an action
   */
  logAction(
    action: string,
    module: 'BANKING_DATA' | 'MACRO_DATA' | 'ECL_CALCULATION' | 'FORMULA_CONFIG' | 'SYSTEM',
    entityType: string,
    entityId: string,
    status: 'success' | 'failed',
    changes?: AuditChange[],
    details?: string
  ): void {
    const auditId = `AUDIT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const auditTrail: AuditTrail = {
      auditId,
      timestamp: new Date(),
      action,
      module,
      entityType,
      entityId,
      status,
      changes,
      details
    };

    this.auditTrails.set(auditId, auditTrail);

    // Maintain size limit
    if (this.auditTrails.size > this.MAX_ENTRIES) {
      const oldestKey = Array.from(this.auditTrails.entries()).sort(
        (a, b) => a[1].timestamp.getTime() - b[1].timestamp.getTime()
      )[0][0];
      this.auditTrails.delete(oldestKey);
    }

    this.saveAuditTrails();
  }

  /**
   * Log data import
   */
  logDataImport(
    module: 'BANKING_DATA' | 'MACRO_DATA',
    recordCount: number,
    status: 'success' | 'failed',
    errorMessage?: string
  ): void {
    this.logAction(
      `Data Import - ${recordCount} records`,
      module,
      'DataImport',
      `IMPORT_${Date.now()}`,
      status,
      undefined,
      errorMessage || `Successfully imported ${recordCount} records`
    );
  }

  /**
   * Log ECL calculation
   */
  logECLCalculation(loanId: string, formulaId: string, eclValue: number, status: 'success' | 'failed'): void {
    this.logAction(
      'ECL Calculation',
      'ECL_CALCULATION',
      'Loan',
      loanId,
      status,
      undefined,
      `Loan: ${loanId}, Formula: ${formulaId}, ECL: ${eclValue}`
    );
  }

  /**
   * Log formula configuration
   */
  logFormulaConfiguration(
    formulaId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    changes?: AuditChange[]
  ): void {
    this.logAction(
      `Formula ${action}`,
      'FORMULA_CONFIG',
      'Formula',
      formulaId,
      'success',
      changes
    );
  }

  /**
   * Get audit trails by module
   */
  getAuditTrailsByModule(module: string): AuditTrail[] {
    return Array.from(this.auditTrails.values())
      .filter(a => a.module === module)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get audit trails by entity
   */
  getAuditTrailsByEntity(entityType: string, entityId: string): AuditTrail[] {
    return Array.from(this.auditTrails.values())
      .filter(a => a.entityType === entityType && a.entityId === entityId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get all audit trails
   */
  getAllAuditTrails(limit?: number): AuditTrail[] {
    const sorted = Array.from(this.auditTrails.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return limit ? sorted.slice(0, limit) : sorted;
  }

  /**
   * Get audit trails by date range
   */
  getAuditTrailsByDateRange(startDate: Date, endDate: Date): AuditTrail[] {
    return Array.from(this.auditTrails.values())
      .filter(a => a.timestamp >= startDate && a.timestamp <= endDate)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Export audit trails
   */
  exportAuditTrails(format: 'json' | 'csv' = 'json'): string {
    const trails = this.getAllAuditTrails();

    if (format === 'json') {
      return JSON.stringify(trails, null, 2);
    } else {
      // CSV format
      const headers = ['Audit ID', 'Timestamp', 'Action', 'Module', 'Entity Type', 'Entity ID', 'Status', 'Details'];
      const rows = trails.map(t => [
        t.auditId,
        t.timestamp.toISOString(),
        t.action,
        t.module,
        t.entityType,
        t.entityId,
        t.status,
        t.details || ''
      ]);

      const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      return csv;
    }
  }

  /**
   * Clear audit trails
   */
  clearAuditTrails(): void {
    this.auditTrails.clear();
    localStorage.removeItem('audit_trails');
  }

  /**
   * Save audit trails to storage
   */
  private saveAuditTrails(): void {
    try {
      const trails = Array.from(this.auditTrails.values());
      localStorage.setItem('audit_trails', JSON.stringify(trails));
    } catch (error) {
      console.error('Failed to save audit trails:', error);
    }
  }

  /**
   * Load audit trails from storage
   */
  private loadAuditTrails(): void {
    const stored = localStorage.getItem('audit_trails');
    if (stored) {
      try {
        const trails = JSON.parse(stored) as AuditTrail[];
        trails.forEach(t => {
          t.timestamp = new Date(t.timestamp);
          this.auditTrails.set(t.auditId, t);
        });
      } catch (error) {
        console.error('Failed to load audit trails:', error);
      }
    }
  }
}
