import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DataRepositoryService } from '@core/services/data-repository.service';
import { MacroDataRepositoryService } from '@core/services/macro-data-repository.service';
import { ECLCalculationService } from '@core/services/ecl-calculation.service';
import { CoreBankingService } from '@core/services/core-banking.service';
import { MacroeconomicHubService } from '@core/services/macroeconomic-hub.service';
import { ECLSummary } from '@core/interfaces/ecl.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  loading = false;
  bankingSummary: any = null;
  eclSummary: ECLSummary | null = null;
  macroVariablesLoaded = false;
  lastUpdateTime: Date | null = null;

  constructor(
    private dataRepository: DataRepositoryService,
    private macroRepository: MacroDataRepositoryService,
    private eclCalculation: ECLCalculationService,
    private coreBanking: CoreBankingService,
    private macroHub: MacroeconomicHubService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;

    // Load banking data
    this.coreBanking.extractAllBankingData().then(data => {
      this.dataRepository.updateBankingData(data);
      this.bankingSummary = this.dataRepository.getSummaryStatistics();
      this.lastUpdateTime = new Date();

      // Load macro data
      return this.macroHub.extractAllMacroVariables();
    }).then(macroData => {
      this.macroRepository.updateMacroData(macroData);
      this.macroVariablesLoaded = true;

      // Calculate ECL
      this.eclSummary = this.eclCalculation.calculatePortfolioECL('ECL_STANDARD_001');
    }).catch(error => {
      console.error('Error loading dashboard data:', error);
    }).finally(() => {
      this.loading = false;
    });
  }

  getECLAsPercentageOfPortfolio(): number {
    if (!this.eclSummary || !this.bankingSummary) return 0;
    const totalBalance = this.bankingSummary.totalLoanBalance;
    return totalBalance > 0 ? (this.eclSummary.totalECL / totalBalance) * 100 : 0;
  }

  navigateToHilda(): void {
    this.router.navigate(['/reports']);
  }
}
