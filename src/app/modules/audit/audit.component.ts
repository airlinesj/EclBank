import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditTrailService } from '@core/services/audit-trail.service';
import { AuditTrail } from '@core/interfaces/audit.interface';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit.component.html',
  styleUrl: './audit.component.scss'
})
export class AuditComponent implements OnInit {
  auditTrails: AuditTrail[] = [];
  filteredTrails: AuditTrail[] = [];
  modules = ['BANKING_DATA', 'MACRO_DATA', 'ECL_CALCULATION', 'FORMULA_CONFIG', 'SYSTEM'];
  selectedModule: string | null = null;
  searchText = '';
  sortBy: 'timestamp' | 'action' | 'status' = 'timestamp';
  sortOrder: 'asc' | 'desc' = 'desc';

  constructor(private auditTrailService: AuditTrailService) {}

  ngOnInit(): void {
    this.loadAuditTrails();
  }

  loadAuditTrails(): void {
    this.auditTrails = this.auditTrailService.getAllAuditTrails(1000);
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredTrails = this.auditTrails.filter(trail => {
      const moduleMatch = !this.selectedModule || trail.module === this.selectedModule;
      const searchMatch =
        !this.searchText ||
        trail.action.toLowerCase().includes(this.searchText.toLowerCase()) ||
        trail.entityId.toLowerCase().includes(this.searchText.toLowerCase()) ||
        trail.details?.toLowerCase().includes(this.searchText.toLowerCase());

      return moduleMatch && searchMatch;
    });

    this.sortTrails();
  }

  sortTrails(): void {
    this.filteredTrails.sort((a, b) => {
      let compareValue = 0;

      if (this.sortBy === 'timestamp') {
        compareValue = a.timestamp.getTime() - b.timestamp.getTime();
      } else if (this.sortBy === 'action') {
        compareValue = a.action.localeCompare(b.action);
      } else if (this.sortBy === 'status') {
        compareValue = a.status.localeCompare(b.status);
      }

      return this.sortOrder === 'desc' ? -compareValue : compareValue;
    });
  }

  clearSearch(): void {
    this.searchText = '';
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedModule = null;
    this.searchText = '';
    this.applyFilters();
  }

  exportAudit(format: 'json' | 'csv'): void {
    const content = this.auditTrailService.exportAuditTrails(format);
    const filename = `audit_trail.${format}`;
    this.downloadFile(content, filename);
  }

  clearAuditLog(): void {
    if (confirm('Are you sure you want to clear all audit logs? This action cannot be undone.')) {
      this.auditTrailService.clearAuditTrails();
      this.auditTrails = [];
      this.filteredTrails = [];
    }
  }

  getModuleColor(module: string): string {
    const colors: Record<string, string> = {
      BANKING_DATA: '#667eea',
      MACRO_DATA: '#764ba2',
      ECL_CALCULATION: '#f39c12',
      FORMULA_CONFIG: '#27ae60',
      SYSTEM: '#e74c3c'
    };
    return colors[module] || '#999';
  }

  getSuccessCount(): number {
    return this.auditTrails.filter(t => t.status === 'success').length;
  }

  getFailedCount(): number {
    return this.auditTrails.filter(t => t.status === 'failed').length;
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
}
