import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MacroEconomicHubResponse, MacroForecast } from '../interfaces/macro.interface';

/**
 * Macro Data Repository Service
 * Stores and manages macroeconomic data from the hub
 */
@Injectable({
  providedIn: 'root'
})
export class MacroDataRepositoryService {
  private macroData = new BehaviorSubject<MacroEconomicHubResponse | null>(null);
  private forecasts = new BehaviorSubject<MacroForecast[]>([]);
  private lastUpdateTime = new BehaviorSubject<Date | null>(null);

  public macroData$ = this.macroData.asObservable();
  public forecasts$ = this.forecasts.asObservable();
  public lastUpdateTime$ = this.lastUpdateTime.asObservable();

  constructor() {
    this.initializeStorage();
  }

  /**
   * Initialize storage from localStorage
   */
  private initializeStorage(): void {
    const storedData = localStorage.getItem('macro_data');
    const storedForecasts = localStorage.getItem('macro_forecasts');

    if (storedData) {
      try {
        this.macroData.next(JSON.parse(storedData));
      } catch (error) {
        console.error('Failed to load stored macro data:', error);
      }
    }

    if (storedForecasts) {
      try {
        this.forecasts.next(JSON.parse(storedForecasts));
      } catch (error) {
        console.error('Failed to load stored forecasts:', error);
      }
    }
  }

  /**
   * Update macro data in repository
   */
  updateMacroData(data: MacroEconomicHubResponse): void {
    this.macroData.next(data);
    this.lastUpdateTime.next(new Date());
    this.persistToStorage(data, this.forecasts.value);
  }

  /**
   * Update forecasts in repository
   */
  updateForecasts(forecasts: MacroForecast[]): void {
    this.forecasts.next(forecasts);
    const currentData = this.macroData.value;
    if (currentData) {
      this.persistToStorage(currentData, forecasts);
    }
  }

  /**
   * Get macro variable by ID
   */
  getMacroVariable(variableId: string) {
    const data = this.macroData.value;
    return data?.variables.find(v => v.variableId === variableId);
  }

  /**
   * Get all macro variables
   */
  getAllMacroVariables() {
    return this.macroData.value?.variables || [];
  }

  /**
   * Get forecast for variable
   */
  getForecast(variableId: string) {
    return this.forecasts.value.find(f => f.variableId === variableId);
  }

  /**
   * Get all forecasts
   */
  getAllForecasts() {
    return this.forecasts.value;
  }

  /**
   * Clear repository data
   */
  clearData(): void {
    this.macroData.next(null);
    this.forecasts.next([]);
    this.lastUpdateTime.next(null);
    localStorage.removeItem('macro_data');
    localStorage.removeItem('macro_forecasts');
  }

  /**
   * Persist data to localStorage
   */
  private persistToStorage(data: MacroEconomicHubResponse, forecasts: MacroForecast[]): void {
    try {
      localStorage.setItem('macro_data', JSON.stringify(data));
      localStorage.setItem('macro_forecasts', JSON.stringify(forecasts));
    } catch (error) {
      console.error('Failed to persist macro data to storage:', error);
    }
  }
}
