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
