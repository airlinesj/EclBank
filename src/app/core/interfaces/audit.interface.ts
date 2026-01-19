/**
 * Audit Trail Interface
 * Tracks all activities and changes in the system
 */

export interface AuditTrail {
  auditId: string;
  timestamp: Date;
  userId?: string;
  action: string;
  module: 'BANKING_DATA' | 'MACRO_DATA' | 'ECL_CALCULATION' | 'FORMULA_CONFIG' | 'SYSTEM';
  entityType: string;
  entityId: string;
  changes?: AuditChange[];
  status: 'success' | 'failed';
  ipAddress?: string;
  details?: string;
}

export interface AuditChange {
  fieldName: string;
  oldValue?: any;
  newValue?: any;
}
